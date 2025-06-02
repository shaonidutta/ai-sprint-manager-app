# Scope Creep Detector - Immediate Fixes Implementation Plan

## 🚨 Critical Issues Requiring Immediate Attention

The Scope Creep Detector is currently **completely non-functional**. This document provides step-by-step fixes to make the feature operational.

## 🔧 Fix #1: Implement Missing Sprint Service Method

**Issue:** `SprintSelector` calls non-existent `getProjectSprints` method  
**Impact:** Sprint selection fails, blocking entire feature  
**Priority:** CRITICAL

### Implementation:

```javascript
// File: frontend/src/services/sprint/sprintService.js
// Add this method to the sprintService object:

getProjectSprints: async (projectId, params = {}) => {
  return await sprintService.getByProject(projectId, params);
},
```

**Complete Fix:**
```javascript
export const sprintService = {
  // ... existing methods ...

  // Add this new method
  getProjectSprints: async (projectId, params = {}) => {
    try {
      const response = await sprintService.getByProject(projectId, params);
      return {
        data: {
          sprints: response.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching project sprints:', error);
      throw error;
    }
  },

  // ... rest of existing methods ...
};
```

## 🔧 Fix #2: Correct Backend Scope Creep Logic

**Issue:** Backend uses same data for original and current issues  
**Impact:** Scope creep detection impossible  
**Priority:** CRITICAL

### Current Broken Code:
```javascript
// backend/controllers/aiController.js:360
const sprintData = {
  sprintGoal: sprint.goal,
  originalIssues: currentIssues, // ❌ WRONG
  currentIssues: currentIssues   // ❌ SAME DATA
};
```

### Temporary Fix (Short-term):
```javascript
// backend/controllers/aiController.js
const detectScopeCreep = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sprintId, originalScope } = req.body; // Get original scope from user input
    const userId = req.user.id;

    // ... existing validation code ...

    // Get current sprint issues
    const currentIssuesQuery = `SELECT * FROM issues WHERE sprint_id = ?`;
    const currentIssues = await database.query(currentIssuesQuery, [sprintId]);

    // For now, use user-provided original scope description
    // TODO: Implement proper baseline tracking
    const sprintData = {
      sprintGoal: sprint.goal,
      originalScope: originalScope, // User-provided description
      currentIssues: currentIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        story_points: issue.story_points
      })),
      // Calculate basic metrics
      currentStoryPoints: currentIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0),
      currentIssueCount: currentIssues.length
    };

    const aiResponse = await aiService.detectScopeCreep(projectId, userId, sprintData);

    // ... rest of existing code ...
  } catch (error) {
    // ... existing error handling ...
  }
};
```

### Update AI Prompt:
```javascript
// backend/services/aiService.js
buildScopeCreepPrompt(sprintData) {
  const { originalScope, currentIssues, sprintGoal, currentStoryPoints, currentIssueCount } = sprintData;
  
  return `
Analyze the following sprint for scope creep:

Sprint Goal: ${sprintGoal}

Original Scope Description: ${originalScope}

Current Sprint State:
- Total Issues: ${currentIssueCount}
- Total Story Points: ${currentStoryPoints}
- Issues:
${currentIssues.map(issue => `  - ${issue.title} (${issue.story_points || 0} points, Status: ${issue.status})`).join('\n')}

Based on the original scope description and current sprint state, analyze:
1. Does the current work align with the original scope?
2. Are there signs of scope expansion beyond the original plan?
3. What is the severity of any scope creep detected?

Provide analysis in JSON format:
{
  "scope_creep_detected": true/false,
  "severity": "None|Low|Medium|High|Critical",
  "scope_creep_score": 0-100,
  "analysis": {
    "alignment_with_goal": "analysis of goal alignment",
    "scope_expansion_indicators": "indicators of scope expansion",
    "impact_assessment": "impact on sprint success"
  },
  "recommendations": [
    "specific actionable recommendations"
  ],
  "risk_factors": [
    "identified risk factors"
  ]
}
`;
}
```

## 🔧 Fix #3: Correct Response Format Mapping

**Issue:** Frontend expects different response format than backend provides  
**Impact:** Results display fails  
**Priority:** HIGH

### Update aiUtils.js:
```javascript
// frontend/src/services/ai/aiUtils.js
// Update the formatAIResponse function for scope-creep type:

formatAIResponse: (response, type) => {
  const baseFormat = {
    ...response,
    timestamp: new Date().toLocaleString(),
    type
  };

  switch (type) {
    case 'scope-creep':
      // Map backend response to frontend expected format
      const scopeAnalysis = response.scope_analysis || response;
      return {
        ...baseFormat,
        creepDetected: scopeAnalysis.scope_creep_detected || false,
        creepPercentage: scopeAnalysis.scope_creep_score || 0,
        severity: scopeAnalysis.severity || 'None',
        affectedAreas: scopeAnalysis.analysis ? [
          scopeAnalysis.analysis.alignment_with_goal,
          scopeAnalysis.analysis.scope_expansion_indicators,
          scopeAnalysis.analysis.impact_assessment
        ].filter(Boolean) : [],
        recommendations: scopeAnalysis.recommendations || [],
        riskFactors: scopeAnalysis.risk_factors || [],
        analysis: scopeAnalysis.analysis || {}
      };

    // ... other cases ...
  }
},
```

## 🔧 Fix #4: Update Frontend Component

**Issue:** Component validation too strict and inconsistent data handling  
**Impact:** Poor user experience  
**Priority:** MEDIUM

### Update ScopeCreepDetection.jsx:
```javascript
// frontend/src/components/ai/ScopeCreepDetection.jsx
// Update the validation and form handling:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Updated validation - allow empty current issues
  if (!formData.sprintId) {
    setError('Please select a sprint');
    return;
  }
  
  if (!formData.originalScope || formData.originalScope.trim().length === 0) {
    setError('Please describe the original sprint scope');
    return;
  }

  try {
    setLoading(true);
    setError(null);

    // Send data in format expected by backend
    const requestData = {
      sprintId: formData.sprintId,
      originalScope: formData.originalScope
    };

    const response = await aiService.scopeCreepDetection(projectId, requestData);
    
    // Use updated formatting function
    const formattedResult = aiUtils.formatAIResponse(response.data, 'scope-creep');
    
    setResult(formattedResult);
  } catch (err) {
    setError(err.response?.data?.message || err.message || 'Failed to analyze scope creep');
    console.error('Error detecting scope creep:', err);
  } finally {
    setLoading(false);
  }
};
```

## 🔧 Fix #5: Update Validation Logic

**Issue:** Overly strict validation prevents valid submissions  
**Impact:** User experience degraded  
**Priority:** MEDIUM

### Update aiUtils.js validation:
```javascript
// frontend/src/services/ai/aiUtils.js
validateScopeCreepData: (data) => {
  const errors = {};

  if (!data.sprintId) {
    errors.sprintId = 'Sprint selection is required';
  }

  if (!data.originalScope || data.originalScope.trim().length === 0) {
    errors.originalScope = 'Original scope description is required';
  } else if (data.originalScope.trim().length > 1000) {
    errors.originalScope = 'Original scope description must be less than 1000 characters';
  }

  // Remove strict currentIssues validation - it's fetched automatically

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
},
```

## 🚀 Implementation Steps

### Step 1: Frontend Fixes (30 minutes)
1. Add `getProjectSprints` method to sprintService.js
2. Update validation logic in aiUtils.js
3. Fix response format mapping in aiUtils.js
4. Update ScopeCreepDetection.jsx form handling

### Step 2: Backend Fixes (45 minutes)
1. Update detectScopeCreep controller to use original scope description
2. Enhance AI prompt with better context
3. Ensure response format matches frontend expectations

### Step 3: Testing (15 minutes)
1. Test sprint selection functionality
2. Test scope creep analysis with sample data
3. Verify results display correctly
4. Check error handling

### Step 4: Verification (10 minutes)
1. Navigate to `/ai/scope-creep/1`
2. Select a sprint from dropdown
3. Enter original scope description
4. Submit for analysis
5. Verify results display

## 📋 Testing Checklist

After implementing fixes, verify:

- [ ] Sprint dropdown loads without errors
- [ ] Sprint selection works correctly
- [ ] Form validation provides appropriate feedback
- [ ] Scope analysis request completes successfully
- [ ] Results display in correct format
- [ ] Error scenarios handled gracefully
- [ ] No console errors during normal operation

## 🎯 Expected Outcome

After implementing these fixes:

1. **Sprint Selection:** ✅ Works correctly
2. **Scope Analysis:** ✅ Provides meaningful results based on user input
3. **Results Display:** ✅ Shows formatted analysis results
4. **Error Handling:** ✅ Graceful error messages
5. **User Experience:** ✅ Functional and intuitive

## 📝 Next Steps

Once immediate fixes are implemented:

1. **Add Sprint Baseline Tracking:** Implement proper historical data tracking
2. **Enhance AI Analysis:** Add quantitative metrics and better context
3. **Improve UI/UX:** Add charts, better visualization
4. **Add Real-time Monitoring:** Proactive scope creep detection
5. **Comprehensive Testing:** Unit, integration, and E2E tests

## ⚠️ Important Notes

- These fixes provide **basic functionality** but don't address the fundamental issue of missing historical data
- For **production use**, implement proper sprint baseline tracking
- The current approach relies on **user-provided scope description** rather than automated baseline comparison
- Consider this a **temporary solution** while implementing comprehensive baseline tracking system
