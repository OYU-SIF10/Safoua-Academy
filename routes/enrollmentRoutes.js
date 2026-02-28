const express = require('express');
const router = express.Router();

const {
  enrollCourse,
  unenrollCourse,
  getMyCourses,
  getCourseProgress,
  completeLesson,
  addReview,
  getCourseStudents,
} = require('../controllers/enrollmentController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES ÉTUDIANT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/enrollments/my-courses
// → Tous les cours de l'étudiant connecté
router.get(
  '/my-courses',
  protect,
  authorizeRoles('etudiant'),
  getMyCourses
);

// POST /api/enrollments/:courseId
// → S'inscrire à un cours
router.post(
  '/:courseId',
  protect,
  authorizeRoles('etudiant'),
  enrollCourse
);

// DELETE /api/enrollments/:courseId
// → Se désinscrire d'un cours
router.delete(
  '/:courseId',
  protect,
  authorizeRoles('etudiant'),
  unenrollCourse
);

// GET /api/enrollments/:courseId/progress
// → Progression de l'étudiant dans un cours
router.get(
  '/:courseId/progress',
  protect,
  authorizeRoles('etudiant'),
  getCourseProgress
);

// PATCH /api/enrollments/:courseId/lessons/:lessonId/complete
// → Marquer une leçon comme complétée
router.patch(
  '/:courseId/lessons/:lessonId/complete',
  protect,
  authorizeRoles('etudiant'),
  completeLesson
);

// POST /api/enrollments/:courseId/review
// → Laisser un avis sur un cours (après complétion)
router.post(
  '/:courseId/review',
  protect,
  authorizeRoles('etudiant'),
  addReview
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES ENSEIGNANT / ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/enrollments/:courseId/students
// → Liste des étudiants inscrits à un cours
router.get(
  '/:courseId/students',
  protect,
  authorizeRoles('enseignant', 'admin'),
  getCourseStudents
);

module.exports = router;