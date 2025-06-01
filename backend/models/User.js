const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const logger = require('../config/logger');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email_verified = data.email_verified || false;
    this.password_reset_token = data.password_reset_token;
    this.password_reset_expires = data.password_reset_expires;
    this.avatar_url = data.avatar_url;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = ? AND is_active = true';
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = ? AND is_active = true';
      const rows = await database.query(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findByPasswordResetToken(token) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE password_reset_token = ? 
        AND password_reset_expires > NOW() 
        AND is_active = true
      `;
      const rows = await database.query(query, [token]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      logger.error('Error finding user by password reset token:', error);
      throw error;
    }
  }

  static async findByEmailVerificationToken(token) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE email_verification_token = ? 
        AND email_verified = false 
        AND is_active = true
      `;
      const rows = await database.query(query, [token]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(rows[0]);
    } catch (error) {
      logger.error('Error finding user by email verification token:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);
      
      const query = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        userData.email,
        password_hash,
        userData.first_name,
        userData.last_name
      ];
      
      const result = await database.query(query, values);
      
      // Return the created user
      return await User.findById(result.insertId);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        const query = `
          UPDATE users SET 
            email = ?, first_name = ?, last_name = ?, 
            email_verified = ?,
            password_reset_token = ?, password_reset_expires = ?,
            avatar_url = ?, is_active = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const values = [
          this.email, this.first_name, this.last_name,
          this.email_verified,
          this.password_reset_token, this.password_reset_expires,
          this.avatar_url, this.is_active, this.id
        ];
        
        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save user without ID. Use User.create() for new users.');
      }
    } catch (error) {
      logger.error('Error saving user:', error);
      throw error;
    }
  }

  async updatePassword(newPassword) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      const query = `
        UPDATE users SET 
          password_hash = ?, 
          password_reset_token = NULL, 
          password_reset_expires = NULL,
          updated_at = NOW()
        WHERE id = ?
      `;
      
      await database.query(query, [password_hash, this.id]);
      this.password_hash = password_hash;
      this.password_reset_token = null;
      this.password_reset_expires = null;
      
      return this;
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  async verifyEmail() {
    try {
      const query = `
        UPDATE users SET 
          email_verified = true, 
          updated_at = NOW()
        WHERE id = ?
      `;
      
      await database.query(query, [this.id]);
      this.email_verified = true;
      
      return this;
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  async generatePasswordResetToken() {
    try {
      const token = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
      
      const query = `
        UPDATE users SET 
          password_reset_token = ?, 
          password_reset_expires = ?,
          updated_at = NOW()
        WHERE id = ?
      `;
      
      await database.query(query, [token, expires, this.id]);
      this.password_reset_token = token;
      this.password_reset_expires = expires;
      
      return token;
    } catch (error) {
      logger.error('Error generating password reset token:', error);
      throw error;
    }
  }

  async comparePassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw error;
    }
  }

  generateAccessToken() {
    const payload = {
      id: this.id,
      email: this.email,
      email_verified: this.email_verified
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    });
  }

  generateRefreshToken() {
    const payload = {
      id: this.id,
      type: 'refresh'
    };
    
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, email_verification_token, password_reset_token, ...userWithoutSensitiveData } = this;
    return userWithoutSensitiveData;
  }

  // Get user's full name
  getFullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  // Check if user is verified
  isVerified() {
    return this.email_verified;
  }

  // Check if user is active
  isActive() {
    return this.is_active;
  }
}

module.exports = User;
