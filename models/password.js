const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
  .is().min(8) // Longueur minimum de 8 lettres.
  .is().max(20) // Longueur maximale de 20 lettres.
  .has().uppercase(1) // Au moins 1 lettre majuscule.
  .has().lowercase(1) // Au moins 1 lettre minuscule.
  .has().digits(2) // Au moins 2 chiffres.
  .has().symbols(1) // Au moins 1 caractère spécial.
  .has().not().spaces() // Ne doit pas contenir d'espaces.

module.exports = passwordSchema;