const Course = require('../models/Course');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Créer un nouveau cours
// @route   POST /api/courses
// @access  Privé (Enseignant)
// ─────────────────────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const { titre, description, categorie, niveau, langue, prix, est_gratuit, tags } = req.body;

    const course = await Course.create({
      titre,
      description,
      categorie,
      niveau,
      langue,
      prix,
      est_gratuit,
      tags,
      enseignant_id: req.user._id, // injecté par authMiddleware
    });

    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer tous les cours publiés (avec recherche et filtrage)
// @route   GET /api/courses
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
  try {
    const { categorie, niveau, langue, search, page = 1, limit = 10 } = req.query;

    // Construction du filtre dynamique
    const filter = { est_publie: true };

    if (categorie) filter.categorie = categorie;
    if (niveau) filter.niveau = niveau;
    if (langue) filter.langue = langue;

    // Recherche textuelle (BF-COURSE-03)
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('enseignant_id', 'nom email')
        .select('-lecons') // ne pas retourner les leçons dans la liste
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer un cours par son ID (avec ses leçons)
// @route   GET /api/courses/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enseignant_id', 'nom email photo_profil');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    // Si le cours n'est pas publié, seul l'enseignant peut le voir
    if (!course.est_publie) {
      if (!req.user || req.user._id.toString() !== course.enseignant_id._id.toString()) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer les cours d'un enseignant (ses propres cours)
// @route   GET /api/courses/my-courses
// @access  Privé (Enseignant)
// ─────────────────────────────────────────────────────────────────────────────
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enseignant_id: req.user._id })
      .select('-lecons')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mettre à jour un cours
// @route   PUT /api/courses/:id
// @access  Privé (Enseignant propriétaire)
// ─────────────────────────────────────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    // Vérifier que c'est bien l'enseignant propriétaire
    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Publier / Dépublier un cours
// @route   PATCH /api/courses/:id/publish
// @access  Privé (Enseignant propriétaire)
// ─────────────────────────────────────────────────────────────────────────────
const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    // Un cours doit avoir au moins une leçon pour être publié
    if (!course.est_publie && course.lecons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ajoutez au moins une leçon avant de publier le cours',
      });
    }

    course.est_publie = !course.est_publie;
    await course.save();

    res.status(200).json({
      success: true,
      message: course.est_publie ? 'Cours publié avec succès' : 'Cours dépublié',
      data: { est_publie: course.est_publie },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Supprimer un cours
// @route   DELETE /api/courses/:id
// @access  Privé (Enseignant propriétaire ou Admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    const isOwner = course.enseignant_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    await course.deleteOne();

    res.status(200).json({ success: true, message: 'Cours supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES LEÇONS (sous-documents)
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Ajouter une leçon à un cours
// @route   POST /api/courses/:id/lessons
// @access  Privé (Enseignant propriétaire)
const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const { titre, type_contenu, url_media, duree_minutes, quiz } = req.body;

    const nouvelleLecon = {
      titre,
      type_contenu,
      url_media,
      duree_minutes,
      ordre: course.lecons.length + 1, // ordre automatique
      quiz: quiz || [],
    };

    course.lecons.push(nouvelleLecon);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Leçon ajoutée avec succès',
      data: course.lecons[course.lecons.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer une leçon d'un cours
// @route   DELETE /api/courses/:id/lessons/:lessonId
// @access  Privé (Enseignant propriétaire)
const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const lessonIndex = course.lecons.findIndex(
      (l) => l._id.toString() === req.params.lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    course.lecons.splice(lessonIndex, 1);

    // Recalculer l'ordre des leçons restantes
    course.lecons.forEach((lecon, index) => {
      lecon.ordre = index + 1;
    });

    await course.save();

    res.status(200).json({ success: true, message: 'Leçon supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
};