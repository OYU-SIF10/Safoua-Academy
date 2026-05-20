const mongoose = require('mongoose');

// ─── Sous-schéma : Option de Quiz ─────────────────────────────────────────
const QuizOptionSchema = new mongoose.Schema({
  texte: {
    type: String,
    required: true,
  },
  est_correcte: {
    type: Boolean,
    default: false,
  },
});

// ─── Sous-schéma : Question de Quiz ───────────────────────────────────────
const QuizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'La question est obligatoire'],
  },
  options: [QuizOptionSchema],
  explication: {
    type: String, // explication de la bonne réponse (utile pour l'apprentissage)
    default: null,
  },
  points: {
    type: Number,
    default: 1,
  },
});

// ─── Schéma principal : Leçon ──────────────────────────────────────────────
const LessonSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre de la leçon est obligatoire'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },

    description: {
      type: String,
      default: null,
    },

    // Référence vers le cours parent
    cours_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Le cours parent est obligatoire'],
    },

    // Référence vers l'enseignant (pour faciliter les requêtes)
    enseignant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type_contenu: {
      type: String,
      enum: ['video', 'audio', 'pdf', 'texte'],
      required: [true, 'Le type de contenu est obligatoire'],
    },

    url_media: {
      type: String, // URL Cloudinary ou stockage externe
      default: null,
    },

    contenu_texte: {
      type: String, // utilisé si type_contenu === 'texte'
      default: null,
    },

    duree_minutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    ordre: {
      type: Number,
      required: [true, "L'ordre de la leçon est obligatoire"],
      min: 1,
    },

    est_gratuite: {
      type: Boolean,
      default: false, // aperçu gratuit ou non
    },

    est_publiee: {
      type: Boolean,
      default: false,
    },

    // Quiz à la fin de la leçon (optionnel)
    quiz: {
      type: [QuizSchema],
      default: [], // ✅ Ensure quiz always defaults to empty array
    },

    // Métadonnées IA — pour le suivi de performance (BF-IA-02)
    meta_ia: {
      competences_cibles: {
        type: [String], // ex: ['tajwid', 'makharij', 'vocabulaire']
        default: [],
      },
      niveau_difficulte: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ─────────────────────────────────────────────────────────────────
LessonSchema.index({ cours_id: 1, ordre: 1 });
LessonSchema.index({ enseignant_id: 1 });

// ─── Virtuel : nombre de questions dans le quiz ────────────────────────────
LessonSchema.virtual('nombre_questions').get(function () {
  // ✅ Fixed: Check if quiz exists before accessing length
  return this.quiz ? this.quiz.length : 0;
});

// ─── Virtuel : points total du quiz ───────────────────────────────────────
LessonSchema.virtual('points_total').get(function () {
  // ✅ Fixed: Check if quiz exists and handle undefined points
  if (!this.quiz || !Array.isArray(this.quiz)) {
    return 0;
  }
  return this.quiz.reduce((total, q) => total + (q.points || 0), 0);
});

// ─── Configuration des virtuels ───────────────────────────────────────────
LessonSchema.set('toJSON', { virtuals: true });
LessonSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lesson', LessonSchema);