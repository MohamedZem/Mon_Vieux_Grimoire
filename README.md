# Mon Vieux Grimoire

Application full-stack de gestion et de notation de livres.

| Couche    | Technologie                        |
|-----------|------------------------------------|
| Frontend  | React 18, React Router, Axios      |
| Backend   | Node.js, Express 5, Mongoose       |
| Base de données | MongoDB Atlas               |
| Auth      | JWT + bcrypt                       |
| Upload    | Multer (images locales)            |

---

## Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Un cluster MongoDB Atlas

---

## Installation

Depuis la racine du projet :

```bash
npm --prefix backend install
npm --prefix frontend install
```

---

## Configuration

### Backend

Copier le fichier exemple :

```bash
cp backend/.env.dist backend/.env
```

Renseigner `backend/.env` :

```env
DB_USER=ton_user_mongodb
DB_PASSWORD=ton_password_mongodb
DB_NAME=nom_de_ta_base
PORT=4200
```

> La valeur de `PORT` doit correspondre au port que le frontend utilise pour appeler l'API.

### Frontend

Par défaut le frontend appelle `http://localhost:4200`.  
Pour changer l'URL de l'API, créer `frontend/.env` :

```env
REACT_APP_API_URL=http://localhost:4200
```

---

## Lancer le projet

Ouvrir **deux terminaux séparés**.

**Terminal 1 — Backend :**

```bash
npm --prefix backend run dev
```

**Terminal 2 — Frontend :**

```bash
npm --prefix frontend start
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:4200  |

---

## Architecture

```
Mon-Vieux-Grimoire/
├── backend/
│   ├── server.js              # Démarrage HTTP, gestion du port
│   ├── app.js                 # Express, CORS, routes, /images statique
│   ├── controllers/
│   │   ├── books.js           # CRUD livres, notation, anti-doublon
│   │   └── user.js            # Inscription, connexion
│   ├── models/
│   │   ├── Books.js           # Schéma Mongoose livre
│   │   └── User.js            # Schéma Mongoose utilisateur
│   ├── routes/
│   │   ├── books.js           # Endpoints /api/books
│   │   └── user.js            # Endpoints /api/auth
│   ├── middleware/
│   │   ├── auth.js            # Vérification token JWT
│   │   └── multer-config.js   # Upload image (jpg, png)
│   └── images/                # Fichiers images uploadés
└── frontend/
    └── src/
        ├── pages/             # Accueil, Connexion, Ajout, Détail, Modification
        ├── components/        # Composants réutilisables (BookItem, BookForm…)
        ├── lib/
        │   ├── common.js      # Appels API (axios)
        │   ├── functions.jsx  # Rendu étoiles (demi-étoiles incluses)
        │   └── customHooks.js # Hooks personnalisés
        └── utils/
            └── constants.js   # URL API et routes frontend
```

---

## Endpoints API

### Authentification

| Méthode | Endpoint             | Description         |
|---------|----------------------|---------------------|
| POST    | /api/auth/signup     | Créer un compte     |
| POST    | /api/auth/login      | Se connecter (JWT)  |

### Livres *(routes protégées sauf GET)*

| Méthode | Endpoint                  | Description                     |
|---------|---------------------------|---------------------------------|
| GET     | /api/books                | Liste tous les livres           |
| GET     | /api/books/bestrating     | 3 livres les mieux notés        |
| GET     | /api/books/:id            | Détail d'un livre               |
| POST    | /api/books                | Ajouter un livre + image        |
| PUT     | /api/books/:id            | Modifier un livre               |
| DELETE  | /api/books/:id            | Supprimer un livre              |
| POST    | /api/books/:id/rating     | Noter un livre (0–5)            |

---

## Fonctionnalités clés

- **Authentification** : inscription et connexion sécurisées (mot de passe haché avec bcrypt, session via token JWT valable 24h).
- **Gestion des livres** : ajout, modification et suppression réservés au propriétaire du livre.
- **Anti-doublon intelligent** : un livre avec le même titre, auteur et année est refusé, quelle que soit la casse (*"harry potter"* et *"Harry Potter"* sont considérés identiques).
- **Upload d'image** : Multer enregistre les images dans `backend/images`, exposé en statique via `/images`.
- **Notation** : chaque utilisateur peut noter un livre une seule fois (note entière de 0 à 5). La moyenne est recalculée automatiquement.
- **Affichage des étoiles** : demi-étoile affichée pour les moyennes décimales (ex : 4,5 → ★★★★½).

---

## Scripts disponibles

**Backend :**

```bash
npm --prefix backend run dev    # Serveur avec rechargement automatique (nodemon)
npm --prefix backend run start  # Serveur sans rechargement
```

**Frontend :**

```bash
npm --prefix frontend start        # Serveur de développement
npm --prefix frontend run build    # Build de production
npm --prefix frontend test         # Tests
```
