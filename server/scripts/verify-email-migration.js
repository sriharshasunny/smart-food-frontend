// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:5000/api';

async function testResendConnection() {
    const targetEmail = process.argv[2] || 'delivered@resend.dev';
    console.log(`\n--- Testing Resend Connection to ${targetEmail} ---`);
    try {
        const res = await fetch(`${BASE_URL}/test-email?email=${targetEmail}`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Test Failed:', e.message);
    }
}

async function testOTP() {
    const targetEmail = process.argv[2] || 'delivered@resend.dev';
    console.log(`\n--- Testing OTP Email to ${targetEmail} ---`);
    try {
        const res = await fetch(`${BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, type: 'login' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Test Failed:', e.message);
    }
}

async function runTests() {
    await testResendConnection();
    await testOTP();
}

runTests();
