import UserModel from "../../models/userModel.js"


export async function getUsers(req, res) {

    try {
        const users = await UserModel.find()
        res.json({message: "Users fetched successfully" , code: 200 , data: users})
    } catch (error) {
        res.json({message: "Something went wrong"  , code: 500 , error: error.message})
    }
}



export async function deleteUser(req, res) {
    const {id} = req.params
    if(!id) return res.status(400).json({message: "User id is required"})
    try {
        const deleteUser = await UserModel.findByIdAndDelete(id)
        if(!deleteUser) return res.status(400).json({message: "User not found"})
        res.json({message: "User deleted successfully" , code: 200 , data: deleteUser})
    } catch (error) {
        res.json({message: "Something went wrong"  , code: 500 , error: error.message})
    }

}