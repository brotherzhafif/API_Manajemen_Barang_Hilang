const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { upload, uploadFileToStorage } = require('../middleware/upload');

// Register user
router.post('/', upload.single('foto_identitas'), async (req, res) => {
    try {
        const { email, password, username, no_hp } = req.body;

        if (!email || !password || !username || !no_hp) {
            return res.status(400).json({ error: 'Email, password, username, dan no_hp wajib diisi' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: username
        });

        // Upload foto identitas jika ada
        let url_foto_identitas = null;
        if (req.file) {
            url_foto_identitas = await uploadFileToStorage(req.file, 'identitas');
        }

        // Store additional user data in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            username,
            email,
            no_hp,
            url_foto_identitas,
            role: 'tamu', // Default role
            created_at: new Date()
        });

        // Set custom claims for role
        await auth.setCustomUserClaims(userRecord.uid, { role: 'tamu' });

        res.status(201).json({
            message: 'User berhasil didaftarkan',
            user: {
                id: userRecord.uid,
                username,
                email,
                no_hp,
                role: 'tamu'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);

        // Pesan error yang lebih detail untuk membantu debugging
        let errorMessage = 'Gagal mendaftarkan user';

        if (error.code) {
            // Firebase auth error codes
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email sudah digunakan oleh pengguna lain';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password terlalu lemah, minimal 6 karakter';
                    break;
            }
        }

        // Jika dalam mode development, tambahkan detail error
        if (process.env.NODE_ENV === 'development') {
            errorMessage += ` (${error.message})`;
        }

        res.status(500).json({ error: errorMessage });
    }
});

module.exports = router;