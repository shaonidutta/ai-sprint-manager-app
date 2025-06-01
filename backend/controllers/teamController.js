const Project = require('../models/Project');
const User = require('../models/User');
const database = require('../config/database');
const logger = require('../config/logger');
const emailService = require('../services/emailService');
const { AppError } = require('../utils/errors');

// Get team members for a project
const getTeamMembers = async (req, res, next) => {
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

    res.json({
      success: true,
      data: {
        team_members: teamMembers
      }
    });

  } catch (error) {
    logger.error('Get team members error:', error);
    next(new AppError('Failed to retrieve team members. Please try again.', 500));
  }
};

// Invite team member to project
const inviteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role = 'Developer' } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has admin/manager access to this project
    const userRole = await project.getUserRole(userId);
    if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
      return next(new AppError('Insufficient permissions to invite team members', 403));
    }

    // Find user by email
    const invitedUser = await User.findByEmail(email.toLowerCase().trim());
    if (!invitedUser) {
      return next(new AppError('User with this email does not exist', 404));
    }

    // Check if user is already a team member
    const isAlreadyMember = await project.hasUserAccess(invitedUser.id);
    if (isAlreadyMember) {
      return next(new AppError('User is already a member of this project', 409));
    }

    // Add user to project
    await project.addTeamMember(invitedUser.id, role);

    // Send invitation email if email service is configured
    try {
      if (emailService.isReady()) {
        await sendTeamInvitationEmail(invitedUser, project, req.user, role);
        logger.info(`Team invitation email sent to ${invitedUser.email}`, { 
          projectId: project.id, 
          invitedUserId: invitedUser.id,
          invitedBy: userId 
        });
      }
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation if email fails
    }

    logger.info(`User invited to project: ${invitedUser.email}`, { 
      projectId: project.id, 
      invitedUserId: invitedUser.id,
      role: role,
      invitedBy: userId 
    });

    res.status(201).json({
      success: true,
      message: `${invitedUser.first_name} ${invitedUser.last_name} has been added to the project as ${role}.`,
      data: {
        user: {
          id: invitedUser.id,
          email: invitedUser.email,
          first_name: invitedUser.first_name,
          last_name: invitedUser.last_name,
          role: role
        }
      }
    });

  } catch (error) {
    logger.error('Invite team member error:', error);
    
    if (error.message === 'User is already a member of this project') {
      return next(new AppError('User is already a member of this project', 409));
    }
    
    next(new AppError('Failed to invite team member. Please try again.', 500));
  }
};

// Remove team member from project
const removeTeamMember = async (req, res, next) => {
  try {
    const { id, user_id } = req.params;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has admin/manager access to this project
    const userRole = await project.getUserRole(userId);
    if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
      return next(new AppError('Insufficient permissions to remove team members', 403));
    }

    // Don't allow removing the project owner
    if (parseInt(user_id) === project.owner_id) {
      return next(new AppError('Cannot remove project owner from team', 400));
    }

    // Check if user is actually a team member
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const isTeamMember = await project.hasUserAccess(user_id);
    if (!isTeamMember) {
      return next(new AppError('User is not a member of this project', 404));
    }

    // Remove user from project
    await project.removeTeamMember(user_id);

    logger.info(`User removed from project: ${targetUser.email}`, { 
      projectId: project.id, 
      removedUserId: user_id,
      removedBy: userId 
    });

    res.json({
      success: true,
      message: `${targetUser.first_name} ${targetUser.last_name} has been removed from the project.`
    });

  } catch (error) {
    logger.error('Remove team member error:', error);
    
    if (error.message === 'Cannot remove project owner from team') {
      return next(new AppError('Cannot remove project owner from team', 400));
    }
    
    next(new AppError('Failed to remove team member. Please try again.', 500));
  }
};

// Update team member role
const updateTeamMemberRole = async (req, res, next) => {
  try {
    const { id, user_id } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has admin access to this project
    const userRole = await project.getUserRole(userId);
    if (!userRole || userRole !== 'Admin') {
      return next(new AppError('Only project admins can change team member roles', 403));
    }

    // Don't allow changing the project owner role
    if (parseInt(user_id) === project.owner_id) {
      return next(new AppError('Cannot change project owner role', 400));
    }

    // Check if user is actually a team member
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const isTeamMember = await project.hasUserAccess(user_id);
    if (!isTeamMember) {
      return next(new AppError('User is not a member of this project', 404));
    }

    // Update user role
    await project.updateTeamMemberRole(user_id, role);

    logger.info(`Team member role updated: ${targetUser.email}`, { 
      projectId: project.id, 
      targetUserId: user_id,
      newRole: role,
      updatedBy: userId 
    });

    res.json({
      success: true,
      message: `${targetUser.first_name} ${targetUser.last_name}'s role has been updated to ${role}.`,
      data: {
        user: {
          id: targetUser.id,
          email: targetUser.email,
          first_name: targetUser.first_name,
          last_name: targetUser.last_name,
          role: role
        }
      }
    });

  } catch (error) {
    logger.error('Update team member role error:', error);
    
    if (error.message === 'Cannot change project owner role') {
      return next(new AppError('Cannot change project owner role', 400));
    }
    
    next(new AppError('Failed to update team member role. Please try again.', 500));
  }
};

// Helper function to send team invitation email
const sendTeamInvitationEmail = async (invitedUser, project, invitedBy, role) => {
  const projectUrl = `${process.env.FRONTEND_URL}/projects/${project.id}`;
  
  const mailOptions = {
    from: {
      name: process.env.FROM_NAME || 'AI Sprint Manager',
      address: process.env.FROM_EMAIL
    },
    to: invitedUser.email,
    subject: `You've been invited to join "${project.name}" - AI Sprint Manager`,
    html: getTeamInvitationTemplate(invitedUser, project, invitedBy, role, projectUrl),
    text: getTeamInvitationTextTemplate(invitedUser, project, invitedBy, role, projectUrl)
  };

  return await emailService.transporter.sendMail(mailOptions);
};

// Team invitation HTML template
const getTeamInvitationTemplate = (invitedUser, project, invitedBy, role, projectUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0052CC; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .project-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Invitation</h1>
        </div>
        <div class="content">
          <h2>Hello ${invitedUser.first_name}!</h2>
          <p><strong>${invitedBy.first_name} ${invitedBy.last_name}</strong> has invited you to join the project:</p>
          
          <div class="project-info">
            <h3>${project.name}</h3>
            <p><strong>Your Role:</strong> ${role}</p>
            <p><strong>Project Key:</strong> ${project.project_key}</p>
            ${project.description ? `<p><strong>Description:</strong> ${project.description}</p>` : ''}
          </div>
          
          <p>Click the button below to view the project and start collaborating:</p>
          <p style="text-align: center;">
            <a href="${projectUrl}" class="button">View Project</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0052CC;">${projectUrl}</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 AI Sprint Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Team invitation text template
const getTeamInvitationTextTemplate = (invitedUser, project, invitedBy, role, projectUrl) => {
  return `
Project Invitation

Hello ${invitedUser.first_name}!

${invitedBy.first_name} ${invitedBy.last_name} has invited you to join the project:

Project: ${project.name}
Your Role: ${role}
Project Key: ${project.project_key}
${project.description ? `Description: ${project.description}` : ''}

Visit the following link to view the project and start collaborating:
${projectUrl}

---
AI Sprint Manager Team
  `.trim();
};

module.exports = {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole
};
