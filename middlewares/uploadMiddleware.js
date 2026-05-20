const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Create directories if they don't exist
['uploads/images', 'uploads/videos', 'uploads/audios', 'uploads/pdfs'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 2. Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, 'uploads/images/');
    else if (file.mimetype.startsWith('video/')) cb(null, 'uploads/videos/');
    else if (file.mimetype.startsWith('audio/')) cb(null, 'uploads/audios/');
    else if (file.mimetype === 'application/pdf') cb(null, 'uploads/pdfs/');
    else cb(new Error('Type non supporté'), false);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

// 3. Define filters
const imageFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images seulement'), false);
};

const mediaFilter = (req, file, cb) => {
  const allowed = ['image/', 'video/', 'audio/', 'application/pdf'];
  allowed.some(t => file.mimetype.startsWith(t)) ? cb(null, true) : cb(new Error('Type non supporté'), false);
};

// 4. Create Multer instances (Internal)
const uploadImageMulter = multer({ 
  storage, 
  fileFilter: imageFilter, 
  limits: { fileSize: 2 * 1024 * 1024 } 
}).single('photo_profil');

const uploadMediaMulter = multer({ 
  storage, 
  fileFilter: mediaFilter, 
  limits: { fileSize: 100 * 1024 * 1024 } 
}).single('url_media');

const uploadCoverMulter = multer({ 
  storage, 
  fileFilter: imageFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
}).single('image_couverture');

// 5. EXPORTS AS STANDARD MIDDLEWARE (The Fix for "next is not a function")

// For Profile Photos (2MB limit)
exports.uploadImage = (req, res, next) => {
    // ✅ Skip multer if not multipart
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  uploadImageMulter(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// For Media Files (100MB limit: images, videos, audios, pdfs)
exports.uploadMedia = (req, res, next) => {
  uploadMediaMulter(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// For Cover Images (5MB limit)
exports.uploadCover = (req, res, next) => {
  uploadCoverMulter(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};