const jwt = require('jsonwebtoken');

/**
 * Middleware d’authentification :
 * - récupère le token JWT envoyé dans le header Authorization
 * - vérifie sa validité avec la clé secrète
 * - extrait l’identifiant utilisateur contenu dans le token
 * - attache cet identifiant à la requête (req.auth)
 * - autorise la suite du traitement si tout est valide
 * - bloque la requête avec une erreur 401 si le token est invalide ou absent
 */
module.exports = (req, res, next) => {
  try {
    console.log('AUTH HEADER =', req.headers.authorization);

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    req.auth = { userId };
    next();
    
  } catch (error) {
    console.log('ERREUR AUTH =', error);
    res.status(401).json({ message: 'Requête non authentifiée', });
  }
};