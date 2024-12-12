import express from 'express';
import { sendOtp, verifyOtpAndCreateToken } from '../controllers/otpController.js';
import { SignUp } from '../controllers/userController.js';

const router = express.Router();

router.post('/sendotp', sendOtp)
// router.post('/verifyotp', verifyOtp)
router.post('/verifyotp', verifyOtpAndCreateToken)
router.post('/signup', SignUp)


export default router;