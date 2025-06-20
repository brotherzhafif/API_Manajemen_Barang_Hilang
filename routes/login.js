const express = require('express');
const router = express.Router();
const { signInWithEmailAndPassword } = require('firebase/auth');
const { auth: clientAuth } = require('../config/firebaseConfig'); // Firebase Client SDK
const { db } = require('../config/firebase'); // Firebase Admin SDK

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        // Login menggunakan Firebase Client SDK
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken(); // Ambil ID token

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User data tidak ditemukan' });
        }

        res.json({
            message: 'Login berhasil',
            token: idToken, // ID token langsung dikembalikan di sini
            user: {
                id: user.uid,
                email: user.email,
                username: userDoc.data().username,
                role: userDoc.data().role || 'tamu'
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(401).json({ error: 'Email atau password tidak valid' });
    }
});

module.exports = router;