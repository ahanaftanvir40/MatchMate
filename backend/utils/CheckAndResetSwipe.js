import UserModel from "../models/userModel.js";

export async function checkAndResetSwipeCount(userId) {
    const user = await UserModel.findById(userId);
    const now = new Date();

    if (now - new Date(user.lastSwipeReset) >= 24 * 60 * 60 * 1000) {
        user.swipeCount = 30;
        user.lastSwipeReset = now;
        await user.save();
    }

    return user.swipeCount;
}