const Board = require('../models/Board');
const BoardColumn = require('../models/BoardColumn');
const Issue = require('../models/Issue');
const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');
const { activityLogger, ACTIVITY_TYPES, RESOURCE_TYPES } = require('../middleware/activityLogger');

// Get enhanced kanban view with columns and WIP limits
const getKanbanView = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { sprintId, swimlane } = req.query;
    const userId = req.user.id;

    // Get board and verify access
    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404));
    }

    // Check user access to board's project
    const projectId = board.project.id;
    await Board.findByProjectId(projectId, userId, { limit: 1 });

    // Get board columns
    let columns = await BoardColumn.findByBoardId(boardId);
    
    // If no columns exist, create default ones
    if (columns.length === 0) {
      columns = await BoardColumn.createDefaultColumns(boardId);
    }

    // Get issues for each column
    const kanbanData = {};
    
    for (const column of columns) {
      const options = {
        status: column.status_mapping,
        sprintId: sprintId ? parseInt(sprintId) : undefined,
        limit: 100,
        orderBy: 'issue_order ASC, created_at ASC'
      };
      
      const issues = await board.getIssues(options);
      
      // Add WIP limit information
      const issueCount = issues.length;
      const isWipExceeded = column.wip_limit && issueCount >= column.wip_limit;
      
      kanbanData[column.id] = {
        column: column.toJSON(),
        issues: issues,
        issue_count: issueCount,
        wip_exceeded: isWipExceeded
      };
    }

    // Handle swimlane grouping
    let swimlaneData = null;
    if (swimlane) {
      swimlaneData = await getSwimlanesData(boardId, swimlane, sprintId);
    }

    res.json(formatSuccessResponse({
      message: 'Kanban view retrieved successfully',
      data: {
        board: {
          id: board.id,
          name: board.name,
          description: board.description
        },
        columns: kanbanData,
        swimlanes: swimlaneData
      }
    }));

  } catch (error) {
    logger.error('Error getting kanban view:', error);
    next(new AppError('Failed to get kanban view', 500));
  }
};

// Update issue status and order (drag and drop)
const updateIssuePosition = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { issueId, newStatus, newOrder, oldStatus, oldOrder } = req.body;
    const userId = req.user.id;

    // Verify board access
    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404));
    }

    // Get the issue
    const issue = await Issue.findById(issueId);
    if (!issue || issue.board_id !== parseInt(boardId)) {
      return next(new AppError('Issue not found or not in this board', 404));
    }

    // Check WIP limits if moving to a new status
    if (newStatus !== oldStatus) {
      const targetColumn = await BoardColumn.findByBoardId(boardId)
        .then(columns => columns.find(col => col.status_mapping === newStatus));
      
      if (targetColumn && targetColumn.wip_limit) {
        const currentCount = await targetColumn.getIssueCount();
        if (currentCount >= targetColumn.wip_limit) {
          return next(new AppError(`WIP limit exceeded for column "${targetColumn.name}". Limit: ${targetColumn.wip_limit}`, 400));
        }
      }
    }

    const connection = await database.getConnection();
    await connection.beginTransaction();

    try {
      // Update issue status and order
      await connection.query(
        'UPDATE issues SET status = ?, issue_order = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, newOrder, issueId]
      );

      // Reorder other issues in the old column if needed
      if (oldStatus === newStatus) {
        // Moving within the same column
        if (newOrder < oldOrder) {
          // Moving up - increment order of issues between newOrder and oldOrder
          await connection.query(
            'UPDATE issues SET issue_order = issue_order + 1 WHERE board_id = ? AND status = ? AND issue_order >= ? AND issue_order < ? AND id != ?',
            [boardId, newStatus, newOrder, oldOrder, issueId]
          );
        } else if (newOrder > oldOrder) {
          // Moving down - decrement order of issues between oldOrder and newOrder
          await connection.query(
            'UPDATE issues SET issue_order = issue_order - 1 WHERE board_id = ? AND status = ? AND issue_order > ? AND issue_order <= ? AND id != ?',
            [boardId, newStatus, oldOrder, newOrder, issueId]
          );
        }
      } else {
        // Moving to different column
        // Decrement order of issues after the old position in old column
        await connection.query(
          'UPDATE issues SET issue_order = issue_order - 1 WHERE board_id = ? AND status = ? AND issue_order > ?',
          [boardId, oldStatus, oldOrder]
        );
        
        // Increment order of issues at or after the new position in new column
        await connection.query(
          'UPDATE issues SET issue_order = issue_order + 1 WHERE board_id = ? AND status = ? AND issue_order >= ? AND id != ?',
          [boardId, newStatus, newOrder, issueId]
        );
      }

      await connection.commit();

      // Log activity
      try {
        await activityLogger(ACTIVITY_TYPES.ISSUE_STATUS_CHANGED, {
          resourceType: RESOURCE_TYPES.ISSUE,
          getResourceId: () => issueId,
          getDetails: () => ({
            old_status: oldStatus,
            new_status: newStatus,
            old_order: oldOrder,
            new_order: newOrder
          })
        })(req, res, () => {});
      } catch (activityError) {
        logger.error('Failed to log issue position update activity:', activityError);
      }

      res.json(formatSuccessResponse({
        message: 'Issue position updated successfully',
        data: {
          issue_id: issueId,
          new_status: newStatus,
          new_order: newOrder
        }
      }));

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    logger.error('Error updating issue position:', error);
    next(new AppError('Failed to update issue position', 500));
  }
};

// Get board columns configuration
const getBoardColumns = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Verify board access
    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404));
    }

    const columns = await BoardColumn.findByBoardId(boardId);

    res.json(formatSuccessResponse({
      message: 'Board columns retrieved successfully',
      data: { columns }
    }));

  } catch (error) {
    logger.error('Error getting board columns:', error);
    next(new AppError('Failed to get board columns', 500));
  }
};

// Update board columns configuration
const updateBoardColumns = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { columns } = req.body;
    const userId = req.user.id;

    // Verify board access
    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404));
    }

    // Update column positions and WIP limits
    const connection = await database.getConnection();
    await connection.beginTransaction();

    try {
      for (const columnData of columns) {
        await connection.query(
          'UPDATE board_columns SET position = ?, wip_limit = ?, updated_at = NOW() WHERE id = ? AND board_id = ?',
          [columnData.position, columnData.wip_limit || null, columnData.id, boardId]
        );
      }

      await connection.commit();

      res.json(formatSuccessResponse({
        message: 'Board columns updated successfully',
        data: { updated_columns: columns.length }
      }));

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    logger.error('Error updating board columns:', error);
    next(new AppError('Failed to update board columns', 500));
  }
};

// Helper function to get swimlanes data
const getSwimlanesData = async (boardId, swimlaneType, sprintId) => {
  try {
    const swimlanes = {};
    
    switch (swimlaneType) {
      case 'assignee':
        // Group by assignee
        const assigneeQuery = `
          SELECT DISTINCT 
            COALESCE(u.id, 0) as assignee_id,
            COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Unassigned') as assignee_name
          FROM issues i
          LEFT JOIN users u ON i.assignee_id = u.id
          WHERE i.board_id = ? ${sprintId ? 'AND i.sprint_id = ?' : ''}
          ORDER BY assignee_name
        `;
        
        const assigneeParams = sprintId ? [boardId, sprintId] : [boardId];
        const assignees = await database.query(assigneeQuery, assigneeParams);
        
        for (const assignee of assignees) {
          swimlanes[assignee.assignee_id] = {
            id: assignee.assignee_id,
            name: assignee.assignee_name,
            type: 'assignee'
          };
        }
        break;
        
      case 'priority':
        // Group by priority
        swimlanes['P1'] = { id: 'P1', name: 'High Priority (P1)', type: 'priority' };
        swimlanes['P2'] = { id: 'P2', name: 'Medium Priority (P2)', type: 'priority' };
        swimlanes['P3'] = { id: 'P3', name: 'Normal Priority (P3)', type: 'priority' };
        swimlanes['P4'] = { id: 'P4', name: 'Low Priority (P4)', type: 'priority' };
        break;
        
      case 'issue_type':
        // Group by issue type
        swimlanes['Story'] = { id: 'Story', name: 'User Stories', type: 'issue_type' };
        swimlanes['Bug'] = { id: 'Bug', name: 'Bugs', type: 'issue_type' };
        swimlanes['Task'] = { id: 'Task', name: 'Tasks', type: 'issue_type' };
        swimlanes['Epic'] = { id: 'Epic', name: 'Epics', type: 'issue_type' };
        break;
    }
    
    return swimlanes;
  } catch (error) {
    logger.error('Error getting swimlanes data:', error);
    return null;
  }
};

module.exports = {
  getKanbanView,
  updateIssuePosition,
  getBoardColumns,
  updateBoardColumns
};
