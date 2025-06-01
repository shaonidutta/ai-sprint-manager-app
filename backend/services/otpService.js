const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

class OTPService {
  constructor() {
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_MINUTES = 60; // 1 hour
    this.MAX_ATTEMPTS = 3;
  }

  // Generate a random numeric OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and save new OTP for a user
  async createOTP(userId, email) {
    try {
      logger.info('Creating new OTP:', { userId, email });

      // Generate new OTP
      const otp = this.generateOTP();
      const createdAtTs = Math.floor(Date.now() / 1000);
      const expiresAtTs = createdAtTs + (this.OTP_EXPIRY_MINUTES * 60);

      logger.info('Creating OTP with timestamps:', {
        createdAtTs,
        expiresAtTs,
        otp
      });

      // Save OTP to database using Unix timestamps
      const insertResult = await database.query(
        'INSERT INTO email_otps (user_id, email, otp, created_at_ts, expires_at_ts) VALUES (?, ?, ?, ?, ?)',
        [userId, email, otp, createdAtTs, expiresAtTs]
      );

      // Verify the OTP was created
      const verifyCreation = await database.query(
        'SELECT * FROM email_otps WHERE id = ?',
        [insertResult.insertId]
      );

      logger.info('New OTP created:', {
        userId,
        email,
        otpId: insertResult.insertId,
        created: verifyCreation.length > 0,
        createdRecord: verifyCreation[0] ? {
          created_at_ts: verifyCreation[0].created_at_ts,
          expires_at_ts: verifyCreation[0].expires_at_ts,
          current_timestamp: Math.floor(Date.now() / 1000)
        } : null
      });

      return {
        otp,
        expiresAt: new Date(expiresAtTs * 1000) // Convert back to Date for API consistency
      };
    } catch (error) {
      logger.error('Error creating OTP:', {
        error: error.message,
        userId,
        email,
        stack: error.stack
      });
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userId, email, otp) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      logger.info('OTP Verification attempt:', {
        userId,
        email,
        otpLength: otp?.length,
        currentTimestamp
      });

      // First, let's check all recent OTPs for debugging
      const allRecentOTPs = await database.query(
        'SELECT * FROM email_otps WHERE user_id = ? AND email = ? ORDER BY created_at_ts DESC LIMIT 5',
        [userId, email]
      );

      logger.info('Recent OTPs:', {
        count: allRecentOTPs.length,
        currentTimestamp,
        otps: allRecentOTPs.map(record => ({
          id: record.id,
          created_at_ts: record.created_at_ts,
          expires_at_ts: record.expires_at_ts,
          is_expired: record.expires_at_ts < currentTimestamp,
          time_until_expiry: record.expires_at_ts - currentTimestamp
        }))
      });

      // Get valid OTP
      const result = await database.query(
        'SELECT * FROM email_otps WHERE user_id = ? AND email = ? AND expires_at_ts > ? ORDER BY created_at_ts DESC LIMIT 1',
        [userId, email, currentTimestamp]
      );

      logger.info('Found OTP record:', {
        found: result.length > 0,
        record: result.length > 0 ? {
          id: result[0].id,
          user_id: result[0].user_id,
          email: result[0].email,
          attempts: result[0].attempts,
          expires_at_ts: result[0].expires_at_ts,
          time_until_expiry: result[0].expires_at_ts - currentTimestamp,
          otp_matches: result[0].otp === otp
        } : null,
        currentTimestamp
      });

      if (result.length === 0) {
        throw new AppError('No valid OTP found or OTP has expired', 400);
      }

      const otpRecord = result[0];

      if (otpRecord.otp !== otp) {
        await database.query(
          'UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?',
          [otpRecord.id]
        );
        throw new AppError('Invalid OTP', 400);
      }

      if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
        throw new AppError('Maximum verification attempts exceeded. Please request a new OTP', 400);
      }

      // Mark user as verified
      await database.query(
        'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      // Invalidate all OTPs by setting their expiration to current timestamp
      await database.query(
        'UPDATE email_otps SET expires_at_ts = ? WHERE user_id = ?',
        [currentTimestamp, userId]
      );

      logger.info('OTP verification successful', { userId, email });

      return true;
    } catch (error) {
      logger.error('Error verifying OTP:', {
        error: error.message,
        userId,
        email,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new OTPService(); 