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
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch((error) => res.status(400).json({ error }));
};
exports.like = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.likes === undefined) {
                sauce.likes = 0;
            } else if (sauce.dislikes === undefined) {
                sauce.dislikes = 0;
            }
            
            const like = req.body.like;
            if (sauce.usersLiked.includes(req.body.userId)) {
                sauce.likes--;
                for (let i = 0; i < sauce.usersLiked.length; i++) {
                    if (sauce.usersLiked[i] === req.body.userId) {
                        sauce.usersLiked.splice(i, 1);
                    }
                }
            } else if (like === 1) {
                sauce.likes++;
                sauce.usersLiked.push(req.body.userId);
                console.log("like = 1");
            }

            if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.dislikes--;
                for (let i = 0; i < sauce.usersDisliked.length; i++) {
                    if (sauce.usersDisliked[i] === req.body.userId) {
                        sauce.usersDisliked.splice(i, 1);
                    }
                }
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
            // const sauceObject = req.file
            //     ? {
            //           ...JSON.parse(req.body.sauce),
            //           imageUrl: `${req.protocol}://${req.get(
            //               "host"
            //           )}/images/${req.file.filename}`,
            //       }
            //     : {
            //           ...req.body,
            //       };
            // Sauce.updateOne(
            //     { _id: req.params.id },
            //     { ...sauceObject, _id: req.params.id }
            // )
            //     .then(() =>
            //         res.status(200).json({ message: "Sauce modifiée !" })
            //     )
            //     .catch((error) => res.status(400).json({ error }));
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
