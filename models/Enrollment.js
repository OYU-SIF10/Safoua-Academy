const mongoose = require('mongoose');

// ─── Sous-schéma : Progression par leçon ──────────────────────────────────
const LessonProgressSchema = new mongoose.Schema({
  lecon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  est_completee: {
    type: Boolean,
    default: false,
  },
  date_completion: {
    type: Date,
    default: null,
  },
  score_quiz: {
    type: Number, // score obtenu au quiz (sur points_total)
    default: null,
  },
  temps_passe_minutes: {
    type: Number,
    default: 0,
  },
});

// ─── Schéma principal : Inscription ───────────────────────────────────────
const EnrollmentSchema = new mongoose.Schema(
  {
    etudiant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'étudiant est obligatoire"],
    },

    cours_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Le cours est obligatoire'],
    },

    // Statut de l'inscription
    statut: {
      type: String,
      enum: ['actif', 'complété', 'abandonné'],
      default: 'actif',
    },

    // Progression globale (0 à 100)
    progression: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Progression détaillée par leçon
    progression_lecons: [LessonProgressSchema],

    // Dates importantes
    date_inscription: {
      type: Date,
      default: Date.now,
    },
    date_completion: {
      type: Date,
      default: null,
    },
    derniere_activite: {
      type: Date,
      default: Date.now,
    },

    // Évaluation du cours par l'étudiant (après complétion)
    avis: {
      note: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      commentaire: {
        type: String,
        maxlength: 1000,
        default: null,
      },
      date_avis: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Contrainte : un étudiant ne peut s'inscrire qu'une fois par cours ────
EnrollmentSchema.index({ etudiant_id: 1, cours_id: 1 }, { unique: true });
EnrollmentSchema.index({ etudiant_id: 1 });
EnrollmentSchema.index({ cours_id: 1 });

// ─── Méthode : recalculer la progression globale ──────────────────────────
EnrollmentSchema.methods.recalculerProgression = function () {
  if (this.progression_lecons.length === 0) return 0;

  const lecons_completees = this.progression_lecons.filter(
    (l) => l.est_completee
  ).length;

  this.progression = Math.round(
    (lecons_completees / this.progression_lecons.length) * 100
  );

  // Marquer comme complété si 100%
  if (this.progression === 100) {
    this.statut = 'complété';
    this.date_completion = new Date();
  }

  return this.progression;
};

// ─── Virtuels ─────────────────────────────────────────────────────────────
EnrollmentSchema.virtual('est_complete').get(function () {
  return this.statut === 'complété';
});

EnrollmentSchema.set('toJSON', { virtuals: true });
EnrollmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);