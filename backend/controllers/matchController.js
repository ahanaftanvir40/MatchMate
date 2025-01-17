import UserModel from "../models/userModel.js";
import swipeModel from "../models/swipeModel.js";
import { getDistanceFromLatLonInKm } from "../utils/CalculateDistance.js";
import { checkAndResetSwipeCount } from "../utils/CheckAndResetSwipe.js";

export async function SuggestedUsers(req, res) {
    const { latitude, longitude } = req.body;

    const passions = req.user.passions

    if (!latitude || !longitude || !passions) {
        return res.status(400).json({ code: 400, success: false, message: 'Latitude, longitude, and passions are required.' });
    }

    try {
        const latitudeFloat = parseFloat(latitude);
        const longitudeFloat = parseFloat(longitude);
        const currentUser = await UserModel.findByIdAndUpdate(req.user._id, { latitude: latitudeFloat, longitude: longitudeFloat }, { new: true });
        const allUsers = await UserModel.find({ _id: { $ne: req.user._id } });
        const passionArray = Array.isArray(passions) ? passions : [passions];

        const suggestions = allUsers.filter(user => {
            const distance = getDistanceFromLatLonInKm(
                latitudeFloat,
                longitudeFloat,
                user.latitude,
                user.longitude
            )

            const hasMatchingPassion = user.passions.some(passion => passionArray.includes(passion));

            return distance <= 50 && hasMatchingPassion;
        })

        if (suggestions.length === 0) {
            return res.json({ code: 200, success: true, error: 'No suggestions found' });
        }

        res.json({ code: 200, success: true, data: suggestions });

    } catch (error) {
        res.status(500).json({ code: 500, success: false, error: 'Server error', message: error.message });
    }


}

export async function handleRightSwipe(req, res) {
    const { targetUserId } = req.body;
    const userId = req.user._id;

    try {
        // Check and reset swipe count if necessary
        let swipeCount = await checkAndResetSwipeCount(userId);

        if (swipeCount <= 0) {
            return res.status(400).json({ code: 400, success: false, error: 'No swipes remaining. Please wait until the reset.' });
        }

        // Check if the target user already swiped right on the current user
        const match = await swipeModel.findOne({ userId: targetUserId, targetUserId: userId });

        if (match) {
            // It's a match!
            swipeCount -= 1;
            await UserModel.findByIdAndUpdate(userId, { swipeCount });
            res.json({ code: 200, success: true, message: 'It\'s a match!', match: true });
        } else {
            // Save the current user's right swipe
            const newSwipe = new swipeModel({
                userId,
                targetUserId,
                date: new Date().toISOString().split('T')[0]
            });

            await newSwipe.save();

            // Decrease swipe count
            swipeCount -= 1;
            await UserModel.findByIdAndUpdate(userId, { swipeCount });

            res.json({ code: 200, success: true, message: 'Swipe recorded.', match: false });
        }
    } catch (error) {
        res.status(500).json({ code: 500, success: false, error: 'Server error', message: error.message });
    }
}