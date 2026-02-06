const DodoPayments = require('dodopayments');
console.log('Require successful');
try {
    const client = new DodoPayments({
        bearerToken: 'test',
        environment: 'test_mode'
    });
    console.log('Client created successfully');
    console.log('Client keys:', Object.keys(client));
} catch (e) {
    console.error('Error creating client:', e);
}
