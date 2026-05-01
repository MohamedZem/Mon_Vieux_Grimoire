const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Inscription d’un nouvel utilisateur :
 * - récupère l’email et le mot de passe envoyés dans la requête
 * - hache le mot de passe avec bcrypt
 * - crée un nouvel utilisateur avec le mot de passe sécurisé
 * - enregistre l’utilisateur en base de données
 * - retourne une réponse de succès ou d’erreur
 */

exports.signup = (req, res, next) => {
    console.log('BODY SIGNUP : ',req.body);

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => {
            console.log('ERREUR SIGNUP COMPLETE :', error);
            res.status(500).json({ error });
});
};
 
/**
 * Connexion d’un utilisateur existant :
 * - recherche un utilisateur correspondant à l’email fourni
 * - retourne une erreur si aucun utilisateur n’est trouvé
 * - compare le mot de passe fourni avec le mot de passe haché en base
 * - retourne une erreur si les identifiants sont incorrects
 * - génère un token JWT si l’authentification est valide
 * - renvoie l’identifiant utilisateur et le token au client
 */
exports.login = (req, res, next) => {
    console.log('BODY LOGIN :', req.body);

    User.findOne({ email: req.body.email })
        .then(user => {
            console.log('USER TROUVE :', user);

            if (user === null) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    console.log('PASSWORD VALID :', valid);

                    if (!valid) {
                        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => {
                    console.log('ERREUR BCRYPT :', error);
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            console.log('ERREUR LOGIN :', error);
            res.status(500).json({ error });
        });
};