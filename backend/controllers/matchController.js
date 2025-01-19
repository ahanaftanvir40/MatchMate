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


            //also filter the users who are already swiped by the current user
            const isSwiped = currentUser.matchedUsers.includes(user._id);
            return distance <= 50 && hasMatchingPassion && !isSwiped;
        })

        if (suggestions.length === 0) {
            return res.json({ code: 200, success: true, error: 'No suggestions found' });
        }
        const sanitizedSuggestions = suggestions.map(user => {
            const { password, ...sanitizedUser } = user.toObject();
            return sanitizedUser;
        });

        res.json({ code: 200, success: true, data: sanitizedSuggestions });
        // res.json({ code: 200, success: true, data: suggestions });

    } catch (error) {
        res.status(500).json({ code: 500, success: false, error: 'Server error', message: error.message });
    }


}


export async function filterSuggestedUsers(req, res) {
    const { distance, gender, ageStart, ageEnd } = req.body;
    const allUsers = await UserModel.find({ _id: { $ne: req.user._id } });


    const suggestedUsers = allUsers.filter(user => {
        // Calculate distance if distance filter is provided
        let isWithinDistance = true;
        if (distance !== undefined) {
            const userDistance = getDistanceFromLatLonInKm(
                req.user.latitude,
                req.user.longitude,
                user.latitude,
                user.longitude
            );
            const parseDistance = parseInt(distance);
            isWithinDistance = userDistance <= parseDistance;
        }

        // Check gender if gender filter is provided
        const isGenderMatch = !gender || user.gender === gender;

        // Check age range if age filters are provided
        let isWithinAgeRange = true;
        if (ageStart !== undefined && ageEnd !== undefined) {
            const parseAgeStart = parseInt(ageStart);
            const parseAgeEnd = parseInt(ageEnd);
            isWithinAgeRange = user.age >= parseAgeStart && user.age <= parseAgeEnd;
        }

        return isWithinDistance && isGenderMatch && isWithinAgeRange;
    });
    if (suggestedUsers.length === 0) {
        return res.json({ code: 200, success: true, error: 'No suggestions found' });
    }

    const sanitizedSuggestions = suggestedUsers.map(user => {
        const { password, ...sanitizedUser } = user.toObject();
        return sanitizedUser;
    })

    res.json({ code: 200, success: true, data: sanitizedSuggestions });
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
            //handle another corner case if the user already exists in the matchedUsers array
            // Save the match to matchedUsers field in both users
            await UserModel.findByIdAndUpdate(userId, { swipeCount, $push: { matchedUsers: targetUserId } });
            await UserModel.findByIdAndUpdate(targetUserId, { $push: { matchedUsers: userId } });
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