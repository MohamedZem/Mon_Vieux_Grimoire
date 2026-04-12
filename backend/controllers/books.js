const Book = require('../models/Books');
const fs = require('fs');

function normalizeText(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactCaseInsensitiveRegex(value = '') {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

// Création d'un nouveau livre.
exports.createBook = (req, res, next) => {
     try {
      // Vérifie que le fichier image est présent dans la requête.
    if (!req.file) {
      // Si aucune image n'est fournie, retourne une erreur.
      return res.status(400).json({ error: 'Image obligatoire' });
    };
    // Les données du livre arrivent sous forme de chaîne JSON via FormData.
    const bookObject = JSON.parse(req.body.book);
    const cleanTitle = normalizeText(bookObject.title);
    const cleanAuthor = normalizeText(bookObject.author);
    const cleanYear = Number(bookObject.year);
    // Supprime les propriétés _id et _userId du livre pour éviter les conflits avec la base de données.
    delete bookObject._id;
    delete bookObject._userId;
    // Vérifie si un livre avec le même titre, auteur et année existe déjà pour éviter les doublons.
    Book.findOne({
      title: exactCaseInsensitiveRegex(cleanTitle),
      author: exactCaseInsensitiveRegex(cleanAuthor),
      year: cleanYear
    })
      .then(existingBook => {
        if (existingBook) {
          // Si un livre similaire existe déjà, Affiche un message d'erreur indiquant que le livre existe déjà, en précisant si c'est l'utilisateur qui a déjà ajouté ce livre ou si c'est un autre utilisateur.
          // supprime l'image téléchargée pour éviter les fichiers inutiles. 
          const message = existingBook.userId === req.auth.userId
            ? 'Vous avez déjà ajouté ce livre.'
            : 'Ce livre existe déjà.';
          return fs.unlink(`images/${req.file.filename}`, () => {
            res.status(400).json({ message });
          });
        }
    // // Création du document Book avec les données nettoyées.    
    const book = new Book({
        ...bookObject,
      title: cleanTitle,
      author: cleanAuthor,
      year: cleanYear,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // Enregistre le livre dans la base de données et retourne une réponse de succès.
     return book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
})
        .catch(error => res.status(400).json({ error }));
} catch (error) {
  // Erreur lors de la création du livre.
      return res.status(400).json({ error: 'Payload invalide (book/image)' });
  }
};
// Récupère un livre spécifique par son ID.
exports.getOneBook = (req, res, next) => {
    // Récupère un livre spécifique par son ID.
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};
// Modifie un livre existant.
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    const cleanTitle = normalizeText(bookObject.title);
    const cleanAuthor = normalizeText(bookObject.author);
    const cleanYear = Number(bookObject.year);
    // On empêche l'utilisateur de modifier artificiellement l'identifiant du propriétaire.
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
          // Vérification que l'utilisateur connecté est bien le propriétaire du livre.
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                Book.findOne({
                  _id: { $ne: req.params.id },
                  title: exactCaseInsensitiveRegex(cleanTitle),
                  author: exactCaseInsensitiveRegex(cleanAuthor),
                  year: cleanYear
                })
                    .then((existingBook) => {
                      if (existingBook) {
                        if (req.file) {
                          fs.unlink(`images/${req.file.filename}`, () => {
                            res.status(400).json({ message: 'Ce livre existe déjà.' });
                          });
                          return;
                        }
                        res.status(400).json({ message: 'Ce livre existe déjà.' });
                        return;
                      }

                      Book.updateOne({ _id: req.params.id }, {
                        ...bookObject,
                        title: cleanTitle,
                        author: cleanAuthor,
                        year: cleanYear,
                        _id: req.params.id
                      })
                        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                        .catch(error => res.status(401).json({ error }));
                    })
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

// Supprime un livre existant.
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
              // // Récupération du nom de fichier à partir de l'URL complète de l'image.
                const filename = book.imageUrl.split('/images/')[1];
                // Supprime le fichier image associé au livre avant de supprimer le document du livre de la base de données.
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};
// Récupère tous les livres.
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};
// Récupère les 3 livres les mieux notés.
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
// Permet à un utilisateur de noter un livre.
exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId;
  const grade = Number(req.body.rating);
  // Vérifie que la note est un entier compris entre 0 et 5.
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 étoiles.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
      }
      // Vérifie si l'utilisateur a déjà noté ce livre pour éviter les notes multiples.
      const alreadyRated = book.ratings.find(rating => rating.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Livre déjà noté par cet utilisateur' });
      }
      // Ajoute la nouvelle note.
      book.ratings.push({
        userId,
        grade
      });
      // Recalcule la note moyenne.
      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = total / book.ratings.length;

      return book.save().then(updatedBook => {
        res.status(200).json(updatedBook);
      });
    })
    .catch(error => res.status(400).json({ error }));
};

