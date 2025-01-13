import express from 'express';
import { SignUp, SignIn, checkExistingUser, sendEmailOtp, verifyEmailOtp, updateUserProfile, getUserProfile } from '../controllers/userController.js';
import upload from '../config/multer.config.js';
import { authToken } from '../middlewares/auth.js';

const router = express.Router();

//User OTP
//call this when user clicks continue with email
router.post('/send-email-otp', sendEmailOtp)
//call this when user clicks verify otp
router.post('/verify-email-otp', verifyEmailOtp)



//user signup and signin
const uploadFields = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'userImages', maxCount: 5 }]);

router.post('/signup', (req, res, next) => {
    uploadFields(req, res, function (err) {
        if (err) {
            console.error('Multer Error:', err);
            if (err.message === 'Invalid file type. Only .jpg, .jpeg, and .png formats are allowed!') {
                return res.status(400).json({ code: 400, success: false, error: err.message });
            }
            return res.status(400).json({ code: 400, success: false, error: 'File upload error' });
        }
        next();
    });
}, SignUp);

router.post('/signin', SignIn)
//check if user exists
router.post('/checkuser', checkExistingUser)
//update user profile
router.put('/update-profile/:userId', (req, res, next) => {
    uploadFields(req, res, function (err) {
        if (err) {
            console.error('Multer Error:', err);
            if (err.message === 'Invalid file type. Only .jpg, .jpeg, and .png formats are allowed!') {
                return res.status(400).json({ code: 400, success: false, error: err.message });
            }
            return res.status(400).json({ code: 400, success: false, error: 'File upload error' });
        }
        next();
    });
}, updateUserProfile)

//User Profile
router.get('/profile', authToken, getUserProfile)



export default router;