import React from 'react';
import PropTypes from 'prop-types';

/**
 * A banner component to display scope creep alerts.
 */
const ScopeCreepBanner = ({
  baselinePoints,
  currentPoints,
  thresholdPct,
  scopeAlerted, // Added to control visibility based on alert status from API
  onDismiss,
}) => {
  if (!scopeAlerted) {
    return null; // Do not render if scopeAlerted is false
  }

  const creepPct =
    baselinePoints > 0
      ? ((currentPoints - baselinePoints) / baselinePoints) * 100
      : 0;

  // Determine if the threshold is actually breached based on current data,
  // even if scopeAlerted is true (it might be stale or a manual override).
  // The banner should primarily react to the scopeAlerted prop from the backend.
  // However, the text should reflect the current numbers.
  const isThresholdExceeded = baselinePoints > 0 && currentPoints > baselinePoints && ((currentPoints - baselinePoints) / baselinePoints) >= thresholdPct;

  // If scopeAlerted is true, but current numbers don't exceed threshold,
  // it might indicate a resolved state or a manual alert.
  // For this component, we'll trust scopeAlerted to show/hide,
  // and the text will always show current calculations.

  return (
    <div
      style={{
        backgroundColor: '#fee2e2', // Light red
        border: '1px solid #ef4444', // Red
        color: '#b91c1c', // Darker red
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: '0.375rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      role="alert"
    >
      <div>
        <p style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
          &#x1F6A8; Sprint Scope Creep Alert
        </p>
        <p style={{ marginTop: '0.25rem' }}>
          Workload is {creepPct.toFixed(0)}% over baseline ({currentPoints} vs {baselinePoints} story points). Threshold is {(thresholdPct * 100).toFixed(0)}%.
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#b91c1c',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.5rem',
        }}
        aria-label="Dismiss alert"
      >
        &times;
      </button>
    </div>
  );
};

ScopeCreepBanner.propTypes = {
  baselinePoints: PropTypes.number.isRequired,
  currentPoints: PropTypes.number.isRequired,
  thresholdPct: PropTypes.number.isRequired,
  scopeAlerted: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default ScopeCreepBanner;