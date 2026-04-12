// bcrypt permet de hacher les mots de passe avant stockage.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
// Inscription d'un nouvel utilisateur.
exports.signup = (req, res, next) => {
    console.log('BODY SIGNUP : ',req.body);
    // Hache le mot de passe avec bcrypt avant de le stocker dans la base de données.
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Enregistre le nouvel utilisateur dans la base de données.
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => {
            // Affiche l'erreur dans la console pour le développement.
            console.log('ERREUR SIGNUP COMPLETE :', error);
            res.status(500).json({ error });
});
};
 // Connexion d'un utilisateur existant.
exports.login = (req, res, next) => {
    console.log('BODY LOGIN :', req.body);
    // Vérifie si un utilisateur avec cet email existe.
    User.findOne({ email: req.body.email })
        .then(user => {
            // Affiche l'utilisateur trouvé dans la console pour le développement.
            console.log('USER TROUVE :', user);

            if (user === null) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
            }

            // Compare le mot de passe fourni avec le mot de passe haché stocké dans la base de données.
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    console.log('PASSWORD VALID :', valid);

                    if (!valid) {
                        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
                    }
                    // Si le mot de passe est valide, génère un token JWT pour l'authentification future.
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                // Erreur lors de la comparaison des mots de passe.
                .catch(error => {
                    console.log('ERREUR BCRYPT :', error);
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            // Erreur lors de la recherche de l'utilisateur en base de données.
            console.log('ERREUR LOGIN :', error);
            res.status(500).json({ error });
        });
};