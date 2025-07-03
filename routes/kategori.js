const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all kategori
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('kategori').get();
        const kategori = [];

        snapshot.forEach(doc => {
            kategori.push({
                id_kategori: doc.id,
                ...doc.data()
            });
        });

        res.json(kategori);
    } catch (error) {
        console.error('Error getting kategori:', error);
        res.status(500).json({ error: 'Gagal mengambil data kategori' });
    }
});

// Get specific kategori by ID
router.get('/:id', async (req, res) => {
    try {
        const kategoriDoc = await db.collection('kategori').doc(req.params.id).get();

        if (!kategoriDoc.exists) {
            return res.status(404).json({ error: 'Kategori tidak ditemukan' });
        }

        res.json({
            id_kategori: kategoriDoc.id,
            ...kategoriDoc.data()
        });
    } catch (error) {
        console.error('Error getting kategori:', error);
        res.status(500).json({ error: 'Gagal mengambil data kategori' });
    }
});

// Add new kategori (admin only)
router.post('/', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { nama_kategori } = req.body; if (!nama_kategori) {
            return res.status(400).json({ error: 'nama_kategori wajib diisi' });
        }

        const id_kategori = `kat-${uuidv4().substring(0, 8)}`;

        await db.collection('kategori').doc(id_kategori).set({
            nama_kategori,
            created_at: new Date()
        });

        res.status(201).json({
            id_kategori,
            nama_kategori
        });
    } catch (error) {
        console.error('Error adding kategori:', error);
        res.status(500).json({ error: 'Gagal menambahkan kategori' });
    }
});

// Update kategori (admin only)
router.put('/:id', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { nama_kategori } = req.body;

        if (!nama_kategori) {
            return res.status(400).json({ error: 'nama_kategori wajib diisi' });
        }

        // Check if kategori exists
        const kategoriDoc = await db.collection('kategori').doc(req.params.id).get();

        if (!kategoriDoc.exists) {
            return res.status(404).json({ error: 'Kategori tidak ditemukan' });
        }

        await db.collection('kategori').doc(req.params.id).update({
            nama_kategori,
            updated_at: new Date(),
            updated_by: req.user.uid
        });

        res.json({
            id_kategori: req.params.id,
            nama_kategori,
            message: 'Kategori berhasil diupdate'
        });
    } catch (error) {
        console.error('Error updating kategori:', error);
        res.status(500).json({ error: 'Gagal mengupdate kategori' });
    }
});

// Delete kategori (admin only)
router.delete('/:id', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        await db.collection('kategori').doc(req.params.id).delete();
        res.json({ message: 'Kategori berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting kategori:', error);
        res.status(500).json({ error: 'Gagal menghapus kategori' });
    }
});

module.exports = router;