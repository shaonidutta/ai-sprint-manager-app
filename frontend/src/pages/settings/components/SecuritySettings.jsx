import React, { useState } from 'react';
import { Card, Button, Input } from '../../../components/common';

const SecuritySettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [sessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, NY',
      lastActive: '2024-01-15T10:30:00Z',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'New York, NY',
      lastActive: '2024-01-14T15:45:00Z',
      current: false
    },
    {
      id: 3,
      device: 'Firefox on macOS',
      location: 'San Francisco, CA',
      lastActive: '2024-01-13T09:20:00Z',
      current: false
    }
  ]);

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = validatePassword();
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    // TODO: Implement password change API call
    console.log('Changing password...');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTerminateSession = (sessionId) => {
    // TODO: Implement session termination
    console.log('Terminating session:', sessionId);
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Active now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Security Settings</h2>
        <p className="text-neutral-600">
          Manage your account security and authentication settings
        </p>
      </div>

      {/* Password Change */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                error={passwordErrors.currentPassword}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.current ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                error={passwordErrors.newPassword}
                placeholder="Enter your new password"
                helperText="Password must be at least 8 characters long"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.confirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Two-Factor Authentication</h3>
            <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Disabled
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">Authenticator App</p>
                <p className="text-sm text-neutral-600">Use an authenticator app to generate verification codes</p>
              </div>
              <Button variant="outline" size="sm">
                Setup
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">SMS Verification</p>
                <p className="text-sm text-neutral-600">Receive verification codes via text message</p>
              </div>
              <Button variant="outline" size="sm">
                Setup
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Active Sessions</h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-neutral-900">{session.device}</p>
                    {session.current && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">{session.location}</p>
                  <p className="text-xs text-neutral-500">{formatLastActive(session.lastActive)}</p>
                </div>
              </div>
              {!session.current && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <Button variant="outline" fullWidth>
            Terminate All Other Sessions
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySettings;
