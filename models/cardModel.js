const mongoose = require("mongoose");

const { validateCardNumber, validateExpireDateFormat, validateExpireDate } = require("./../utils/validators");

const cardSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        validate: {
            validator: validateCardNumber,
            message: "Credit card number must consist of exactly 16 digits",
        },
    },
    cardholder_name: { type: String, required: true },
    expiration_date: {
        type: String,
        required: true,
        validate: [
            {
                validator: validateExpireDateFormat,
                message: "Credit card expiration date must be in the format MM/YY",
            },
            {
                validator: validateExpireDate,
                message: "Credit card expiration date must be in the future",
            },
        ],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
