const express = require('express');
const { auth, db } = require('../config/firebase');

// Middleware verifikasi token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Token diperlukan' });
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await auth.verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Error verifikasi token:', error);

            let errorMessage = 'Unauthorized - Token tidak valid';
            if (process.env.NODE_ENV === 'development') {
                errorMessage += ` (${error.message})`;
            }

            res.status(401).json({ error: errorMessage });
        }
    } catch (error) {
        console.error('Error dalam middleware verifyToken:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi token' });
    }
};

// Middleware pengecekan role dari Firestore
const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized - User belum terautentikasi' });
            }
            // Ambil role dari Firestore
            const userDoc = await db.collection('users').doc(req.user.uid).get();
            if (!userDoc.exists) {
                return res.status(404).json({ error: 'User tidak ditemukan di database' });
            }
            const userRole = userDoc.data().role;
            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    error: 'Forbidden - Anda tidak memiliki akses',
                    requiredRoles: roles,
                    yourRole: userRole
                });
            }
            next();
        } catch (error) {
            console.error('Error dalam middleware checkRole:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa role' });
        }
    };
};

module.exports = { verifyToken, checkRole };