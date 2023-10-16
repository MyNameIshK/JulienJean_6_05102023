const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.likeDislike = (req, res, next) => {
    const userId = req.auth.userId;
    const like = req.body.like;

    if (like === -1 || like === 0 || like === 1) {
        const sauceId = req.params.id;
        Sauce.findById(sauceId)
            .then((sauce) => {
                if (!sauce) { return res.status(404).json({ message: "Sauce non trouvée" }) }

                const userLiked = sauce.usersLiked.includes(userId);
                const userDisliked = sauce.usersDisliked.includes(userId);

                if (like === 1 && !userLiked) {
                    Sauce.updateOne(
                        { _id: sauceId },
                        {
                            $inc: { likes: 1 },
                            $push: { usersLiked: userId },
                        }
                    )
                        .then(() => { res.status(200).json({ message: "Like ajouté avec succès" }) })
                        .catch((error) => { res.status(500).json({ error }) });
                } else if (like === -1 && !userDisliked) {
                    Sauce.updateOne(
                        { _id: sauceId },
                        {
                            $inc: { dislikes: 1 },
                            $push: { usersDisliked: userId },
                        }
                    )
                        .then(() => { res.status(200).json({ message: "Dislike ajouté avec succès" }) })
                        .catch((error) => { res.status(500).json({ error }) });
                } else if (like === 0) {
                    if (userLiked) {
                        Sauce.updateOne(
                            { _id: sauceId },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: userId },
                            }
                        )
                            .then(() => { res.status(200).json({ message: "Like annulé avec succès" }) })
                            .catch((error) => { res.status(500).json({ error }) });
                    } else if (userDisliked) {
                        Sauce.updateOne(
                            { _id: sauceId },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId },
                            }
                        )
                            .then(() => { res.status(200).json({ message: "Dislike annulé avec succès" }) })
                            .catch((error) => { res.status(500).json({ error }) });
                    }
                }
            })
            .catch((error) => { res.status(500).json({ error }); });
    } else { res.status(400).json({ message: "Valeur de like invalide" }); }
};