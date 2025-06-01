const Project = require('../models/Project');
const User = require('../models/User');
const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

// Create a new project
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Create project data
    const projectData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      owner_id: userId
    };

    // Create the project
    const project = await Project.create(projectData);

    logger.info(`Project created: ${project.name}`, { 
      projectId: project.id, 
      userId: userId,
      projectKey: project.project_key 
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: {
        project: project.toJSON()
      }
    });

  } catch (error) {
    logger.error('Create project error:', error);
    
    // Handle duplicate project key error (unlikely but possible)
    if (error.code === 'ER_DUP_ENTRY') {
      return next(new AppError('Project with similar name already exists. Please try a different name.', 409));
    }
    
    next(new AppError('Project creation failed. Please try again.', 500));
  }
};

// Get projects for current user
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT p.* FROM projects p
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL
    `;
    
    const queryParams = [userId];

    // Add search filter
    if (search && search.trim()) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.project_key LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const validSortFields = ['name', 'created_at', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sort_by) && validSortOrders.includes(sort_order)) {
      query += ` ORDER BY p.${sort_by} ${sort_order.toUpperCase()}`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    // Add pagination
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const projects = await database.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total FROM projects p
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL
    `;
    
    const countParams = [userId];
    
    if (search && search.trim()) {
      countQuery += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.project_key LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await database.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        projects: projects.map(project => new Project(project).toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get projects error:', error);
    next(new AppError('Failed to retrieve projects. Please try again.', 500));
  }
};

// Get project by ID
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has access to this project
    const hasAccess = await project.hasUserAccess(userId);
    if (!hasAccess) {
      return next(new AppError('Access denied to this project', 403));
    }

    // Get team members
    const teamMembers = await project.getTeamMembers();
    
    // Get user's role in the project
    const userRole = await project.getUserRole(userId);

    res.json({
      success: true,
      data: {
        project: project.toJSON(),
        team_members: teamMembers,
        user_role: userRole
      }
    });

  } catch (error) {
    logger.error('Get project by ID error:', error);
    next(new AppError('Failed to retrieve project. Please try again.', 500));
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has admin access to this project
    const userRole = await project.getUserRole(userId);
    if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
      return next(new AppError('Insufficient permissions to update this project', 403));
    }

    // Update project fields
    if (name !== undefined) {
      project.name = name.trim();
    }
    if (description !== undefined) {
      project.description = description ? description.trim() : null;
    }

    // Save updated project
    await project.save();

    logger.info(`Project updated: ${project.name}`, { 
      projectId: project.id, 
      userId: userId 
    });

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        project: project.toJSON()
      }
    });

  } catch (error) {
    logger.error('Update project error:', error);
    next(new AppError('Project update failed. Please try again.', 500));
  }
};

// Delete project (soft delete)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Only project owner can delete the project
    if (project.owner_id !== userId) {
      return next(new AppError('Only project owner can delete the project', 403));
    }

    // Soft delete the project
    await project.delete();

    logger.info(`Project deleted: ${project.name}`, { 
      projectId: project.id, 
      userId: userId 
    });

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });

  } catch (error) {
    logger.error('Delete project error:', error);
    next(new AppError('Project deletion failed. Please try again.', 500));
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
