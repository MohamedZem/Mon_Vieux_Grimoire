const multer = require('multer');

// Dictionnaire des types MIME pour les images autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

/**
 * Stockage en mémoire :
 * Multer place le fichier dans req.file.buffer
 * au lieu de l’écrire directement sur le disque.
 */
const storage = multer.memoryStorage();

/**
 * Filtre des fichiers :
 * - vérifie que le type MIME est autorisé
 * - accepte ou rejette le fichier en conséquence
 */
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

/**
 * Export du middleware multer :
 * - stockage en mémoire
 * - filtrage des fichiers
 * - limitation de la taille (10 Mo max)
 * - attente d’un seul fichier nommé "image"
 */
module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Mo max
  }
}).single('image');