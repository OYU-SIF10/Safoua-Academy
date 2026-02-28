const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Ajouter une leçon à un cours
// @route   POST /api/courses/:courseId/lessons
// @access  Privé (Enseignant propriétaire)
// ─────────────────────────────────────────────────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    // Vérifier que c'est bien l'enseignant propriétaire
    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    // Calculer l'ordre automatiquement (dernière leçon + 1)
    const nombreLecons = await Lesson.countDocuments({ cours_id: req.params.courseId });

    const {
      titre,
      description,
      type_contenu,
      url_media,
      contenu_texte,
      duree_minutes,
      est_gratuite,
      quiz,
      meta_ia,
    } = req.body;

    const lesson = await Lesson.create({
      titre,
      description,
      cours_id: req.params.courseId,
      enseignant_id: req.user._id,
      type_contenu,
      url_media,
      contenu_texte,
      duree_minutes,
      ordre: nombreLecons + 1,
      est_gratuite,
      quiz: quiz || [],
      meta_ia,
    });

    res.status(201).json({
      success: true,
      message: 'Leçon créée avec succès',
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer toutes les leçons d'un cours
// @route   GET /api/courses/:courseId/lessons
// @access  Public (leçons gratuites) / Privé (leçons payantes)
// ─────────────────────────────────────────────────────────────────────────────
const getLessonsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    let filter = { cours_id: req.params.courseId, est_publiee: true };

    // Si l'utilisateur n'est pas connecté → uniquement les leçons gratuites
    if (!req.user) {
      filter.est_gratuite = true;
    }

    const lessons = await Lesson.find(filter)
      .select('-quiz') // ne pas retourner le quiz dans la liste
      .sort({ ordre: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer une leçon par son ID (avec le quiz)
// @route   GET /api/courses/:courseId/lessons/:lessonId
// @access  Privé (Étudiant inscrit ou Enseignant)
// ─────────────────────────────────────────────────────────────────────────────
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    // Leçon gratuite → accessible à tous
    if (lesson.est_gratuite) {
      return res.status(200).json({ success: true, data: lesson });
    }

    // Leçon payante → vérifier que l'utilisateur est connecté
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Connectez-vous pour accéder à cette leçon',
      });
    }

    // L'enseignant propriétaire peut toujours accéder
    if (lesson.enseignant_id.toString() === req.user._id.toString()) {
      return res.status(200).json({ success: true, data: lesson });
    }

    //  vérifier l'inscription de l'étudiant 
   
const inscription = await Enrollment.findOne({
      etudiant_id: req.user._id,
     cours_id: req.params.courseId
});
    if (!inscription) return res.status(403).json({
     success: false,
     message: "Inscrivez-vous au cours pour accéder à cette leçon"
});

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mettre à jour une leçon
// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @access  Privé (Enseignant propriétaire)
// ─────────────────────────────────────────────────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    if (lesson.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Leçon mise à jour avec succès',
      data: updatedLesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Publier / Dépublier une leçon
// @route   PATCH /api/courses/:courseId/lessons/:lessonId/publish
// @access  Privé (Enseignant propriétaire)
// ─────────────────────────────────────────────────────────────────────────────
const togglePublishLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    if (lesson.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    lesson.est_publiee = !lesson.est_publiee;
    await lesson.save();

    res.status(200).json({
      success: true,
      message: lesson.est_publiee ? 'Leçon publiée' : 'Leçon dépubliée',
      data: { est_publiee: lesson.est_publiee },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Réordonner les leçons d'un cours
// @route   PATCH /api/courses/:courseId/lessons/reorder
// @access  Privé (Enseignant propriétaire)
// Body: { ordres: [{ lessonId: '...', ordre: 1 }, { lessonId: '...', ordre: 2 }] }
// ─────────────────────────────────────────────────────────────────────────────
const reorderLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable' });
    }

    if (course.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const { ordres } = req.body; // [{ lessonId, ordre }]

    // Mise à jour en parallèle
    const updates = ordres.map(({ lessonId, ordre }) =>
      Lesson.findByIdAndUpdate(lessonId, { ordre }, { new: true })
    );

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      message: 'Ordre des leçons mis à jour avec succès',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Supprimer une leçon
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Privé (Enseignant propriétaire ou Admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    const isOwner = lesson.enseignant_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    await lesson.deleteOne();

    // Recalculer l'ordre des leçons restantes
    const lecons = await Lesson.find({ cours_id: req.params.courseId }).sort({ ordre: 1 });
    const updates = lecons.map((l, index) =>
      Lesson.findByIdAndUpdate(l._id, { ordre: index + 1 })
    );
    await Promise.all(updates);

    res.status(200).json({ success: true, message: 'Leçon supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DU QUIZ
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Ajouter une question au quiz d'une leçon
// @route   POST /api/courses/:courseId/lessons/:lessonId/quiz
// @access  Privé (Enseignant propriétaire)
const addQuizQuestion = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    if (lesson.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const { question, options, explication, points } = req.body;

    lesson.quiz.push({ question, options, explication, points });
    await lesson.save();

    res.status(201).json({
      success: true,
      message: 'Question ajoutée au quiz',
      data: lesson.quiz[lesson.quiz.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer une question du quiz
// @route   DELETE /api/courses/:courseId/lessons/:lessonId/quiz/:questionId
// @access  Privé (Enseignant propriétaire)
const deleteQuizQuestion = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    if (lesson.enseignant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Action non autorisée' });
    }

    const questionIndex = lesson.quiz.findIndex(
      (q) => q._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question introuvable' });
    }

    lesson.quiz.splice(questionIndex, 1);
    await lesson.save();

    res.status(200).json({ success: true, message: 'Question supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  togglePublishLesson,
  reorderLessons,
  deleteLesson,
  addQuizQuestion,
  deleteQuizQuestion,
};