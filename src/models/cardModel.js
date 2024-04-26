const mongoose = require("mongoose");

const { validateCardNumber, validateExpireDateFormat, validateExpireDate } = require("./../utils/validators");
const { encryptData, decryptData } = require("./../utils/encryption");

const cardSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
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

const cardFields = ["number", "cardholder_name", "expiration_date"];

const hideNumberDigits = (number) => {
    const lastDigits = number.slice(-4);
    return lastDigits.padStart(16, "*");
};

cardSchema.pre("save", function (next) {
    cardFields.forEach((field) => (this[field] = encryptData(this[field])));
    next();
});

cardSchema.post("save", function () {
    cardFields.forEach((field) => {
        this[field] = decryptData(this[field]);
        if (field === "number") this.number = hideNumberDigits(this.number);
    });
});

cardSchema.post("find", function (doc) {
    doc.forEach((card) => {
        cardFields.forEach((field) => (card[field] = decryptData(card[field])));
        card.number = hideNumberDigits(card.number);
    });
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
