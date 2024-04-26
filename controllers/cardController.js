const Card = require("./../models/cardModel");
const AppError = require("./../utils/appError");

const validateMaxNumberCards = async (user) => {
    const cards = await Card.find({ user: user._id });
    if (0 <= cards.length && cards.length <= 4) return true;
    return false;
};

const createCard = async (req, res, next) => {
    try {
        if (await validateMaxNumberCards(req.user)) {
            const new_card = await Card.create({ ...req.body, user: req.user._id });
            res.status(200).json({ status: "success", card_information: new_card });
            next();
        } else {
            return next(
                new AppError(
                    "User can have maximum 5 cards into the account. If you want to add new card to your account, you must delete any card before that.",
                    400
                )
            );
        }
    } catch (err) {
        next(err);
    }
};

module.exports = { createCard };
