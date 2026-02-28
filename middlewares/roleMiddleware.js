// ─────────────────────────────────────────────────────────────────────────────
// Middleware de gestion des rôles
// Utilisation : authorizeRoles('admin', 'enseignant')
// ─────────────────────────────────────────────────────────────────────────────

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };