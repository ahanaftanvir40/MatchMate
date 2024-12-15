import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from './cloudinary.config.js';



const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {

        let folder;
        if (file.fieldname === 'avatar') {
            folder = 'avatars';
        }
        if (file.fieldname === 'userImages') {
            folder = 'userImages';
        }

        const publicId = await new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, bytes) => {
                if (err) {
                    reject(err);
                }
                resolve(bytes.toString('hex') + path.extname(file.originalname))
            })
        })

        return {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png'],
            public_id: publicId
        };

    },
});


const upload = multer({
    storage: storage,
});

export default upload;