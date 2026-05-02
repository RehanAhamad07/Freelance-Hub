const jwt = require('jsonwebtoken');

async function testApi() {
  try {
    // 1. Generate a mock token for User '69d9148ed81f86245beb3236' (Rehan Ahamad)
    const token = jwt.sign({ userId: '69d9148ed81f86245beb3236', roles: ['client'] }, 'supersecret123', { expiresIn: '1d' });
    
    console.log('Sending request to API...');
    const res = await fetch('http://localhost:5001/api/auth/save-service/69d92e69206bcacea176cb0d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Response Status:', res.status);
    const data = await res.text();
    console.log('Response Data:', data.substring(0, 500));
  } catch (error) {
    console.log('API Error:', error.message);
  }
}

testApi();
