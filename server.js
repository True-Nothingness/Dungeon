// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const petRoutes = require('./routes/pet');
const battleRoutes = require('./routes/battle');
const itemRoutes = require('./routes/item');
const characterRoutes = require('./routes/characters');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/characters', characterRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Optional: fallback route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
