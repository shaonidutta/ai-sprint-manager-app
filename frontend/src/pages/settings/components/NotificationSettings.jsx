import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: {
      projectUpdates: true,
      taskAssignments: true,
      mentions: true,
      comments: true,
      statusChanges: false,
      dailyDigest: false,
      weeklyReport: true,
      securityAlerts: true
    },
    push: {
      projectUpdates: false,
      taskAssignments: true,
      mentions: true,
      comments: false,
      statusChanges: true,
      deadlineReminders: true
    },
    inApp: {
      projectUpdates: true,
      taskAssignments: true,
      mentions: true,
      comments: true,
      statusChanges: true,
      deadlineReminders: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement API call to save notification settings
    console.log('Saving notification settings:', settings);
    setHasChanges(false);
  };

  const NotificationToggle = ({ category, setting, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-neutral-200 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-neutral-900">{label}</p>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(category, setting)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings[category][setting] ? 'bg-primary-600' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[category][setting] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Notification Settings</h2>
        <p className="text-neutral-600">
          Control how and when you receive notifications across different channels
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Email Notifications</h3>
            <p className="text-sm text-neutral-600">Receive notifications via email</p>
          </div>
        </div>

        <div className="space-y-1">
          <NotificationToggle
            category="email"
            setting="projectUpdates"
            label="Project Updates"
            description="Get notified when there are significant updates to your projects"
          />
          <NotificationToggle
            category="email"
            setting="taskAssignments"
            label="Task Assignments"
            description="Receive emails when tasks are assigned to you"
          />
          <NotificationToggle
            category="email"
            setting="mentions"
            label="Mentions"
            description="Get notified when someone mentions you in comments or descriptions"
          />
          <NotificationToggle
            category="email"
            setting="comments"
            label="Comments"
            description="Receive notifications for new comments on tasks you're involved with"
          />
          <NotificationToggle
            category="email"
            setting="statusChanges"
            label="Status Changes"
            description="Get notified when task statuses change"
          />
          <NotificationToggle
            category="email"
            setting="dailyDigest"
            label="Daily Digest"
            description="Receive a daily summary of your tasks and updates"
          />
          <NotificationToggle
            category="email"
            setting="weeklyReport"
            label="Weekly Report"
            description="Get a weekly summary of project progress and achievements"
          />
          <NotificationToggle
            category="email"
            setting="securityAlerts"
            label="Security Alerts"
            description="Important security notifications and account changes"
          />
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Push Notifications</h3>
            <p className="text-sm text-neutral-600">Receive notifications on your device</p>
          </div>
        </div>

        <div className="space-y-1">
          <NotificationToggle
            category="push"
            setting="projectUpdates"
            label="Project Updates"
            description="Push notifications for important project changes"
          />
          <NotificationToggle
            category="push"
            setting="taskAssignments"
            label="Task Assignments"
            description="Get notified immediately when tasks are assigned to you"
          />
          <NotificationToggle
            category="push"
            setting="mentions"
            label="Mentions"
            description="Instant notifications when you're mentioned"
          />
          <NotificationToggle
            category="push"
            setting="comments"
            label="Comments"
            description="Push notifications for new comments"
          />
          <NotificationToggle
            category="push"
            setting="statusChanges"
            label="Status Changes"
            description="Get notified when task statuses change"
          />
          <NotificationToggle
            category="push"
            setting="deadlineReminders"
            label="Deadline Reminders"
            description="Reminders for upcoming task deadlines"
          />
        </div>
      </Card>

      {/* In-App Notifications */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-neutral-900">In-App Notifications</h3>
            <p className="text-sm text-neutral-600">Notifications within the application</p>
          </div>
        </div>

        <div className="space-y-1">
          <NotificationToggle
            category="inApp"
            setting="projectUpdates"
            label="Project Updates"
            description="Show notifications in the app for project changes"
          />
          <NotificationToggle
            category="inApp"
            setting="taskAssignments"
            label="Task Assignments"
            description="In-app notifications for new task assignments"
          />
          <NotificationToggle
            category="inApp"
            setting="mentions"
            label="Mentions"
            description="Show notifications when you're mentioned"
          />
          <NotificationToggle
            category="inApp"
            setting="comments"
            label="Comments"
            description="In-app notifications for new comments"
          />
          <NotificationToggle
            category="inApp"
            setting="statusChanges"
            label="Status Changes"
            description="Show notifications for status changes"
          />
          <NotificationToggle
            category="inApp"
            setting="deadlineReminders"
            label="Deadline Reminders"
            description="In-app reminders for upcoming deadlines"
          />
        </div>
      </Card>

      {/* Notification Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Notification Schedule</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium text-neutral-900">Quiet Hours</p>
              <p className="text-sm text-neutral-600">
                Disable non-urgent notifications during specified hours
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium text-neutral-900">Weekend Notifications</p>
              <p className="text-sm text-neutral-600">
                Control notifications during weekends
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 font-medium">You have unsaved changes</p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationSettings;
