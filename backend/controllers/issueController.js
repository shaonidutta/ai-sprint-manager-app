const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const TimeLog = require('../models/TimeLog');
const logger = require('../config/logger');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/errors');
const { recomputeSprintScope } = require('../utils/sprintUtils'); // Added for scope creep calculation

class IssueController {
  // GET /api/v1/boards/:boardId/issues
  static async getBoardIssues(req, res) {
    try {
      const { boardId } = req.params;
      const userId = req.user.id;
      const { page, limit, status, assigneeId, sprintId, search, issueType, priority, backlogOnly } = req.query;

      console.log('🔍 BOARD ISSUES REQUEST:', {
        boardId,
        backlogOnly,
        backlogOnlyType: typeof backlogOnly,
        backlogOnlyValue: backlogOnly === 'true',
        allQueryParams: req.query
      });

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        status,
        assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
        sprintId: sprintId ? parseInt(sprintId) : undefined,
        search: search || '',
        issueType,
        priority,
        backlogOnly: backlogOnly === 'true'
      };

      console.log('🔍 PROCESSED OPTIONS:', options);

      const result = await Issue.findByBoardId(boardId, userId, options);

      // Add cache-busting headers for backlog queries to ensure fresh data
      if (backlogOnly) {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
      }

      res.status(200).json(formatSuccessResponse({
        message: 'Issues retrieved successfully',
        data: result
      }));
    } catch (error) {
      logger.error('Error getting board issues:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/issues/:id
  static async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // First check if issue exists
      const issue = await Issue.findById(id);

      if (!issue) {
        return res.status(404).json(formatErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'Issue not found'
        }));
      }

      // Check if user has access to this issue's board
      const boardId = issue.board.id;

      // This will throw an error if user doesn't have access
      await Issue.findByBoardId(boardId, userId, { limit: 1 });

      res.status(200).json(formatSuccessResponse({
        message: 'Issue retrieved successfully',
        data: { issue }
      }));
    } catch (error) {
      logger.error('Error getting issue by ID:', error);

      // Handle specific error types
      if (error.name === 'NotFoundError' || error.message.includes('not found')) {
        return res.status(404).json(formatErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'Issue not found'
        }));
      }

      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/boards/:id/issues
  static async createIssue(req, res) {
    try {
      const { id: boardId } = req.params;
      const userId = req.user.id;
      const { 
        title, 
        description, 
        issueType, 
        priority, 
        assigneeId, 
        storyPoints, 
        originalEstimate, 
        sprintId 
      } = req.body;

      const issueData = {
        board_id: boardId,
        title,
        description,
        issue_type: issueType || 'Story',
        priority: priority || 'P3',
        assignee_id: assigneeId,
        story_points: storyPoints,
        original_estimate: originalEstimate,
        sprint_id: sprintId,
        reporter_id: userId
      };

      const issue = await Issue.create(issueData);

      // After creating an issue, recompute scope if it's assigned to a sprint
      if (issue.sprint_id) {
        try {
          await recomputeSprintScope(issue.sprint_id);
        } catch (recomputeError) {
          logger.error(`Error recomputing sprint scope after creating issue ${issue.id} for sprint ${issue.sprint_id}:`, recomputeError);
          // Do not let this error block the main response
        }
      }

      res.status(201).json(formatSuccessResponse({
        message: 'Issue created successfully',
        data: { issue }
      }));
    } catch (error) {
      logger.error('Error creating issue:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PUT /api/v1/issues/:id
  static async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log('🔍 ISSUE UPDATE REQUEST BODY:', req.body);

      const {
        title,
        description,
        issueType,
        status,
        priority,
        assigneeId,
        storyPoints,
        originalEstimate,
        timeRemaining,
        sprintId,
        sprint_id, // Also check for snake_case
        blockedReason
      } = req.body;

      console.log('🔍 EXTRACTED VALUES:', {
        sprintId,
        sprint_id,
        sprintIdType: typeof sprintId,
        sprint_idType: typeof sprint_id
      });

      const issue = await Issue.findById(id);
      const oldSprintId = issue.sprint_id;
      const oldStoryPoints = issue.story_points;

      console.log('🔍 ISSUE BEFORE UPDATE:', {
        id: issue.id,
        title: issue.title,
        current_sprint_id: oldSprintId,
        current_story_points: oldStoryPoints
      });

      // Check if user has access to this issue
      const boardId = issue.board.id;
      await Issue.findByBoardId(boardId, userId, { limit: 1 });

      // Update issue properties
      if (title !== undefined) issue.title = title;
      if (description !== undefined) issue.description = description;
      if (issueType !== undefined) issue.issue_type = issueType;
      if (status !== undefined) issue.status = status;
      if (priority !== undefined) issue.priority = priority;
      // Allow unassigning by passing null
      if (assigneeId !== undefined) issue.assignee_id = assigneeId;
      if (storyPoints !== undefined) issue.story_points = storyPoints;
      if (originalEstimate !== undefined) issue.original_estimate = originalEstimate;
      if (timeRemaining !== undefined) issue.time_remaining = timeRemaining;
      
      // Handle sprint_id update (allow unassigning by passing null)
      let newSprintIdFromRequest;
      if (sprintId !== undefined) { // typically from frontend JSON
        newSprintIdFromRequest = sprintId;
      } else if (sprint_id !== undefined) { // typically from form-data or other sources
        newSprintIdFromRequest = sprint_id;
      }

      if (newSprintIdFromRequest !== undefined) {
         // Allow setting sprint_id to null to remove from sprint
        issue.sprint_id = newSprintIdFromRequest === null ? null : parseInt(newSprintIdFromRequest, 10);
      }


      if (blockedReason !== undefined) issue.blocked_reason = blockedReason;

      console.log('🔍 ISSUE AFTER PROPERTY UPDATE (before save):', {
        id: issue.id,
        title: issue.title,
        new_sprint_id: issue.sprint_id,
        new_story_points: issue.story_points
      });

      await issue.save(); // Save changes to the issue first

      const newSprintIdActual = issue.sprint_id;
      const newStoryPointsActual = issue.story_points;

      console.log('🔍 ISSUE AFTER SAVE:', {
        id: issue.id,
        title: issue.title,
        final_sprint_id: newSprintIdActual,
        final_story_points: newStoryPointsActual
      });
      
      // Recompute sprint scope
      // Use a Set to avoid duplicate calls if old and new sprint IDs are the same (though logic below handles it)
      const sprintsToRecompute = new Set();

      if (oldSprintId !== newSprintIdActual) {
        if (oldSprintId) {
          sprintsToRecompute.add(oldSprintId);
        }
        if (newSprintIdActual) {
          sprintsToRecompute.add(newSprintIdActual);
        }
      } else if (oldStoryPoints !== newStoryPointsActual) { // Sprint is the same, but points changed
        if (newSprintIdActual) { // Only recompute if it's in a sprint
          sprintsToRecompute.add(newSprintIdActual);
        }
      }

      for (const sprintToUpdate of sprintsToRecompute) {
        try {
          await recomputeSprintScope(sprintToUpdate);
        } catch (recomputeError) {
          logger.error(`Error recomputing sprint scope for sprint ${sprintToUpdate} after updating issue ${issue.id}:`, recomputeError);
          // Do not let this error block the main response
        }
      }

      res.status(200).json(formatSuccessResponse({
        message: 'Issue updated successfully',
        data: { issue } // issue object is already updated
      }));
    } catch (error) {
      logger.error('Error updating issue:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PATCH /api/v1/issues/:id/status
  static async updateIssueStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status, blockedReason } = req.body;

      const issue = await Issue.findById(id);

      // Check if user has access to this issue
      const boardId = issue.board.id;
      await Issue.findByBoardId(boardId, userId, { limit: 1 });

      // Update blocked reason if status is Blocked
      if (status === 'Blocked' && blockedReason) {
        issue.blocked_reason = blockedReason;
      }

      await issue.updateStatus(status, userId);

      res.status(200).json(formatSuccessResponse({
        message: 'Issue status updated successfully',
        data: { issue }
      }));
    } catch (error) {
      logger.error('Error updating issue status:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // DELETE /api/v1/issues/:id
  static async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const issue = await Issue.findById(id);

      // Check if user has access to this issue
      const boardId = issue.board.id;
      await Issue.findByBoardId(boardId, userId, { limit: 1 });

      await issue.delete();

      res.status(200).json(formatSuccessResponse({
        message: 'Issue deleted successfully'
      }));
    } catch (error) {
      logger.error('Error deleting issue:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/issues/:id/comments
  static async getIssueComments(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { page, limit } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      };

      const result = await Comment.findByIssueId(id, userId, options);

      res.status(200).json(formatSuccessResponse({
        message: 'Issue comments retrieved successfully',
        data: result
      }));
    } catch (error) {
      logger.error('Error getting issue comments:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/issues/:id/comments
  static async createComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content } = req.body;

      const commentData = {
        issue_id: id,
        user_id: userId,
        content
      };

      const comment = await Comment.create(commentData);

      res.status(201).json(formatSuccessResponse({
        message: 'Comment created successfully',
        data: { comment }
      }));
    } catch (error) {
      logger.error('Error creating comment:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/issues/:id/time-logs
  static async getIssueTimeLogs(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { page, limit, startDate, endDate } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        startDate,
        endDate
      };

      const result = await TimeLog.findByIssueId(id, userId, options);

      res.status(200).json(formatSuccessResponse({
        message: 'Issue time logs retrieved successfully',
        data: result
      }));
    } catch (error) {
      logger.error('Error getting issue time logs:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/issues/:id/time-logs
  static async logTime(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { timeSpent, hoursLogged, description, loggedDate } = req.body;

      const timeLogData = {
        issue_id: id,
        user_id: userId,
        hours_logged: hoursLogged || timeSpent, // Support both field names for compatibility
        description,
        logged_date: loggedDate || new Date().toISOString().split('T')[0]
      };

      const timeLog = await TimeLog.create(timeLogData);

      res.status(201).json(formatSuccessResponse({
        message: 'Time logged successfully',
        data: { timeLog }
      }));
    } catch (error) {
      logger.error('Error logging time:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PUT /api/v1/comments/:id
  static async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Check if comment exists and user owns it
      const comment = await database.query(
        'SELECT * FROM issue_comments WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (comment.length === 0) {
        return res.status(404).json(formatErrorResponse({
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found or access denied'
        }));
      }

      // Update comment
      await database.query(
        'UPDATE issue_comments SET comment = ?, updated_at = NOW() WHERE id = ?',
        [content.trim(), id]
      );

      // Get updated comment
      const updatedComment = await database.query(
        `SELECT c.*, u.first_name, u.last_name, u.email, u.avatar_url
         FROM issue_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [id]
      );

      res.json(formatSuccessResponse({
        message: 'Comment updated successfully',
        data: { comment: updatedComment[0] }
      }));
    } catch (error) {
      logger.error('Error updating comment:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // DELETE /api/v1/comments/:id
  static async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if comment exists and user owns it
      const comment = await database.query(
        'SELECT * FROM issue_comments WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (comment.length === 0) {
        return res.status(404).json(formatErrorResponse({
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found or access denied'
        }));
      }

      // Delete comment
      await database.query('DELETE FROM issue_comments WHERE id = ?', [id]);

      res.json(formatSuccessResponse({
        message: 'Comment deleted successfully'
      }));
    } catch (error) {
      logger.error('Error deleting comment:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PUT /api/v1/time-logs/:id
  static async updateTimeLog(req, res) {
    try {
      const { id } = req.params;
      const { timeSpent, description, loggedDate } = req.body;
      const userId = req.user.id;

      // Check if time log exists and user owns it
      const timeLog = await database.query(
        'SELECT * FROM time_logs WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (timeLog.length === 0) {
        return res.status(404).json(formatErrorResponse({
          code: 'TIME_LOG_NOT_FOUND',
          message: 'Time log not found or access denied'
        }));
      }

      // Update time log
      await database.query(
        `UPDATE time_logs SET
         hours_logged = ?, description = ?, logged_date = ?
         WHERE id = ?`,
        [timeSpent, description || null, loggedDate || new Date().toISOString().split('T')[0], id]
      );

      // Get updated time log
      const updatedTimeLog = await database.query(
        `SELECT tl.*, u.first_name, u.last_name, u.email
         FROM time_logs tl
         JOIN users u ON tl.user_id = u.id
         WHERE tl.id = ?`,
        [id]
      );

      res.json(formatSuccessResponse({
        message: 'Time log updated successfully',
        data: { timeLog: updatedTimeLog[0] }
      }));
    } catch (error) {
      logger.error('Error updating time log:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // DELETE /api/v1/time-logs/:id
  static async deleteTimeLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if time log exists and user owns it
      const timeLog = await database.query(
        'SELECT * FROM time_logs WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (timeLog.length === 0) {
        return res.status(404).json(formatErrorResponse({
          code: 'TIME_LOG_NOT_FOUND',
          message: 'Time log not found or access denied'
        }));
      }

      // Delete time log
      await database.query('DELETE FROM time_logs WHERE id = ?', [id]);

      res.json(formatSuccessResponse({
        message: 'Time log deleted successfully'
      }));
    } catch (error) {
      logger.error('Error deleting time log:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }
}

module.exports = IssueController;
