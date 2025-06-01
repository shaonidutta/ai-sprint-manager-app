# Email Notification System - Complete Implementation Guide

## Overview

This guide provides a comprehensive, step-by-step explanation of how the email notification system is implemented in the HackMap application. The system handles team invitation emails with a robust fallback mechanism and professional HTML templates.

## Architecture Overview

```
User Action (Team Invite) → Database Notification → Email Service → SMTP/Mock → Recipient
                                    ↓
                            Frontend Notification Display
```

## 1. System Components

### 1.1 Core Dependencies
- **nodemailer**: Email sending library
- **dotenv**: Environment variable management
- **mysql2**: Database connectivity

### 1.2 Key Files
- `server/utils/email.utils.js` - Email service implementation
- `server/controllers/team.controller.js` - Team invitation logic
- `server/controllers/notification.controller.js` - Notification management
- `server/.env` - Email configuration
- Database: `notification` table

## 2. Database Schema

### 2.1 Notification Table Structure
```sql
CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type notification_type NOT NULL,  -- 'TEAM_INVITE', 'JOIN_REQUEST'
    team_id INTEGER NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status notification_status NOT NULL DEFAULT 'PENDING',  -- 'PENDING', 'ACCEPTED', 'DECLINED'
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2.2 Related Tables
- `user` - Stores user email addresses
- `team` - Team information for invitations
- `team_member` - Team membership tracking

## 3. Environment Configuration

### 3.1 Email Configuration Options

#### Option 1: Gmail Configuration (Recommended)
```env
EMAIL_USERNAME=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=HackMap
```

#### Option 2: Generic SMTP Configuration
```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@example.com
```

### 3.2 Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings → Security → App Passwords
3. Generate app password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

## 4. Email Service Implementation

### 4.1 Transporter Creation (`createTransporter()`)

```javascript
const createTransporter = () => {
  // Priority 1: Gmail Configuration
  if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Priority 2: Mock Transporter (Development/Fallback)
  return mockTransporter;
};
```

### 4.2 Mock Transporter (Fallback Mechanism)
When email credentials are not configured:
- Logs email content to console
- Simulates successful sending
- Prevents application crashes
- Useful for development/testing

### 4.3 Email Sending Function (`sendEmail()`)
```javascript
const sendEmail = async (options) => {
  // 1. Validate recipient email
  // 2. Create transporter
  // 3. Build mail options
  // 4. Send email
  // 5. Handle errors gracefully
  // 6. Return success/failure status
};
```

## 5. Team Invitation Flow

### 5.1 Complete Invitation Process

#### Step 1: User Initiates Invitation
- Frontend: User enters invitee email
- API Call: `POST /api/teams/:id/invite`
- Authentication: JWT token verification

#### Step 2: Backend Validation
```javascript
// 1. Verify team exists and user has permission
// 2. Check if invitee is registered user
// 3. Validate team size limits
// 4. Check for existing invitations
```

#### Step 3: Database Operations
```javascript
// 1. Create notification record
const result = await query(`
  INSERT INTO notification (user_id, type, team_id, sender_id, status)
  VALUES (?, 'TEAM_INVITE', ?, ?, 'PENDING')
`, [inviteeId, teamId, userId]);

// 2. Get notification ID for response
const notificationId = result.insertId;
```

#### Step 4: Email Sending
```javascript
// 1. Retrieve user details
const inviterName = await getUserName(userId);
const teamName = await getTeamName(teamId);
const inviteeEmail = await getUserEmail(inviteeId);

// 2. Send email
const emailSent = await sendTeamInviteEmail(inviteeEmail, inviterName, teamName);
```

#### Step 5: Response Handling
```javascript
// 1. Log email status
// 2. Return notification details
// 3. Handle errors gracefully
```

## 6. Email Template System

### 6.1 HTML Email Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Team Invitation</title>
</head>
<body style="font-family: Arial, sans-serif;">
  <!-- Header -->
  <div style="background-color: #4f46e5; color: white; padding: 20px;">
    <h1>HackMap Team Invitation</h1>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join their team <strong>${teamName}</strong> on HackMap.</p>
    <p>Log in to your HackMap account and check your notifications to accept or decline this invitation.</p>
    <p>Thanks,<br>The HackMap Team</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f5f5f5; padding: 20px;">
    <p>&copy; ${new Date().getFullYear()} HackMap. All rights reserved.</p>
  </div>
</body>
</html>
```

### 6.2 Plain Text Fallback
```text
Hello,

${inviterName} has invited you to join their team ${teamName} on HackMap.

Log in to your HackMap account and check your notifications to accept or decline this invitation.

Thanks,
The HackMap Team
```

## 7. Notification Management

### 7.1 Retrieving Notifications
```javascript
// API: GET /api/notifications
// Returns: User's notifications with sender and team details
const notifications = await query(`
  SELECT n.id, n.type, n.team_id, n.sender_id, n.status, n.created_at,
         u.username as sender_username, t.name as team_name
  FROM notification n
  JOIN user u ON n.sender_id = u.id
  JOIN team t ON n.team_id = t.id
  WHERE n.user_id = ?
  ORDER BY n.created_at DESC
`, [userId]);
```

### 7.2 Responding to Notifications
```javascript
// API: POST /api/notifications/:id/respond
// Body: { action: 'ACCEPT' | 'DECLINE' }

// 1. Validate notification ownership
// 2. Check notification status (must be PENDING)
// 3. Update notification status
// 4. If ACCEPTED: Add user to team (with size validation)
```

## 8. Error Handling & Resilience

### 8.1 Email Sending Errors
- Network failures: Graceful degradation
- Invalid credentials: Falls back to mock transporter
- Missing recipient: Skips email, continues with notification
- SMTP errors: Logged but don't break the flow

### 8.2 Database Errors
- Transaction rollback for critical operations
- Detailed error logging
- User-friendly error messages

### 8.3 Validation Errors
- Input sanitization
- Business rule validation
- Proper HTTP status codes

## 9. Security Considerations

### 9.1 Email Security
- App passwords instead of account passwords
- Environment variable protection
- No sensitive data in email content
- Rate limiting (can be implemented)

### 9.2 Notification Security
- User ownership validation
- Team permission checks
- Status transition validation
- SQL injection prevention

## 10. Testing Strategy

### 10.1 Development Testing
- Mock transporter for local development
- Console logging for email verification
- Database transaction testing

### 10.2 Production Testing
- Test email sending with real SMTP
- Monitor email delivery rates
- Error tracking and alerting

## 11. Monitoring & Maintenance

### 11.1 Logging
- Email sending attempts and results
- Error tracking with stack traces
- Performance monitoring

### 11.2 Metrics to Track
- Email delivery success rate
- Notification response rates
- System performance impact

## 12. Future Enhancements

### 12.1 Potential Improvements
- Email queue system for high volume
- Email templates for different notification types
- Email preferences management
- Delivery status tracking
- Rich HTML email designs
- Email analytics and tracking

### 12.2 Scalability Considerations
- Background job processing
- Email service providers (SendGrid, AWS SES)
- Caching for user data
- Database optimization

## 13. Code Implementation Details

### 13.1 Email Utility Functions

#### Core Email Sending Function
```javascript
// server/utils/email.utils.js
const sendEmail = async (options) => {
  try {
    // Validation
    if (!options.to) {
      console.log('Email sending skipped: Recipient email is missing');
      return { success: false };
    }

    // Create transporter (Gmail or Mock)
    const transporter = createTransporter();

    // Build email options
    const fromName = process.env.EMAIL_FROM_NAME || "HackMap";
    const fromEmail = process.env.EMAIL_USERNAME || "noreply@hackmap.app";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };

    console.log('Sending email to:', options.to);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
```

#### Team Invitation Email Function
```javascript
const sendTeamInviteEmail = async (to, inviterName, teamName) => {
  const subject = `You've been invited to join ${teamName} on HackMap`;

  // Plain text version
  const text = `Hello,\n\n${inviterName} has invited you to join their team ${teamName} on HackMap.\n\nLog in to your HackMap account and check your notifications to accept or decline this invitation.\n\nThanks,\nThe HackMap Team`;

  // HTML version with styling
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Team Invitation - HackMap</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">HackMap Team Invitation</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin-top: 0;">Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join their team <strong>${teamName}</strong> on HackMap.</p>
          <p>Log in to your HackMap account and check your notifications to accept or decline this invitation.</p>
          <p style="margin-bottom: 0;">Thanks,<br>The HackMap Team</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} HackMap. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({ to, subject, text, html });
  return result.success;
};
```

### 13.2 Team Controller Implementation

#### Team Invitation Endpoint
```javascript
// server/controllers/team.controller.js
const inviteUserToTeam = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    const teamId = req.params.id;
    const { email } = req.body;

    // 1. Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 2. Check if team exists and user has permission
    const teams = await query('SELECT * FROM team WHERE id = ?', [teamId]);
    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = teams[0];

    // 3. Check if user is team member (has permission to invite)
    const isTeamMember = await query(
      'SELECT * FROM team_member WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    if (isTeamMember.length === 0) {
      return res.status(403).json({ message: 'You must be a team member to invite others' });
    }

    // 4. Check if invitee exists
    const invitees = await query('SELECT * FROM user WHERE email = ?', [email]);
    if (invitees.length === 0) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const invitee = invitees[0];
    const inviteeId = invitee.id;

    // 5. Check if user is already a team member
    const isAlreadyMember = await query(
      'SELECT * FROM team_member WHERE team_id = ? AND user_id = ?',
      [teamId, inviteeId]
    );

    if (isAlreadyMember.length > 0) {
      return res.status(409).json({ message: 'User is already a team member' });
    }

    // 6. Check if invitation already exists
    const existingInvitation = await query(`
      SELECT * FROM notification
      WHERE user_id = ? AND team_id = ? AND type = 'TEAM_INVITE' AND status = 'PENDING'
    `, [inviteeId, teamId]);

    if (existingInvitation.length > 0) {
      return res.status(409).json({ message: 'Invitation already sent' });
    }

    // 7. Create notification
    const result = await query(`
      INSERT INTO notification (user_id, type, team_id, sender_id, status)
      VALUES (?, 'TEAM_INVITE', ?, ?, 'PENDING')
    `, [inviteeId, teamId, userId]);

    // 8. Get user details for email
    const inviter = await query('SELECT username FROM user WHERE id = ?', [userId]);
    const inviterName = inviter[0].username;
    const teamName = team.name;
    const inviteeEmail = invitee.email;

    // 9. Send email invitation
    const emailSent = await sendTeamInviteEmail(inviteeEmail, inviterName, teamName);
    if (emailSent) {
      console.log(`Email invitation sent successfully to ${inviteeEmail}`);
    } else {
      console.log(`Email invitation could not be sent to ${inviteeEmail}, but notification was created`);
    }

    // 10. Return success response
    res.status(201).json({
      notification_id: result.insertId,
      type: 'TEAM_INVITE',
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Error in inviteUserToTeam:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 13.3 Notification Controller Implementation

#### Get User Notifications
```javascript
// server/controllers/notification.controller.js
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's notifications with related data
    const notifications = await query(`
      SELECT n.id, n.type, n.team_id, n.sender_id, n.status, n.created_at,
             u.username as sender_username, t.name as team_name
      FROM notification n
      JOIN user u ON n.sender_id = u.id
      JOIN team t ON n.team_id = t.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [userId]);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

#### Respond to Notification
```javascript
const respondToNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;
    const { action } = req.body;

    // 1. Validate action
    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({ message: 'Valid action (ACCEPT or DECLINE) is required' });
    }

    // 2. Get notification
    const notifications = await query(
      'SELECT * FROM notification WHERE id = ?',
      [notificationId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = notifications[0];

    // 3. Verify ownership
    if (notification.user_id !== userId) {
      return res.status(403).json({ message: 'You can only respond to your own notifications' });
    }

    // 4. Check if still pending
    if (notification.status !== 'PENDING') {
      return res.status(400).json({ message: 'This notification has already been responded to' });
    }

    // 5. Update notification status
    const status = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
    await query(
      'UPDATE notification SET status = ? WHERE id = ?',
      [status, notificationId]
    );

    // 6. If accepted, add user to team
    if (action === 'ACCEPT' && notification.type === 'TEAM_INVITE') {
      // Check team size limit
      const team = await query('SELECT * FROM team WHERE id = ?', [notification.team_id]);
      const hackathonId = team[0].hackathon_id;
      const hackathon = await query('SELECT team_size_limit FROM hackathon WHERE id = ?', [hackathonId]);
      const teamSizeLimit = hackathon[0].team_size_limit;

      const memberCount = await query(
        'SELECT COUNT(*) as count FROM team_member WHERE team_id = ?',
        [notification.team_id]
      );

      if (memberCount[0].count >= teamSizeLimit) {
        // Revert notification status
        await query(
          'UPDATE notification SET status = ? WHERE id = ?',
          ['DECLINED', notificationId]
        );
        return res.status(403).json({ message: 'Team is full' });
      }

      // Add user to team
      await query(
        'INSERT INTO team_member (team_id, user_id) VALUES (?, ?)',
        [notification.team_id, userId]
      );
    }

    res.status(200).json({
      id: parseInt(notificationId),
      status
    });
  } catch (error) {
    console.error('Error in respondToNotification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

## 14. Frontend Integration

### 14.1 API Service Functions
```typescript
// client/src/services/api.ts
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/api/notifications',
  RESPOND: (id: number) => `/api/notifications/${id}/respond`
};

export const TEAM_ENDPOINTS = {
  INVITE: (id: number) => `/api/teams/${id}/invite`
};
```

### 14.2 Notification Handling
```typescript
// Handle notification response
const handleNotificationResponse = async (notificationId: number, action: 'ACCEPT' | 'DECLINE') => {
  try {
    setProcessingNotificationId(notificationId);

    // Get notification details for better messaging
    const notification = notifications.find(n => n.id === notificationId);
    const teamName = notification?.team_name || 'team';

    // Call API to respond to notification
    await api.post(NOTIFICATION_ENDPOINTS.RESPOND(notificationId), { action });

    // Update notifications list
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' }
        : notification
    ));

    // Show success message
    const actionText = action === 'ACCEPT' ? 'accepted' : 'declined';
    showToast(`Successfully ${actionText} invitation to join ${teamName}`, 'success');
  } catch (error) {
    console.error('Error responding to notification:', error);
    showToast('Failed to respond to notification', 'error');
  } finally {
    setProcessingNotificationId(null);
  }
};
```

## 15. Deployment Considerations

### 15.1 Environment Variables Setup
```bash
# Production .env file
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=hackmap
DB_PORT=3306

# JWT
JWT_SECRET=your-very-secure-jwt-secret
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_USERNAME=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=HackMap
```

### 15.2 Production Checklist
- [ ] Email credentials configured and tested
- [ ] Database notifications table created
- [ ] SMTP connection tested
- [ ] Error monitoring setup
- [ ] Email delivery monitoring
- [ ] Rate limiting implemented (optional)
- [ ] Backup email service configured (optional)

## Conclusion

This email notification system provides a robust, scalable foundation for team communication in the HackMap platform. The fallback mechanism ensures the application works in all environments, while the modular design allows for easy extension and maintenance.

Key benefits:
- **Reliability**: Graceful fallback to mock transporter
- **Security**: Proper validation and error handling
- **Scalability**: Modular design for easy extension
- **User Experience**: Professional HTML email templates
- **Developer Experience**: Comprehensive logging and error tracking
