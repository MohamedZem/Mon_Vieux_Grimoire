const Book = require('../models/Books');
const fs = require('fs');
const path = require('path');

function normalizeText(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactCaseInsensitiveRegex(value = '') {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

/**
 * Crée un nouveau livre :
 * - vérifie qu'une image a bien été envoyée
 * - parse et nettoie les données reçues dans req.body.book
 * - empêche l'utilisation d'un _id ou d'un _userId fournis par le client
 * - vérifie qu'un livre équivalent n'existe pas déjà
 * - supprime l'image uploadée si un doublon est détecté
 * - enregistre le livre avec l'utilisateur authentifié comme propriétaire
 */
exports.createBook = (req, res, next) => {
     try {
      
    if (!req.file) {
      return res.status(400).json({ error: 'Image obligatoire' });
    };

    const bookObject = JSON.parse(req.body.book);
    const cleanTitle = normalizeText(bookObject.title);
    const cleanAuthor = normalizeText(bookObject.author);
    const cleanYear = Number(bookObject.year);
    
    delete bookObject._id;
    delete bookObject._userId;
    
    Book.findOne({
      title: exactCaseInsensitiveRegex(cleanTitle),
      author: exactCaseInsensitiveRegex(cleanAuthor),
      year: cleanYear
    })
      .then(existingBook => {
        if (existingBook) {
          const message = existingBook.userId === req.auth.userId
            ? 'Vous avez déjà ajouté ce livre.'
            : 'Ce livre existe déjà.';

          const imagePath = path.join('images', req.processedImageFilename);

          return fs.unlink(imagePath, () => {
            res.status(400).json({ message });
          });
        }    
    const book = new Book({
        ...bookObject,
      title: cleanTitle,
      author: cleanAuthor,
      year: cleanYear,
      userId: req.auth.userId,
      imageUrl: req.processedImageFilename
    });
    
     return book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
})
        .catch(error => res.status(400).json({ error }));
} catch (error) {
    return res.status(400).json({ error: 'Payload invalide (book/image)' });
  }
};

/**
 * Récupère un livre à partir de son identifiant.
 * Retourne le document trouvé ou une erreur 404 si aucun livre ne correspond.
 */
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

/**
 * Modifie un livre existant :
 * - reconstruit les données du livre selon qu'une nouvelle image est fournie ou non
 * - nettoie les champs titre, auteur et année
 * - interdit la modification du propriétaire via _userId
 * - vérifie que l'utilisateur connecté est bien le propriétaire du livre
 * - contrôle qu'aucun autre livre identique n'existe déjà
 * - supprime la nouvelle image uploadée si la modification est refusée
 * - met à jour le livre en base avec les données nettoyées
 * * - supprime l'ancienne image si une nouvelle a bien été validée
 */
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`
      }
    : { ...req.body };

  const cleanTitle = normalizeText(bookObject.title);
  const cleanAuthor = normalizeText(bookObject.author);
  const cleanYear = Number(bookObject.year);

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        if (req.file) {
          fs.unlink(`images/${req.processedImageFilename}`, () => {});
        }
        return res.status(401).json({ message: 'Non autorisé' });
      }

      Book.findOne({
        _id: { $ne: req.params.id },
        title: exactCaseInsensitiveRegex(cleanTitle),
        author: exactCaseInsensitiveRegex(cleanAuthor),
        year: cleanYear
      })
        .then((existingBook) => {
          if (existingBook) {
            if (req.file) {
              fs.unlink(`images/${req.processedImageFilename}`, () => {
                res.status(400).json({ message: 'Ce livre existe déjà.' });
              });
              return;
            }
            return res.status(400).json({ message: 'Ce livre existe déjà.' });
          }

          const oldFilename = book.imageUrl.split('/images/')[1];

          Book.updateOne(
            { _id: req.params.id },
            {
              ...bookObject,
              title: cleanTitle,
              author: cleanAuthor,
              year: cleanYear,
              _id: req.params.id
            }
          )
            .then(() => {
              if (req.file) {
                fs.unlink(`images/${oldFilename}`, (err) => {
                  if (err) {
                    console.log('Erreur suppression ancienne image :', err);
                  }
                });
              }

              res.status(200).json({ message: 'Livre modifié !' });
            })
            .catch((error) => {
              if (req.file) {
                fs.unlink(`images/${req.processedImageFilename}`, () => {});
              }
              res.status(401).json({ error });
            });
        })
        .catch((error) => {
          if (req.file) {
            fs.unlink(`images/${req.processedImageFilename}`, () => {});
          }
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      if (req.file) {
        fs.unlink(`images/${req.processedImageFilename}`, () => {});
      }
      res.status(400).json({ error });
    });
};
/**
 * Supprime un livre existant :
 * - vérifie que l'utilisateur connecté est le propriétaire du livre
 * - extrait le nom du fichier image depuis l'URL stockée en base
 * - supprime d'abord l'image du dossier local
 * - supprime ensuite le livre correspondant dans la base de données
 */
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};
/**
 * Récupère tous les livres présents en base.
 * Retourne la liste complète sans filtrage.
 */
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

/**
 * Récupère les 3 livres ayant la meilleure note moyenne.
 * Les résultats sont triés par moyenne décroissante.
 */
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Ajoute une note à un livre :
 * - récupère l'utilisateur authentifié et la note envoyée
 * - vérifie que la note est un entier entre 0 et 5
 * - charge le livre concerné
 * - empêche un même utilisateur de noter plusieurs fois le même livre
 * - ajoute la nouvelle note dans le tableau ratings
 * - recalcule la moyenne globale averageRating
 * - enregistre puis retourne le livre mis à jour
 */
exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId;
  const grade = Number(req.body.rating);
  
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 étoiles.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
      }
      const alreadyRated = book.ratings.find(rating => rating.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Livre déjà noté par cet utilisateur' });
      }
      book.ratings.push({
        userId,
        grade
      });
      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = total / book.ratings.length;

      return book.save().then(updatedBook => {
        res.status(200).json(updatedBook);
      });
    })
    .catch(error => res.status(400).json({ error }));
};

