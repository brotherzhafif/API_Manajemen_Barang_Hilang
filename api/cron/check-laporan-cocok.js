module.exports = async (req, res) => {
    try {
        // Lakukan pengecekan berkala disini
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Cron job error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};