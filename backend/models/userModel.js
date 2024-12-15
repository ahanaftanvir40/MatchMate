import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    role: {
        type: String,
        enum: ['user', 'premium', 'admin'],
        default: 'user',
    },
    phoneNumber: {
        type: String,
        sparse: true,
        unique: true,
    },
    email: {
        type: String,
        sparse: true,
    },
    profileImage: {
        type: String,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true,
    },
    passions: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length === 3,
            message: 'User must select exactly 3 passions.',
        },

    },

    profession: {
        type: String,
    },
    location: {
        type: String,
    },

    notification: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
