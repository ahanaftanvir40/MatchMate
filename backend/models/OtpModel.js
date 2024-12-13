import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: Date.now,
    },
})

const OtpModel = mongoose.model('Otp', otpSchema);
export default OtpModel;