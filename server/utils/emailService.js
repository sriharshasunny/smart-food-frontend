const { Resend } = require('resend');

// Initialize Resend
// Note: Ensure RESEND_API_KEY is in your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - One Time Password
 */
exports.sendOTP = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'SmartFood <onboarding@resend.dev>', // Default testing domain. Change to verified domain in prod.
            to: [email],
            subject: 'Your Login Code',
            html: `
            <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h1>SmartFood Delivery 🍔</h1>
                <p>Your verification code is:</p>
                <h2 style="font-size: 32px; letter-spacing: 5px; color: #f97316;">${otp}</h2>
                <p>This code expires in 10 minutes.</p>
                <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore.</p>
            </div>
        `
        });

        if (error) {
            console.error("Resend OTP Error:", error);
            throw error;
        }

        console.log(`[EmailService] OTP sent to ${email}. ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error("Failed to send OTP:", error);
        throw error;
    }
};

/**
 * Send Order Confirmation Email
 * @param {string} email - Recipient email
 * @param {object} order - Order object
 */
exports.sendOrderConfirmation = async (email, order) => {
    console.log(`[EmailService] Preparing to send order confirmation to ${email}`);

    // Fallback if order items are missing or structure is different
    const items = order.items || [];
    const orderId = order._id || order.id || 'N/A';
    const total = order.totalAmount || order.total_amount || 0;
    const link = order.invoiceLink || '#';

    const itemListHtml = items.map(i => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #333;">${i.name}</td>
            <td style="text-align: right; padding: 10px; color: #333;">${i.quantity}</td>
            <td style="text-align: right; padding: 10px; color: #333;">₹${(i.price * i.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    try {
        const { data, error } = await resend.emails.send({
            from: 'SmartFood Orders <onboarding@resend.dev>', // Default testing domain
            to: [email],
            subject: `Order Confirmed! #${orderId.toString().slice(-6)}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <div style="background-color: #ff6600; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
                    <h1 style="margin: 0;">Order Confirmed!</h1>
                    <p style="margin: 5px 0 0;">Your food is on the way.</p>
                </div>
                <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
                    <p>Hi there,</p>
                    <p>Thank you for choosing SmartFood Delivery! We've received your order and are preparing it with care.</p>
                    <p style="color: #ff6600; font-weight: bold; font-size: 18px; margin: 20px 0;">We will reach in 10-15 min.</p>
                    
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #555;">Order ID</p>
                        <p style="margin: 5px 0 0; font-size: 18px; color: #333;">#${orderId.toString().toUpperCase().slice(-6)}</p>
                    </div>

                    <h3>Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 2px solid #eee;">
                            <th style="text-align: left; padding: 10px; color: #555;">Item</th>
                            <th style="text-align: right; padding: 10px; color: #555;">Qty</th>
                            <th style="text-align: right; padding: 10px; color: #555;">Price</th>
                        </tr>
                        ${itemListHtml}
                        <tr>
                            <td colspan="2" style="padding: 15px 10px; font-weight: bold; text-align: right;">Total Amount:</td>
                            <td style="padding: 15px 10px; font-weight: bold; text-align: right; color: #ff6600; font-size: 18px;">₹${Number(total).toFixed(2)}</td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${link}" style="background-color: #ff6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Invoice</a>
                    </div>

                    <div style="text-align: center; margin-top: 30px; color: #777; font-size: 12px;">
                        <p>SmartFood Delivery Inc.</p>
                    </div>
                </div>
            </div>
            `
        });

        if (error) {
            console.error("Resend Order Email Error:", error);
            throw error;
        }

        console.log(`[EmailService] Order Email sent to ${email}. ID: ${data.id}`);
        return data;

    } catch (error) {
        console.error("Failed to send order email:", error);
        // Fallback to not crashing app, but logging error is crucial
        // In dev with unverified domain, this might fail if not sending to self
        return null;
    }
};
