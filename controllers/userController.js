const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Inscription
// @route   POST /api/users/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res,next) => {
  try {
    const { nom, prenom, email,role, mot_de_passe } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    if (mot_de_passe.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // ✅ User.create déclenche le pre('save') qui hash automatiquement
    const user = await User.create({
      nom,
      prenom,
      email,
      role,
      mot_de_passe,
      photo_profil: req.file ? req.file.filename : null,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        photo_profil: user.photo_profil,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Connexion
// @route   POST /api/users/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res,next) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Identifiants invalides' });
    }

    // ✅ Utiliser la méthode du modèle
    const isMatch = await user.comparePassword(mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        photo_profil: user.photo_profil,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/me
// @access  Privé
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res,next) => {
  try {
    // req.user est déjà injecté par authMiddleware (sans mot_de_passe)
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mettre à jour son propre profil
// @route   PUT /api/users/me
// @access  Privé
// ─────────────────────────────────────────────────────────────────────────────
exports.updateMe = async (req, res,next) => {
  try {
    const { nom, prenom, mot_de_passe } = req.body;

    const user = await User.findById(req.user._id);

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (req.file) user.photo_profil = req.file.filename;

    // ✅ Passer par .save() pour déclencher le pre('save') et hasher le mdp
    if (mot_de_passe) user.mot_de_passe = mot_de_passe;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        photo_profil: user.photo_profil,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN UNIQUEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Lister tous les utilisateurs avec pagination
// @route   GET /api/users?page=1&limit=10
// @access  Admin
exports.listerUtilisateurs = async (req, res,next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find().select('-mot_de_passe').skip(skip).limit(Number(limit)),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Admin
exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-mot_de_passe');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUtilisateur = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Demander une réinitialisation de mot de passe
// @route   POST /api/users/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien a été envoyé'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail(user.email, resetUrl);
      res.status(200).json({
        success: true,
        message: 'Email de réinitialisation envoyé avec succès'
      });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Réinitialiser le mot de passe
// @route   PUT /api/users/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { mot_de_passe, motDePasseConfirmation } = req.body;

    if (!mot_de_passe || !motDePasseConfirmation) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe et confirmation requis'
      });
    }

    if (mot_de_passe !== motDePasseConfirmation) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    if (mot_de_passe.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit avoir au moins 6 caractères'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    user.mot_de_passe = mot_de_passe;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};