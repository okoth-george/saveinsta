const express = require('express');
const cors = require('cors');
const downloadRoutes = require('./routes/downloadRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors()); // Allows your React frontend to talk to this API
app.use(express.json()); // Allows the server to parse JSON bodies

// 2. Health Check Route (Good for testing if Docker is working)
app.get('/', (req, res) => {
    res.send('Instagram Saver API is running...');
});

// 3. Routes
app.use('/api/download', downloadRoutes);
app.use('/api/media', mediaRoutes);

// 4. Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

module.exports = app;
