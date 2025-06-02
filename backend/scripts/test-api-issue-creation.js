const axios = require('axios');

const testAPIIssueCreation = async () => {
  try {
    console.log('🧪 Testing API Issue Creation...\n');

    // First, let's try to login to get a token
    console.log('1. Attempting to login...');
    
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Now test issue creation
      console.log('\n2. Testing issue creation...');
      
      const issueData = {
        title: 'API Test Issue',
        description: 'This issue was created via API test',
        issueType: 'Story',
        priority: 'P3',
        storyPoints: 2,
        originalEstimate: 4
      };

      const createResponse = await axios.post(
        'http://localhost:3000/api/v1/boards/1/issues',
        issueData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (createResponse.data.success) {
        console.log('✅ Issue creation successful!');
        console.log('Created issue:', {
          id: createResponse.data.data.issue.id,
          title: createResponse.data.data.issue.title,
          issue_order: createResponse.data.data.issue.issue_order,
          status: createResponse.data.data.issue.status
        });

        // Clean up - delete the test issue
        const issueId = createResponse.data.data.issue.id;
        try {
          await axios.delete(
            `http://localhost:3000/api/v1/issues/${issueId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          console.log('🧹 Test issue cleaned up');
        } catch (deleteError) {
          console.log('⚠️  Could not clean up test issue (this is okay)');
        }

      } else {
        console.error('❌ Issue creation failed:', createResponse.data);
      }

    } else {
      console.error('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: Could not connect to server');
      console.error('Make sure the backend server is running on http://localhost:3000');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

// Run the test
testAPIIssueCreation()
  .then(() => {
    console.log('\n✅ API test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ API test failed:', error.message);
    process.exit(1);
  });
