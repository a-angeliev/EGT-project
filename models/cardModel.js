const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    number: { type: String, required: true },
    cardholder_name: { type: String, required: true },
    expiration_date: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
