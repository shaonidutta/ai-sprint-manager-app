# 🛠️ AI Sprint Planner Enhancement Spec

## ✅ Scope of Enhancements

This spec covers two enhancements for the **Sprint Negotiator AI** module:

1. **Feedback Loop UI** – Users can reject/edit AI-suggested tasks and regenerate the plan accordingly.
2. **Adjustable Capacity Slider** – Users can override default story point capacity to simulate different sprint scopes.

---

## 🔧 1. Feedback Loop UI

### 🌟 Feature Objective:

Allow users to mark tasks they **don’t want** in the sprint or to **edit** task descriptions. The AI will use this feedback when regenerating a plan.

---

### ✅ Frontend Changes

**Component**: `SprintPlanningAI.jsx`

1. After the AI returns the suggested sprint plan, display each task in an editable card format.

2. Add the following actions for each task:

   * ✅ Accept (default)
   * ❌ Reject
   * ✏️ Edit text

3. Maintain two state variables:

   ```js
   const [rejectedTasks, setRejectedTasks] = useState([]);
   const [editedTasks, setEditedTasks] = useState({});
   ```

4. When “Regenerate Plan” is clicked, send the following in the API request:

   ```json
   {
     "rejectedTasks": ["Task A", "Task B"],
     "editedTasks": {
       "Old Task C": "Edited Task C"
     }
   }
   ```

---

### ✅ Backend Changes

**File**: `aiService.js`
**Function**: `buildSprintPlanningPrompt()`

1. Accept `rejectedTasks` and `editedTasks` as optional parameters.
2. Inject them into the prompt string like this:

   ```js
   if (rejectedTasks.length > 0) {
     prompt += `\n\nAvoid the following task(s) as they were rejected by the user:\n- ${rejectedTasks.join('\n- ')}`;
   }

   if (Object.keys(editedTasks).length > 0) {
     prompt += `\n\nUse these edited versions of tasks:\n`;
     for (const [original, edited] of Object.entries(editedTasks)) {
       prompt += `- \"${original}\" ➔ \"${edited}\"\n`;
     }
   }
   ```

---

## 🔧 2. Adjustable Capacity Slider

### 🌟 Feature Objective:

Allow users to override the default sprint story point capacity manually via UI control.

---

### ✅ Frontend Changes

**Component**: `SprintPlanningAI.jsx`

1. Add a numeric slider or input field:

   ```jsx
   <label>Total Story Points</label>
   <input type="number" value={storyPoints} onChange={handleChange} />
   ```

2. Pass the updated capacity value as `totalStoryPoints` in the API request:

   ```json
   {
     "totalStoryPoints": 30
   }
   ```

---

### ✅ Backend Changes

**File**: `aiService.js`
**Function**: `buildSprintPlanningPrompt()`

1. Use the custom value from the request instead of hardcoding default:

   ```js
   prompt += `\n\nAvailable story points for this sprint: ${totalStoryPoints}`;
   ```

---

## 💪 Testing Requirements

### Unit Tests

* [ ] Test prompt generation with rejected tasks only
* [ ] Test prompt generation with edited tasks only
* [ ] Test prompt with both rejected + edited tasks + custom capacity

### Integration

* [ ] Regenerate plan should exclude rejected tasks
* [ ] Edited tasks should appear as expected
* [ ] Story point cap should not be exceeded by selected tasks

---

## ✅ Example Final Prompt (Combined)

```text
You are an AI Sprint Planner.

Use the backlog below and generate a sprint plan that fits within 30 story points. Prioritize critical tasks and optimize team capacity.

Avoid the following task(s):
- "Write unit tests"

Use these edited versions of tasks:
- "Create dashboard UI components" ➔ "Build dashboard layout and navigation"

Sprint Dates: 10 June – 24 June  
Backlog:
1. Implement user authentication (Critical)  
2. Build dashboard layout and navigation (High)  
3. Setup database migrations (Medium)

Output JSON with selected issues, story points, total used points, and a suggested sprint goal.
```

---

## 📁 File Summary

| File                    | Changes                              |
| ----------------------- | ------------------------------------ |
| `SprintPlanningAI.jsx`  | UI for feedback and capacity control |
| `aiService.js`          | Enhanced prompt builder logic        |
| `api/v1/ai/sprint-plan` | Accept new fields in request payload |
