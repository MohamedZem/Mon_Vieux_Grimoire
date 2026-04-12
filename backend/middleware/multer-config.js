// Configuration de Multer pour la gestion des fichiers (images de livres)
const multer = require('multer');
// Dictionnaire des types MIME pour les images autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
  // Destination des fichiers : dossier 'images'
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Définit le nom du fichier enregistré : nom d'origine sans espaces + timestamp pour éviter les doublons + extension
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage }).single('image');