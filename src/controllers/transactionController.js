const mongoose = require("mongoose");

const Deposit = require("./../models/depositModel");
const Card = require("./../models/cardModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { depositFundsLogger, transactionFundsLogger } = require("../utils/logger");

// I know is better to move the `try-catch` block as outside function.
// Also the same `if states` from depositFunds and transferFunds,
// but that creates errors in the testing.
const depositFunds = async (req, res, next) => {
    try {
        const amount = req.body.amount;
        if (!amount || !req.body.card_id) return next(new AppError("You must provide amount and card_id", 400));
        if (isNaN(amount)) return next(new AppError("The amount must be a Number", 400));
        // If the amount === 0, then will trigger first case !0 === true
        if (amount < 0) return next(new AppError("You cannot work negative amount", 400));

        const card = await Card.findById(req.body.card_id);
        if (!card) return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));
        if (card.user._id.toString() !== req.user._id.toString())
            return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));

        const deposit = await Deposit.create({ amount: amount, card_id: card._id });
        const newBalance = req.user.balance + amount;

        await User.findByIdAndUpdate(req.user._id, { balance: newBalance });
        depositFundsLogger.log({
            level: "info",
            message: `User: ${req.user._id}, Old balance: ${req.user.balance}, New balance: ${newBalance}`,
        });
        res.status(200).json({ status: "success", deposit });
    } catch (err) {
        depositFundsLogger.log({ level: "error", message: err });
        next(err);
    }
};

const transactionFunds = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const amount = req.body.amount;
        if (!amount || !req.body.receiver_id) return next(new AppError("You must provide amount and receiver_id", 400));
        if (isNaN(amount)) return next(new AppError("The amount must be a Number", 400));
        // If the amount === 0, then will trigger first case !0 === true
        if (amount < 0) return next(new AppError("You cannot work negative amount", 400));

        const receiver = await User.findById(req.body.receiver_id);

        if (!receiver) return next(new AppError("This user does not exist", 400));
        if (req.user.balance < amount) return next(new AppError("Not enough balance", 400));
        if (req.user._id.toString() === receiver._id.toString())
            return next(new AppError("You cannot send money on yourself", 400));

        const senderNewBalance = req.user.balance - amount;
        const receiverNewBalance = receiver.balance + amount;

        // It's important to handle all updates together, because the process involves more than one users or records, depending each others.
        session.startTransaction();

        await User.findByIdAndUpdate(req.user._id, { balance: senderNewBalance });
        await User.findByIdAndUpdate(req.body.receiver_id, { balance: receiverNewBalance });
        await Transaction.create({ sender: req.user._id, receiver: receiver._id, amount: amount });

        await session.commitTransaction();
        session.endSession();

        transactionFundsLogger.log({
            level: "info",
            message: `Sender: ${req.user._id}, Receiver: ${receiver._id}, Amount: ${amount}, Sender old balance: ${req.user.balance}, Receiver old balance: ${receiver.balance}`,
        });
        res.status(200).json({ status: "success" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        transactionFundsLogger.log({ level: "error", message: err });
        next(err);
    }
};

const listUserTransactions = async (req, res, next) => {
    try {
        const transactionAsSender = await Transaction.find({ sender: req.user._id });
        const transactionAsReceiver = await Transaction.find({ receiver: req.user._id });
        res.status(200).json({
            status: "success",
            transaction_as_sender: transactionAsSender,
            transaction_as_receiver: transactionAsReceiver,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { depositFunds, transactionFunds, listUserTransactions };
