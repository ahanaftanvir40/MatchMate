import axios from 'axios';
import crypto from 'crypto';
import OtpModel from '../models/OtpModel.js';
import UserModel from '../models/userModel.js';

export async function sendOtp(req, res) {
    try {
        const { phoneNumber } = req.body;

        const existingUser = await UserModel.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        // Generate OTP
        const otp = crypto.randomInt(10 ** (4 - 1), 10 ** 4).toString();

        // Send SMS
        const slicedPhoneNumber = phoneNumber.split('+')[1];
        const smsResponse = await axios.post(
            `http://45.120.38.242/api/sendsms?api_key=${process.env.OTP_API_KEY}&type=text&phone=${slicedPhoneNumber}&senderid=${process.env.OTP_SENDER_ID}&message=Your OTP is ${otp}`
        );

        if (smsResponse.data.status_code === 200) {
            // Save OTP to the database with expiration (e.g., 5 minutes)
            const otpEntry = new OtpModel({
                phoneNumber,
                otp,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
            });
            await otpEntry.save();

            return res.status(200).json({ message: 'OTP sent successfully', success: true });
        } else {
            return res.status(500).json({ message: 'Failed to send OTP', success: false });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}


export async function verifyOtpAndCreateToken(req, res) {
    try {
        const { otp } = req.body;

        // Find the OTP entry in the database
        const otpEntry = await OtpModel.findOne({ otp });

        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired', success: false });
        }

        // Check if OTP has expired
        if (otpEntry.expireAt < Date.now()) {
            await OtpModel.deleteOne({ otp });
            return res.status(400).json({ message: 'OTP has expired', success: false });
        }

        // Create token
        const token = jwt.sign({ phoneNumber: otpEntry.phoneNumber }, process.env.JWT_SECRET);


        return res.status(201).json({ message: 'Otp Verified', success: true, token });
    } catch (error) {
        console.error('Error during sign-up:', error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}
