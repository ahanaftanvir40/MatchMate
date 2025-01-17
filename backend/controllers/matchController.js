import UserModel from "../models/userModel.js";
import { getDistanceFromLatLonInKm } from "../utils/CalculateDistance.js";

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