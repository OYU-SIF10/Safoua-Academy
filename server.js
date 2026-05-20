// ─── Charger les variables d'environnement EN PREMIER ─────────────────────
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ─── Register all models with Mongoose ─────────────────────────────────
require('./models/User');
require('./models/Course');

// Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

// ─── Initialisation ────────────────────────────────────────────────────────
const app = express();

// ─── Connexion MongoDB ─────────────────────────────────────────────────────
connectDB();

// ✅ CORS avec origin explicite
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));


// ─── Middlewares globaux ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ pour les formulaires

// ─── Fichiers statiques (uploads) ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes API ───────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// ─── Route de test ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Safoua Academy API is running' });
});

// ─── Lancer le serveur ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});