const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// Authentification obligatoire — bloque si pas de token
// ─────────────────────────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Accès non autorisé' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur complet depuis la BDD
    const user = await User.findById(decoded.id).select('-mot_de_passe');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }

    req.user = user; // req.user._id, req.user.role, req.user.nom...
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Authentification optionnelle — laisse passer mais identifie si connecté
// ─────────────────────────────────────────────────────────────────────────────
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-mot_de_passe');
    }
  } catch (err) {
    // Token invalide → on continue sans utilisateur
  }
  next();
};