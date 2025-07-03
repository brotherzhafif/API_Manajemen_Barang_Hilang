const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// Get all klaim (admin only)
router.get('/', verifyToken, async (req, res) => {
    try {
        const snapshot = await db.collection('klaim').get();
        const klaimData = [];

        snapshot.forEach(doc => {
            klaimData.push({
                id_klaim: doc.id,
                ...doc.data()
            });
        });

        res.json(klaimData);
    } catch (error) {
        console.error('Error getting all klaim:', error);
        res.status(500).json({ error: 'Gagal mengambil data semua klaim' });
    }
});

// Buat klaim baru (untuk backward compatibility)
router.post('/', verifyToken, checkRole(['admin', 'satpam']), upload.single('foto_klaim'), async (req, res) => {
    try {
        const { id_laporan_cocok, id_penerima } = req.body;

        if (!id_laporan_cocok || !id_penerima) {
            return res.status(400).json({ error: 'id_laporan_cocok dan id_penerima wajib diisi' });
        }

        // Upload foto klaim
        let url_foto_klaim = null;
        if (req.file) {
            url_foto_klaim = await uploadFileToStorage(req.file, 'klaim');
        }

        // Simpan klaim ke Firestore
        const id_klaim = `klaim-${uuidv4().substring(0, 8)}`;

        await db.collection('klaim').doc(id_klaim).set({
            id_laporan_cocok,
            id_satpam: req.user.uid,
            id_penerima,
            url_foto_klaim,
            waktu_terima: new Date(),
            status: 'selesai'
        });

        // Otomatis update status laporan terkait menjadi selesai
        const cocokDoc = await db.collection('cocok').doc(id_laporan_cocok).get();
        if (cocokDoc.exists) {
            const cocokData = cocokDoc.data();
            // Update status laporan hilang dan temuan
            await db.collection('laporan').doc(cocokData.id_laporan_hilang).update({
                status: 'selesai',
                updated_at: new Date()
            });
            await db.collection('laporan').doc(cocokData.id_laporan_temuan).update({
                status: 'selesai',
                updated_at: new Date()
            });
        }

        res.status(201).json({
            id_klaim,
            message: 'Klaim berhasil dibuat dan diselesaikan'
        });
    } catch (error) {
        console.error('Error creating klaim:', error);
        res.status(500).json({ error: 'Gagal membuat klaim' });
    }
});

// Get specific klaim by ID (admin only)
router.get('/:id', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const klaimDoc = await db.collection('klaim').doc(req.params.id).get();

        if (!klaimDoc.exists) {
            return res.status(404).json({ error: 'Klaim tidak ditemukan' });
        }

        res.json({
            id_klaim: klaimDoc.id,
            ...klaimDoc.data()
        });
    } catch (error) {
        console.error('Error getting klaim:', error);
        res.status(500).json({ error: 'Gagal mengambil data klaim' });
    }
});

// Update klaim
router.put('/:id', verifyToken, checkRole(['admin', 'satpam']), upload.single('foto_klaim'), async (req, res) => {
    try {
        const { id_laporan_cocok, id_penerima, id_satpam } = req.body;

        // Check if klaim exists
        const klaimDoc = await db.collection('klaim').doc(req.params.id).get();
        if (!klaimDoc.exists) {
            return res.status(404).json({ error: 'Klaim tidak ditemukan' });
        }

        const currentData = klaimDoc.data();

        // Upload foto klaim baru jika ada
        let url_foto_klaim = currentData.url_foto_klaim;
        if (req.file) {
            url_foto_klaim = await uploadFileToStorage(req.file, 'klaim');
        }

        const updateData = {
            id_laporan_cocok: id_laporan_cocok || currentData.id_laporan_cocok,
            id_penerima: id_penerima || currentData.id_penerima,
            id_satpam: id_satpam || currentData.id_satpam,
            url_foto_klaim,
            updated_at: new Date(),
            updated_by: req.user.uid
        };

        await db.collection('klaim').doc(req.params.id).update(updateData);

        res.json({
            message: 'Klaim berhasil diupdate',
            id_klaim: req.params.id
        });
    } catch (error) {
        console.error('Error updating klaim:', error);
        res.status(500).json({ error: 'Gagal mengupdate klaim' });
    }
});

// Delete klaim
router.delete('/:id', verifyToken, checkRole(['admin', 'satpam']), async (req, res) => {
    try {
        const klaimDoc = await db.collection('klaim').doc(req.params.id).get();

        if (!klaimDoc.exists) {
            return res.status(404).json({ error: 'Klaim tidak ditemukan' });
        }

        await db.collection('klaim').doc(req.params.id).delete();

        res.json({ message: 'Klaim berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting klaim:', error);
        res.status(500).json({ error: 'Gagal menghapus klaim' });
    }
});

module.exports = router;