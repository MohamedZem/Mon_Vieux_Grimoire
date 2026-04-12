const mongoose = require('mongoose');
// Plugin permettant de gérer les erreurs liées aux champs uniques (ex : email déjà utilisé).
const uniqueValidator = require('mongoose-unique-validator').default; 

const userSchema = mongoose.Schema({
   // Assure que chaque email est unique dans la base de données.
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
// Appliquer le plugin de validation d'unicité au schéma.
userSchema.plugin(uniqueValidator); 


module.exports = mongoose.model('User', userSchema);