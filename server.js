// ─── Charger les variables d'environnement EN PREMIER ─────────────────────
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

// ─── Initialisation ────────────────────────────────────────────────────────
const app = express();

// ─── Connexion MongoDB ─────────────────────────────────────────────────────
connectDB();

// ─── Middlewares globaux ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ pour les formulaires

// ─── Fichiers statiques (uploads) ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes API ───────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/lessons', lessonRoutes); // ⚠️ imbriqué
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/performance', performanceRoutes);

// ─── Route de test ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Safoua Academy API is running' });
});

// ─── Lancer le serveur ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});