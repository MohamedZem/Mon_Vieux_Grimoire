const multer = require('multer');

// Dictionnaire des types MIME pour les images autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'images/webp': 'webp'
};

/**
 * Stockage en mémoire :
 * Multer place alors le fichier dans req.file.buffer
 * au lieu de l’écrire directement sur le disque.
 */
const storage = multer.memoryStorage();

 const fileFilter = (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(
        new Error('Type de fichier non autorisé. Formats acceptés : jpg, jpeg, png, webp'),
        false
      );
    }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 5 Mo max
  }
}).single('image');