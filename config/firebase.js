const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.STORAGE_BUCKET
});

// Inisialisasi Firestore dan Auth
const db = admin.firestore();
const auth = admin.auth();
const bucket = getStorage().bucket();

module.exports = { admin, db, auth, bucket };