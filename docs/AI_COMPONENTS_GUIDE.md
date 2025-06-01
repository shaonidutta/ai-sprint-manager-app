# AI Components Integration Guide

## 📋 Overview

This guide provides detailed documentation for integrating and using the AI components in the AI Sprint Management App.

## 🧠 AI Components Architecture

### Component Structure
```
frontend/src/components/ai/
├── AIQuotaWidget.jsx          # AI quota display
├── SprintPlanningAI.jsx       # Sprint planning AI
├── ScopeCreepDetection.jsx    # Scope creep analysis
├── RiskAssessment.jsx         # Project risk assessment
├── RetrospectiveAI.jsx        # Sprint retrospective AI
├── AIInsightsDashboard.jsx    # AI insights dashboard
└── index.js                   # Component exports
```

### Service Dependencies
```
frontend/src/services/ai/
├── aiService.js               # AI API calls
└── aiUtils.js                 # AI utility functions
```

## 🎨 Component Documentation

### 1. AIQuotaWidget

**Purpose**: Display AI usage quota for a project

**Props**:
- `projectId` (string, required): Project ID
- `className` (string, optional): Additional CSS classes

**Features**:
- Real-time quota display
- Progress bar visualization
- Quota status indicators
- Reset date information
- Exceeded quota warnings

**Usage**:
```jsx
import { AIQuotaWidget } from '../components/ai';

function ProjectDashboard({ projectId }) {
  return (
    <div>
      <AIQuotaWidget 
        projectId={projectId} 
        className="mb-6" 
      />
    </div>
  );
}
```

**States**:
- Loading: Shows skeleton loader
- Error: Displays error message with retry button
- Success: Shows quota information with progress bar

### 2. SprintPlanningAI

**Purpose**: AI-powered sprint planning assistance

**Props**:
- `projectId` (string, required): Project ID
- `onPlanGenerated` (function, optional): Callback when plan is generated
- `className` (string, optional): Additional CSS classes

**Features**:
- Sprint goal input
- Team capacity configuration
- Sprint duration selection
- Backlog items management
- AI recommendations
- Velocity estimation
- Risk factor identification

**Usage**:
```jsx
import { SprintPlanningAI } from '../components/ai';

function SprintPlanningPage({ projectId }) {
  const handlePlanGenerated = (plan) => {
    console.log('Generated plan:', plan);
    // Handle the generated plan
  };

  return (
    <SprintPlanningAI 
      projectId={projectId}
      onPlanGenerated={handlePlanGenerated}
      className="max-w-4xl mx-auto"
    />
  );
}
```

**Form Validation**:
- Sprint goal: Required, max 1000 characters
- Team capacity: Required, positive number
- Sprint duration: 1-4 weeks
- Backlog items: At least one item required

### 3. ScopeCreepDetection

**Purpose**: Detect and analyze scope creep in sprints

**Props**:
- `projectId` (string, required): Project ID
- `sprintId` (string, optional): Pre-selected sprint ID
- `className` (string, optional): Additional CSS classes

**Features**:
- Sprint selection dropdown
- Original scope description
- Current issues analysis
- Scope creep percentage
- Affected areas identification
- Mitigation recommendations

**Usage**:
```jsx
import { ScopeCreepDetection } from '../components/ai';

function SprintAnalysisPage({ projectId, sprintId }) {
  return (
    <ScopeCreepDetection 
      projectId={projectId}
      sprintId={sprintId}
      className="bg-white rounded-lg shadow"
    />
  );
}
```

**Analysis Results**:
- Creep detected: Boolean flag
- Creep percentage: 0-100%
- Affected areas: Array of impacted areas
- Recommendations: Actionable suggestions

### 4. RiskAssessment

**Purpose**: AI-powered project risk assessment

**Props**:
- `projectId` (string, required): Project ID
- `className` (string, optional): Additional CSS classes

**Features**:
- Project context input
- Sprint information form
- Team metrics configuration
- Risk level calculation
- Risk identification
- Mitigation strategies

**Usage**:
```jsx
import { RiskAssessment } from '../components/ai';

function RiskManagementPage({ projectId }) {
  return (
    <div className="space-y-6">
      <h1>Risk Assessment</h1>
      <RiskAssessment 
        projectId={projectId}
        className="max-w-6xl"
      />
    </div>
  );
}
```

**Risk Levels**:
- Low: Green indicator
- Medium: Yellow indicator
- High: Orange indicator
- Critical: Red indicator

### 5. RetrospectiveAI

**Purpose**: AI-powered sprint retrospective analysis

**Props**:
- `projectId` (string, required): Project ID
- `sprintId` (string, optional): Pre-filled sprint ID
- `className` (string, optional): Additional CSS classes

**Features**:
- Sprint metrics input
- Team feedback collection
- AI analysis generation
- What went well insights
- Improvement suggestions
- Action items generation
- Team morale assessment

**Usage**:
```jsx
import { RetrospectiveAI } from '../components/ai';

function RetrospectivePage({ projectId, sprintId }) {
  return (
    <RetrospectiveAI 
      projectId={projectId}
      sprintId={sprintId}
      className="container mx-auto px-4"
    />
  );
}
```

**Feedback Categories**:
- What went well
- What could be improved
- Action items

### 6. AIInsightsDashboard

**Purpose**: Comprehensive AI insights and analytics dashboard

**Props**:
- `projectId` (string, optional): Specific project ID for quota widget
- `className` (string, optional): Additional CSS classes

**Features**:
- AI quota display
- Project insights overview
- AI recommendations
- Trends and analytics
- Refresh functionality
- Empty state handling

**Usage**:
```jsx
import { AIInsightsDashboard } from '../components/ai';

function DashboardPage({ projectId }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AIInsightsDashboard 
        projectId={projectId}
        className="p-6"
      />
    </div>
  );
}
```

**Dashboard Sections**:
- Header with refresh button
- AI quota widget (if projectId provided)
- Project insights grid
- Recommendations list
- Trends analytics
- Empty state for no data

## 🔧 Integration Examples

### Complete AI Features Page

```jsx
import React, { useState } from 'react';
import { 
  AIQuotaWidget,
  SprintPlanningAI,
  ScopeCreepDetection,
  RiskAssessment,
  RetrospectiveAI,
  AIInsightsDashboard
} from '../components/ai';

function AIFeaturesPage({ projectId }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'AI Dashboard', component: AIInsightsDashboard },
    { id: 'planning', label: 'Sprint Planning', component: SprintPlanningAI },
    { id: 'scope-creep', label: 'Scope Creep', component: ScopeCreepDetection },
    { id: 'risk', label: 'Risk Assessment', component: RiskAssessment },
    { id: 'retrospective', label: 'Retrospective', component: RetrospectiveAI }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with quota */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">AI Features</h1>
            <AIQuotaWidget projectId={projectId} className="w-64" />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent && (
          <ActiveComponent 
            projectId={projectId}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}

export default AIFeaturesPage;
```

### Modal Integration

```jsx
import React, { useState } from 'react';
import { SprintPlanningAI } from '../components/ai';

function SprintPlanningModal({ isOpen, onClose, projectId }) {
  const handlePlanGenerated = (plan) => {
    console.log('Plan generated:', plan);
    // Process the plan
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">AI Sprint Planning</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <SprintPlanningAI
            projectId={projectId}
            onPlanGenerated={handlePlanGenerated}
          />
        </div>
      </div>
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Error Handling
```jsx
import { errorHandler } from '../utils/errorHandler';

function AIComponent({ projectId }) {
  const [error, setError] = useState(null);

  const handleAIRequest = async () => {
    try {
      setError(null);
      const result = await aiService.someMethod(projectId);
      // Handle success
    } catch (err) {
      const message = errorHandler.handleQuotaError(err);
      setError(message);
      errorHandler.logError(err, { component: 'AIComponent' });
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {/* Component content */}
    </div>
  );
}
```

### 2. Loading States
```jsx
function AIComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" /* spinner SVG */>
            Processing...
          </span>
        ) : (
          'Generate Analysis'
        )}
      </button>
    </div>
  );
}
```

### 3. Quota Checking
```jsx
import { aiService, aiUtils } from '../services/ai';

function AIFeatureComponent({ projectId }) {
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    const checkQuota = async () => {
      try {
        const quotaData = await aiService.getQuota(projectId);
        setQuota(aiUtils.formatQuotaData(quotaData.data));
      } catch (error) {
        console.error('Failed to check quota:', error);
      }
    };

    checkQuota();
  }, [projectId]);

  const isFeatureAvailable = quota && !quota.isExceeded;

  return (
    <div>
      {!isFeatureAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-yellow-700 text-sm">
            AI quota exceeded. Feature will be available after quota reset.
          </p>
        </div>
      )}
      
      <button disabled={!isFeatureAvailable}>
        Use AI Feature
      </button>
    </div>
  );
}
```

## 📱 Responsive Design

All AI components are designed to be responsive and work well on different screen sizes:

- **Mobile**: Single column layout, stacked forms
- **Tablet**: Optimized spacing and touch targets
- **Desktop**: Full feature layout with sidebars

## 🔒 Security Considerations

1. **API Quota Limits**: All components respect the 10 requests per project per month limit
2. **Input Validation**: All user inputs are validated before sending to AI services
3. **Error Handling**: Sensitive error information is not exposed to users
4. **Authentication**: All AI requests require valid authentication tokens

## 🚀 Performance Tips

1. **Lazy Loading**: Load AI components only when needed
2. **Caching**: Cache AI responses where appropriate
3. **Debouncing**: Debounce user inputs to prevent excessive API calls
4. **Error Boundaries**: Wrap AI components in error boundaries

---

*Last Updated: December 2024*
*Status: AI Components Ready for Integration*
