import express from 'express';
import { authToken } from '../middlewares/auth.js';
import { SuggestedUsers, handleRightSwipe } from '../controllers/matchController.js';

const router = express.Router();

//Send Lat Lang of the logged in user and it returns the suggested users if no users fount it will save the lat lang of the current user anyway.
router.post('/suggestedUsers', authToken, SuggestedUsers)
router.post('/handleRightSwipe', authToken, handleRightSwipe)

export default router;