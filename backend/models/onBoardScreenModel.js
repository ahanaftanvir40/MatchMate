import mongoose, { Schema } from 'mongoose';

const onBoardScreenSchema = new Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
})

const OnBoardScreenModel = mongoose.model('OnBoardScreen', onBoardScreenSchema);
export default OnBoardScreenModel;