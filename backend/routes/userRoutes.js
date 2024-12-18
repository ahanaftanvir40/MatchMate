import express from 'express';
import { sendOtp, verifyOtpAndCreateToken } from '../controllers/otpController.js';
import { SignUp, SignIn, checkExistingUser } from '../controllers/userController.js';
import upload from '../config/multer.config.js';





const router = express.Router();
//user otp
// router.post('/sendotp', sendOtp)
// router.post('/verifyotp', verifyOtpAndCreateToken)





//user signup and signin
const uploadFields = upload.fields([{ name: 'avatar', maxCount: 1 }])

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
router.post('/checkuser', checkExistingUser)



export default router;