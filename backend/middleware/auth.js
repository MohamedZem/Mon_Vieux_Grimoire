const jwt = require('jsonwebtoken');
// Middleware d'authentification pour protéger les routes nécessitant une authentification.
module.exports = (req, res, next) => {
  try {
    // Vérifie que le header Authorization est présent et contient un token.
    console.log('AUTH HEADER =', req.headers.authorization);
    // Extrait le token du header Authorization
    const token = req.headers.authorization.split(' ')[1];
    // Vérifie et décode le token pour obtenir l'ID de l'utilisateur.
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    // Extraction de l'identifiant utilisateur contenu dans le token décodé.
    const userId = decodedToken.userId;
    // Ajoute l'identifiant utilisateur à la requête pour les middlewares suivants.
    req.auth = { userId };
    next();

  } catch (error) {
    // On ajoute l'utilisateur à la requête pour les middlewares suivants.
    console.log('ERREUR AUTH =', error);
    res.status(401).json({ error: error | 'Requête non authentifiée' });
  }
};