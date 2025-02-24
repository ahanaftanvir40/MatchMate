import express from 'express';
import { authToken } from '../middlewares/auth.js';
import { uploadFields } from '../middlewares/uploadFields.js';

//import controllers
import { createPost, handleLike, getPosts } from '../controllers/postController.js';

const router = express.Router();
// const uploadFields = upload.fields([{ name: 'postImages', maxCount: 5 }]);

router.post('/create', authToken, uploadFields([{ name: 'postImages', maxCount: 5 }]), createPost)

//Handle Love Reacts and to remove the like call this again.
router.post('/like/:postId', authToken, handleLike);

//Get Posts
router.get('/getPosts', authToken, getPosts)


export default router;