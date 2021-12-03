const Sauce = require("../models/Sauce");
const fs = require("fs");
const { log } = require("console");

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
        likes: 0,
        dislikes: 0,
        usersDisliked: [],
        usersLiked: [],
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch((error) => res.status(400).json({ error }));
};
exports.like = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const like = req.body.like;
            if (sauce.usersLiked.includes(req.body.userId)) {
                sauce.likes--;
                const index = sauce.usersLiked.indexOf(req.body.userId);
                sauce.usersLiked.splice(index, 1);
            } else if (like === 1) {
                sauce.likes++;
                sauce.usersLiked.push(req.body.userId);
            }
            if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.dislikes--;
                const index = sauce.usersDisliked.indexOf(req.body.userId);
                sauce.usersDisliked.splice(index, 1);
            } else if (like === -1) {
                sauce.dislikes++;
                sauce.usersDisliked.push(req.body.userId);
            }
            console.log(sauce);
            sauce
                .save()
                .then(() => res.status(200).json({ message: "OK" }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
};
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({ error }));
};
exports.modifySauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1];
            if (req.file) {
                fs.unlink(`images/${filename}`, () => {});
                const sauceObject = {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get("host")}/images/${
                        req.file.filename
                    }`,
                };
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: "Sauce modifiée !" })
                    )
                    .catch((error) => res.status(400).json({ error }));
            } else {
                const sauceObject = {
                    ...req.body,
                };
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: "Sauce modifiée !" })
                    )
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "OK" }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch((error) => res.status(500).json({ error }));
};
