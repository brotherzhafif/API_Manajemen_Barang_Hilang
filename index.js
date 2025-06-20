require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/kategori', require('./routes/kategori'));
app.use('/api/lokasi', require('./routes/lokasi'));
app.use('/api/users', require('./routes/users'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/cocok', require('./routes/cocok'));
app.use('/api/klaim', require('./routes/klaim'));
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));

// Root route
app.get('/', (req, res) => {
    res.send('API Manajemen Barang Hilang berjalan!');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});