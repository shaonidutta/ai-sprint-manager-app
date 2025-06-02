import React, { useState, useMemo } from 'react';

const TeamRiskHeatmap = ({ data }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Create risk matrix data
  const riskMatrix = useMemo(() => {
    if (!data || !data.teamMembers) return null;

    // Define probability and impact levels
    const probabilityLevels = ['Improbable', 'Possible', 'Occasional', 'Moderate', 'Constant'];
    const impactLevels = ['Insignificant', 'Minor', 'Moderate', 'High', 'Catastrophic'];

    // Create matrix grid
    const matrix = [];
    for (let p = 0; p < probabilityLevels.length; p++) {
      const row = [];
      for (let i = 0; i < impactLevels.length; i++) {
        const riskScore = (p + 1) * (i + 1); // Simple risk calculation
        let riskLevel = 'Low';
        let cellColor = 'bg-green-400';

        if (riskScore >= 20) {
          riskLevel = 'Critical';
          cellColor = 'bg-red-600';
        } else if (riskScore >= 15) {
          riskLevel = 'High';
          cellColor = 'bg-red-400';
        } else if (riskScore >= 10) {
          riskLevel = 'High';
          cellColor = 'bg-orange-400';
        } else if (riskScore >= 6) {
          riskLevel = 'Medium';
          cellColor = 'bg-yellow-400';
        } else if (riskScore >= 3) {
          riskLevel = 'Medium';
          cellColor = 'bg-yellow-300';
        }

        // Find team members in this risk category
        const membersInCell = data.teamMembers.filter(member => {
          // Calculate probability based on multiple factors
          let probabilityScore = 0;

          // Workload factor (0-4)
          const workloadPercentage = member.workload?.percentage || 0;
          if (workloadPercentage > 90) probabilityScore += 2;
          else if (workloadPercentage > 75) probabilityScore += 1;

          // Blocked issues factor
          const blockedIssues = member.issueBreakdown?.blocked || 0;
          if (blockedIssues > 2) probabilityScore += 2;
          else if (blockedIssues > 0) probabilityScore += 1;

          // High priority issues factor
          const highPriorityIssues = member.issueBreakdown?.highPriority || 0;
          if (highPriorityIssues > 3) probabilityScore += 1;

          // Risk factors
          const riskFactorCount = member.riskFactors?.length || 0;
          if (riskFactorCount > 2) probabilityScore += 1;

          const memberProbability = Math.min(probabilityScore, 4);

          // Calculate impact based on role and workload
          let impactScore = 0;

          // Role-based impact
          if (member.role?.toLowerCase().includes('manager') || member.role?.toLowerCase().includes('lead')) {
            impactScore += 2; // Higher impact for leadership roles
          } else if (member.role?.toLowerCase().includes('admin')) {
            impactScore += 1;
          }

          // Workload impact
          if (workloadPercentage > 80) impactScore += 2;
          else if (workloadPercentage > 60) impactScore += 1;

          // Issue count impact
          const totalIssues = parseInt(member.issueBreakdown?.total || 0);
          if (totalIssues > 5) impactScore += 1;

          const memberImpact = Math.min(impactScore, 4);

          return memberProbability === p && memberImpact === i;
        });

        row.push({
          probability: probabilityLevels[p],
          impact: impactLevels[i],
          riskScore,
          riskLevel,
          cellColor,
          members: membersInCell,
          coordinates: { p, i }
        });
      }
      matrix.push(row);
    }

    return matrix;
  }, [data]);

  if (!data || !data.teamMembers) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔥 Team Risk Heatmap
          </span>
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No heatmap data available</p>
          <p className="text-gray-400 text-sm mt-2">Try generating a new risk assessment with the heatmap option enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-8 transition-all duration-500 hover:shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔥 Team Risk Heatmap
        </span>
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Overall Risk</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary?.overallRisk || 'N/A'}</p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Overloaded</p>
              <p className="text-2xl font-bold text-orange-900">{data.summary?.overloadedMembers || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Critical Issues</p>
              <p className="text-2xl font-bold text-red-900">{data.criticalIssues?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Capacity Used</p>
              <p className="text-2xl font-bold text-green-900">{data.summary?.totalCapacityUtilization || 'N/A'}%</p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Matrix Heatmap */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📊 Risk Probability vs Impact Matrix
          </span>
        </h3>

        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Matrix Header */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="text-center font-semibold text-gray-700 py-3"></div>
              {['Insignificant', 'Minor', 'Moderate', 'High', 'Catastrophic'].map(impact => (
                <div key={impact} className="text-center font-semibold text-gray-700 py-3 text-sm">
                  {impact}
                </div>
              ))}
            </div>

            {/* Y-axis label */}
            <div className="flex items-center mb-4">
              <div className="transform -rotate-90 text-center font-bold text-gray-600 w-16 text-sm">
                PROBABILITY
              </div>
              <div className="flex-1">
                {/* Matrix Grid */}
                {riskMatrix && riskMatrix.slice().reverse().map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-right font-semibold text-gray-700 py-4 pr-4 text-sm">
                      {row[0].probability}
                    </div>
                    {row.map((cell, cellIndex) => (
                      <div
                        key={cellIndex}
                        className={`${cell.cellColor} rounded-lg p-4 min-h-[80px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-white relative group`}
                        onClick={() => setSelectedCell(cell)}
                      >
                        {cell.members.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-800 shadow-lg">
                              {cell.members.length}
                            </div>
                          </div>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                            <div className="font-semibold">{cell.riskLevel} Risk</div>
                            <div>Score: {cell.riskScore}</div>
                            <div>{cell.members.length} member(s)</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis label */}
            <div className="text-center font-bold text-gray-600 mt-4 text-sm">
              IMPACT
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            👥 Team Member Details
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.teamMembers.map(member => (
            <TeamMemberRiskCard
              key={member.id}
              member={member}
              onClick={() => setSelectedMember(member)}
              isSelected={selectedMember?.id === member.id}
            />
          ))}
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Low Risk (≤5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Medium Risk (6-10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-sm font-medium text-gray-700">High Risk (11-15)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm font-medium text-gray-700">High Risk (16-19)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Critical Risk (≥20)</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.summary?.recommendations && data.summary.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-2">
            {data.summary.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-amber-600 mt-1">•</span>
                <span className="text-amber-800">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modals */}
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {selectedCell && (
        <RiskCellModal
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};

// Team Member Risk Card Component
const TeamMemberRiskCard = ({ member, onClick, isSelected }) => {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'from-red-600 to-red-700 border-red-300';
      case 'high': return 'from-orange-500 to-red-500 border-orange-300';
      case 'medium': return 'from-yellow-400 to-orange-400 border-yellow-300';
      case 'low': return 'from-green-400 to-blue-400 border-green-300';
      default: return 'from-gray-400 to-gray-500 border-gray-300';
    }
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={`bg-gradient-to-br ${getRiskColor(member.riskLevel)} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${isSelected ? 'ring-4 ring-blue-300' : ''}`}
      onClick={onClick}
    >
      <div className="text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-bold text-lg">{member.name}</h4>
            <p className="text-sm opacity-90">{member.role}</p>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Risk Level</div>
            <div className="font-bold text-lg">{member.riskLevel}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Workload</span>
              <span>{member.workload?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getWorkloadColor(member.workload?.percentage || 0)}`}
                style={{ width: `${Math.min(member.workload?.percentage || 0, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs opacity-75 mt-1">
              {member.workload?.assigned || 0} pts assigned / {member.workload?.capacity || 0} pts capacity
            </div>
          </div>

          <div className="text-xs opacity-90">
            <div>In Progress: {member.issueBreakdown?.inProgress || 0}</div>
            <div>Blocked: {member.issueBreakdown?.blocked || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Member Modal Component
const TeamMemberModal = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-gray-600">{member.role}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span className={`font-semibold ${member.riskLevel === 'High' ? 'text-red-600' : member.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {member.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-semibold">{member.riskScore}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Workload Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Assigned:</span>
                    <span>{member.workload?.assigned || 0} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span>{member.workload?.capacity || 0} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization:</span>
                    <span>{member.workload?.percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span>{member.workload?.available || 0} pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Issue Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Issues:</span>
                    <span>{member.issueBreakdown?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span>{member.issueBreakdown?.inProgress || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked:</span>
                    <span className="text-red-600">{member.issueBreakdown?.blocked || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Priority:</span>
                    <span className="text-orange-600">{member.issueBreakdown?.highPriority || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Risk Factors</h3>
                <ul className="space-y-1">
                  {member.riskFactors?.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-700">• {factor}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Suggestions</h3>
                <ul className="space-y-1">
                  {member.suggestions?.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Cell Modal Component
const RiskCellModal = ({ cell, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Risk Cell Details</h2>
              <p className="text-gray-600">{cell.probability} Probability × {cell.impact} Impact</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cell.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                  cell.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                  cell.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {cell.riskLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk Score:</span>
                <span className="font-semibold">{cell.riskScore}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Team Members in this Category</h3>
              {cell.members.length > 0 ? (
                <div className="space-y-2">
                  {cell.members.map(member => (
                    <div key={member.id} className="flex justify-between items-center">
                      <span>{member.name}</span>
                      <span className="text-sm text-gray-600">{member.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No team members in this risk category</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRiskHeatmap;
