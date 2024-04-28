const Card = require("./../models/cardModel");
const AppError = require("./../utils/appError");
const { createCardLogger, deleteCardLogger } = require("../utils/logger");

const validateMaxNumberCards = async (user) => {
    const cards = await Card.find({ user: user._id });
    if (0 <= cards.length && cards.length <= 4) return true;
    return false;
};

const createCard = async (req, res, next) => {
    try {
        if (await validateMaxNumberCards(req.user)) {
            const new_card = await Card.create({ ...req.body, user: req.user._id });
            createCardLogger.log({ level: "info", message: new_card });
            res.status(200).json({ status: "success", card_information: new_card });
        } else {
            return next(
                new AppError(
                    "User can have maximum 5 cards into the account. If you want to add new card to your account, you must delete any card before that.",
                    400
                )
            );
        }
    } catch (err) {
        createCardLogger.log({ level: "error", message: err });
        next(err);
    }
};

const deleteCard = async (req, res, next) => {
    try {
        const id = req.params.id;
        const card = await Card.findById(id);
        if (card?.user._id.toString() === req.user._id.toString()) {
            await Card.findByIdAndDelete(id);
            deleteCardLogger.log({ level: "info", message: `${(card, req.user._id)}` });
            res.status(204).json({ status: "success" });
        } else {
            return next(
                new AppError("You don't have permissions to delete this card or this card doesn't exist!", 401)
            );
        }
    } catch (err) {
        deleteCardLogger.log({ level: "error", message: err });
        next(err);
    }
};

const listAllCards = async (req, res, next) => {
    try {
        const cards = await Card.find({ user: req.user._id });
        res.status(200).json({ status: "success", cards });
    } catch (err) {
        next(err);
    }
};
module.exports = { createCard, validateMaxNumberCards, deleteCard, listAllCards };
