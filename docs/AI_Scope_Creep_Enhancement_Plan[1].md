 I need you to generate all the minimal code and SQL needed to add a “Configurable Threshold Alert” for story‐point scope creep into my existing Node.js/Express + MySQL backend and React frontend. I have only 30 minutes, so please produce complete, copy-and-paste-ready snippets for each step. Follow this outline exactly:

1. **SQL Migration**
   Generate a MySQL migration that alters the existing `sprints` table by adding:

   * `baseline_points INT NOT NULL DEFAULT 0`
   * `scope_threshold_pct DECIMAL(5,2) NOT NULL DEFAULT 0.10`
   * `scope_alerted BOOLEAN NOT NULL DEFAULT FALSE`

   Output only the SQL statements needed for this change.

2. **Backend – “Start Sprint” Endpoint**
   Show me a Node.js/Express handler for `POST /api/v1/sprints/:sprintId/start` that:

   * Marks the sprint active (assume existing code already sets status = 'active').
   * Runs:

     ```sql
     SELECT COALESCE(SUM(story_points), 0) AS total_points
     FROM issues
     WHERE sprint_id = :sprintId;
     ```
   * Updates `sprints` with:

     ```sql
     UPDATE sprints
       SET baseline_points = <total_points>, scope_alerted = FALSE
       WHERE id = :sprintId;
     ```

   Provide the full Express route code, using `async/await` and `db.query(...)`.

3. **Backend – `recomputeSprintScope(sprintId)` Helper and Hooks**
   a. Write an async function `recomputeSprintScope(sprintId)` that:

   * Selects `baseline_points`, `scope_threshold_pct`, and `scope_alerted` from `sprints` where `id = sprintId`.
   * Selects `COALESCE(SUM(story_points), 0) AS current_points` from `issues` where `sprint_id = sprintId`.
   * Calculates:

     ```js
     const creepRatio = (current_points - baseline_points) / baseline_points;
     ```

     If `baseline_points === 0`, it should do nothing.
   * If `creepRatio >= scope_threshold_pct && scope_alerted === false`, it runs:

     ```sql
     UPDATE sprints
       SET scope_alerted = TRUE
       WHERE id = sprintId;
     ```

   Export this function so it can be called from issue routes.

   b. Show me how to modify the existing `POST /api/v1/issues` and `PUT /api/v1/issues/:issueId` handlers so that after inserting/updating an issue:

   * For `POST`: if `req.body.sprint_id` is non-null, call `await recomputeSprintScope(req.body.sprint_id)`.
   * For `PUT`: load the old issue row to get `oldSprintId` and `oldPoints`. After updating, if `oldSprintId !== newSprintId`, call `recomputeSprintScope(oldSprintId)` and `recomputeSprintScope(newSprintId)`; if only `story_points` changed, call `recomputeSprintScope(newSprintId)`.

   Provide complete code examples for both route handlers.

4. **Backend – “Status” Endpoint**
   Generate an Express route `GET /api/v1/sprints/:sprintId/status` that:

   * SELECTs `baseline_points`, `scope_threshold_pct`, and `scope_alerted` from `sprints` where `id = sprintId`.
   * SELECTs `COALESCE(SUM(story_points), 0) AS current_points` from `issues` where `sprint_id = sprintId`.
   * Returns JSON:

   ```json
   {
     "baselinePoints": <baseline_points>,
     "currentPoints": <current_points>,
     "thresholdPct": <scope_threshold_pct>,
     "scopeAlerted": <scope_alerted>
   }
   ```

   Provide the full Express route code.

5. **Frontend – `ScopeCreepBanner.jsx` Component**
   Create a React functional component named `ScopeCreepBanner` that receives props:

   * `baselinePoints` (number)
   * `currentPoints` (number)
   * `thresholdPct` (decimal, e.g. 0.10)
   * `onDismiss` (function)

   The component should:

   * Compute:

   ```js
   const creepPct =
     baselinePoints > 0
       ? ((currentPoints - baselinePoints) / baselinePoints) * 100
       : 0;
   ```

   * Display a red-bordered banner with text:

   > 🚨 Sprint Scope Creep Alert
   > Workload is {creepPct.toFixed(0)}% over baseline ({currentPoints} vs {baselinePoints}, threshold {thresholdPct × 100}%).

   * Include a “×” button that calls `onDismiss`.
     Provide full JSX code with minimal inline styles.

6. **Frontend – Integrate Banner into `SprintBoard.jsx`**
   Show how to modify the existing `SprintBoard.jsx` (assume it receives a prop `sprintId`) to:

   * Import `ScopeCreepBanner` and `axios`.
   * Add state:

     ```js
     const [status, setStatus] = useState({
       baselinePoints: 0,
       currentPoints: 0,
       thresholdPct: 0.1,
       scopeAlerted: false,
     });
     const [bannerDismissed, setBannerDismissed] = useState(false);
     ```
   * On `useEffect` mount, call `GET /api/v1/sprints/${sprintId}/status`, then set `status` from the response.
   * Set up a `setInterval` to re‐fetch status every 60 seconds.
   * Conditionally render `<ScopeCreepBanner />` if `status.scopeAlerted && !bannerDismissed`, passing in the four props and an `onDismiss={() => setBannerDismissed(true)}`.
   * Keep the rest of the sprint-board UI unchanged below.
     Provide the complete modified `SprintBoard.jsx`.

7. **Frontend – Update “Create/Edit Sprint” Form**
   Show how to modify `SprintForm.jsx` to:

   * Add state for `thresholdPctUI` (integer percentage, default = 10).
   * If editing an existing sprint (`isEdit === true`), fetch `scope_threshold_pct` via `GET /api/v1/sprints/${sprintId}` and set `thresholdPctUI = scope_threshold_pct × 100`.
   * Add a numeric input labeled “Scope‐Creep Threshold (%)” where:

     ```jsx
     <input
       type="number"
       value={thresholdPctUI}
       onChange={e => setThresholdPctUI(e.target.value)}
       min="0"
       max="100"
     />
     ```
   * On submit, convert `thresholdPctUI / 100` to `scope_threshold_pct` and send it in the payload to either `POST /api/v1/boards/${boardId}/sprints` or `PUT /api/v1/sprints/${sprintId}`, alongside other sprint fields.
     Provide the full updated `SprintForm.jsx` code.

8. **Testing Instructions (no code)**
   At the end, briefly describe how to verify in 2–3 steps:

   * Create a sprint with threshold = 10%. Assign issues totaling 100 points, click “Start Sprint,” confirm `baseline_points = 100` in the DB.
   * Add a 9-point issue (no banner), then a 2-point issue (banner appears).
   * Refresh the sprint board and verify the red warning shows.

**Important:**

* Output only the code and SQL snippets—do not include explanatory comments beyond what’s necessary in the code itself.
* Use `async/await` style and assume `db.query(...)` is how you run MySQL queries.
* Keep styling minimal, with inline CSS or basic classes.

Begin generating each section in order.
