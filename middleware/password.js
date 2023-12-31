const passwordSchema = require("../models/password");

module.exports = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    return res.status(400).json({
      message: "Le mot de passe doit comprendre 8 caractères dont deux chiffres, un caractère spécial et sans espaces."
    });
  } else {
    next();
  }
};