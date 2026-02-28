const express = require('express');
const router = express.Router();

const {
  createPerformance,
  getPerformanceByLesson,
  getRapportEtudiant,
  getRapportEtudiantParEnseignant,
  getStatsCours,
} = require('../controllers/performanceController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES ÉTUDIANT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/performance/:courseId/lessons/:lessonId
// → Enregistrer une performance (quiz ou prononciation)
router.post(
  '/:courseId/lessons/:lessonId',
  protect,
  authorizeRoles('etudiant'),
  createPerformance
);

// GET /api/performance/:courseId/lessons/:lessonId
// → Historique des performances d'une leçon
router.get(
  '/:courseId/lessons/:lessonId',
  protect,
  authorizeRoles('etudiant'),
  getPerformanceByLesson
);

// GET /api/performance/:courseId/rapport
// → Rapport global de l'étudiant dans un cours (BF-IA-02)
router.get(
  '/:courseId/rapport',
  protect,
  authorizeRoles('etudiant'),
  getRapportEtudiant
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES ENSEIGNANT / ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/performance/:courseId/students/:studentId/rapport
// → Rapport d'un étudiant spécifique (vue enseignant)
router.get(
  '/:courseId/students/:studentId/rapport',
  protect,
  authorizeRoles('enseignant', 'admin'),
  getRapportEtudiantParEnseignant
);

// GET /api/performance/:courseId/stats
// → Statistiques globales du cours
router.get(
  '/:courseId/stats',
  protect,
  authorizeRoles('enseignant', 'admin'),
  getStatsCours
);

module.exports = router;