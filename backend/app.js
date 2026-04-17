const express = require('express');

const path = require('path');

require('dotenv').config();

const mongoose = require('mongoose');

// Création de l'application Express
const app = express();

// Importation des routes pour les livres et les utilisateurs
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Connexion à la base de données MongoDB Atlas avec gestion des promesses pour afficher les messages de succès ou d'erreur
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.o5gpsre.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error)); // Afficher l'erreur
//Body-parser ancien modèle intégré à Express pour analyser les requêtes JSON
  app.use(express.json());   

  // Middleware CORS : Permet d'autoriser les requêtes provenant d'autres origines (ex : frontend React)
  app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utilisation des routes pour les livres et les utilisateurs, ainsi que la gestion des fichiers statiques pour les images
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;