import express from 'express';
import { sendOtp, verifyOtpAndCreateToken } from '../controllers/otpController.js';
import { SignUp, SignIn } from '../controllers/userController.js';

const router = express.Router();

//user otp
// router.post('/sendotp', sendOtp)
// router.post('/verifyotp', verifyOtpAndCreateToken)

//user signup and signin
router.post('/signup', SignUp)
router.post('/signin', SignIn)



export default router;