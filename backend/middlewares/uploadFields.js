import upload from "../config/multer.config.js";

export const uploadFields = (fields) => (req, res, next) => {
    upload.fields(fields)(req, res, function (err) {
        if (err) {
            if (err.message === 'Invalid file type. Only .jpg, .jpeg, heic , heif and .png formats are allowed!') {
                return res.status(400).json({ code: 400, success: false, error: err.message });
            }
            return res.status(400).json({ code: 400, success: false, message: 'File upload error', error: err.code });
        }
        next();
    });
}