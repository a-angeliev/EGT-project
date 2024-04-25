const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    number: { type: String, require: true },
    cardholder_name: { type: String, require: true },
    expiration_date: { type: String, require: true },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
