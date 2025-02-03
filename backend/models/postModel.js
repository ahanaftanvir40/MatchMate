import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
    },
    images: {
        type: [String],
        validate: {
            validator: (v) => v.length <= 5,
            message: 'Post can have maximum 5 photos.'
        }
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

const PostModel = mongoose.model('Post', postSchema);
export default PostModel;