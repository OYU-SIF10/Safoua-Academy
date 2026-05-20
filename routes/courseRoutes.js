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

const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { uploadCover } = require('../middlewares/uploadMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', getAllCourses);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT
// ─────────────────────────────────────────────────────────────────────────────

// ✅ Static routes FIRST (before /:id)
router.get('/my-courses', protect, authorizeRoles('enseignant'), getMyCourses);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES AVEC PARAMÈTRE — après les routes statiques
// ─────────────────────────────────────────────────────────────────────────────

// ✅ Dynamic :id routes AFTER static routes
router.get('/:id', getCourseById);

router.post('/', protect, authorizeRoles('enseignant'), uploadCover, createCourse);

router.put('/:id', protect, authorizeRoles('enseignant'), uploadCover, updateCourse);

router.patch('/:id/publish', protect, authorizeRoles('enseignant'), togglePublishCourse);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ENSEIGNANT ou ADMIN
// ─────────────────────────────────────────────────────────────────────────────

router.delete('/:id', protect, authorizeRoles('enseignant', 'admin'), deleteCourse);

// ─────────────────────────────────────────────────────────────────────────────
// LEÇONS IMBRIQUÉES ✅
// ─────────────────────────────────────────────────────────────────────────────
const lessonRoutes = require('./lessonRoutes');
router.use('/:courseId/lessons', lessonRoutes);

module.exports = router;