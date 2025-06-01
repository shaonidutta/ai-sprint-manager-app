import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../../components/common';
import { useAuth } from '../../../context/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Account & Profile</h2>
        <p className="text-neutral-600">
          Manage your personal information and account preferences
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary-700">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-neutral-600">{user?.email}</p>
              <p className="text-sm text-neutral-500">
                {user?.job_title || 'No job title set'} • {user?.department || 'No department set'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/profile'}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Personal Information</h3>
              <p className="text-neutral-600 mb-4">
                Update your name, contact details, and professional information
              </p>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Manage Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Notification Preferences</h3>
              <p className="text-neutral-600 mb-4">
                Control how and when you receive notifications
              </p>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Configure Notifications
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Status */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Account Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Account Type</p>
              <p className="text-sm text-neutral-600">Standard User</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Email Verification</p>
              <p className="text-sm text-neutral-600">Your email address is verified</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-neutral-900">Member Since</p>
              <p className="text-sm text-neutral-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountSettings;
