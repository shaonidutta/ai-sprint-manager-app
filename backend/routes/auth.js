const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import validators
const { validateRequest } = require('../validators/userValidator');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  otpVerificationSchema
} = require('../validators/userValidator');

// Import middleware
const authMiddleware = require('../middleware/auth');
const { avatarUpload, handleUploadError } = require('../middleware/upload');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  validateRequest(registerSchema),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', 
  validateRequest(loginSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', 
  authMiddleware.authenticate,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authMiddleware.authenticate,
  authController.getProfile
);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me',
  authMiddleware.authenticate,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP for email verification
 * @access  Public
 */
router.post('/send-otp',
  authController.sendOTP
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post('/verify-otp',
  validateRequest(otpVerificationSchema),
  authController.verifyOTP
);

/**
 * @route   GET /api/v1/auth/otp-status
 * @desc    Check OTP status (for cooldown)
 * @access  Public
 */
router.get('/otp-status',
  authController.getOTPStatus
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.post('/change-password',
  authMiddleware.authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/upload-avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/upload-avatar',
  authMiddleware.authenticate,
  avatarUpload,
  handleUploadError,
  authController.uploadAvatar
);

/**
 * @route   DELETE /api/v1/auth/delete-avatar
 * @desc    Delete user avatar
 * @access  Private
 */
router.delete('/delete-avatar',
  authMiddleware.authenticate,
  authController.deleteAvatar
);

module.exports = router;
