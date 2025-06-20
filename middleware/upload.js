const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../config/firebase');

// Setup Multer untuk menyimpan file sementara
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper untuk upload file ke Google Cloud Storage
const uploadFileToStorage = async (file, folder) => {
    if (!file) return null;

    const filename = `${folder}/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(filename);

    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
            reject(error);
        });

        blobStream.on('finish', async () => {
            // Buat URL publik
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

module.exports = { upload, uploadFileToStorage };