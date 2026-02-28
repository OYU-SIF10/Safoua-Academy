const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Créer les dossiers s'ils n'existent pas ──────────────────────────────
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDirIfNotExists('uploads/images');
createDirIfNotExists('uploads/videos');
createDirIfNotExists('uploads/audios');
createDirIfNotExists('uploads/pdfs');

// ─── Configuration du stockage ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Trier automatiquement selon le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/');
    } else if (file.mimetype.startsWith('audio/')) {
      cb(null, 'uploads/audios/');
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'uploads/pdfs/');
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  },
  filename: function (req, file, cb) {
    // Nom unique : timestamp + nom original nettoyé
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')   // espaces → tirets
      .toLowerCase();
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

// ─── Filtres par type ─────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const mediaFilter = (req, file, cb) => {
  const allowed = [
    'image/',
    'video/',
    'audio/',
    'application/pdf',
  ];
  const isAllowed = allowed.some((type) => file.mimetype.startsWith(type));
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'), false);
  }
};

// ─── Exports : différents middlewares selon l'usage ──────────────────────

// Pour les photos de profil (images uniquement, 2MB)
exports.uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('photo_profil');

// Pour les médias de leçons (vidéo, audio, PDF, image, 100MB)
exports.uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).single('url_media');

// Pour les images de couverture de cours (images uniquement, 5MB)
exports.uploadCover = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image_couverture');