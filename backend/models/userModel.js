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
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
    photos: {
        type: [String],
        validate: {
            validator: (v) => v.length <= 5,
            message: 'User can upload maximum 5 photos.'
        }
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
    age: {
        type: Number,
        default: 0
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
            validator: (v) => v.length <= 5,
            message: 'User may have maximum 5 passions.',
        },
    },
    bio: {
        type: String,
    },
    profession: {
        type: String,
    },

    //Location
    latitude: {
        type: Number,
        default: 0,
    },
    longitude: {
        type: Number,
        default: 0,
    },
    //Settings
    notification: {
        type: Boolean,
        default: false,
    },

    //Matched Users
    matchedUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },

    //Swipe-Count
    swipeCount: {
        type: Number,
        default: 30,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
