const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465, // SSL
    secure: true,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
});

// Verify connection configuration on startup (non-blocking)
transporter.verify().then(() => {
    console.log('[EmailService] Nodemailer SMTP connection verified successfully.');
}).catch((err) => {
    console.error('[EmailService] Nodemailer SMTP connection failed (Check App Password):', err.message);
});

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - One Time Password
 */
exports.sendOTP = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"SmartFood Security" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Access Code - SmartFood Delivery',
            html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #eaeaea; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 20px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SmartFood Delivery</h1>
                </div>
                <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">Use the verification code below to authorize your login securely.</p>
                
                <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px dashed #fdba74;">
                    <h2 style="font-size: 36px; letter-spacing: 8px; color: #ea580c; margin: 0; font-family: monospace;">${otp}</h2>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">This code is valid for 10 minutes.</p>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
            </div>
        `
        });

        console.log(`[EmailService] OTP sent seamlessly via Nodemailer to ${email}. ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Failed to send OTP via Nodemailer:", error);
        throw error;
    }
};

/**
 * Send Order Confirmation Email
 * @param {string} email - Recipient email
 * @param {object} order - Order object
 */
exports.sendOrderConfirmation = async (email, order) => {
    console.log(`[EmailService] Preparing to send order confirmation via Nodemailer to ${email}`);

    // Extract relevant data safely
    const items = order.items || [];
    const orderId = order._id || order.id || 'N/A';
    const total = order.totalAmount || order.total_amount || 0;
    const link = order.invoiceLink || '#';

    // Build items HTML list
    const itemListHtml = items.map(i => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 10px; color: #1e293b; font-weight: 500;">${i.name}</td>
            <td style="text-align: center; padding: 16px 10px; color: #475569; font-weight: 600;">x${i.quantity}</td>
            <td style="text-align: right; padding: 16px 10px; color: #1e293b; font-weight: 600;">₹${(i.price * i.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    try {
        const info = await transporter.sendMail({
            from: `"SmartFood Orders" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: email,
            subject: `Order Confirmed! Receipt #${orderId.toString().slice(-6)}`,
            html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; color: white;">
                    <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                        <span style="font-size: 30px;">🛵</span>
                    </div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Order Received!</h1>
                    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your food is being prepared.</p>
                </div>

                <div style="padding: 32px;">
                    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi there,</p>
                    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Great choice! We've received your order and the kitchen is working their magic.</p>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
                        <p style="margin: 0; color: #f97316; font-weight: 700; font-size: 18px;">Estimated Delivery: 10-15 min</p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 32px; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Order Summary</h3>
                            <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Receipt #${orderId.toString().toUpperCase().slice(-6)}</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e2e8f0;">
                                <th style="text-align: left; padding: 12px 10px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                                <th style="text-align: center; padding: 12px 10px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                <th style="text-align: right; padding: 12px 10px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemListHtml}
                            <tr>
                                <td colspan="2" style="padding: 24px 10px 10px; font-weight: 700; text-align: right; color: #475569; font-size: 16px;">Total Paid</td>
                                <td style="padding: 24px 10px 10px; font-weight: 800; text-align: right; color: #ea580c; font-size: 20px;">₹${Number(total).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="text-align: center; margin-top: 40px;">
                        <a href="${link}" style="display: inline-block; background: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background 0.2s;">Download Official Invoice</a>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; font-weight: 500;">SmartFood Delivery Inc. © ${new Date().getFullYear()}</p>
                </div>
            </div>
            `
        });

        console.log(`[EmailService] Order Email sent via Nodemailer to ${email}. ID: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Failed to send order email via Nodemailer:", error);
        return null;
    }
};
