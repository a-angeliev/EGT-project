const mongoose = require("mongoose");

const Deposit = require("./../models/depositModel");
const Card = require("./../models/cardModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel.js");
const AppError = require("../utils/appError");

const depositFunds = async (req, res, next) => {
    try {
        const card = await Card.findById(req.body.card_id);

        if (req.body.amount <= 0) return next(new AppError("You cannot deposit negative amount", 400));
        if (!card) return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));
        if (card.user._id.toString() !== req.user._id.toString())
            return next(new AppError("You don't have permissions on that card or the card doesn't exist", 400));

        const deposit = await Deposit.create({ amount: req.body.amount, card_id: card._id });
        const newBalance = req.user.balance + req.body.amount;

        await User.findByIdAndUpdate(req.user._id, { balance: newBalance });

        res.status(200).json({ status: "success", deposit });
    } catch (err) {
        next(err);
    }
};

const transactionFunds = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        if (isNaN(req.body.amount)) return next(new AppError("The amount must be a Number", 400));
        const receiver = await User.findById(req.body?.receiver_id);
        const amount = req.body.amount;

        if (!receiver) return next(new AppError("This user does not exist", 400));
        if (!amount || amount <= 0) return next(new AppError("You cannot send negative amount", 400));
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

        res.status(200).json({ status: "success" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

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
