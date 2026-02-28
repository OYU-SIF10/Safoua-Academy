const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams pour accéder à :courseId du parent

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  togglePublishLesson,
  reorderLessons,
  deleteLesson,
  addQuizQuestion,
  deleteQuizQuestion,
} = require('../controllers/lessonController');

const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES / SEMI-PUBLIQUES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/courses/:courseId/lessons
// → Leçons gratuites pour visiteurs, toutes les leçons pour connectés
router.get('/', optionalAuth, getLessonsByCourse);

// GET /api/courses/:courseId/lessons/:lessonId
// → Détail d'une leçon (avec quiz)
router.get('/:lessonId', optionalAuth, getLessonById);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/courses/:courseId/lessons
// → Créer une leçon
router.post(
  '/',
  protect,
  authorizeRoles('enseignant'),
  createLesson
);

// PUT /api/courses/:courseId/lessons/:lessonId
// → Modifier une leçon
router.put(
  '/:lessonId',
  protect,
  authorizeRoles('enseignant'),
  updateLesson
);

// PATCH /api/courses/:courseId/lessons/:lessonId/publish
// → Publier / Dépublier une leçon
router.patch(
  '/:lessonId/publish',
  protect,
  authorizeRoles('enseignant'),
  togglePublishLesson
);

// PATCH /api/courses/:courseId/lessons/reorder
// → Réordonner les leçons
router.patch(
  '/reorder',
  protect,
  authorizeRoles('enseignant'),
  reorderLessons
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — QUIZ
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/courses/:courseId/lessons/:lessonId/quiz
// → Ajouter une question au quiz
router.post(
  '/:lessonId/quiz',
  protect,
  authorizeRoles('enseignant'),
  addQuizQuestion
);

// DELETE /api/courses/:courseId/lessons/:lessonId/quiz/:questionId
// → Supprimer une question du quiz
router.delete(
  '/:lessonId/quiz/:questionId',
  protect,
  authorizeRoles('enseignant'),
  deleteQuizQuestion
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT ou ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// DELETE /api/courses/:courseId/lessons/:lessonId
// → Supprimer une leçon
router.delete(
  '/:lessonId',
  protect,
  authorizeRoles('enseignant', 'admin'),
  deleteLesson
);

module.exports = router;