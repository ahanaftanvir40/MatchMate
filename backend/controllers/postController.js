import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";

export async function createPost(req, res) {
    const userId = req.user._id;
    const { content } = req.body;

    let images;
    if (req.files && req.files.postImages) {
        images = req.files.postImages.map((image) => {
            return image.path;
        });
    }

    try {
        const newPost = new PostModel({
            userId: userId,
            content,
            images,
        });

        await newPost.save();

        return res.status(201).json({ code: 200, success: true, message: 'Post created successfully', data: newPost });

    } catch (error) {
        return res.status(500).json({ code: 500, success: false, message: 'Internal server error', error: error.message });
    }




}


export async function handleLike(req, res) {
    const postId = req.params.postId;
    const userId = req.user._id;

    try {
        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ code: 404, success: false, message: 'Post not found' });
        }

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return res.status(200).json({ code: 200, success: true, message: 'Post updated successfully', data: post });

    } catch (error) {
        return res.status(500).json({ code: 500, success: false, message: 'Internal server error', error: error.message });
    }
}


export async function getPosts(req, res) {
    const userId = req.user._id;
    try {

        const currentUser = await UserModel.findById(userId)
        if (currentUser.matchedUsers.length === 0) {
            return res.status(404).json({ code: 404, success: false, message: 'No matched users found to show posts', error: 'No posts to show' });
        }
        const matchedUser = currentUser.matchedUsers.map((user => user.toString()));
        const allPosts = await Promise.all(matchedUser.map(async (id) => {
            const posts = await PostModel.find({ userId: id }).populate('userId', 'firstName lastName profileImage').populate('likes', 'firstName , lastName , profileImage').sort({ createdAt: -1 })
            return posts
        }));

        return res.status(200).json({ code: 200, success: true, message: 'Posts fetched successfully', data: allPosts });

    } catch (error) {
        return res.status(500).json({ code: 500, success: false, message: 'Internal server error', error: error.message });
    }

}