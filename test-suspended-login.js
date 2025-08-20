// Test script to check suspended user login response
const testSuspendedLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'suspended@adventuregear.com',
        password: 'user123'
      })
    });

    const data = await response.json();
    
    console.log('Status Code:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Data:', data);
    console.log('Error Message:', data.error?.message || data.error);
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testSuspendedLogin();

