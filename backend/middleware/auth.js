const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({ encoding: "latin1" });

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decodedToken.userId;
        req.auth = { userId: userId };
        if (req.body.userId && req.body.userId !== userId) {
            throw "User id no valid";
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | "Requete unidentified" });
    }
};