import UserModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';


export async function SignUp(req, res) {
    try {
        const { token, firstName, lastName, dateOfBirth, gender, passions } = req.body

        let phoneNumber;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            phoneNumber = decoded.phoneNumber;
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token', success: false });
        }

        const existingUser = await UserModel.findOne({ phoneNumber })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false })
        }

        const newUser = new UserModel({
            phoneNumber,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            passions
        })
        await newUser.save()

        return res.status(201).json({ message: 'User created successfully', success: true, data: newUser })

    } catch (error) {
        console.error('An error occurred: ', error)
        return res.status(500).json({ message: 'An error occurred', success: false })
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