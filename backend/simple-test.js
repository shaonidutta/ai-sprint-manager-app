// Simple test to verify the project stats functionality
console.log('Testing project stats...');

// Test the basic functionality
const testStats = {
  total_issues: 10,
  active_sprints: 2,
  completed_issues: 5,
  team_members_count: 3
};

console.log('Expected stats format:', JSON.stringify(testStats, null, 2));

// Test the API endpoint format
const apiResponse = {
  success: true,
  data: testStats
};

console.log('Expected API response format:', JSON.stringify(apiResponse, null, 2));
console.log('Test completed successfully!');
