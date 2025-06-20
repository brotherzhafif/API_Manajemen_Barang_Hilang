require('dotenv').config();
const admin = require('firebase-admin');

// Inisialisasi Firebase Admin SDK dengan error handling yang lebih baik
try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ?
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') :
        undefined;

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        console.error('Firebase credentials tidak lengkap. Periksa variabel lingkungan.');
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
        }),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
    });
    console.log('Firebase Admin SDK berhasil diinisialisasi');
} catch (error) {
    console.error('Error inisialisasi Firebase Admin SDK:', error);
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };