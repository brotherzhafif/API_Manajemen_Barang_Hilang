const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all cocok data
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('cocok').get();
        const cocokData = [];

        snapshot.forEach(doc => {
            cocokData.push({
                id_laporan_cocok: doc.id,
                ...doc.data()
            });
        });

        res.json(cocokData);
    } catch (error) {
        console.error('Error getting cocok data:', error);
        res.status(500).json({ error: 'Gagal mengambil data pencocokan' });
    }
});

// Get specific cocok by ID
router.get('/:id', async (req, res) => {
    try {
        const cocokDoc = await db.collection('cocok').doc(req.params.id).get();

        if (!cocokDoc.exists) {
            return res.status(404).json({ error: 'Data pencocokan tidak ditemukan' });
        }

        res.json({
            id_laporan_cocok: cocokDoc.id,
            ...cocokDoc.data()
        });
    } catch (error) {
        console.error('Error getting cocok data:', error);
        res.status(500).json({ error: 'Gagal mengambil data pencocokan' });
    }
});

// Create new cocok (admin/satpam only)
router.post('/', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { id_laporan_hilang, id_laporan_temuan, skor_cocok } = req.body;

        if (!id_laporan_hilang || !id_laporan_temuan) {
            return res.status(400).json({ error: 'ID laporan hilang dan temuan wajib diisi' });
        }

        // Validate laporan exists
        const laporanHilangDoc = await db.collection('laporan').doc(id_laporan_hilang).get();
        const laporanTemuanDoc = await db.collection('laporan').doc(id_laporan_temuan).get();

        if (!laporanHilangDoc.exists || !laporanTemuanDoc.exists) {
            return res.status(404).json({ error: 'Laporan hilang atau temuan tidak ditemukan' });
        }

        const laporanHilangData = laporanHilangDoc.data();
        const laporanTemuanData = laporanTemuanDoc.data();

        // Verify laporan types
        if (laporanHilangData.jenis_laporan !== 'hilang' || laporanTemuanData.jenis_laporan !== 'temuan') {
            return res.status(400).json({ error: 'Jenis laporan tidak sesuai' });
        }

        // Create new cocok record with custom ID
        const id_laporan_cocok = `cocok-${uuidv4().substring(0, 8)}`;

        const newCocok = {
            id_laporan_hilang,
            id_laporan_temuan,
            skor_cocok: skor_cocok || 0,
            created_at: new Date(),
            created_by: req.user.uid
        };

        await db.collection('cocok').doc(id_laporan_cocok).set(newCocok);

        // Update status laporan to 'cocok'
        await db.collection('laporan').doc(id_laporan_hilang).update({
            status: 'cocok',
            updated_at: new Date()
        });

        await db.collection('laporan').doc(id_laporan_temuan).update({
            status: 'cocok',
            updated_at: new Date()
        });

        res.status(201).json({
            id_laporan_cocok,
            ...newCocok,
            message: 'Pencocokan berhasil dibuat'
        });
    } catch (error) {
        console.error('Error creating cocok data:', error);
        res.status(500).json({ error: 'Gagal membuat data pencocokan' });
    }
});

// Update skor cocok
router.patch('/:id/skor', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const { skor_cocok } = req.body;

        if (skor_cocok === undefined || skor_cocok < 0 || skor_cocok > 100) {
            return res.status(400).json({ error: 'Skor harus bernilai 0-100' });
        }

        await db.collection('cocok').doc(req.params.id).update({
            skor_cocok,
            updated_at: new Date(),
            updated_by: req.user.uid
        });

        res.json({ message: 'Skor kecocokan berhasil diupdate' });
    } catch (error) {
        console.error('Error updating cocok score:', error);
        res.status(500).json({ error: 'Gagal mengupdate skor kecocokan' });
    }
});

// Delete cocok (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const cocokDoc = await db.collection('cocok').doc(req.params.id).get();

        if (!cocokDoc.exists) {
            return res.status(404).json({ error: 'Data pencocokan tidak ditemukan' });
        }

        const cocokData = cocokDoc.data();

        // Reset laporan status to 'proses'
        if (cocokData.id_laporan_hilang) {
            await db.collection('laporan').doc(cocokData.id_laporan_hilang).update({
                status: 'proses',
                updated_at: new Date()
            });
        }

        if (cocokData.id_laporan_temuan) {
            await db.collection('laporan').doc(cocokData.id_laporan_temuan).update({
                status: 'proses',
                updated_at: new Date()
            });
        }

        // Delete cocok record
        await db.collection('cocok').doc(req.params.id).delete();

        res.json({ message: 'Data pencocokan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting cocok data:', error);
        res.status(500).json({ error: 'Gagal menghapus data pencocokan' });
    }
});

module.exports = router;