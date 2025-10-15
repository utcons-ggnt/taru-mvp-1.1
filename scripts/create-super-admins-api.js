// Script to create super admin users via API endpoint
const https = require('https');
const http = require('http');

// Get the base URL from environment or use localhost
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function createSuperAdmins() {
  try {
    console.log('🚀 Creating Super Admin users via API...');
    console.log(`📡 Calling API endpoint: ${BASE_URL}/api/admin/create-super-admin`);
    
    const url = new URL('/api/admin/create-super-admin', BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success) {
            console.log('✅ Super Admin creation completed successfully!');
            console.log('\n📋 Results:');
            console.log('='.repeat(50));
            
            response.results.forEach((result, index) => {
              console.log(`${index + 1}. ${result.name} (${result.email})`);
              console.log(`   Action: ${result.action}`);
              console.log(`   Message: ${result.message}`);
              console.log('');
            });
            
            if (response.errors && response.errors.length > 0) {
              console.log('⚠️  Errors:');
              response.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.name} (${error.email})`);
                console.log(`   Error: ${error.error}`);
                console.log('');
              });
            }
            
            console.log('📊 Summary:');
            console.log(`Total Super Admins: ${response.summary.totalSuperAdmins}`);
            console.log('');
            
            console.log('🔐 Login Credentials:');
            console.log('='.repeat(50));
            response.credentials.forEach((cred, index) => {
              console.log(`${index + 1}. ${cred.name}`);
              console.log(`   Email: ${cred.email}`);
              console.log(`   Password: ${cred.password}`);
              console.log('');
            });
            
            console.log('⚠️  IMPORTANT SECURITY NOTES:');
            console.log('- Change these passwords immediately after first login');
            console.log('- Store credentials securely');
            console.log('- These accounts have full platform access');
            console.log('- Access the Super Admin dashboard at: /super-admin-login');
            
          } else {
            console.error('❌ API returned error:', response.error || 'Unknown error');
          }
        } catch (parseError) {
          console.error('❌ Error parsing response:', parseError);
          console.log('Raw response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure the Next.js development server is running (npm run dev)');
      console.log('2. Check if the API endpoint is accessible');
      console.log('3. Verify the database connection is working');
    });
    
    // Send empty body for POST request
    req.write('{}');
    req.end();
    
  } catch (error) {
    console.error('❌ Error creating super admins:', error);
  }
}

// Run the script
createSuperAdmins();
