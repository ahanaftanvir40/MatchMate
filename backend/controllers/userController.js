import jwt from 'jsonwebtoken';
import UserModel from "../models/userModel.js";

export async function SignUp(req, res) {
    try {
        const { phoneNumber, email, firstName, lastName, dateOfBirth, gender, passions } = req.body;

        if (!phoneNumber && !email) {
            return res.status(404).json({ message: 'Phone number or email is required', code: 404, success: false });
        }


        // Check phone number or email if it already exists
        const query = { $or: [{ phoneNumber }] };
        if (email) {
            query.$or.push({ email });
        }

        // Check if user already exists and sending the user data
        const existingUser = await UserModel.findOne(query)


        // Return message if user already exists and also the data of the existing user
        if (existingUser) {
            const token = jwt.sign({ value: phoneNumber || email }, process.env.JWT_SECRET);
            return res.status(400).json({ message: 'User already exists', code: 400, success: false, token, data: existingUser });
        }


        // Create new user if user does not exist
        const newUser = new UserModel({
            phoneNumber,
            email: email || undefined, // Ensure email is stored as null if empty
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
        const { phoneNumber } = req.body;
        const user = await UserModel.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const token = jwt.sign({ phoneNumber }, process.env.JWT_SECRET);

        return res.status(200).json({ message: 'User found', success: true, token, data: user });
    } catch (error) {

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