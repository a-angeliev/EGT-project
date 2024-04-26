const Card = require("./../models/cardModel");

const createCard = async (req, res, next) => {
    console.log(req.user);
    try {
        const newCard = await Card.create({ ...req.body, user: req.user._id });
        res.status(200).json({ status: "success", card_information: newCard });
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { createCard };
