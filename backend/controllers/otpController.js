const OTP = require('../models/OTP');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

// @desc    Send OTP to email
// @route   POST /api/otp/send
// @access  Public
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Generate new OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({ email, otp });

        // Send OTP email
        const result = await sendOTPEmail(email, otp);

        if (!result.success) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ message: 'Email verified successfully', verified: true });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { sendOTP, verifyOTP };
