const Deposit = require("./../models/depositModel");
const Card = require("./../models/cardModel");
const AppError = require("../utils/appError");

const depositFunds = async (req, res, next) => {
    try {
        const card = await Card.findById(req.body.card_id);

        if (req.body.amount <= 0) return next(new AppError("You cannot deposit negative amount", 400));
        if (!card) return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));
        if (card.user._id.toString() !== req.user._id.toString())
            return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));

        const deposit = await Deposit.create({ amount: req.body.amount, card_id: card._id });
        res.status(200).json({ status: "success", deposit });
    } catch (err) {
        next(err);
    }
};

module.exports = { depositFunds };
