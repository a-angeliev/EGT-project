const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    sender: { type: String, require: true },
    receiver: { type: String, require: true },
    amount: { type: Number, require: true, min: [0, "Price must be greater than 0"] },
    transaction_date: { type: Date, default: new Date() },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
