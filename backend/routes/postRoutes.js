import express from 'express';
import { authToken } from '../middlewares/auth.js';
import upload from '../config/multer.config.js';

//import controllers
import { createPost, handleLike , getPosts } from '../controllers/postController.js';

const router = express.Router();
const uploadFields = upload.fields([{ name: 'postImages', maxCount: 5 }]);

router.post('/create', authToken, (req, res, next) => {
    uploadFields(req, res, function (err) {
        if (err) {
            console.error('Multer Error:', err);
            if (err.message === 'Invalid file type. Only .jpg, .jpeg, heic , heif and .png formats are allowed!') {
                return res.status(400).json({ code: 400, success: false, error: err.message });
            }
            return res.status(400).json({ code: 400, success: false, error: 'File upload error' });
        }
        next();
    })
},

    createPost)


//Handle Love Reacts and to remove the like call this again.
router.post('/like/:postId', authToken, handleLike);

//Get Posts
router.get('/getPosts' , authToken , getPosts)


export default router;