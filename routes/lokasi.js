const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all lokasi
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('lokasi').get();
        const lokasi = [];

        snapshot.forEach(doc => {
            lokasi.push({
                id_lokasi_klaim: doc.id,
                ...doc.data()
            });
        });

        res.json(lokasi);
    } catch (error) {
        console.error('Error getting lokasi:', error);
        res.status(500).json({ error: 'Gagal mengambil data lokasi' });
    }
});

// Get lokasi by ID
router.get('/:id', async (req, res) => {
    try {
        const lokasiDoc = await db.collection('lokasi').doc(req.params.id).get();

        if (!lokasiDoc.exists) {
            return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
        }

        res.json({
            id_lokasi_klaim: lokasiDoc.id,
            ...lokasiDoc.data()
        });
    } catch (error) {
        console.error('Error getting lokasi:', error);
        res.status(500).json({ error: 'Gagal mengambil data lokasi' });
    }
});

// Add new lokasi (admin and satpam only)
router.post('/', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { lokasi_klaim } = req.body;

        if (!lokasi_klaim) {
            return res.status(400).json({ error: 'lokasi_klaim wajib diisi' });
        }

        // Check if lokasi already exists
        const lokasiSnapshot = await db.collection('lokasi')
            .where('lokasi_klaim', '==', lokasi_klaim)
            .get(); if (!lokasiSnapshot.empty) {
                return res.status(400).json({ error: 'Lokasi dengan nama tersebut sudah ada' });
            }

        const id_lokasi_klaim = `loc-${uuidv4().substring(0, 8)}`;

        await db.collection('lokasi').doc(id_lokasi_klaim).set({
            lokasi_klaim,
            created_at: new Date(),
            created_by: req.user.uid
        });

        res.status(201).json({
            id_lokasi_klaim,
            lokasi_klaim
        });
    } catch (error) {
        console.error('Error adding lokasi:', error);
        res.status(500).json({ error: 'Gagal menambahkan lokasi' });
    }
});

// Update lokasi (admin and satpam only)
router.put('/:id', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { lokasi_klaim } = req.body;

        if (!lokasi_klaim) {
            return res.status(400).json({ error: 'lokasi_klaim wajib diisi' });
        }

        // Check if lokasi exists
        const lokasiDoc = await db.collection('lokasi').doc(req.params.id).get();

        if (!lokasiDoc.exists) {
            return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
        }

        // Check if new name already exists for another location
        const lokasiSnapshot = await db.collection('lokasi')
            .where('lokasi_klaim', '==', lokasi_klaim)
            .get();

        if (!lokasiSnapshot.empty) {
            // Make sure we're not finding the same document
            const isDuplicate = lokasiSnapshot.docs.some(doc => doc.id !== req.params.id);
            if (isDuplicate) {
                return res.status(400).json({ error: 'Lokasi dengan nama tersebut sudah ada' });
            }
        }

        await db.collection('lokasi').doc(req.params.id).update({
            lokasi_klaim,
            updated_at: new Date(),
            updated_by: req.user.uid
        });

        res.json({
            id_lokasi_klaim: req.params.id,
            lokasi_klaim,
            message: 'Lokasi berhasil diupdate'
        });
    } catch (error) {
        console.error('Error updating lokasi:', error);
        res.status(500).json({ error: 'Gagal mengupdate lokasi' });
    }
});

// Delete lokasi (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        // Check if lokasi is used in laporan
        const laporanSnapshot = await db.collection('laporan')
            .where('id_lokasi_klaim', '==', req.params.id)
            .limit(1)
            .get();

        if (!laporanSnapshot.empty) {
            return res.status(400).json({
                error: 'Lokasi tidak dapat dihapus karena sedang digunakan dalam laporan'
            });
        }

        await db.collection('lokasi').doc(req.params.id).delete();
        res.json({ message: 'Lokasi berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting lokasi:', error);
        res.status(500).json({ error: 'Gagal menghapus lokasi' });
    }
});

module.exports = router;