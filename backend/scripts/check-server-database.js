const axios = require('axios');

const checkServerDatabase = async () => {
  let testBoardId = 1; // Default board ID

  try {
    console.log('🔍 Checking server database connection...\n');

    // Test the health endpoint
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      console.log('✅ Server is running');
      console.log('Health status:', healthResponse.data);
    } catch (error) {
      console.error('❌ Server health check failed:', error.message);
      return;
    }

    // Try to login to get a token
    console.log('\n2. Attempting to login...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email: 'agtshaonidutta2k@gmail.com',
        password: '123Agartala!'
      });

      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        const token = loginResponse.data.data.tokens.access_token;
        console.log('Using token:', token.substring(0, 50) + '...');
        
        // Try to get projects to see if basic queries work
        console.log('\n3. Testing basic database queries...');
        try {
          const projectsResponse = await axios.get(
            'http://localhost:3000/api/v1/projects',
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (projectsResponse.data.success) {
            console.log('✅ Basic database queries work');
            console.log(`Found ${projectsResponse.data.data.projects.length} projects`);

            // Get the first project's boards
            if (projectsResponse.data.data.projects.length > 0) {
              const firstProject = projectsResponse.data.data.projects[0];
              console.log(`First project: ${firstProject.name} (ID: ${firstProject.id})`);

              // Get boards for this project
              try {
                const boardsResponse = await axios.get(
                  `http://localhost:3000/api/v1/projects/${firstProject.id}/boards`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );

                if (boardsResponse.data.success && boardsResponse.data.data.boards.length > 0) {
                  const firstBoard = boardsResponse.data.data.boards[0];
                  console.log(`First board: ${firstBoard.name} (ID: ${firstBoard.id})`);

                  // Update the board ID for issue creation
                  testBoardId = firstBoard.id;
                }
              } catch (boardError) {
                console.log('Could not get boards:', boardError.response?.data || boardError.message);
              }
            }
          }
        } catch (error) {
          console.error('❌ Basic database queries failed:', error.response?.data || error.message);
        }

        // Now test issue creation with minimal data
        console.log('\n4. Testing issue creation with minimal data...');
        try {
          const minimalIssueData = {
            title: 'Minimal Test Issue'
          };

          console.log(`Using board ID: ${testBoardId}`);

          const createResponse = await axios.post(
            `http://localhost:3000/api/v1/boards/${testBoardId}/issues`,
            minimalIssueData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (createResponse.data.success) {
            console.log('✅ Issue creation successful!');
            console.log('Created issue:', createResponse.data.data.issue);
          }

        } catch (error) {
          console.error('❌ Issue creation failed:');
          if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
          } else {
            console.error('Error:', error.message);
          }
        }

      } else {
        console.error('❌ Login failed:', loginResponse.data);
      }
    } catch (error) {
      console.error('❌ Login request failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
checkServerDatabase()
  .then(() => {
    console.log('\n✅ Server database check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Server database check failed:', error.message);
    process.exit(1);
  });
