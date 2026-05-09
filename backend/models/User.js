const mongoose = require('mongoose');
const validator = require('validator');

const uniqueValidator = require('mongoose-unique-validator').default; 

// Assure que chaque email est unique dans la base de données.
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, validate: { validator: validator.isEmail, message: 'Adresse email invalide'} },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); 


module.exports = mongoose.model('User', userSchema);