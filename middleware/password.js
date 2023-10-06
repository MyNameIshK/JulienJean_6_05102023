// On récupère le model du mot de passe.

const passwordSchema = require("../models/password");

// On vérifie que le mot de passe est correct avec notre model.

module.exports = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    res.writeHead(
      400,
      "Le mot de passe doit comprendre 8 caractères dont deux chiffres, un caractère et sans espaces",
      {
        "content-type": "application/json",
      }
    );
    res.end("Le format du mot de passe est incorrect.");
  } else {
    next();
  }
};