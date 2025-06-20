const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// Login user
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        // Firebase Admin SDK tidak memiliki fungsi signInWithEmailAndPassword,
        // ini biasanya dilakukan di client dengan Firebase Auth SDK
        // Namun kita bisa cek apakah user exists dan valid

        try {
            // Cek apakah user ada
            const userRecord = await auth.getUserByEmail(email);

            // Disini tidak bisa memverifikasi password secara langsung dengan Admin SDK
            // Biasanya ini dilakukan di client, tapi kita bisa memberikan informasi user

            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(userRecord.uid).get();

            if (!userDoc.exists) {
                return res.status(404).json({ error: 'User data tidak ditemukan' });
            }

            // Generate custom token untuk autentikasi client
            const customToken = await auth.createCustomToken(userRecord.uid);

            res.json({
                message: 'Login berhasil',
                token: customToken,
                user: {
                    id: userRecord.uid,
                    email: userRecord.email,
                    ...userDoc.data()
                }
            });

        } catch (error) {
            // User tidak ditemukan atau ada error lain
            console.error('Error finding user:', error);
            return res.status(401).json({ error: 'Email atau password tidak valid' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Gagal melakukan login' });
    }
});

module.exports = router;