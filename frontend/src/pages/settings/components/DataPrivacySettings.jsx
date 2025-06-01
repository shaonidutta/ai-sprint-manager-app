import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const DataPrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'team',
    activityTracking: true,
    analyticsOptIn: true,
    marketingEmails: false,
    dataSharing: false,
    crashReporting: true
  });

  const [exportStatus, setExportStatus] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleExportData = () => {
    setExportStatus('processing');
    // TODO: Implement data export
    setTimeout(() => {
      setExportStatus('ready');
    }, 3000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      // TODO: Implement account deletion
      console.log('Deleting account...');
    }
  };

  const profileVisibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
    { value: 'team', label: 'Team Members', description: 'Only team members can see your profile' },
    { value: 'private', label: 'Private', description: 'Only you can see your profile' }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Data & Privacy</h2>
        <p className="text-neutral-600">
          Control your data, privacy settings, and how your information is used
        </p>
      </div>

      {/* Privacy Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Privacy Controls</h3>
        
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Profile Visibility</h4>
            <div className="space-y-3">
              {profileVisibilityOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={privacySettings.profileVisibility === option.value}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <div>
                    <p className="font-medium text-neutral-900">{option.label}</p>
                    <p className="text-sm text-neutral-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Activity Tracking */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Activity Tracking</p>
              <p className="text-sm text-neutral-600">Allow tracking of your activity for analytics and improvements</p>
            </div>
            <button
              onClick={() => handlePrivacyToggle('activityTracking')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.activityTracking ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.activityTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Analytics Opt-in */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Analytics & Performance</p>
              <p className="text-sm text-neutral-600">Help improve the product by sharing anonymous usage data</p>
            </div>
            <button
              onClick={() => handlePrivacyToggle('analyticsOptIn')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.analyticsOptIn ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.analyticsOptIn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Marketing Communications</p>
              <p className="text-sm text-neutral-600">Receive emails about new features, tips, and product updates</p>
            </div>
            <button
              onClick={() => handlePrivacyToggle('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.marketingEmails ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Data Sharing with Partners</p>
              <p className="text-sm text-neutral-600">Allow sharing anonymized data with trusted partners for research</p>
            </div>
            <button
              onClick={() => handlePrivacyToggle('dataSharing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.dataSharing ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Crash Reporting */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-200">
            <div>
              <p className="font-medium text-neutral-900">Crash Reporting</p>
              <p className="text-sm text-neutral-600">Automatically send crash reports to help us fix issues</p>
            </div>
            <button
              onClick={() => handlePrivacyToggle('crashReporting')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.crashReporting ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.crashReporting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Data Management</h3>
        
        <div className="space-y-6">
          {/* Data Export */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Export Your Data</h4>
              <p className="text-sm text-neutral-600">Download a copy of all your data including projects, tasks, and comments</p>
            </div>
            <div className="flex items-center space-x-3">
              {exportStatus === 'processing' && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="text-sm text-neutral-600">Processing...</span>
                </div>
              )}
              {exportStatus === 'ready' && (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              )}
              {!exportStatus && (
                <Button variant="outline" onClick={handleExportData}>
                  Export Data
                </Button>
              )}
            </div>
          </div>

          {/* Data Retention */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Data Retention</h4>
              <p className="text-sm text-neutral-600">Configure how long your data is stored</p>
            </div>
            <Button variant="outline">
              Configure
            </Button>
          </div>

          {/* Data Portability */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Data Portability</h4>
              <p className="text-sm text-neutral-600">Transfer your data to another service</p>
            </div>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </Card>

      {/* Legal & Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Legal & Compliance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Privacy Policy</h4>
              <p className="text-sm text-neutral-600">Read our privacy policy and data handling practices</p>
            </div>
            <Button variant="outline" size="sm">
              View Policy
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Terms of Service</h4>
              <p className="text-sm text-neutral-600">Review the terms and conditions of using our service</p>
            </div>
            <Button variant="outline" size="sm">
              View Terms
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Cookie Policy</h4>
              <p className="text-sm text-neutral-600">Learn about how we use cookies and tracking technologies</p>
            </div>
            <Button variant="outline" size="sm">
              View Policy
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">GDPR Rights</h4>
              <p className="text-sm text-neutral-600">Exercise your rights under GDPR and other privacy regulations</p>
            </div>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Deletion */}
      <Card className="p-6 border-red-200">
        <h3 className="text-lg font-medium text-red-900 mb-6">Delete Account</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Permanently Delete Your Account</h4>
            <p className="text-sm text-red-700 mb-4">
              This action cannot be undone. All your data, including projects, tasks, comments, and files will be permanently deleted.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-red-900 mb-1">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="block w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                />
              </div>
              
              <Button 
                variant="danger" 
                disabled={deleteConfirmation !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataPrivacySettings;
