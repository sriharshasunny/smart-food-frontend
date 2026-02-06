const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const emailService = require('../utils/emailService');

const testEmail = process.env.SMTP_USER || process.env.EMAIL_USER;

const mockOrder = {
    _id: 'Test-Order-' + Date.now(),
    totalAmount: 450,
    invoiceLink: 'http://localhost:5173/orders/test-invoice',
    items: [
        { name: 'Spicy Chicken Burger', quantity: 2, price: 150 },
        { name: 'Coke Zero', quantity: 1, price: 50 },
        { name: 'French Fries', quantity: 1, price: 100 }
    ],
    guestInfo: {
        name: 'Test User',
        email: testEmail
    }
};

console.log(`Sending test order confirmation to ${testEmail}...`);

emailService.sendOrderConfirmation(testEmail, mockOrder)
    .then(info => {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info ? info.messageId : 'No ID returned (Mock Mode?)');
    })
    .catch(err => {
        console.error('❌ Email failed:', err);
    });
