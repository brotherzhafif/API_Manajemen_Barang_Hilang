const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = [];

        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(users);
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({ error: 'Gagal mengambil data semua user' });
    }
});

// Create new user (admin only)
router.post('/', verifyToken, checkRole(['admin']), upload.single('foto_identitas'), async (req, res) => {
    try {
        const { email, password, username, role } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, dan username wajib diisi' });
        }

        if (!['tamu', 'satpam', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role tidak valid' });
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
            role: role || 'tamu',
            created_at: new Date(),
            created_by: req.user.uid
        });

        // Set custom claims for role
        await auth.setCustomUserClaims(userRecord.uid, { role: role || 'tamu' });

        res.status(201).json({
            message: 'User berhasil dibuat',
            user: {
                id: userRecord.uid,
                username,
                email,
                role: role || 'tamu'
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);

        let errorMessage = 'Gagal membuat user';
        if (error.code) {
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

        if (process.env.NODE_ENV === 'development') {
            errorMessage += ` (${error.message})`;
        }

        res.status(500).json({ error: errorMessage });
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

// Get specific user by ID (admin only)
router.get('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.params.id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json({
            id: req.params.id,
            ...userDoc.data()
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Gagal mengambil data user' });
    }
});

// Update user (admin only)
router.put('/:id', verifyToken, checkRole(['admin']), upload.single('foto_identitas'), async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const userId = req.params.id;

        if (!username || !email) {
            return res.status(400).json({ error: 'Username dan email wajib diisi' });
        }

        if (role && !['tamu', 'satpam', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role tidak valid' });
        }

        // Check if user exists
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Upload foto identitas baru jika ada
        let url_foto_identitas = userDoc.data().url_foto_identitas;
        if (req.file) {
            url_foto_identitas = await uploadFileToStorage(req.file, 'identitas');
        }

        // Update data di Firestore
        const updateData = {
            username,
            email,
            url_foto_identitas,
            updated_at: new Date(),
            updated_by: req.user.uid
        };

        if (role) {
            updateData.role = role;
        }

        await db.collection('users').doc(userId).update(updateData);

        // Update Firebase Auth user
        const authUpdateData = {
            email,
            displayName: username
        };
        await auth.updateUser(userId, authUpdateData);

        // Update custom claims jika role berubah
        if (role) {
            await auth.setCustomUserClaims(userId, { role });
        }

        res.json({
            message: 'User berhasil diupdate',
            user: {
                id: userId,
                username,
                email,
                role: role || userDoc.data().role
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Gagal mengupdate user' });
    }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Prevent admin from deleting themselves
        if (userId === req.user.uid) {
            return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
        }

        // Check if user has active reports
        const laporanSnapshot = await db.collection('laporan')
            .where('id_user', '==', userId)
            .limit(1)
            .get();

        if (!laporanSnapshot.empty) {
            return res.status(400).json({
                error: 'User tidak dapat dihapus karena memiliki laporan aktif'
            });
        }

        // Delete from Firebase Auth
        await auth.deleteUser(userId);

        // Delete from Firestore
        await db.collection('users').doc(userId).delete();

        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Gagal menghapus user' });
    }
});

module.exports = router;