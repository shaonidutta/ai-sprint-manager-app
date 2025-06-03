const database = require('../config/database');
const logger = require('../config/logger');

/**
 * Recomputes the scope for a given sprint and updates the scope_alerted flag if necessary.
 * @param {number} sprintId - The ID of the sprint to recompute.
 */
async function recomputeSprintScope(sprintId) {
  if (!sprintId) {
    logger.warn('recomputeSprintScope called with null or undefined sprintId');
    return;
  }

  try {
    // Select baseline_points, scope_threshold_pct, and scope_alerted from sprints
    const [sprintDetails] = await database.query(
      'SELECT baseline_points, scope_threshold_pct, scope_alerted FROM sprints WHERE id = ?',
      [sprintId]
    );

    if (!sprintDetails) {
      logger.warn(`recomputeSprintScope: Sprint with ID ${sprintId} not found.`);
      return;
    }

    const { baseline_points, scope_threshold_pct, scope_alerted } = sprintDetails;

    // If baseline_points is 0, do nothing.
    if (baseline_points === 0) {
      logger.info(`recomputeSprintScope: Sprint ${sprintId} has baseline_points = 0, skipping calculation.`);
      return;
    }

    // Select COALESCE(SUM(story_points), 0) AS current_points from issues
    const [issuePoints] = await database.query(
      'SELECT COALESCE(SUM(story_points), 0) AS current_points FROM issues WHERE sprint_id = ?',
      [sprintId]
    );
    const current_points = issuePoints.current_points;

    // Calculate creepRatio
    const creepRatio = (current_points - baseline_points) / baseline_points;

    logger.info(`recomputeSprintScope: Sprint ${sprintId} - Baseline: ${baseline_points}, Current: ${current_points}, Threshold: ${scope_threshold_pct}, Alerted: ${scope_alerted}, CreepRatio: ${creepRatio}`);

    // If creepRatio >= scope_threshold_pct && scope_alerted === false, update sprints
    if (creepRatio >= scope_threshold_pct && scope_alerted === false) {
      await database.query(
        'UPDATE sprints SET scope_alerted = TRUE WHERE id = ?',
        [sprintId]
      );
      logger.info(`recomputeSprintScope: Sprint ${sprintId} scope alert triggered and updated.`);
    } else if (creepRatio < scope_threshold_pct && scope_alerted === true) {
      // Optional: Reset alert if scope goes back below threshold
      // await database.query(
      //   'UPDATE sprints SET scope_alerted = FALSE WHERE id = ?',
      //   [sprintId]
      // );
      // logger.info(`recomputeSprintScope: Sprint ${sprintId} scope alert reset.`);
    }

  } catch (error) {
    logger.error(`Error in recomputeSprintScope for sprintId ${sprintId}:`, error);
    // Do not re-throw, as this is a background task and shouldn't crash the main request
  }
}

module.exports = {
  recomputeSprintScope,
};