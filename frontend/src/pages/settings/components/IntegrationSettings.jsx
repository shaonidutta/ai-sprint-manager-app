import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';

const IntegrationSettings = () => {
  const [integrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and updates to your Slack workspace',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      ),
      connected: false,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your repositories and sync issues with GitHub',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      connected: true,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Import and sync issues from your Jira projects',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129V8.915A5.214 5.214 0 0 0 18.294 4.7V5.757zm5.701-5.756H11.443a5.215 5.215 0 0 0 5.215 5.215h2.129V3.158A5.215 5.215 0 0 0 23.995 8.373V1.001z"/>
        </svg>
      ),
      connected: false,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Connect with Google Calendar, Drive, and Gmail',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      connected: true,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Send notifications and updates to Microsoft Teams',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.625 5.55c-2.1-.525-4.2-.525-6.3 0v2.1c2.1-.525 4.2-.525 6.3 0v-2.1zm-6.3 4.2v2.1c2.1-.525 4.2-.525 6.3 0v-2.1c-2.1.525-4.2.525-6.3 0zm6.3 4.2c-2.1.525-4.2.525-6.3 0v2.1c2.1.525 4.2.525 6.3 0v-2.1z" fill="#5059C9"/>
          <path d="M3.375 5.55v12.9h10.5V5.55H3.375zm5.25 9.45H6.75v-1.5h1.875v1.5zm0-3H6.75V10.5h1.875V12zm3.75 3h-1.875v-1.5h1.875v1.5zm0-3h-1.875V10.5h1.875V12z" fill="#5059C9"/>
        </svg>
      ),
      connected: false,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Send notifications to your Discord server',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
      connected: false,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]);

  const [webhooks] = useState([
    {
      id: 1,
      name: 'Project Updates Webhook',
      url: 'https://api.example.com/webhooks/project-updates',
      events: ['project.created', 'project.updated', 'project.deleted'],
      active: true,
      lastTriggered: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Task Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      events: ['task.assigned', 'task.completed'],
      active: false,
      lastTriggered: '2024-01-10T14:20:00Z'
    }
  ]);

  const handleConnect = (integrationId) => {
    // TODO: Implement integration connection
    console.log('Connecting to:', integrationId);
  };

  const handleDisconnect = (integrationId) => {
    // TODO: Implement integration disconnection
    console.log('Disconnecting from:', integrationId);
  };

  const handleWebhookToggle = (webhookId) => {
    // TODO: Implement webhook toggle
    console.log('Toggling webhook:', webhookId);
  };

  const formatLastTriggered = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900">Integration Settings</h2>
        <p className="text-neutral-600">
          Connect your favorite tools and services to enhance your workflow
        </p>
      </div>

      {/* Available Integrations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-6">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                  <div className={integration.color}>
                    {integration.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-neutral-900">{integration.name}</h4>
                    {integration.connected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{integration.description}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {integration.connected ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Webhooks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Webhooks</h3>
            <p className="text-sm text-neutral-600">Configure custom webhooks for external integrations</p>
          </div>
          <Button>
            Add Webhook
          </Button>
        </div>

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-neutral-900">{webhook.name}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    webhook.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-1 truncate">{webhook.url}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-xs text-neutral-500">
                    Events: {webhook.events.join(', ')}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Last triggered: {formatLastTriggered(webhook.lastTriggered)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleWebhookToggle(webhook.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webhook.active ? 'bg-primary-600' : 'bg-neutral-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webhook.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">API Keys</h3>
            <p className="text-sm text-neutral-600">Manage API keys for external access</p>
          </div>
          <Button>
            Generate New Key
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Production API Key</h4>
              <p className="text-sm text-neutral-600 font-mono">sk_prod_••••••••••••••••••••••••••••••••</p>
              <p className="text-xs text-neutral-500 mt-1">Created on Jan 10, 2024 • Last used 2 hours ago</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Development API Key</h4>
              <p className="text-sm text-neutral-600 font-mono">sk_dev_••••••••••••••••••••••••••••••••</p>
              <p className="text-xs text-neutral-500 mt-1">Created on Jan 5, 2024 • Last used 1 day ago</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
