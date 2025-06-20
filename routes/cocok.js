const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');

// Buat klaim baru
router.post('/', verifyToken, checkRole(['satpam']), upload.single('foto_klaim'), async (req, res) => {
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
        const docRef = await db.collection('klaim').add({
            id_laporan_cocok,
            id_satpam: req.user.uid,
            id_penerima,
            url_foto_klaim,
            waktu_terima: new Date(),
            terverifikasi: false
        });

        res.status(201).json({
            id_klaim: docRef.id,
            message: 'Klaim berhasil dibuat'
        });
    } catch (error) {
        console.error('Error creating klaim:', error);
        res.status(500).json({ error: 'Gagal membuat klaim' });
    }
});

// Verifikasi klaim (satpam only)
router.patch('/:id/verifikasi', verifyToken, checkRole(['satpam']), async (req, res) => {
    try {
        const klaimDoc = await db.collection('klaim').doc(req.params.id).get();

        if (!klaimDoc.exists) {
            return res.status(404).json({ error: 'Klaim tidak ditemukan' });
        }

        const klaimData = klaimDoc.data();

        // Hanya satpam yang membuat klaim yang bisa memverifikasi
        if (klaimData.id_satpam !== req.user.uid) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk memverifikasi klaim ini' });
        }

        await db.collection('klaim').doc(req.params.id).update({
            terverifikasi: true,
            updated_at: new Date()
        });

        // Update status laporan menjadi selesai
        if (klaimData.id_laporan_cocok) {
            const cocokDoc = await db.collection('cocok').doc(klaimData.id_laporan_cocok).get();

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
        }

        res.json({ message: 'Klaim berhasil diverifikasi' });
    } catch (error) {
        console.error('Error verifying klaim:', error);
        res.status(500).json({ error: 'Gagal memverifikasi klaim' });
    }
});

module.exports = router;