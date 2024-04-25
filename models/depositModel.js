const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
    amount: { type: Number, require: true, min: [0, "Price must be greater than 0"] },
    card_id: {
        require: true,
        type: Schema.Types.ObjectId,
        ref: "Card",
    },
    deposit_date: { type: Date, default: newDate() },
});

const Deposit = mongoose.model("Deposit", depositSchema);

module.exports = Deposit;
