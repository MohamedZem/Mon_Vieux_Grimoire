const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const BookCtrl = require('../controllers/books');

// Routes publiques (pas d'authentification requise)
router.get('/', BookCtrl.getAllBooks);
router.get('/bestrating', BookCtrl.getBestRatedBooks);
router.get('/:id', BookCtrl.getOneBook);

// Routes protégées (authentification requise)
router.post('/', auth, multer, BookCtrl.createBook);
router.post('/:id/rating', auth, BookCtrl.rateBook);
router.put('/:id', auth, multer, BookCtrl.modifyBook);
router.delete('/:id', auth, BookCtrl.deleteBook);


module.exports = router;