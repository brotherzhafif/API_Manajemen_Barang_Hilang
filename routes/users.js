const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');

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

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        if (!['tamu', 'satpam', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role tidak valid' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            disabled: false
        });

        // Set custom user claims
        await auth.setCustomUserClaims(userRecord.uid, { role });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email,
            role,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({ message: 'User berhasil terdaftar' });
    } catch (error) {
        console.error('Error registering new user:', error);
        res.status(500).json({ error: 'Gagal mendaftar user baru' });
    }
});

module.exports = router;