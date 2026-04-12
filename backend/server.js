const http = require('http');
const app = require('./app');
// ajouter une fonction normalizePort pour éviter les erreurs de port déjà utilisé ou de port non valide
const normalizePort = val => {
  const port = parseInt(val, 10);
// Si val n'est pas un nombre, retourner val tel quel.
  if (isNaN(port)) {
    return val;
  }
  // Si port est un nombre positif, le retourner.
  if (port >= 0) {
    return port;
  }
  return false;
};
// Définition du port : soit via variable d'environnement, soit 4000 par défaut
const port = normalizePort(process.env.PORT ||'4000');
// Enregistre le port dans l'application Express
app.set('port', port);

// Ajouter une fonction de gestion des erreurs pour le serveur HTTP.
const errorHandler = error => {
  // Si l'erreur n'est pas liée à l'écoute du port, on la relance.
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  // Détermine si l'adresse est un pipe ou un port et crée une description pour les messages d'erreur.
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      // Si l'erreur est liée à des permissions insuffisantes, afficher un message d'erreur et quitter le processus.
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // Si l'erreur est liée à l'adresse déjà utilisée, afficher un message d'erreur et quitter le processus.
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Créer le serveur HTTP en utilisant l'application Express.
const server = http.createServer(app);
// Ajouter des écouteurs d'événements pour gérer les erreurs et le démarrage du serveur.
server.on('error', errorHandler);
// Ajouter un écouteur d'événement pour afficher un message lorsque le serveur commence à écouter.
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
