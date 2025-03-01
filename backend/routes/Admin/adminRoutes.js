import express from 'express'
import {authToken} from '../../middlewares/auth.js'
import { getUsers , deleteUser } from '../../controllers/Admin/adminUserController.js'
const router = express.Router()
// add auth middeware later

//User Admin Routes
//Get all users
router.get('/users' , getUsers)
router.delete('/users/:id' , deleteUser)

export default router