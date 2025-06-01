import React, { useState } from 'react';
import { Card, Button, Select } from '../../../components/common';

const ApplicationPreferences = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    defaultView: 'kanban',
    itemsPerPage: '20',
    autoSave: true,
    compactMode: false,
    showAvatars: true,
    enableAnimations: true,
    enableSounds: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement API call to save preferences
    console.log('Saving preferences:', preferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      defaultView: 'kanban',
      itemsPerPage: '20',
      autoSave: true,
      compactMode: false,
      showAvatars: true,
      enableAnimations: true,
      enableSounds: false
    });
    setHasChanges(false);
  };

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12 Hour' },
    { value: '24h', label: '24 Hour' }
  ];

  const defaultViewOptions = [
    { value: 'kanban', label: 'Kanban Board' },
    { value: 'list', label: 'List View' },
    { value: 'calendar', label: 'Calendar View' }
  ];

  const itemsPerPageOptions = [
    { value: '10', label: '10 items' },
    { value: '20', label: '20 items' },
    { value: '50', label: '50 items' },
    { value: '100', label: '100 items' }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Application Preferences</h2>
        <p className="text-neutral-600">
          Customize your application experience and default settings
        </p>
      </div>

      {/* Appearance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label="Theme"
              value={preferences.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              options={themeOptions}
              helperText="Choose your preferred color scheme"
            />
          </div>
          <div>
            <Select
              label="Language"
              value={preferences.language}
              onChange={(e) => handleChange('language', e.target.value)}
              options={languageOptions}
              helperText="Select your preferred language"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Compact Mode</p>
              <p className="text-sm text-neutral-600">Reduce spacing and padding for a denser layout</p>
            </div>
            <button
              onClick={() => handleToggle('compactMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.compactMode ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Show Avatars</p>
              <p className="text-sm text-neutral-600">Display user avatars throughout the application</p>
            </div>
            <button
              onClick={() => handleToggle('showAvatars')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.showAvatars ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.showAvatars ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Enable Animations</p>
              <p className="text-sm text-neutral-600">Show smooth transitions and animations</p>
            </div>
            <button
              onClick={() => handleToggle('enableAnimations')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.enableAnimations ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Date & Time */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Date & Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Select
              label="Timezone"
              value={preferences.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              options={timezoneOptions}
            />
          </div>
          <div>
            <Select
              label="Date Format"
              value={preferences.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              options={dateFormatOptions}
            />
          </div>
          <div>
            <Select
              label="Time Format"
              value={preferences.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              options={timeFormatOptions}
            />
          </div>
        </div>
      </Card>

      {/* Default Views */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Default Views</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label="Default Board View"
              value={preferences.defaultView}
              onChange={(e) => handleChange('defaultView', e.target.value)}
              options={defaultViewOptions}
              helperText="Choose the default view for project boards"
            />
          </div>
          <div>
            <Select
              label="Items Per Page"
              value={preferences.itemsPerPage}
              onChange={(e) => handleChange('itemsPerPage', e.target.value)}
              options={itemsPerPageOptions}
              helperText="Number of items to show in lists"
            />
          </div>
        </div>
      </Card>

      {/* Behavior */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Behavior</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Auto-save</p>
              <p className="text-sm text-neutral-600">Automatically save changes as you work</p>
            </div>
            <button
              onClick={() => handleToggle('autoSave')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoSave ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Sound Effects</p>
              <p className="text-sm text-neutral-600">Play sounds for notifications and actions</p>
            </div>
            <button
              onClick={() => handleToggle('enableSounds')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.enableSounds ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.enableSounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 font-medium">You have unsaved changes</p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
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

export default ApplicationPreferences;
