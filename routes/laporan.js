const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const { upload, uploadFileToStorage } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// Buat laporan baru
router.post('/', verifyToken, upload.array('foto', 3), async (req, res) => {
    try {
        const {
            id_kategori,
            id_lokasi_klaim,
            lokasi_kejadian,
            nama_barang,
            jenis_laporan,
            deskripsi
        } = req.body;

        if (!id_kategori || !nama_barang || !jenis_laporan) {
            return res.status(400).json({ error: 'Data tidak lengkap' });
        }

        // Upload foto
        const url_foto = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadFileToStorage(file, 'laporan');
                url_foto.push(url);
            }
        }

        // Simpan laporan ke Firestore
        const id_laporan = `lap-${uuidv4().substring(0, 8)}`;

        await db.collection('laporan').doc(id_laporan).set({
            id_kategori,
            id_user: req.user.uid,
            id_lokasi_klaim,
            lokasi_kejadian,
            nama_barang,
            jenis_laporan,
            url_foto,
            deskripsi,
            waktu_laporan: new Date(),
            status: 'proses'
        });

        res.status(201).json({
            id_laporan,
            message: 'Laporan berhasil dibuat'
        });
    } catch (error) {
        console.error('Error creating laporan:', error);
        res.status(500).json({ error: 'Gagal membuat laporan' });
    }
});

// Get laporan by ID
router.get('/:id', async (req, res) => {
    try {
        const laporanDoc = await db.collection('laporan').doc(req.params.id).get();

        if (!laporanDoc.exists) {
            return res.status(404).json({ error: 'Laporan tidak ditemukan' });
        }

        res.json({
            id_laporan: laporanDoc.id,
            ...laporanDoc.data()
        });
    } catch (error) {
        console.error('Error getting laporan:', error);
        res.status(500).json({ error: 'Gagal mengambil data laporan' });
    }
});

// Get all laporan (with filters)
router.get('/', async (req, res) => {
    try {
        const { jenis_laporan, status, id_kategori } = req.query;

        let query = db.collection('laporan');

        if (jenis_laporan) {
            query = query.where('jenis_laporan', '==', jenis_laporan);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        if (id_kategori) {
            query = query.where('id_kategori', '==', id_kategori);
        }

        const snapshot = await query.get();
        const laporan = [];

        snapshot.forEach(doc => {
            laporan.push({
                id_laporan: doc.id,
                ...doc.data()
            });
        });

        res.json(laporan);
    } catch (error) {
        console.error('Error getting laporan:', error);
        res.status(500).json({ error: 'Gagal mengambil data laporan' });
    }
});

// Update status laporan
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['proses', 'cocok', 'selesai'].includes(status)) {
            return res.status(400).json({ error: 'Status tidak valid' });
        }

        await db.collection('laporan').doc(req.params.id).update({
            status,
            updated_at: new Date()
        });

        res.json({ message: 'Status laporan berhasil diupdate' });
    } catch (error) {
        console.error('Error updating laporan status:', error);
        res.status(500).json({ error: 'Gagal mengupdate status laporan' });
    }
});

module.exports = router;