import cloudinary from "../../config/cloudinary.config.js"
import UserModel from "../../models/userModel.js"


export async function getUsers(req, res) {

    try {
        const users = await UserModel.find()
        res.json({ message: "Users fetched successfully", code: 200, data: users })
    } catch (error) {
        res.json({ message: "Something went wrong", code: 500, error: error.message })
    }
}



export async function deleteUser(req, res) {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: "User id is required" })
    try {
        const user = await UserModel.findById(id)
        if (!user) return res.status(400).json({ message: "User not found" })

        if (user.profileImage) {
            const profileImagePublicId = user.profileImage.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(profileImagePublicId)
            console.log("Profile image deleted successfully");

        }

        if (user.photos && user.photos.length > 0) {
            user.photos.map(async photo => {
                const photoPublicId = photo.split('/').pop().split('.')[0]
                await cloudinary.uploader.destroy(photoPublicId)
                console.log("Photos deleted successfully");

            })
        }
        // Delete user
        const deleteUser = await UserModel.findByIdAndDelete(id)
        res.json({ message: "User deleted successfully", code: 200, data: deleteUser })
    } catch (error) {
        res.json({ message: "Something went wrong", code: 500, error: error.message })
    }

}