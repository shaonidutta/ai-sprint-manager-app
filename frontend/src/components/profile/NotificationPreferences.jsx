import { useState } from 'react';
import { motion } from 'framer-motion';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      projectUpdates: true,
      taskAssignments: true,
      mentions: true,
      dailyDigest: false,
      weeklyReport: true
    },
    pushNotifications: {
      projectUpdates: false,
      taskAssignments: true,
      mentions: true,
      statusChanges: true
    }
  });

  const handleToggle = (category, setting) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const NotificationToggle = ({ category, setting, label, description }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => handleToggle(category, setting)}
        className={`${
          preferences[category][setting] ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`${
            preferences[category][setting] ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Email Notifications</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Choose which emails you'd like to receive</p>
          </div>
          <div className="mt-6 space-y-1 divide-y divide-gray-200">
            <NotificationToggle
              category="emailNotifications"
              setting="projectUpdates"
              label="Project Updates"
              description="Get notified when there are significant updates to your projects"
            />
            <NotificationToggle
              category="emailNotifications"
              setting="taskAssignments"
              label="Task Assignments"
              description="Receive emails when tasks are assigned to you"
            />
            <NotificationToggle
              category="emailNotifications"
              setting="mentions"
              label="Mentions"
              description="Get notified when someone mentions you in comments"
            />
            <NotificationToggle
              category="emailNotifications"
              setting="dailyDigest"
              label="Daily Digest"
              description="Receive a daily summary of your tasks and updates"
            />
            <NotificationToggle
              category="emailNotifications"
              setting="weeklyReport"
              label="Weekly Report"
              description="Get a weekly summary of project progress"
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Push Notifications</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Configure browser notifications for real-time updates</p>
          </div>
          <div className="mt-6 space-y-1 divide-y divide-gray-200">
            <NotificationToggle
              category="pushNotifications"
              setting="projectUpdates"
              label="Project Updates"
              description="Get browser notifications for project updates"
            />
            <NotificationToggle
              category="pushNotifications"
              setting="taskAssignments"
              label="Task Assignments"
              description="Receive notifications when tasks are assigned to you"
            />
            <NotificationToggle
              category="pushNotifications"
              setting="mentions"
              label="Mentions"
              description="Get notified when someone mentions you"
            />
            <NotificationToggle
              category="pushNotifications"
              setting="statusChanges"
              label="Status Changes"
              description="Receive notifications when task statuses change"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences; 