const express = require('express');
const router = express.Router();
const { signInWithEmailAndPassword } = require('firebase/auth');
const { auth: clientAuth } = require('../config/firebaseConfig'); // Firebase Client SDK
const { db, auth: adminAuth } = require('../config/firebase'); // Firebase Admin SDK

// Login user
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        // Login menggunakan Firebase Client SDK (dapat memverifikasi password)
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;

        // Get custom token menggunakan Firebase Admin SDK
        const customToken = await adminAuth.createCustomToken(user.uid);

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User data tidak ditemukan' });
        }

        // Return user data and token
        res.json({
            message: 'Login berhasil',
            token: customToken,
            user: {
                id: user.uid,
                email: user.email,
                username: userDoc.data().username,
                role: userDoc.data().role || 'tamu'
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        // Pesan error yang lebih detail untuk membantu debugging
        let errorMessage = 'Email atau password tidak valid';

        if (error.code) {
            // Firebase auth error codes
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Pengguna dengan email tersebut tidak ditemukan';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password salah';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Kredensial tidak valid';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Terlalu banyak percobaan login yang gagal. Coba lagi nanti';
                    break;
            }
        }

        // Jika dalam mode development, tambahkan detail error
        if (process.env.NODE_ENV === 'development') {
            errorMessage += ` (${error.message})`;
        }

        res.status(401).json({ error: errorMessage });
    }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'Token wajib dikirimkan' });
        }

        // Verifikasi token yang dikirimkan oleh client
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Ambil data user dari Firestore
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User data tidak ditemukan' });
        }

        res.json({
            message: 'Token valid',
            user: {
                id: uid,
                email: decodedToken.email,
                username: userDoc.data().username,
                role: userDoc.data().role || 'tamu'
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        let errorMessage = 'Token tidak valid';

        // Jika dalam mode development, tambahkan detail error
        if (process.env.NODE_ENV === 'development') {
            errorMessage += ` (${error.message})`;
        }

        res.status(401).json({ error: errorMessage });
    }
});

module.exports = router;