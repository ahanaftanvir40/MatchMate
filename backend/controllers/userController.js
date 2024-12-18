import jwt from 'jsonwebtoken';
import UserModel from "../models/userModel.js";
import cloudinary from '../config/cloudinary.config.js';


export async function SignUp(req, res) {
    try {

        const { phoneNumber, email, firstName, lastName, dateOfBirth, gender, passions } = req.body;
        // user avatar from frontend
        console.log('Req file', req.files['avatar']);
        // Req file [
        //     {
        //       fieldname: 'avatar',
        //       originalname: '370065100_374503718458294_2906132510583845363_n.png',
        //       encoding: '7bit',
        //       mimetype: 'image/png',
        //       path: 'https://res.cloudinary.com/dzps0hxo4/image/upload/v1734304604/avatars/cf91e5b249e3b3da6ffa21e3d8db20c9.png.png',
        //       size: 186419,
        //       filename: 'avatars/cf91e5b249e3b3da6ffa21e3d8db20c9.png'
        //     }
        //   ]



        const profileImage = req.files['avatar'][0].path;
        const publicId = req.files['avatar'][0].filename;



        // console.log('Req body', req.body);
        // console.log('Profile Image', profileImage);

        // Check if phone number or email is provided
        if (!phoneNumber && !email) {
            return res.status(404).json({ message: 'Phone number or email is required', code: 404, success: false });
        }

        if (!req.files) {
            return res.status(400).json({ code: 400, success: false, message: 'No Image uploaded' });
        }


        // Check phone number or email if it already exists
        if (phoneNumber) {
            const existingPhoneNumber = await UserModel.findOne({ phoneNumber });
            if (existingPhoneNumber) {
                // delete file
                await cloudinary.uploader.destroy(publicId);
                const token = jwt.sign({ value: phoneNumber }, process.env.JWT_SECRET);
                return res.status(400).json({ message: 'User already exists with this Phone Number', code: 400, success: false, token, data: existingPhoneNumber });
            }
        }
        if (email) {
            const existingEmail = await UserModel.findOne({ email });
            if (existingEmail) {
                // deleteFile()
                await cloudinary.uploader.destroy(publicId);
                const token = jwt.sign({ value: email }, process.env.JWT_SECRET);
                return res.status(400).json({ message: 'User already exists with this Email', code: 400, success: false, token, data: existingEmail });
            }
        }




        // Create new user if user does not exist
        const newUser = new UserModel({
            phoneNumber: phoneNumber || undefined, // Ensure phone number is stored as null if empty
            email: email || undefined, // Ensure email is stored as null if empty
            profileImage,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            passions
        });
        await newUser.save();


        // Create token using phone number or email
        const token = jwt.sign({ value: phoneNumber || email }, process.env.JWT_SECRET);

        return res.status(200).json({ message: 'User created successfully', code: 200, success: true, token, data: newUser });



    } catch (error) {
        console.error('An error occurred: ', error);
        return res.status(500).json({ message: 'An error occurred', code: 500, success: false, error: error.message });
    }
}

export async function SignIn(req, res) {
    try {
        const { phoneNumber, email } = req.body;

        if (!phoneNumber && !email) {
            return res.status(404).json({ message: 'Phone number or email is required', code: 404, success: false });
        }

        if (phoneNumber) {
            const user = await UserModel.findOne({ phoneNumber });
            if (!user) {
                return res.status(404).json({ message: 'User not found', code: 404, success: false });
            }
            const token = jwt.sign({ value: phoneNumber }, process.env.JWT_SECRET);
            return res.status(200).json({ message: 'User found', success: true, token, data: user });
        }

        if (email) {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found', code: 404, success: false });
            }
            const token = jwt.sign({ value: email }, process.env.JWT_SECRET);
            return res.status(200).json({ message: 'User found', success: true, token, data: user });
        }


    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', code: 500, success: false, error: error.message });
    }
}


export async function checkExistingUser(req, res) {
    try {
        const { phoneNumber, email } = req.body;



        if (!phoneNumber && !email) {
            return res.status(404).json({ message: 'Phone number or email is required', code: 404, success: false });
        }

        if (phoneNumber) {
            const user = await UserModel.findOne({ phoneNumber });
            if (!user) {
                return res.status(404).json({ message: 'User not found', code: 404, success: false });
            }
            return res.status(200).json({ message: 'User found', code: 200, success: true, data: user });
        }

        if (email) {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found', code: 404, success: false });
            }
            return res.status(200).json({ message: 'User found', code: 200, success: true, data: user });
        }
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', code: 500, success: false, error: error.message });
    }
}





















// import axios from 'axios';
// import crypto from 'crypto';
// import UserModel from "../models/userModel.js";
// import OtpModel from '../models/OtpModel.js';


// export async function SignUp(req, res) {
//     try {
//         const { phoneNumber, firstName, lastName, dateOfBirth, gender, passions, } = req.body;

//         const existingUser = await UserModel.findOne({ phoneNumber });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists', success: false });
//         }

//         // Generate OTP
//         const otp = crypto.randomInt(10 ** (4 - 1), 10 ** 4).toString();

//         //Handle otp here and if success create user
//         const sendSMS = async () => {
//             const slicedPhoneNumber = phoneNumber.split('+')[1]
//             try {
//                 const response = await axios.post(`http://45.120.38.242/api/sendsms?api_key=${process.env.OTP_API_KEY}&type=text&phone=${slicedPhoneNumber}&senderid=${process.env.OTP_SENDER_ID}&message=Your OTP is ${otp}`)


//                 console.log('SMS sent successfully:', response.data);
//                 if (response.data.status_code == 200) {
//                     const newOtp = new OtpModel({
//                         phoneNumber,
//                         otp
//                     })
//                 }
//                 res.json(response.data);
//                 return response.data;
//             } catch (error) {
//                 console.error('Error sending SMS:', error.message);
//                 throw error;
//             }
//         };

//         // Call the function
//         sendSMS();

//         const newUser = new UserModel({
//             phoneNumber,
//             firstName,
//             lastName,
//             dateOfBirth,
//         })


//     } catch (error) {
//         console.log('An error occurred: ', error);
//         return res.status(500).json({
//             message: 'An error occurred', success
//         })
//     }
// }