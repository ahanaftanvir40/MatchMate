import UserModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';

export async function authToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findOne({ _id: decoded.value });
        next()
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid token', error: 'Please SignIn', success: false });
    }
}