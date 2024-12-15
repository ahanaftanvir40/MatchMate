import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath;
        if (file.fieldname === 'avatar') {
            uploadPath = './public/avatar';
        }
        if (file.fieldname === 'userImages') {
            uploadPath = './public/userImages';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(10, (err, bytes) => {
            if (err) return cb(err);
            const fn = bytes.toString('hex') + path.extname(file.originalname);
            cb(null, fn);
        });
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .jpg, .jpeg, and .png formats are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

export default upload;