const express = require('express');
const cors = require('cors');
const downloadRoutes = require('./routes/downloadRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();


// 1. Middleware
// ✅ Allow both local dev and production Vercel domain
app.use(cors({
  origin: [
    'http://localhost:5173',                        // local dev
    'https://saveinsta-jade.vercel.app',                 // Vercel production
    process.env.FRONTEND_URL,                       // from env var
  ].filter(Boolean),
  methods: ['GET', 'POST'],
  credentials: true,
}));

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
