const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('--- Email Credential Tester ---');
console.log('Loading env from:', envPath);

const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

console.log('SMTP Config:');
console.log('User:', user ? user : '(Missing)');
console.log('Pass:', pass ? '****' + pass.slice(-4) : '(Missing)');
console.log('Host:', process.env.SMTP_HOST || 'smtp.gmail.com');

if (!user || !pass) {
    console.error('❌ ERROR: Missing SMTP_USER or SMTP_PASS in .env file');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: pass
    },
    debug: true, // Enable debug logs
    logger: true // Enable logger
});

async function verify() {
    console.log('\n🔄 Attempting to connect to Gmail...');
    try {
        await transporter.verify();
        console.log('✅ Connection Successful! Credentials are valid.');

        console.log('\n📧 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: user, // Send to self
            subject: 'SmartFood Email Test',
            text: 'If you are reading this, your email configuration is working correctly!'
        });
        console.log('✅ Validated! Message ID:', info.messageId);
        console.log('Check your inbox (' + user + ') for the test email.');

    } catch (error) {
        console.error('\n❌ Connection Failed!');
        console.error('Error:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);

        if (error.code === 'EAUTH') {
            console.log('\n💡 TIP: EAUTH usually means the App Password is wrong or 2FA is not enabled.');
            console.log('Ensure you are using the 16-char App Password, NOT your login password.');
        }
    }
}

verify();
