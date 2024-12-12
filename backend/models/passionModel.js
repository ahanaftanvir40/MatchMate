import mongoose, { Schema } from "mongoose";

const passionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
});

const PassionModel = mongoose.model('Passion', passionSchema);
export default PassionModel;
