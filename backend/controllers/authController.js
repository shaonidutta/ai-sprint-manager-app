const User = require('../models/User');
const database = require('../config/database');
const logger = require('../config/logger');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const { AppError } = require('../utils/errors');
const { deleteOldAvatar } = require('../middleware/upload');
const { logLogin, logLogout, logRegister, ACTIVITY_TYPES, logActivity } = require('../middleware/activityLogger');
const path = require('path');

// Register a new user
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }

    // Create new user
    const userData = {
      email: email.toLowerCase().trim(),
      password,
      first_name: first_name.trim(),
      last_name: last_name.trim()
    };

    const user = await User.create(userData);

    // Send OTP for verification
    try {
      if (emailService.isReady()) {
        const { otp, expiresAt } = await otpService.createOTP(user.id, user.email);
        await emailService.sendOTPVerificationEmail(user, otp, otpService.OTP_EXPIRY_MINUTES);
        logger.info(`OTP sent to ${user.email}`, { userId: user.id });
      } else {
        logger.warn('Email service not configured, skipping OTP email');
      }
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      // Don't fail registration if email fails
    }

    logger.info(`New user registered: ${user.email}`, { userId: user.id });

    // Log registration activity
    try {
      await logRegister(req, user.id);
    } catch (activityError) {
      logger.error('Failed to log registration activity:', activityError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(new AppError('Registration failed. Please try again.', 500));
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive()) {
      return next(new AppError('Account is deactivated. Please contact support.', 401));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if email is verified and handle verification
    if (!user.isVerified()) {
      try {
        // Generate and send new OTP
        const { otp, expiresAt } = await otpService.createOTP(user.id, user.email);
        
        if (emailService.isReady()) {
          await emailService.sendOTPVerificationEmail(user, otp, otpService.OTP_EXPIRY_MINUTES);
          logger.info(`OTP sent to ${user.email} for verification`, { 
            userId: user.id,
            expiresAt: expiresAt.toISOString()
          });
        }

        return res.status(403).json({
          success: false,
          error: {
            message: 'Please verify your email address. A new verification code has been sent to your email.',
            code: 'EMAIL_NOT_VERIFIED',
            data: {
              email: user.email,
              requiresVerification: true,
              expiresAt: expiresAt.toISOString()
            }
          }
        });
      } catch (otpError) {
        logger.error('Failed to send OTP during login:', otpError);
        return next(new AppError('Failed to send verification code. Please try again.', 500));
      }
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in database
    await storeRefreshToken(user.id, refreshToken);

    logger.info(`User logged in: ${user.email}`, { userId: user.id });

    // Log login activity
    try {
      await logLogin(req, user.id);
    } catch (activityError) {
      logger.error('Failed to log login activity:', activityError);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRE || '15m'
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(new AppError('Login failed. Please try again.', 500));
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Check if refresh token exists in database
    const tokenExists = await checkRefreshToken(decoded.id, refresh_token);
    if (!tokenExists) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive()) {
      return next(new AppError('User not found or inactive', 401));
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();

    logger.info(`Token refreshed for user: ${user.email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRE || '15m'
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    next(new AppError('Token refresh failed. Please login again.', 500));
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const userId = req.user?.id;

    if (refresh_token) {
      // Remove refresh token from database
      await removeRefreshToken(userId, refresh_token);
    }

    logger.info(`User logged out`, { userId });

    // Log logout activity
    if (userId) {
      try {
        await logLogout(req, userId);
      } catch (activityError) {
        logger.error('Failed to log logout activity:', activityError);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(new AppError('Logout failed', 500));
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    next(new AppError('Failed to get user profile', 500));
  }
};

// Helper function to store refresh token with UTC time
const storeRefreshToken = async (userId, token) => {
  try {
    const bcrypt = require('bcryptjs');
    const tokenHash = await bcrypt.hash(token, 10);
    
    // Create dates in UTC
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    
    // Format dates for MySQL (YYYY-MM-DD HH:mm:ss)
    const mysqlNow = now.toISOString().slice(0, 19).replace('T', ' ');
    const mysqlExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    logger.info('Storing refresh token', {
      userId,
      createdAt: mysqlNow,
      expiresAt: mysqlExpiresAt
    });

    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `;

    await database.query(query, [userId, tokenHash, mysqlNow, mysqlExpiresAt]);
    
    logger.info('Refresh token stored successfully', { userId });
  } catch (error) {
    logger.error('Error storing refresh token:', error);
    throw error;
  }
};

// Helper function to check refresh token with UTC time
const checkRefreshToken = async (userId, token) => {
  try {
    const query = `
      SELECT token_hash FROM refresh_tokens 
      WHERE user_id = ? AND UNIX_TIMESTAMP(expires_at) > UNIX_TIMESTAMP(NOW())
    `;

    const rows = await database.query(query, [userId]);
    
    const bcrypt = require('bcryptjs');
    for (const row of rows) {
      const isValid = await bcrypt.compare(token, row.token_hash);
      if (isValid) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking refresh token:', error);
    throw error;
  }
};

// Helper function to remove refresh token
const removeRefreshToken = async (userId, token) => {
  try {
    if (!userId || !token) return;

    const query = `
      SELECT id, token_hash FROM refresh_tokens 
      WHERE user_id = ? AND expires_at > NOW()
    `;

    const rows = await database.query(query, [userId]);
    
    const bcrypt = require('bcryptjs');
    for (const row of rows) {
      const isValid = await bcrypt.compare(token, row.token_hash);
      if (isValid) {
        await database.query('DELETE FROM refresh_tokens WHERE id = ?', [row.id]);
        break;
      }
    }
  } catch (error) {
    logger.error('Error removing refresh token:', error);
    // Don't throw error for logout
  }
};

// Forgot password - send reset email
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if user is active
    if (!user.isActive()) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token
    const resetToken = await user.generatePasswordResetToken();

    // Send password reset email if email service is configured
    try {
      if (emailService.isReady()) {
        await emailService.sendPasswordReset(user, resetToken);
        logger.info(`Password reset email sent to ${user.email}`, { userId: user.id });
      } else {
        return next(new AppError('Email service not configured', 503));
      }
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return next(new AppError('Failed to send password reset email. Please try again.', 500));
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    next(new AppError('Failed to process password reset request. Please try again.', 500));
  }
};

// Reset password with token
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user by password reset token
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    await user.updatePassword(password);

    logger.info(`Password reset successful for user: ${user.email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    next(new AppError('Password reset failed. Please try again.', 500));
  }
};

// Change password (for authenticated users)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    await user.updatePassword(newPassword);

    logger.info(`Password changed for user: ${user.email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    next(new AppError('Password change failed. Please try again.', 500));
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, avatar_url } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update user fields if provided
    if (first_name !== undefined) {
      user.first_name = first_name.trim();
    }
    if (last_name !== undefined) {
      user.last_name = last_name.trim();
    }
    if (avatar_url !== undefined) {
      user.avatar_url = avatar_url.trim() || null;
    }

    // Save updated user
    await user.save();

    logger.info(`Profile updated for user: ${user.email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    next(new AppError('Profile update failed. Please try again.', 500));
  }
};

// Upload avatar
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return next(new AppError('No avatar file provided', 400));
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Delete old avatar if exists
    if (user.avatar_url) {
      const oldAvatarPath = path.join(process.cwd(), user.avatar_url);
      deleteOldAvatar(oldAvatarPath);
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar_url = avatarUrl;
    await user.save();

    logger.info(`Avatar uploaded for user: ${user.email}`, {
      userId: user.id,
      filename: req.file.filename
    });

    // Log avatar upload activity
    try {
      await logActivity(userId, ACTIVITY_TYPES.AVATAR_UPLOADED, {
        details: { filename: req.file.filename },
        req
      });
    } catch (activityError) {
      logger.error('Failed to log avatar upload activity:', activityError);
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: {
        user: user.toJSON(),
        avatar_url: avatarUrl
      }
    });

  } catch (error) {
    logger.error('Avatar upload error:', error);

    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    next(new AppError('Avatar upload failed. Please try again.', 500));
  }
};

// Delete avatar
const deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if user has an avatar
    if (!user.avatar_url) {
      return next(new AppError('No avatar to delete', 400));
    }

    // Delete avatar file
    const avatarPath = path.join(process.cwd(), user.avatar_url);
    deleteOldAvatar(avatarPath);

    // Update user
    user.avatar_url = null;
    await user.save();

    logger.info(`Avatar deleted for user: ${user.email}`, { userId: user.id });

    res.json({
      success: true,
      message: 'Avatar deleted successfully.',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Avatar delete error:', error);
    next(new AppError('Avatar deletion failed. Please try again.', 500));
  }
};

// Verify email with OTP
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify OTP
    await otpService.verifyOTP(user.id, user.email, otp);

    // Mark email as verified
    user.email_verified = true;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`, { userId: user.id });

    // Send welcome email
    try {
      if (emailService.isReady()) {
        await emailService.sendWelcomeEmail(user);
        logger.info(`Welcome email sent to ${user.email}`, { userId: user.id });
      }
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully. Welcome to AI Sprint Manager!',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Verify OTP error:', error);
    next(error);
  }
};

// Send OTP for email verification
const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if already verified
    if (user.isVerified()) {
      return next(new AppError('Email is already verified', 400));
    }

    // Generate and save new OTP
    const { otp, expiresAt } = await otpService.createOTP(user.id, user.email);

    // Send OTP email
    if (emailService.isReady()) {
      await emailService.sendOTPVerificationEmail(user, otp, otpService.OTP_EXPIRY_MINUTES);
      logger.info(`OTP sent to ${user.email}`, { 
        userId: user.id,
        expiresAt: expiresAt.toISOString()
      });
    } else {
      return next(new AppError('Email service not configured', 503));
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email: user.email,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    logger.error('Send OTP error:', error);
    next(new AppError('Failed to send OTP. Please try again.', 500));
  }
};

// Get OTP status (for frontend to check cooldown)
const getOTPStatus = async (req, res, next) => {
  try {
    const { email } = req.query;

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const status = await otpService.getOTPStatus(user.id);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('Get OTP status error:', error);
    next(new AppError('Failed to get OTP status', 500));
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOTP,
  verifyOTP,
  getOTPStatus
};
