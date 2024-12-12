import UserModel from "../models/userModel";

export async function authToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findOne({ phoneNumber: decoded.phoneNumber });
        next()
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid token', success: false });
    }
}