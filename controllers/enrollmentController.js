const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    S'inscrire à un cours
// @route   POST /api/enrollments/:courseId
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    if (!course.est_publie) {
      return res.status(400).json({ success: false, message: 'Ce cours n\'est pas disponible' });
    }

    // Vérifier si l'étudiant est déjà inscrit
    const dejaInscrit = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (dejaInscrit) {
      return res.status(400).json({ success: false, message: 'Vous êtes déjà inscrit à ce cours' });
    }

    // Récupérer toutes les leçons publiées du cours
    const lecons = await Lesson.find({
      cours_id: req.params.courseId,
      est_publiee: true,
    }).select('_id');

    // Initialiser la progression pour chaque leçon
    const progression_lecons = lecons.map((lecon) => ({
      lecon_id: lecon._id,
      est_completee: false,
      score_quiz: null,
      temps_passe_minutes: 0,
    }));

    const enrollment = await Enrollment.create({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
      progression_lecons,
    });

    // Incrémenter le nombre d'inscrits dans le cours
    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { nombre_inscrits: 1 },
    });

    res.status(201).json({
      success: true,
      message: `Inscription au cours "${course.titre}" réussie`,
      data: enrollment,
    });
  } catch (error) {
    // Gérer le cas de double inscription (index unique)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Vous êtes déjà inscrit à ce cours' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Se désinscrire d'un cours
// @route   DELETE /api/enrollments/:courseId
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const unenrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscription introuvable' });
    }

    await enrollment.deleteOne();

    // Décrémenter le nombre d'inscrits
    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { nombre_inscrits: -1 },
    });

    res.status(200).json({ success: true, message: 'Désinscription effectuée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer tous les cours d'un étudiant (mes inscriptions)
// @route   GET /api/enrollments/my-courses
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ etudiant_id: req.user._id })
      .populate('cours_id', 'titre description image_couverture categorie niveau enseignant_id')
      .sort({ derniere_activite: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
     console.error('❌ getMyCourses ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer la progression d'un étudiant dans un cours
// @route   GET /api/enrollments/:courseId/progress
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    }).populate('progression_lecons.lecon_id', 'titre ordre type_contenu duree_minutes');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Vous n\'êtes pas inscrit à ce cours' });
    }

    res.status(200).json({
      success: true,
      data: {
        progression: enrollment.progression,
        statut: enrollment.statut,
        date_inscription: enrollment.date_inscription,
        date_completion: enrollment.date_completion,
        derniere_activite: enrollment.derniere_activite,
        progression_lecons: enrollment.progression_lecons,
        avis: enrollment.avis,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Marquer une leçon comme complétée
// @route   PATCH /api/enrollments/:courseId/lessons/:lessonId/complete
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Vous n\'êtes pas inscrit à ce cours' });
    }

    // Trouver la leçon dans la progression
    const lessonProgress = enrollment.progression_lecons.find(
      (l) => l.lecon_id.toString() === req.params.lessonId
    );

    if (!lessonProgress) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable dans votre progression' });
    }

    // Mettre à jour la progression de la leçon
    lessonProgress.est_completee = true;
    lessonProgress.date_completion = new Date();

    if (req.body.score_quiz !== undefined) {
      lessonProgress.score_quiz = req.body.score_quiz;
    }

    if (req.body.temps_passe_minutes !== undefined) {
      lessonProgress.temps_passe_minutes = req.body.temps_passe_minutes;
    }

    // Mettre à jour la dernière activité
    enrollment.derniere_activite = new Date();

    // Recalculer la progression globale
    enrollment.recalculerProgression();

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Leçon marquée comme complétée',
      data: {
        progression: enrollment.progression,
        statut: enrollment.statut,
        lecon: lessonProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Laisser un avis sur un cours (après complétion)
// @route   POST /api/enrollments/:courseId/review
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const addReview = async (req, res) => {
  try {
    const { note, commentaire } = req.body;

    const enrollment = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Vous n\'êtes pas inscrit à ce cours' });
    }

    if (enrollment.statut !== 'complété') {
      return res.status(400).json({
        success: false,
        message: 'Vous devez compléter le cours avant de laisser un avis',
      });
    }

    if (enrollment.avis.note) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà laissé un avis' });
    }

    // Enregistrer l'avis
    enrollment.avis = { note, commentaire, date_avis: new Date() };
    await enrollment.save();

    // Recalculer la note moyenne du cours
    const avis = await Enrollment.find({
      cours_id: req.params.courseId,
      'avis.note': { $ne: null },
    }).select('avis.note');

    const note_moyenne =
      avis.reduce((sum, e) => sum + e.avis.note, 0) / avis.length;

    await Course.findByIdAndUpdate(req.params.courseId, {
      note_moyenne: Math.round(note_moyenne * 10) / 10, // arrondir à 1 décimale
    });

    res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès',
      data: enrollment.avis,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer les étudiants inscrits à un cours (vue enseignant)
// @route   GET /api/enrollments/:courseId/students
// @access  Privé (Enseignant propriétaire ou Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    const isOwner = course.enseignant_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    // ── Pagination ───────────────────────────────────────────────────────
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [enrollments, total] = await Promise.all([
      Enrollment.find({ cours_id: req.params.courseId })
        .populate('etudiant_id', 'nom email photo_profil')
        .select('etudiant_id progression statut date_inscription derniere_activite avis')
        .sort({ date_inscription: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Enrollment.countDocuments({ cours_id: req.params.courseId }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  enrollCourse,
  unenrollCourse,
  getMyCourses,
  getCourseProgress,
  completeLesson,
  addReview,
  getCourseStudents,
};