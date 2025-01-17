import mongoose, { Schema } from 'mongoose';

const SwipeSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Ensure that each user can only swipe right on the same target once per day
// SwipeSchema.index({ userId: 1, targetUserId: 1, date: 1 }, { unique: true });

export default mongoose.model('Swipe', SwipeSchema);
