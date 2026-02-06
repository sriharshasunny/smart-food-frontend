const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = require('./utils/supabase');
const emailService = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodRoutes = require('./routes/foodRoutes');

app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/food', foodRoutes);

// --- AUTH ROUTES (Inline Refactor) ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        // Note: Password storing in plaintext is bad practice. supbase.auth is better.
        // But maintaining legacy behavior for now.
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                name,
                email,
                password, // Legacy field
                auth_provider: 'local'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'User registered successfully',
            user: { name, email, _id: newUser.id } // Keep _id for frontend compatibility
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user.id, // Map for frontend
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Firebase/Provider Login (Syncs/Creates user)
app.post('/api/auth/firebase-login', async (req, res) => {
    try {
        const { uid, email, phone, name } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'UID required' });
        }

        // Check user by Firebase UID or Email/Phone
        // Supabase OR syntax: or=(firebase_uid.eq.UID,email.eq.EMAIL, ...)
        // Let's keep it simple: check UID first, then email

        // 1. Check by UID
        let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', uid)
            .single();

        // 2. If not found, check by Email/Phone to merge
        if (!user && (email || phone)) {
            let query = supabase.from('users').select('*');
            const conditions = [];
            if (email) conditions.push(`email.eq.${email}`);
            if (phone) conditions.push(`phone.eq.${phone}`);

            if (conditions.length > 0) {
                query = query.or(conditions.join(','));
                const { data: potentialMatches } = await query;
                if (potentialMatches && potentialMatches.length > 0) {
                    user = potentialMatches[0];
                }
            }
        }

        if (user) {
            // Update UID if missing
            if (!user.firebase_uid) {
                const { data: updated } = await supabase
                    .from('users')
                    .update({
                        firebase_uid: uid,
                        auth_provider: 'firebase'
                    })
                    .eq('id', user.id)
                    .select()
                    .single();
                user = updated;
            }
            return res.status(200).json({
                status: 'success',
                user: { ...user, _id: user.id }
            });
        } else {
            // Create New
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    name: name || 'New User',
                    email: email,
                    phone: phone,
                    firebase_uid: uid,
                    auth_provider: 'firebase'
                })
                .select()
                .single();

            if (createError) throw createError;

            return res.status(201).json({
                status: 'created',
                user: { ...newUser, _id: newUser.id }
            });
        }

    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Temporary In-Memory OTP Store
const otpStore = new Map();

// Nodemailer Transporter
// Email Service imported at top
// const transporter = ... (Moved to utils/emailService.js)

// --- EMAIL OTP ROUTES ---

// DEBUG ROUTE: Test Email Connection (Resend)
app.get('/api/test-email', async (req, res) => {
    try {
        const email = req.query.email || 'delivered@resend.dev'; // Default to Resend sink
        console.log(`Testing Resend to: ${email}`);

        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'SmartFood Test <onboarding@resend.dev>',
            to: [email],
            subject: 'Resend Integation Test',
            html: '<h1>It Works!</h1><p>Resend is active.</p>'
        });

        if (error) throw error;

        res.json({
            status: 'SUCCESS',
            message: 'Email sent via Resend!',
            data
        });

    } catch (error) {
        console.error("Resend Test Error:", error);
        res.status(500).json({
            status: 'FAILED',
            error: error.message
        });
    }
});

// DEBUG ROUTE: Force-email the last order
app.get('/api/debug-last-order', async (req, res) => {
    try {
        const supabase = require('./utils/supabase');
        const emailService = require('./utils/emailService');

        // Get last order
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !order) return res.status(404).json({ error: "No orders found" });

        const guestEmail = order.guest_info?.email;
        if (!guestEmail) return res.status(400).json({ error: "Last order has no email", order });

        // Mock payload
        const orderForEmail = {
            ...order,
            _id: order.id,
            guestInfo: order.guest_info,
            totalAmount: order.total_amount,
            invoiceLink: `https://smart-food-frontend.vercel.app/orders/${order.id}/invoice`,
            items: []
        };

        // Attempt Send
        const info = await emailService.sendOrderConfirmation(guestEmail, orderForEmail);

        res.json({
            status: 'SUCCESS',
            emailTarget: guestEmail,
            messageId: info?.messageId || 'Sent (No ID)'
        });

    } catch (e) {
        res.status(500).json({
            status: 'FAILED',
            error: e.toString(),
            stack: e.stack
        });
    }
});

// 1. Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email, type } = req.body; // type: 'login' | 'register'
        if (!email) return res.status(400).json({ message: 'Email required' });

        const cleanEmail = email.toLowerCase();

        if (type) {
            const { data: userExists } = await supabase
                .from('users')
                .select('id')
                .eq('email', cleanEmail)
                .single();

            if (type === 'reset' && !userExists) {
                return res.status(404).json({
                    message: 'Account not found',
                    // ... error details match original
                    action: 'switch_to_register'
                });
            }
            if (type === 'login' && !userExists) {
                return res.status(404).json({
                    message: 'User not found',
                    action: 'switch_to_register'
                });
            }
            if (type === 'register' && userExists) {
                return res.status(400).json({
                    message: 'User already exists',
                    action: 'switch_to_login'
                });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(cleanEmail, { otp, expires: Date.now() + 10 * 60 * 1000 });

        console.log(`\n=== EMAIL OTP for ${cleanEmail} (${type || 'unknown'}) ===\nCode: ${otp}\n=============================\n`);

        try {
            await emailService.sendOTP(cleanEmail, otp);
            console.log(`Email sent successfully to ${cleanEmail}`);
            res.json({ message: 'OTP sent successfully' });
        } catch (mailError) {
            console.error("Email send failed:", mailError);
            // Exposed detailed error for debugging purposes
            res.status(500).json({
                message: `Email Failed: ${mailError.message || 'Unknown Error'}`,
                error: mailError.toString()
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
});

// 2. Verify OTP & Login
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp, name, password } = req.body;
        const cleanEmail = email.toLowerCase();
        const storedData = otpStore.get(cleanEmail);

        if (!storedData) return res.status(400).json({ message: 'OTP expired or not sent' });

        const sentOtpInt = parseInt(otp);
        const storedOtpInt = parseInt(storedData.otp);

        if (isNaN(sentOtpInt) || sentOtpInt !== storedOtpInt) {
            return res.status(400).json({ message: 'Invalid OTP Code' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(cleanEmail);
            return res.status(400).json({ message: 'OTP expired' });
        }

        console.log(`[Verify] OTP Verified for ${cleanEmail}`);

        otpStore.delete(cleanEmail);

        // Find or Create User
        try {
            let { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('email', cleanEmail)
                .single();

            if (!user) {
                // Registration
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        name: name || 'Explorer',
                        email: cleanEmail,
                        password: password,
                        auth_provider: 'email-otp'
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                user = newUser;
            } else {
                // Update name
                if (name && user.name === 'New User') {
                    await supabase
                        .from('users')
                        .update({ name })
                        .eq('id', user.id);
                    user.name = name;
                }
            }

            res.json({
                message: 'Login successful',
                user: { ...user, _id: user.id },
                token: 'mock-jwt-token'
            });
        } catch (dbError) {
            console.error("Database Error during Verify:", dbError);
            res.status(500).json({ message: 'Database Error', error: dbError.message });
        }

    } catch (error) {
        console.error("General Verify Error:", error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});

// 3. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });

        const cleanEmail = email.toLowerCase();
        const storedData = otpStore.get(cleanEmail);

        if (!storedData) return res.status(400).json({ message: 'OTP expired or not sent' });

        const sentOtpInt = parseInt(otp);
        const storedOtpInt = parseInt(storedData.otp);

        if (isNaN(sentOtpInt) || sentOtpInt !== storedOtpInt) return res.status(400).json({ message: 'Invalid OTP Code' });
        if (Date.now() > storedData.expires) return res.status(400).json({ message: 'OTP expired' });

        otpStore.delete(cleanEmail);

        // Update Password
        const { error } = await supabase
            .from('users')
            .update({ password: newPassword })
            .eq('email', cleanEmail);

        if (error) return res.status(500).json({ message: 'Error updating password', error: error.message });

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('✅ Supabase Backend Active - v2 (Restaurant Routes Added)');
});
