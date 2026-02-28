const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { uploadImage } = require('../middlewares/uploadMiddleware'); // ✅ corrigé

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES
// ─────────────────────────────────────────────────────────────────────────────

router.post('/register', uploadImage, userController.register);
router.post('/login', userController.login);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — UTILISATEUR CONNECTÉ
// ─────────────────────────────────────────────────────────────────────────────

router.get('/me', protect, userController.getMe);
router.put('/me', protect, uploadImage, userController.updateMe);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES PRIVÉES — ADMIN UNIQUEMENT
// ─────────────────────────────────────────────────────────────────────────────

router.get('/', protect, authorizeRoles('admin'), userController.listerUtilisateurs);
router.get('/:id', protect, authorizeRoles('admin'), userController.getUtilisateurById);
router.delete('/:id', protect, authorizeRoles('admin'), userController.deleteUtilisateur);

module.exports = router;
