// Test the project stats route implementation
const express = require('express');
const router = express.Router();

// Mock the controller function
const mockGetProjectStats = (req, res) => {
  const { id } = req.params;
  
  // Mock response data
  const mockStats = {
    total_issues: 10,
    active_sprints: 2,
    completed_issues: 5,
    team_members_count: 3
  };

  res.json({
    success: true,
    data: mockStats
  });
};

// Test route definition
router.get('/:id/stats', mockGetProjectStats);

console.log('Route test setup complete');
console.log('Expected endpoint: GET /api/v1/projects/:id/stats');
console.log('Expected response format:');
console.log(JSON.stringify({
  success: true,
  data: {
    total_issues: 10,
    active_sprints: 2,
    completed_issues: 5,
    team_members_count: 3
  }
}, null, 2));

// Test the route pattern
const testUrl = '/1/stats';
console.log(`\nTesting URL pattern: ${testUrl}`);
console.log('This should match the route /:id/stats');

module.exports = router;
