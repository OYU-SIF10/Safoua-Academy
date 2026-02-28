const PerformanceIA = require('../models/PerformanceIA');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Enregistrer une performance (quiz ou prononciation)
// @route   POST /api/performance/:courseId/lessons/:lessonId
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const createPerformance = async (req, res) => {
  try {
    // Vérifier que l'étudiant est inscrit au cours
    const inscription = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (!inscription) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être inscrit au cours pour enregistrer une performance',
      });
    }

    // Vérifier que la leçon existe
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      cours_id: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon introuvable' });
    }

    const {
      type_exercice,
      score,
      resultats_quiz,
      feedback_prononciation,
      reponse_api_ia,
      duree_secondes,
      competences_evaluees,
    } = req.body;

    // Vérifier si une performance existe déjà pour cette leçon
    const performanceExistante = await PerformanceIA.findOne({
      etudiant_id: req.user._id,
      lecon_id: req.params.lessonId,
      type_exercice,
    });

    let performance;

    if (performanceExistante) {
      // Incrémenter le nombre de tentatives
      performanceExistante.tentative += 1;
      performanceExistante.score = score;
      performanceExistante.resultats_quiz = resultats_quiz || [];
      performanceExistante.feedback_prononciation = feedback_prononciation || [];
      performanceExistante.reponse_api_ia = reponse_api_ia || null;
      performanceExistante.duree_secondes = duree_secondes || 0;
      performanceExistante.competences_evaluees =
        competences_evaluees || lesson.meta_ia?.competences_cibles || [];

      // Recalculer le niveau de maîtrise
      performanceExistante.calculerNiveauMaitrise();

      // Générer les recommandations
      performanceExistante.recommandations = await genererRecommandations(
        performanceExistante,
        lesson,
        req.params.courseId
      );

      performance = await performanceExistante.save();
    } else {
      // Créer une nouvelle performance
      performance = new PerformanceIA({
        etudiant_id: req.user._id,
        lecon_id: req.params.lessonId,
        cours_id: req.params.courseId,
        type_exercice,
        score,
        resultats_quiz: resultats_quiz || [],
        feedback_prononciation: feedback_prononciation || [],
        reponse_api_ia: reponse_api_ia || null,
        duree_secondes: duree_secondes || 0,
        competences_evaluees:
          competences_evaluees || lesson.meta_ia?.competences_cibles || [],
      });

      // Calculer le niveau de maîtrise
      performance.calculerNiveauMaitrise();

      // Générer les recommandations
      performance.recommandations = await genererRecommandations(
        performance,
        lesson,
        req.params.courseId
      );

      await performance.save();
    }

    res.status(201).json({
      success: true,
      message: 'Performance enregistrée avec succès',
      data: performance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Récupérer toutes les performances d'un étudiant dans une leçon
// @route   GET /api/performance/:courseId/lessons/:lessonId
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const getPerformanceByLesson = async (req, res) => {
  try {
    const performances = await PerformanceIA.find({
      etudiant_id: req.user._id,
      lecon_id: req.params.lessonId,
      cours_id: req.params.courseId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Rapport global d'un étudiant dans un cours (BF-IA-02)
// @route   GET /api/performance/:courseId/rapport
// @access  Privé (Étudiant)
// ─────────────────────────────────────────────────────────────────────────────
const getRapportEtudiant = async (req, res) => {
  try {
    // Vérifier l'inscription
    const inscription = await Enrollment.findOne({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    });

    if (!inscription) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas inscrit à ce cours',
      });
    }

    // Rapport agrégé par type d'exercice (méthode statique du modèle)
    const rapport = await PerformanceIA.getRapportEtudiant(
      req.user._id,
      req.params.courseId
    );

    // Dernières recommandations actives
    const dernieresPerformances = await PerformanceIA.find({
      etudiant_id: req.user._id,
      cours_id: req.params.courseId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('lecon_id type_exercice score niveau_maitrise recommandations createdAt');

    res.status(200).json({
      success: true,
      data: {
        progression_globale: inscription.progression,
        statut_cours: inscription.statut,
        rapport_par_exercice: rapport,
        dernieres_activites: dernieresPerformances,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Rapport des performances d'un étudiant (vue enseignant)
// @route   GET /api/performance/:courseId/students/:studentId/rapport
// @access  Privé (Enseignant propriétaire ou Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getRapportEtudiantParEnseignant = async (req, res) => {
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

    const rapport = await PerformanceIA.getRapportEtudiant(
      req.params.studentId,
      req.params.courseId
    );

    const inscription = await Enrollment.findOne({
      etudiant_id: req.params.studentId,
      cours_id: req.params.courseId,
    }).populate('etudiant_id', 'nom email');

    res.status(200).json({
      success: true,
      data: {
        etudiant: inscription?.etudiant_id || null,
        progression_globale: inscription?.progression || 0,
        statut_cours: inscription?.statut || 'non inscrit',
        rapport_par_exercice: rapport,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Statistiques globales d'un cours (vue enseignant/admin)
// @route   GET /api/performance/:courseId/stats
// @access  Privé (Enseignant propriétaire ou Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getStatsCours = async (req, res) => {
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

    // Agrégation globale du cours
    const stats = await PerformanceIA.aggregate([
      {
        $match: {
          cours_id: new require('mongoose').Types.ObjectId(req.params.courseId),
        },
      },
      {
        $group: {
          _id: '$lecon_id',
          score_moyen: { $avg: '$score' },
          nombre_tentatives: { $sum: 1 },
          nombre_etudiants: { $addToSet: '$etudiant_id' },
        },
      },
      {
        $project: {
          score_moyen: { $round: ['$score_moyen', 1] },
          nombre_tentatives: 1,
          nombre_etudiants: { $size: '$nombre_etudiants' },
        },
      },
      {
        $sort: { score_moyen: 1 }, // leçons les plus difficiles en premier
      },
    ]);

    // Populer les titres des leçons
    const statsAvecLecons = await Lesson.populate(stats, {
      path: '_id',
      select: 'titre ordre',
    });

    res.status(200).json({
      success: true,
      data: {
        titre_cours: course.titre,
        nombre_inscrits: course.nombre_inscrits,
        note_moyenne: course.note_moyenne,
        stats_par_lecon: statsAvecLecons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION UTILITAIRE PRIVÉE — Générer les recommandations IA (BF-IA-01)
// ─────────────────────────────────────────────────────────────────────────────
const genererRecommandations = async (performance, lesson, courseId) => {
  const recommandations = [];

  // Si score faible → réviser la leçon
  if (performance.score < 50) {
    recommandations.push({
      type_recommandation: 'reviser_lecon',
      lecon_id: lesson._id,
      cours_id: courseId,
      message: `Votre score est de ${performance.score}/100. Nous vous recommandons de revoir la leçon "${lesson.titre}".`,
    });
  }

  // Si score moyen → exercice supplémentaire sur les compétences faibles
  if (performance.score >= 50 && performance.score < 70) {
    recommandations.push({
      type_recommandation: 'exercice_supplementaire',
      lecon_id: lesson._id,
      cours_id: courseId,
      message: `Continuez à pratiquer les compétences : ${performance.competences_evaluees.join(', ')}.`,
    });
  }

  // Si score bon → suggérer la leçon suivante
  if (performance.score >= 70) {
    const leconSuivante = await Lesson.findOne({
      cours_id: courseId,
      ordre: lesson.ordre + 1,
      est_publiee: true,
    }).select('_id titre');

    if (leconSuivante) {
      recommandations.push({
        type_recommandation: 'cours_suivant',
        lecon_id: leconSuivante._id,
        cours_id: courseId,
        message: `Excellent travail ! Passez à la leçon suivante : "${leconSuivante.titre}".`,
      });
    }
  }

  return recommandations;
};

module.exports = {
  createPerformance,
  getPerformanceByLesson,
  getRapportEtudiant,
  getRapportEtudiantParEnseignant,
  getStatsCours,
};