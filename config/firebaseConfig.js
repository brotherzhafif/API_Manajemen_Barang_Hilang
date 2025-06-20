const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Firebase configuration untuk client SDK
try {
    // Cek apakah variabel lingkungan tersedia
    if (!process.env.FIREBASE_API_KEY || !process.env.FIREBASE_PROJECT_ID) {
        console.error('Firebase Client SDK credentials tidak lengkap. Periksa variabel lingkungan.');
    }

    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('Firebase Client SDK berhasil diinisialisasi');

    module.exports = { auth };
} catch (error) {
    console.error('Error inisialisasi Firebase Client SDK:', error);
    // Export empty auth object untuk mencegah error saat import
    module.exports = { auth: null };
}