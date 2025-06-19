const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (opsional, misal parsing JSON)
// app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Manajemen Barang Hilang berjalan!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
