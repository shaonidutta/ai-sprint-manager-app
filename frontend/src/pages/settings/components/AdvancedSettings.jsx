import React, { useState } from 'react';
import { Card, Button, Select, Input } from '../../../components/common';

const AdvancedSettings = () => {
  const [developerMode, setDeveloperMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [experimentalFeatures, setExperimentalFeatures] = useState({
    aiEnhancements: false,
    advancedAnalytics: true,
    newUIComponents: false,
    performanceOptimizations: true
  });

  const [cacheSettings, setCacheSettings] = useState({
    clearOnLogout: true,
    maxCacheSize: '100',
    cacheExpiry: '24'
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    lazyLoading: true,
    imageOptimization: true,
    prefetchData: false,
    reducedAnimations: false
  });

  const [customCSS, setCustomCSS] = useState('');
  const [customJS, setCustomJS] = useState('');

  const handleExperimentalToggle = (feature) => {
    setExperimentalFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handlePerformanceToggle = (setting) => {
    setPerformanceSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleCacheChange = (setting, value) => {
    setCacheSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleClearCache = () => {
    // TODO: Implement cache clearing
    console.log('Clearing cache...');
  };

  const handleResetSettings = () => {
    // TODO: Implement settings reset
    console.log('Resetting all settings...');
  };

  const handleExportSettings = () => {
    // TODO: Implement settings export
    console.log('Exporting settings...');
  };

  const handleImportSettings = () => {
    // TODO: Implement settings import
    console.log('Importing settings...');
  };

  const cacheSizeOptions = [
    { value: '50', label: '50 MB' },
    { value: '100', label: '100 MB' },
    { value: '200', label: '200 MB' },
    { value: '500', label: '500 MB' }
  ];

  const cacheExpiryOptions = [
    { value: '1', label: '1 hour' },
    { value: '6', label: '6 hours' },
    { value: '24', label: '24 hours' },
    { value: '168', label: '1 week' }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Advanced Settings</h2>
        <p className="text-neutral-600">
          Configure advanced features, developer tools, and experimental options
        </p>
      </div>

      {/* Developer Tools */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Developer Tools</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Developer Mode</p>
              <p className="text-sm text-neutral-600">Enable developer tools and debugging features</p>
            </div>
            <button
              onClick={() => setDeveloperMode(!developerMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                developerMode ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  developerMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Debug Mode</p>
              <p className="text-sm text-neutral-600">Show detailed error messages and console logs</p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                debugMode ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Beta Features</p>
              <p className="text-sm text-neutral-600">Access to beta features and early releases</p>
            </div>
            <button
              onClick={() => setBetaFeatures(!betaFeatures)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                betaFeatures ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  betaFeatures ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Experimental Features */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Experimental Features</h3>
        <p className="text-sm text-neutral-600 mb-4">
          These features are experimental and may not work as expected. Use at your own risk.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">AI Enhancements</p>
              <p className="text-sm text-neutral-600">Enhanced AI features and suggestions</p>
            </div>
            <button
              onClick={() => handleExperimentalToggle('aiEnhancements')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                experimentalFeatures.aiEnhancements ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  experimentalFeatures.aiEnhancements ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Advanced Analytics</p>
              <p className="text-sm text-neutral-600">Detailed analytics and reporting features</p>
            </div>
            <button
              onClick={() => handleExperimentalToggle('advancedAnalytics')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                experimentalFeatures.advancedAnalytics ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  experimentalFeatures.advancedAnalytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">New UI Components</p>
              <p className="text-sm text-neutral-600">Try out new user interface components</p>
            </div>
            <button
              onClick={() => handleExperimentalToggle('newUIComponents')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                experimentalFeatures.newUIComponents ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  experimentalFeatures.newUIComponents ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Performance Optimizations</p>
              <p className="text-sm text-neutral-600">Experimental performance improvements</p>
            </div>
            <button
              onClick={() => handleExperimentalToggle('performanceOptimizations')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                experimentalFeatures.performanceOptimizations ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  experimentalFeatures.performanceOptimizations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Performance Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Performance Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Lazy Loading</p>
              <p className="text-sm text-neutral-600">Load content only when needed to improve performance</p>
            </div>
            <button
              onClick={() => handlePerformanceToggle('lazyLoading')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                performanceSettings.lazyLoading ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  performanceSettings.lazyLoading ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Image Optimization</p>
              <p className="text-sm text-neutral-600">Automatically optimize images for faster loading</p>
            </div>
            <button
              onClick={() => handlePerformanceToggle('imageOptimization')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                performanceSettings.imageOptimization ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  performanceSettings.imageOptimization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Prefetch Data</p>
              <p className="text-sm text-neutral-600">Preload data in the background for faster navigation</p>
            </div>
            <button
              onClick={() => handlePerformanceToggle('prefetchData')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                performanceSettings.prefetchData ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  performanceSettings.prefetchData ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Reduced Animations</p>
              <p className="text-sm text-neutral-600">Reduce animations for better performance on slower devices</p>
            </div>
            <button
              onClick={() => handlePerformanceToggle('reducedAnimations')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                performanceSettings.reducedAnimations ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  performanceSettings.reducedAnimations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Cache Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Cache Management</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Maximum Cache Size"
                value={cacheSettings.maxCacheSize}
                onChange={(e) => handleCacheChange('maxCacheSize', e.target.value)}
                options={cacheSizeOptions}
              />
            </div>
            <div>
              <Select
                label="Cache Expiry"
                value={cacheSettings.cacheExpiry}
                onChange={(e) => handleCacheChange('cacheExpiry', e.target.value)}
                options={cacheExpiryOptions}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Clear Cache on Logout</p>
              <p className="text-sm text-neutral-600">Automatically clear cache when you log out</p>
            </div>
            <button
              onClick={() => setCacheSettings(prev => ({ ...prev, clearOnLogout: !prev.clearOnLogout }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                cacheSettings.clearOnLogout ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  cacheSettings.clearOnLogout ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearCache}>
              Clear Cache Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Custom Code */}
      {developerMode && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Custom Code</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Add custom CSS and JavaScript. Use with caution as this can affect application functionality.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Custom CSS
              </label>
              <textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="/* Add your custom CSS here */"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Custom JavaScript
              </label>
              <textarea
                value={customJS}
                onChange={(e) => setCustomJS(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="// Add your custom JavaScript here"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Settings Management */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Settings Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={handleExportSettings}>
            Export Settings
          </Button>
          <Button variant="outline" onClick={handleImportSettings}>
            Import Settings
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            Reset All Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedSettings;
