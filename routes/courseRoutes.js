const express = require('express');
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
} = require('../controllers/courseController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { uploadCover } = require('../middlewares/uploadMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/courses          → Liste tous les cours publiés (recherche + filtrage)
router.get('/', getAllCourses);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/courses/my-courses        → Mes cours (enseignant connecté)
// ⚠️ Déclaré AVANT /:id pour éviter que 'my-courses' soit lu comme un paramètre
router.get(
  '/my-courses',
  protect,
  authorizeRoles('enseignant'),
  getMyCourses
);

// POST /api/courses                  → Créer un cours
router.post(
  '/',
  protect,
  authorizeRoles('enseignant'),
  uploadCover,                         //  upload image de couverture
  createCourse
);

// PUT /api/courses/:id               → Modifier un cours
router.put(
  '/:id',
  protect,
  authorizeRoles('enseignant'),
  uploadCover,                         //  permet de changer l'image de couverture
  updateCourse
);

// PATCH /api/courses/:id/publish     → Publier / Dépublier un cours
router.patch(
  '/:id/publish',
  protect,
  authorizeRoles('enseignant'),
  togglePublishCourse
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT ou ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// DELETE /api/courses/:id            → Supprimer un cours
router.delete(
  '/:id',
  protect,
  authorizeRoles('enseignant', 'admin'),
  deleteCourse
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES AVEC PARAMÈTRE — à la fin pour ne pas écraser /my-courses
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/courses/:id      → Détail d'un cours avec ses leçons
router.get('/:id', getCourseById);

module.exports = router;