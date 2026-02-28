const mongoose = require('mongoose');

// ─── Sous-schéma : Feedback de prononciation ──────────────────────────────
const FeedbackPrononciationSchema = new mongoose.Schema({
  mot: {
    type: String, // mot mal prononcé
    required: true,
  },
  transcription_etudiant: {
    type: String, // ce que l'étudiant a dit (retourné par l'API Speech-to-Text)
    default: null,
  },
  transcription_correcte: {
    type: String, // ce qu'il fallait dire
    default: null,
  },
  score_similarite: {
    type: Number, // 0 à 100 — similarité entre les deux prononciations
    min: 0,
    max: 100,
    default: null,
  },
  conseil: {
    type: String, // conseil personnalisé généré (ex: "Faites attention au makhraj du ع")
    default: null,
  },
});

// ─── Sous-schéma : Résultat de Quiz ───────────────────────────────────────
const ResultatQuizSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  reponse_etudiant: {
    type: String,
    default: null,
  },
  est_correcte: {
    type: Boolean,
    default: false,
  },
  points_obtenus: {
    type: Number,
    default: 0,
  },
});

// ─── Schéma principal : PerformanceIA ─────────────────────────────────────
const PerformanceIASchema = new mongoose.Schema(
  {
    etudiant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'étudiant est obligatoire"],
    },

    lecon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La leçon est obligatoire'],
    },

    cours_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Le cours est obligatoire'],
    },

    type_exercice: {
      type: String,
      enum: ['quiz', 'prononciation', 'lecture', 'memorisation'],
      required: [true, "Le type d'exercice est obligatoire"],
    },

    // ── Score global de la session ───────────────────────────────────────
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Détail quiz ──────────────────────────────────────────────────────
    resultats_quiz: [ResultatQuizSchema],

    // ── Détail prononciation (BF-IA-01 — API Speech-to-Text) ────────────
    feedback_prononciation: [FeedbackPrononciationSchema],

    // ── Données brutes retournées par l'API IA ───────────────────────────
    reponse_api_ia: {
      type: mongoose.Schema.Types.Mixed, // JSON brut de Google Speech-to-Text ou autre
      default: null,
    },

    // ── Temps passé sur l'exercice ───────────────────────────────────────
    duree_secondes: {
      type: Number,
      default: 0,
    },

    // ── Nombre de tentatives ─────────────────────────────────────────────
    tentative: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ── Compétences évaluées (liées à meta_ia de la leçon) ───────────────
    competences_evaluees: [String], // ex: ['tajwid', 'makharij', 'vocabulaire']

    // ── Niveau de maîtrise calculé par l'IA ──────────────────────────────
    niveau_maitrise: {
      type: String,
      enum: ['faible', 'moyen', 'bon', 'excellent'],
      default: 'faible',
    },

    // ── Recommandations personnalisées (BF-IA-01) ─────────────────────────
    recommandations: [
      {
        type_recommandation: {
          type: String,
          enum: ['reviser_lecon', 'exercice_supplementaire', 'cours_suivant', 'cours_lie'],
        },
        lecon_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
          default: null,
        },
        cours_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          default: null,
        },
        message: String, // ex: "Nous vous recommandons de réviser le Makhraj du ح"
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Index ─────────────────────────────────────────────────────────────────
PerformanceIASchema.index({ etudiant_id: 1, lecon_id: 1 });
PerformanceIASchema.index({ etudiant_id: 1, cours_id: 1 });
PerformanceIASchema.index({ etudiant_id: 1, type_exercice: 1 });
PerformanceIASchema.index({ createdAt: -1 });

// ─── Méthode : calculer le niveau de maîtrise selon le score ──────────────
PerformanceIASchema.methods.calculerNiveauMaitrise = function () {
  if (this.score >= 90) this.niveau_maitrise = 'excellent';
  else if (this.score >= 70) this.niveau_maitrise = 'bon';
  else if (this.score >= 50) this.niveau_maitrise = 'moyen';
  else this.niveau_maitrise = 'faible';

  return this.niveau_maitrise;
};

// ─── Statique : rapport global d'un étudiant dans un cours (BF-IA-02) ─────
PerformanceIASchema.statics.getRapportEtudiant = async function (etudiant_id, cours_id) {
  return await this.aggregate([
    {
      $match: {
        etudiant_id: new require('mongoose').Types.ObjectId(etudiant_id),
        cours_id: new require('mongoose').Types.ObjectId(cours_id),
      },
    },
    {
      $group: {
        _id: '$type_exercice',
        score_moyen: { $avg: '$score' },
        nombre_sessions: { $sum: 1 },
        derniere_session: { $max: '$createdAt' },
        competences: { $push: '$competences_evaluees' },
      },
    },
    {
      $sort: { score_moyen: 1 }, // du plus faible au plus fort → lacunes en premier
    },
  ]);
};

// ─── Virtuels ──────────────────────────────────────────────────────────────
PerformanceIASchema.virtual('est_reussi').get(function () {
  return this.score >= 70;
});

PerformanceIASchema.set('toJSON', { virtuals: true });
PerformanceIASchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PerformanceIA', PerformanceIASchema);