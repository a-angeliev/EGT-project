const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: [0, "Price must be greater than 0"] },
    transaction_date: { type: Date, default: new Date() },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
