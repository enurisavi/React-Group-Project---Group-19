const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && allowedTypes.test(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, JPG, PNG, and GIF files are allowed."));
    }
};

const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = uploadMiddleware;
