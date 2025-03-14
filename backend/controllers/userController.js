import jwt from 'jsonwebtoken';
import UserModel from "../models/userModel.js";
import cloudinary from '../config/cloudinary.config.js';
import { sendMail } from '../config/nodemailer.config.js'
import { calculateAge } from '../utils/CalculateAge.js';
import OtpModel from '../models/OtpModel.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    passions: z.array(z.string()).min(3, { message: 'User must select minimum 3 passions' }).max(5, { message: 'User can select a maximum of 5 passions' })
})

export async function SignUp(req, res) {
    try {

        const { phoneNumber, email, password, firstName, lastName, dateOfBirth, gender, passions } = req.body;

        // Validate request body
        const validation = schema.safeParse({ password, passions });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0].message, code: 400, success: false });
        }


        // user avatar from frontend
        // console.log('Req file', req.files['avatar']);
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


        if (req.files['avatar'] === undefined) {
            return res.status(400).json({ code: 400, success: false, message: 'No Image uploaded', error: 'Please upload an avatar' });
        }

        const profileImage = req.files['avatar'][0].path;
        const publicId = req.files['avatar'][0].filename;



        // console.log('Req body', req.body);
        // console.log('Profile Image', profileImage);

        // Check if phone number or email is provided
        if (!phoneNumber && !email && !password) {
            return res.status(404).json({ message: 'Phone number or email or password is required', code: 404, success: false });
        }

        if (!req.files) {
            return res.status(400).json({ code: 400, success: false, message: 'No Image uploaded' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check phone number or email if it already exists
        if (phoneNumber) {
            const existingPhoneNumber = await UserModel.findOne({ phoneNumber });
            if (existingPhoneNumber) {
                // delete file
                await cloudinary.uploader.destroy(publicId);
                const token = jwt.sign({ value: phoneNumber }, process.env.JWT_SECRET);
                return res.status(400).json({ message: 'User already exists with this Phone Number', code: 400, success: false, token, data: existingPhoneNumber });
            }
            // Create new user if user does not exist
            const age = calculateAge(dateOfBirth);
            const newUser = new UserModel({
                phoneNumber: phoneNumber || undefined, // Ensure phone number is stored as null if empty
                email: email || undefined, // Ensure email is stored as null if empty
                password: hashedPassword,
                profileImage,
                firstName,
                lastName,
                dateOfBirth,
                age,
                gender,
                passions
            });
            await newUser.save();

            // Convert user document to plain JavaScript object and delete password field
            const userResponse = newUser.toObject();
            delete userResponse.password;



            // Create token using phone number or email
            const token = jwt.sign({ value: phoneNumber }, process.env.JWT_SECRET);
            return res.status(200).json({ message: 'User created successfully', code: 200, success: true, token, data: userResponse });
        }

        if (email) {
            const existingEmail = await UserModel.findOne({ email });
            if (existingEmail) {
                // deleteFile()
                await cloudinary.uploader.destroy(publicId);
                const token = jwt.sign({ value: email }, process.env.JWT_SECRET);
                return res.status(400).json({ message: 'User already exists with this Email', code: 400, success: false, token, data: existingEmail });
            }

            // Create new user if user does not exist
            const age = calculateAge(dateOfBirth);
            const newUser = new UserModel({
                phoneNumber: phoneNumber || undefined, // Ensure phone number is stored as null if empty
                email: email || undefined, // Ensure email is stored as null if empty
                profileImage,
                password: hashedPassword,
                firstName,
                lastName,
                dateOfBirth,
                age,
                gender,
                passions
            });
            await newUser.save();
            // Convert user document to plain JavaScript object and delete password field
            const userResponse = newUser.toObject();
            delete userResponse.password;


            // Create token using phone number or email
            const token = jwt.sign({ value: email }, process.env.JWT_SECRET);
            return res.status(200).json({ message: 'User created successfully', code: 200, success: true, token, data: userResponse });

        }


    } catch (error) {
        console.error('An error occurred: ', error);
        return res.status(500).json({ message: error.message, code: 500, success: false, error: 'An error occured' }); //error is for the user
    }
}



export async function sendEmailOtp(req, res) {
    const { email } = req.body;
    const sendOtp = await sendMail(email, 'Sign-Up')
    if (sendOtp.success) {
        const userOtp = new OtpModel({
            email,
            otp: sendOtp.otp,
            expireAt: Date.now() + 600000
        })

        await userOtp.save();
        return res.status(200).json({ message: 'OTP sent successfully', code: 200, success: true });
    }
}

export async function verifyEmailOtp(req, res) {
    const { otp } = req.body

    if (!otp) {
        return res.status(400).json({ message: 'OTP is required', code: 400, success: false });
    }

    const userOtp = await OtpModel.findOne({ otp: otp, expireAt: { $gt: Date.now() } });


    if (!userOtp) {
        // OTP not found or expired
        const expiredOtp = await OtpModel.findOne({ otp: otp });
        if (expiredOtp) {
            return res.status(400).json({ message: 'OTP has expired', error: 'Your OTP has expired', code: 400, success: false });
        } else {
            return res.status(400).json({ message: 'Invalid OTP', error: 'Your OTP is Invalid', code: 400, success: false });
        }
    }

    if (userOtp) {
        await OtpModel.deleteOne({ otp: otp });
        return res.status(200).json({ message: 'OTP verified successfully', code: 200, success: true });
    }


}

export async function SignIn(req, res) {
    try {
        const { phoneNumber, email, password } = req.body;

        if (!phoneNumber && !email && !password) {
            return res.status(404).json({ message: 'Phone number or email password is required', code: 404, success: false });
        }

        if (phoneNumber) {
            const user = await UserModel.findOne({ phoneNumber });
            if (!user) {
                return res.status(404).json({ message: 'User not found', error: 'Wrong Credentials', code: 404, success: false });
            }
            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.status(400).json({ message: 'Invalid password', code: 400, success: false });
            }

            const token = jwt.sign({ value: user._id }, process.env.JWT_SECRET);
            const userResponse = user.toObject();
            delete userResponse.password
            return res.status(200).json({ message: 'User found', success: true, token, data: userResponse });
        }

        if (email) {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found', error: 'Wrong Credentials', code: 404, success: false });
            }
            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.status(400).json({ message: 'Invalid password', code: 400, success: false });
            }
            const token = jwt.sign({ value: user._id }, process.env.JWT_SECRET);
            const userResponse = user.toObject();
            delete userResponse.password
            return res.status(200).json({ message: 'User found', success: true, token, data: user });
        }


    } catch (error) {
        return res.status(500).json({ error: 'An error occurred', code: 500, success: false, message: error.message });
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
        return res.status(500).json({ error: 'An error occurred', code: 500, success: false, message: error.message });
    }
}


export async function updateUserProfile(req, res) {
    try {
        const { userId } = req.params;
        const { name, dateOfBirth, phoneNumber, passions, bio, profession, photos, removePhoto, removePassion, addPassion } = req.body;
        console.log('Req User' + req.user._id);
        console.log('Req Params' + userId);

        if (userId != req.user._id) {
            return res.status(403).json({ message: 'You are not authorized to perform this action', code: 403, success: false });
        }

        let firstName, lastName;
        if (name) {
            firstName = name.split(' ')[0];
            lastName = name.split(' ')[1];
        }


        // Validate passions
        // if (passions && passions.length !== 3) {
        //     return res.status(400).json({ message: 'User must select exactly 3 passions.', code: 400, success: false });
        // }

        // // Validate photos //REMOVE THIS LATER
        // if (photos && photos.length > 5) {
        //     return res.status(400).json({ message: 'User can upload a maximum of 5 photos.', code: 400, success: false });
        // }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404, success: false });
        }

        // Update avatar if provided
        if (req.files && req.files['avatar']) {
            const profileImage = req.files['avatar'][0].path;
            const publicId = req.files['avatar'][0].filename;

            // Delete old avatar from Cloudinary
            if (user.profileImage) {
                const oldPublicId = user.profileImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(oldPublicId);
            }

            user.profileImage = profileImage;
        }

        // Update photos if provided
        if (req.files && req.files['userImages']) {
            const newPhotos = req.files['userImages'].map(file => file.path);
            user.photos = [...user.photos, ...newPhotos].slice(0, 5);
        }

        // Remove specific photo if provided. Just give the photo URL to remove
        if (removePhoto) {
            const photoIndex = user.photos.indexOf(removePhoto);
            if (photoIndex !== -1) {
                // Delete photo from Cloudinary
                const publicId = removePhoto.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);

                // Remove photo from user's photos array
                user.photos.splice(photoIndex, 1);
            } else {
                return res.status(404).json({ message: 'Photo not found', code: 404, success: false });
            }
        }



        // Update passions if provided
        if (removePassion || addPassion) {
            let updatedPassions = [...user.passions];

            // Remove passions if provided
            if (removePassion) {
                const removeArray = Array.isArray(removePassion) ? removePassion : [removePassion];

                for (const passion of removeArray) {
                    const passionIndex = updatedPassions.indexOf(passion);
                    if (passionIndex !== -1) {
                        updatedPassions.splice(passionIndex, 1);
                    } else {
                        return res.status(400).json({ message: `Passion '${passion}' to remove not found`, code: 400, success: false });
                    }
                }
            }

            // Add passions if provided
            if (addPassion) {
                const addArray = Array.isArray(addPassion) ? addPassion : [addPassion];

                for (const passion of addArray) {
                    if (updatedPassions.length >= 5) {
                        return res.status(400).json({ message: 'User can select a maximum of 5 passions', code: 400, success: false });
                    }
                    if (!updatedPassions.includes(passion)) {
                        updatedPassions.push(passion);
                    } else {
                        return res.json({ message: "Passion Already Exists", code: 400, success: false })
                    }
                }
            }

            // Validate the final count before updating
            if (updatedPassions.length < 3) {
                return res.status(400).json({ message: "You must have at least 3 passions", code: 400, success: false });
            }

            // Update the user's passions and save
            user.passions = updatedPassions;
            await user.save();
            delete user._doc.password

            return res.json({ message: 'Passions updated successfully', code: 200, success: true, data: user });
        }



        // Update other fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.bio = bio || user.bio;
        user.profession = profession || user.profession;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ message: 'User profile updated successfully', code: 200, success: true, data: userResponse });
    } catch (error) {
        console.error('An error occurred: ', error);
        return res.status(500).json({ error: 'An error occurred', code: 500, success: false, message: error.message });
    }
}

export async function getUserProfile(req, res) {
    try {
        const user = await UserModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404, success: false });
        }
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(200).json({ message: 'User found', code: 200, success: true, data: userResponse });
    } catch (error) {
        return res.status(500).json({ message: error.message, code: 500, success: false, error: 'An error occurred' });
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