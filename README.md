# 📚 Mon Vieux Grimoire

Application full-stack de gestion et de notation de livres.

## 🧾 Description

Mon Vieux Grimoire est une application web permettant aux utilisateurs de :

- ✅ S'inscrire et se connecter
- ✅ Ajouter des livres avec une image
- ✅ Modifier et supprimer leurs livres
- ✅ Noter des livres (0–5)
- ✅ Consulter les livres les mieux notés

| Couche    | Technologie                        |
|-----------|------------------------------------|
| Frontend  | React 18, React Router, Axios      |
| Backend   | Node.js, Express 5, Mongoose       |
| Base de données | MongoDB Atlas               |
| Auth      | JWT + bcrypt                       |
| Upload    | Multer + Sharp (images optimisées) |

---

## Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Un cluster MongoDB Atlas

---

## Installation


git clone https://github.com/MohamedZem/Mon_Vieux_Grimoire.git

cd Mon_Vieux_Grimoire

Ouvrir **deux terminaux séparés**.

cd backend 
npm install

cd frontend
npm install
```

---

## Configuration

Créer un fichier .env à la racine du dossier backend :

PORT=4200
DB_USER=your_mongodb_user
DB_PASSWORD=your_mongodb_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key

Le fichier .env n’est pas versionné pour des raisons de sécurité.
```

> La valeur de `PORT` doit correspondre au port que le frontend utilise pour appeler l'API.

### Frontend

Par défaut le frontend appelle `http://localhost:4200`.  
Pour changer l'URL de l'API, créer `frontend/.env` :

```env
REACT_APP_API_URL=http://localhost:4200
```
## Lancer le projet

**Terminal 1 — Backend :**

```bash
npm run dev
```

**Terminal 2 — Frontend :**

```bash
npm start
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:4200  |

---

### 👤 Compte de test

Vous pouvez utiliser les identifiants suivants pour tester l'application :

- **Email** : tests@test.fr
- **Mot de passe** : 1234

---

## Architecture

```
Mon-Vieux-Grimoire/
├── README.md
├── backend/
│   ├── app.js                 # Express, CORS, routes, /images statique
│   ├── package.json
│   ├── server.js              # Démarrage HTTP, gestion du port
│   ├── controllers/
│   │   ├── books.js           # CRUD livres, notation, anti-doublon
│   │   └── user.js            # Inscription, connexion
│   ├── middleware/
│   │   ├── auth.js            # Vérification token JWT
│   │   ├── multer-config.js   # Configuration Multer pour upload
│   │   └── sharp.js           # Compression et conversion d'images
│   ├── models/
│   │   ├── Books.js           # Schéma Mongoose livre
│   │   └── User.js            # Schéma Mongoose utilisateur
│   ├── routes/
│   │   ├── books.js           # Endpoints /api/books
│   │   └── user.js            # Endpoints /api/auth
│   └── images/                # Fichiers images uploadés
│
└── frontend/
    ├── package.json
    ├── README.md
    ├── Dockerfile
    ├── babel-plugin-macros.config.js
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   ├── robots.txt
    │   └── data/
    │       └── data.json
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── App.test.js
    │   ├── index.js
    │   ├── index.css
    │   ├── reportWebVitals.js
    │   ├── setupTests.js
    │   ├── components/
    │   │   ├── BackArrow/
    │   │   │   └── BackArrow.jsx
    │   │   ├── Books/
    │   │   │   ├── BestRatedBooks/
    │   │   │   │   ├── BestRatedBooks.jsx
    │   │   │   │   └── BestRatedBooks.module.css
    │   │   │   ├── BookForm/
    │   │   │   │   ├── BookForm.jsx
    │   │   │   │   └── BookForm.module.css
    │   │   │   ├── BookInfo/
    │   │   │   │   └── BookInfo.jsx
    │   │   │   ├── BookItem/
    │   │   │   │   ├── BookItem.jsx
    │   │   │   │   └── BookItem.module.css
    │   │   │   └── BookRatingForm/
    │   │   │       ├── BookRatingForm.jsx
    │   │   │       └── BookRatingForm.module.css
    │   │   ├── Footer/
    │   │   │   ├── Footer.jsx
    │   │   │   └── Footer.module.css
    │   │   ├── Header/
    │   │   │   ├── Header.jsx
    │   │   │   └── Header.module.css
    │   │   └── ScrollToTop/
    │   │       └── ScrollToTop.jsx
    │   ├── images/
    │   ├── lib/
    │   │   ├── common.js      # Appels API (axios)
    │   │   ├── functions.jsx  # Rendu étoiles (demi-étoiles incluses)
    │   │   └── customHooks.js # Hooks personnalisés
    │   ├── pages/
    │   │   ├── AddBook/
    │   │   │   ├── AddBook.jsx
    │   │   │   └── AddBook.module.css
    │   │   ├── Book/
    │   │   │   ├── Book.jsx
    │   │   │   └── Book.module.css
    │   │   ├── Home/
    │   │   │   ├── Home.jsx
    │   │   │   └── Home.module.css
    │   │   ├── SignIn/
    │   │   │   ├── SignIn.jsx
    │   │   │   └── SignIn.module.css
    │   │   └── updateBook/
    │   │       ├── UpdateBook.jsx
    │   │       └── UpdateBook.module.css
    │   └── utils/
    │       └── constants.js   # URL API et routes frontend
    └── build/
        ├── index.html
        ├── manifest.json
        ├── robots.txt
        ├── asset-manifest.json
        ├── data/
        │   └── data.json
        └── static/
            ├── css/
            ├── js/
            └── media/
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

## 🖼️ Gestion des images

Les images uploadées sont :

- **Traitées en mémoire** avec Multer (pas de fichier temporaire)
- **Compressées** avec Sharp
- **Converties en WebP** (optimisation Green Code)
- **Redimensionnées** pour l'optimisation
- **Stockées** dans `backend/images`
- **Exposées** en tant que ressources statiques via `/images`

---

## 🔒 Sécurité

- **Mots de passe** : hashés avec bcrypt
- **Authentification** : JWT avec expiration 24h
- **Routes protégées** : middleware qui vérifie le token avant d'accorder l'accès
- **Validation des fichiers** : type (jpg, png) + taille maximale
- **Suppression automatique** : les images orphelines sont supprimées quand un livre est supprimé
- **Protection contre les doublons** : même titre, auteur et année refusés (case-insensitive)

---

## Scripts disponibles

**Backend :**

```bash
npm run dev    # Serveur avec rechargement automatique (nodemon)
npm run start  # Serveur sans rechargement
```

**Frontend :**

```bash
npm start        # Serveur de développement
npm run build    # Build de production
npm test         # Tests
```
