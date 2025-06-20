const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');

// Register new user
router.post('/register', upload.single('foto_identitas'), async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, dan username wajib diisi' });
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
                role: 'tamu'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Gagal mendaftarkan user' });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json({
            id: req.user.uid,
            ...userDoc.data()
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Gagal mengambil profil user' });
    }
});

// Update user role (admin only)
router.patch('/:id/role', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!['tamu', 'satpam', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role tidak valid' });
        }

        // Update in Firestore
        await db.collection('users').doc(userId).update({
            role,
            updated_at: new Date()
        });

        // Update custom claims
        await auth.setCustomUserClaims(userId, { role });

        res.json({ message: 'Role user berhasil diupdate' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Gagal mengupdate role user' });
    }
});

module.exports = router;