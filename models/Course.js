const mongoose = require('mongoose');

// ─── Sous-schéma : Quiz (dans une leçon) ───────────────────────────────────
const QuizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [String], // choix multiples
  correctAnswer: {
    type: String,
    required: true,
  },
});

// ─── Sous-schéma : Leçon ───────────────────────────────────────────────────
const LessonSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de la leçon est obligatoire'],
    trim: true,
  },
  type_contenu: {
    type: String,
    enum: ['video', 'audio', 'pdf', 'texte'],
    required: true,
  },
  url_media: {
    type: String, // URL vers Cloudinary 
    default: null,
  },
  duree_minutes: {
    type: Number,
    default: 0,
  },
  ordre: {
    type: Number, // ordre d'affichage dans le cours
    required: true,
  },
  quiz: [QuizSchema], // quiz optionnel à la fin de la leçon
});

// ─── Schéma principal : Cours ──────────────────────────────────────────────
const CourseSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre du cours est obligatoire'],
      trim: true,
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères'],
    },

    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },

    categorie: {
      type: String,
      enum: ['Coran', 'Langue Arabe', 'Sciences Islamiques'],
      required: [true, 'La catégorie est obligatoire'],
    },

    niveau: {
      type: String,
      enum: ['Débutant', 'Intermédiaire', 'Avancé'],
      required: [true, 'Le niveau est obligatoire'],
    },

    langue: {
      type: String,
      enum: ['Arabe', 'Français', 'Anglais'],
      default: 'Arabe',
    },

    image_couverture: {
      type: String, // URL de l'image
      default: null,
    },

    prix: {
      type: Number,
      default: 0, // 0 = gratuit
      min: 0,
    },

    est_gratuit: {
      type: Boolean,
      default: true,
    },

    est_publie: {
      type: Boolean,
      default: false, // l'enseignant doit publier manuellement
    },

    // Référence vers l'enseignant (User avec role = 'enseignant')
    enseignant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'enseignant est obligatoire"],
    },

    // Les leçons sont des sous-documents embarqués
    lecons: [LessonSchema],

    // Statistiques
    nombre_inscrits: {
      type: Number,
      default: 0,
    },

    note_moyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    tags: [String], // ex: ['tajwid', 'makharij', 'debutant']
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt automatiquement
  }
);

// ─── Index pour la recherche et le filtrage (BF-COURSE-03)────────────────
CourseSchema.index({ titre: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ categorie: 1, niveau: 1 });
CourseSchema.index({ enseignant_id: 1 });
CourseSchema.index({ est_publie: 1 });

// ─── Méthode virtuelle : nombre de leçons ─────────────────────────────────
CourseSchema.virtual('nombre_lecons').get(function () {
  return this.lecons.length;
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);