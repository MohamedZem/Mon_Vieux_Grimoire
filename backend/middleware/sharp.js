const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Middleware de compression d'image.
 * - lit le fichier reçu par Multer depuis req.file.buffer
 * - redimensionne l'image si nécessaire
 * - convertit l'image en WebP
 * - enregistre le fichier compressé dans /images
 * - stocke le nom final dans req.processedImageFilename
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const imagesDir = path.join(__dirname, '..', 'images');

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const baseName = path.parse(req.file.originalname).name
      .replace(/\s+/g, '_')
      .replace(/[^\w-]/g, '');

    const filename = `${baseName}-${Date.now()}.webp`;
    const outputPath = path.join(imagesDir, filename);

    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 72 })
      .toFile(outputPath);

    req.processedImageFilename = filename;
    next();
  } catch (error) {
    console.error('ERREUR SHARP =', error);
    res.status(500).json({ error: 'Erreur lors du traitement de l’image.' });
  }
};