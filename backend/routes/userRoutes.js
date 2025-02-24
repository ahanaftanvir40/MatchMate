import express from 'express';
import { SignUp, SignIn, checkExistingUser, sendEmailOtp, verifyEmailOtp, updateUserProfile, getUserProfile } from '../controllers/userController.js';
import { authToken } from '../middlewares/auth.js';
import { uploadFields } from '../middlewares/uploadFields.js';

const router = express.Router();

//User OTP
//call this when user clicks continue with email
router.post('/send-email-otp', sendEmailOtp)
//call this when user clicks verify otp
router.post('/verify-email-otp', verifyEmailOtp)


//user signup and signin
// const uploadFields = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'userImages', maxCount: 5 }]);
router.post('/signup', uploadFields([{ name: 'avatar', maxCount: 1 }, { name: 'userImages', maxCount: 5 }]), SignUp);

router.post('/signin', SignIn)

//check if user exists
router.post('/checkuser', checkExistingUser)

//update user profile
router.put('/update-profile/:userId', authToken, uploadFields([{ name: 'avatar', maxCount: 1 }, { name: 'userImages', maxCount: 5 }]), updateUserProfile)

//User Profile
router.get('/profile', authToken, getUserProfile)



export default router;