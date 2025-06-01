const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  // Initialize email service with SMTP configuration
  async initialize() {
    try {
      // Validate required environment variables
      const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        logger.warn(`Email service not configured. Missing environment variables: ${missingVars.join(', ')}`);
        return false;
      }

      // Create transporter with proper Gmail configuration
      const transportConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      // For Gmail, use service configuration for better compatibility
      if (process.env.SMTP_HOST.includes('gmail')) {
        transportConfig.service = 'gmail';
        // Remove host and port when using service
        delete transportConfig.host;
        delete transportConfig.port;
        delete transportConfig.secure;
      }

      this.transporter = nodemailer.createTransport(transportConfig);

      // Log configuration for debugging
      logger.info('Email service configuration:', {
        host: transportConfig.host || 'gmail service',
        port: transportConfig.port || 'default',
        secure: transportConfig.secure,
        service: transportConfig.service,
        user: process.env.SMTP_USER
      });

      // Verify connection (skip in development if credentials are invalid)
      try {
        await this.transporter.verify();
        this.isConfigured = true;
        logger.info('Email service initialized successfully');
        return true;
      } catch (verifyError) {
        logger.error('Email service verification failed:', {
          error: verifyError.message,
          code: verifyError.code,
          command: verifyError.command
        });

        if (process.env.NODE_ENV === 'development') {
          logger.warn('Email service verification failed in development mode. Email features will be disabled.');
          this.isConfigured = false;
          return false;
        } else {
          throw verifyError;
        }
      }

    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.isConfigured = false;
      return false;
    }
  }

  // Check if email service is ready
  isReady() {
    return this.isConfigured && this.transporter;
  }

  // Send OTP verification email
  async sendOTPVerificationEmail(user, otp, expiresInMinutes) {
    if (!this.isReady()) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'AI Sprint Manager',
          address: process.env.FROM_EMAIL
        },
        to: user.email,
        subject: 'Verify Your Email - AI Sprint Manager',
        html: this.getOTPEmailTemplate(user, otp, expiresInMinutes),
        text: this.getOTPEmailTextTemplate(user, otp, expiresInMinutes)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`OTP verification email sent to ${user.email}`, { messageId: result.messageId });
      return result;

    } catch (error) {
      logger.error(`Failed to send OTP verification email to ${user.email}:`, error);
      throw error;
    }
  }

  // OTP verification email HTML template
  getOTPEmailTemplate(user, otp, expiresInMinutes) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0052CC; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .otp-code { font-size: 32px; font-weight: bold; text-align: center; 
                     letter-spacing: 4px; margin: 20px 0; color: #0052CC; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Sprint Manager</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${user.first_name} ${user.last_name}!</h2>
            <p>Thank you for registering with AI Sprint Manager. To verify your email address, please use the following verification code:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in ${expiresInMinutes} minutes.</p>
            <p><strong>Important:</strong></p>
            <ul>
              <li>Never share this code with anyone</li>
              <li>Our team will never ask for this code</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; 2024 AI Sprint Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // OTP verification email text template
  getOTPEmailTextTemplate(user, otp, expiresInMinutes) {
    return `
Welcome to AI Sprint Manager, ${user.first_name} ${user.last_name}!

Thank you for registering with AI Sprint Manager. To verify your email address, please use the following verification code:

${otp}

This code will expire in ${expiresInMinutes} minutes.

Important:
- Never share this code with anyone
- Our team will never ask for this code
- If you didn't request this code, please ignore this email

---
AI Sprint Manager Team
    `.trim();
  }

  // Send password reset email
  async sendPasswordReset(user, resetToken) {
    if (!this.isReady()) {
      throw new Error('Email service not configured');
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'AI Sprint Manager',
          address: process.env.FROM_EMAIL
        },
        to: user.email,
        subject: 'Reset Your Password - AI Sprint Manager',
        html: this.getPasswordResetTemplate(user, resetUrl),
        text: this.getPasswordResetTextTemplate(user, resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${user.email}`, { messageId: result.messageId });
      return result;

    } catch (error) {
      logger.error(`Failed to send password reset email to ${user.email}:`, error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    if (!this.isReady()) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'AI Sprint Manager',
          address: process.env.FROM_EMAIL
        },
        to: user.email,
        subject: 'Welcome to AI Sprint Manager!',
        html: this.getWelcomeTemplate(user),
        text: this.getWelcomeTextTemplate(user)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}`, { messageId: result.messageId });
      return result;

    } catch (error) {
      logger.error(`Failed to send welcome email to ${user.email}:`, error);
      throw error;
    }
  }

  // Email verification HTML template
  getEmailVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0052CC; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Sprint Manager</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${user.first_name} ${user.last_name}!</h2>
            <p>Thank you for registering with AI Sprint Manager. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0052CC;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AI Sprint Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email verification text template
  getEmailVerificationTextTemplate(user, verificationUrl) {
    return `
Welcome to AI Sprint Manager, ${user.first_name} ${user.last_name}!

Thank you for registering with AI Sprint Manager. To complete your registration, please verify your email address by visiting the following link:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

---
AI Sprint Manager Team
    `.trim();
  }

  // Password reset HTML template
  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0052CC; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Sprint Manager</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.first_name} ${user.last_name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0052CC;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AI Sprint Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password reset text template
  getPasswordResetTextTemplate(user, resetUrl) {
    return `
Password Reset Request

Hello ${user.first_name} ${user.last_name},

We received a request to reset your password. Visit the following link to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

---
AI Sprint Manager Team
    `.trim();
  }

  // Welcome email HTML template
  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Sprint Manager</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0052CC; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI Sprint Manager!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name} ${user.last_name}!</h2>
            <p>Your email has been verified successfully. Welcome to AI Sprint Manager!</p>
            <p>You can now start using all the features of our AI-powered sprint management platform:</p>
            <ul>
              <li>Create and manage projects</li>
              <li>Plan sprints with AI assistance</li>
              <li>Track issues and progress</li>
              <li>Collaborate with your team</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AI Sprint Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Welcome email text template
  getWelcomeTextTemplate(user) {
    return `
Welcome to AI Sprint Manager!

Hello ${user.first_name} ${user.last_name}!

Your email has been verified successfully. Welcome to AI Sprint Manager!

You can now start using all the features of our AI-powered sprint management platform:
- Create and manage projects
- Plan sprints with AI assistance
- Track issues and progress
- Collaborate with your team

Visit ${process.env.FRONTEND_URL}/dashboard to get started.

---
AI Sprint Manager Team
    `.trim();
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
