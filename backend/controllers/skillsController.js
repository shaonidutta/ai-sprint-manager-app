const TeamMemberSkills = require('../models/TeamMemberSkills');
const Project = require('../models/Project');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const logger = require('../config/logger');
const { successResponse } = require('../utils/responseFormatter');

// Get skills for a project
const getProjectSkills = async (req, res, next) => {
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

    // Get project skills
    const skills = await TeamMemberSkills.findByProjectId(id);

    res.json(successResponse({
      skills: skills.map(skill => skill.getSkillSummary())
    }, 'Project skills retrieved successfully'));

  } catch (error) {
    logger.error('Get project skills error:', error);
    next(new AppError('Failed to retrieve project skills. Please try again.', 500));
  }
};

// Get skills for a specific user in a project
const getUserProjectSkills = async (req, res, next) => {
  try {
    const { id, user_id } = req.params;
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

    // Check if target user exists and is part of project
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const isTeamMember = await project.hasUserAccess(user_id);
    if (!isTeamMember) {
      return next(new AppError('User is not a member of this project', 404));
    }

    // Get user skills for this project
    const skills = await TeamMemberSkills.findByUserAndProject(user_id, id);

    res.json(successResponse({
      user: {
        id: targetUser.id,
        name: `${targetUser.first_name} ${targetUser.last_name}`,
        email: targetUser.email
      },
      skills: skills.map(skill => skill.getSkillSummary())
    }, 'User skills retrieved successfully'));

  } catch (error) {
    logger.error('Get user project skills error:', error);
    next(new AppError('Failed to retrieve user skills. Please try again.', 500));
  }
};

// Add skill to team member
const addTeamMemberSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, skill_name, proficiency_level = 'Beginner', years_experience = 0.0 } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has admin/manager access to this project
    const userRole = await project.getUserRole(userId);
    if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
      return next(new AppError('Insufficient permissions to manage team member skills', 403));
    }

    // Check if target user exists and is part of project
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const isTeamMember = await project.hasUserAccess(user_id);
    if (!isTeamMember) {
      return next(new AppError('User is not a member of this project', 404));
    }

    // Create skill
    const skill = await TeamMemberSkills.create({
      user_id,
      project_id: id,
      skill_name,
      proficiency_level,
      years_experience
    });

    logger.info(`Skill added to team member: ${skill_name}`, { 
      projectId: id, 
      userId: user_id,
      skillId: skill.id,
      addedBy: userId 
    });

    res.json(successResponse({
      skill: skill.getSkillSummary()
    }, 'Skill added to team member successfully'));

  } catch (error) {
    logger.error('Add team member skill error:', error);
    
    if (error.message.includes('Skill already exists')) {
      return next(new AppError('This skill already exists for the team member', 400));
    }
    
    next(new AppError('Failed to add skill to team member. Please try again.', 500));
  }
};

// Update skill proficiency
const updateSkillProficiency = async (req, res, next) => {
  try {
    const { skill_id } = req.params;
    const { proficiency_level, years_experience } = req.body;
    const userId = req.user.id;

    // Find skill
    const skill = await TeamMemberSkills.findById(skill_id);
    if (!skill) {
      return next(new AppError('Skill not found', 404));
    }

    // Find project
    const project = await Project.findById(skill.project_id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permissions - user can update their own skills or admin/manager can update any
    const userRole = await project.getUserRole(userId);
    const canUpdate = userId === skill.user_id || ['Admin', 'Project Manager'].includes(userRole);
    
    if (!canUpdate) {
      return next(new AppError('Insufficient permissions to update this skill', 403));
    }

    // Update skill
    if (proficiency_level) {
      skill.proficiency_level = proficiency_level;
    }
    if (years_experience !== undefined) {
      skill.years_experience = years_experience;
    }

    await skill.save();

    logger.info(`Skill updated: ${skill.skill_name}`, { 
      skillId: skill.id,
      projectId: skill.project_id,
      updatedBy: userId 
    });

    res.json(successResponse({
      skill: skill.getSkillSummary()
    }, 'Skill updated successfully'));

  } catch (error) {
    logger.error('Update skill proficiency error:', error);
    next(new AppError('Failed to update skill. Please try again.', 500));
  }
};

// Remove skill from team member
const removeTeamMemberSkill = async (req, res, next) => {
  try {
    const { skill_id } = req.params;
    const userId = req.user.id;

    // Find skill
    const skill = await TeamMemberSkills.findById(skill_id);
    if (!skill) {
      return next(new AppError('Skill not found', 404));
    }

    // Find project
    const project = await Project.findById(skill.project_id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check permissions - user can remove their own skills or admin/manager can remove any
    const userRole = await project.getUserRole(userId);
    const canRemove = userId === skill.user_id || ['Admin', 'Project Manager'].includes(userRole);
    
    if (!canRemove) {
      return next(new AppError('Insufficient permissions to remove this skill', 403));
    }

    // Remove skill
    await skill.delete();

    logger.info(`Skill removed: ${skill.skill_name}`, { 
      skillId: skill.id,
      projectId: skill.project_id,
      removedBy: userId 
    });

    res.json(successResponse({}, 'Skill removed successfully'));

  } catch (error) {
    logger.error('Remove team member skill error:', error);
    next(new AppError('Failed to remove skill. Please try again.', 500));
  }
};

// Get skill statistics for project
const getProjectSkillStats = async (req, res, next) => {
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

    // Get all project skills
    const skills = await TeamMemberSkills.findByProjectId(id);

    // Calculate statistics
    const skillStats = {};
    const proficiencyStats = {
      'Beginner': 0,
      'Intermediate': 0,
      'Advanced': 0,
      'Expert': 0
    };

    skills.forEach(skill => {
      // Count skills
      if (!skillStats[skill.skill_name]) {
        skillStats[skill.skill_name] = {
          count: 0,
          avg_proficiency: 0,
          avg_experience: 0,
          proficiency_levels: { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0, 'Expert': 0 }
        };
      }
      
      skillStats[skill.skill_name].count++;
      skillStats[skill.skill_name].proficiency_levels[skill.proficiency_level]++;
      
      // Count overall proficiency
      proficiencyStats[skill.proficiency_level]++;
    });

    // Calculate averages
    Object.keys(skillStats).forEach(skillName => {
      const skillData = skillStats[skillName];
      const skillInstances = skills.filter(s => s.skill_name === skillName);
      
      skillData.avg_proficiency = skillInstances.reduce((sum, s) => sum + s.getProficiencyScore(), 0) / skillInstances.length;
      skillData.avg_experience = skillInstances.reduce((sum, s) => sum + s.years_experience, 0) / skillInstances.length;
    });

    res.json(successResponse({
      total_skills: skills.length,
      unique_skills: Object.keys(skillStats).length,
      skill_breakdown: skillStats,
      proficiency_distribution: proficiencyStats,
      team_size: (await project.getTeamMembers()).length
    }, 'Project skill statistics retrieved successfully'));

  } catch (error) {
    logger.error('Get project skill stats error:', error);
    next(new AppError('Failed to retrieve skill statistics. Please try again.', 500));
  }
};

module.exports = {
  getProjectSkills,
  getUserProjectSkills,
  addTeamMemberSkill,
  updateSkillProficiency,
  removeTeamMemberSkill,
  getProjectSkillStats
};
