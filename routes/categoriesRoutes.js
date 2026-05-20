const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCoursesByCategory,
  getCategoriesStats,
} = require('../controllers/categoriesController');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/categories
// → Toutes les catégories avec top 3 cours (featured)
router.get('/', getAllCategories);

// GET /api/categories/stats
// → Statistiques de chaque catégorie
router.get('/stats', getCategoriesStats);

// GET /api/categories/:categorie
// → Tous les cours d'une catégorie avec pagination
router.get('/:categorie', getCoursesByCategory);

module.exports = router;
