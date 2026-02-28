const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Inscription
// @route   POST /api/users/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    // ✅ User.create déclenche le pre('save') qui hash automatiquement
    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe,                                        // ✅ pas de hash manuel
      photo_profil: req.file ? req.file.filename : null,   // ✅ renommé
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
exports.login = async (req, res) => {
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
exports.getMe = async (req, res) => {
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
exports.updateMe = async (req, res) => {
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

// @desc    Lister tous les utilisateurs
// @route   GET /api/users
// @access  Admin
exports.listerUtilisateurs = async (req, res) => {
  try {
    const users = await User.find().select('-mot_de_passe'); // ✅ sécurisé
    res.status(200).json({ success: true, count: users.length, data: users });
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