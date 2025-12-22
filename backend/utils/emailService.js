const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Log config status
console.log('Email Service Config:', {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using Resend
const sendOTPEmail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Hitayu Portal <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email - OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb; text-align: center;">Email Verification</h2>
                    <p style="color: #374151; font-size: 16px;">Your OTP for email verification is:</p>
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
                    <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hitayu Volunteer Portal</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend email error:', error);
            return { success: false, error: error.message };
        }

        console.log('Email sent successfully:', data);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { generateOTP, sendOTPEmail };
