const mongoose = require("mongoose");

const Card = require("../../models/cardModel");
const Transaction = require("../../models/transactionModel");
const User = require("../../models/userModel");
const Deposit = require("../../models/depositModel");
const { depositFunds, transactionFunds, listUserTransactions } = require("../../controllers/transactionController");

describe("Transaction controller", () => {
    jest.mock("../../models/cardModel");
    jest.mock("../../models/transactionModel");
    jest.mock("../../models/userModel");
    jest.mock("../../models/depositModel");
    jest.mock("mongoose");

    describe("depositFunds", () => {
        let mockReq;
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const mockNext = jest.fn();

        beforeEach(() => {
            mockReq = {
                body: { amount: 100, card_id: 5 },
                user: { _id: 10, balance: 100 },
            };
        });

        it("expect error if its not provided amount", () => {
            mockReq.body.amount = undefined;
            depositFunds(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and card_id"));
        });
        it("expect error if its not provided card_id", () => {
            mockReq.body.card_id = undefined;
            depositFunds(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and card_id"));
        });
        it("expect error if provided amount isNaN", () => {
            mockReq.body.amount = "test";
            depositFunds(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("The amount must be a Number"));
        });
        it("expect error if provided amount is < 0", () => {
            mockReq.body.amount = -5;
            depositFunds(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You cannot work negative amount"));
        });
        it("expect error if provided amount is == 0", () => {
            mockReq.body.amount = 0;
            depositFunds(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and card_id"));
        });
        it("expect error if provided card id is invalid", () => {
            Card.findById = jest.fn(() => {
                throw new Error();
            });
            depositFunds(mockReq, mockRes, mockNext);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error());
        });

        it("expect error if Card model does not find any card", async () => {
            Card.findById = jest.fn(() => null);
            await depositFunds(mockReq, mockRes, mockNext);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(
                new Error("You don't have permissions on that card or the card doesn't exist")
            );
        });
        it("expect error if card user id not match request user id", async () => {
            Card.findById = jest.fn(() => ({ user: { _id: 4 } }));
            await depositFunds(mockReq, mockRes, mockNext);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(
                new Error("You don't have permissions on that card or the card doesn't exist")
            );
        });
        it("expect no errors with correct inputs", async () => {
            Card.findById = jest.fn(() => ({ _id: 18, user: { _id: 10 } }));
            Deposit.create = jest.fn(() => "deposit");
            User.findByIdAndUpdate = jest.fn(() => {});
            await depositFunds(mockReq, mockRes, mockNext);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(Deposit.create).toHaveBeenCalledTimes(1);
            expect(Deposit.create).toHaveBeenCalledWith({ amount: 100, card_id: 18 });
            expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(10, { balance: 200 });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ status: "success", deposit: "deposit" });
        });
    });

    describe("transactionFunds", () => {
        let mockReq;
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const mockNext = jest.fn();

        const startSessionMock = {
            startTransaction: jest.fn(() => "test"),
            commitTransaction: jest.fn().mockReturnThis(),
            endSession: jest.fn(() => "test"),
            abortTransaction: jest.fn(() => "test"),
        };
        mongoose.startSession = jest.fn(() => {}).mockReturnValue(startSessionMock);

        beforeEach(() => {
            mockReq = {
                body: { amount: 100, receiver_id: 5 },
                user: { _id: 10, balance: 100 },
            };
        });
        it("expect error if it's not provided amount", async () => {
            mockReq.body.amount = undefined;
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and receiver_id"));
        });
        it("expect error if it's not provided receiver_id", async () => {
            mockReq.body.receiver_id = undefined;
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and receiver_id"));
        });
        it("expect error if amount isNaN", async () => {
            mockReq.body.amount = "test";
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("The amount must be a Number"));
        });
        it("expect error if amount < 0", async () => {
            mockReq.body.amount = -5;
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You cannot work negative amount"));
        });
        it("expect error if amount === 0", async () => {
            mockReq.body.amount = 0;
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You must provide amount and receiver_id"));
        });
        it("expect User model to be called if it's provided proper input data", async () => {
            User.findById = jest.fn();
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledTimes(1);
            expect(User.findById).toHaveBeenCalledWith(5);
        });
        it("expect error if provided id is not real id patter", async () => {
            User.findById = jest.fn(() => {
                throw new Error();
            });
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(startSessionMock.abortTransaction).toHaveBeenCalledTimes(1);
            expect(startSessionMock.endSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error());
        });
        it("expect error if cannot find record into the database", async () => {
            User.findById = jest.fn(() => null);
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("This user does not exist"));
        });
        it("expect error if request user balance < provided amount", async () => {
            mockReq.body.amount = 1000;
            User.findById = jest.fn(() => "user");
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("Not enough balance"));
        });
        it("expect error if request user id is not the same as receiver id", async () => {
            User.findById = jest.fn(() => ({ _id: 10 }));
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(mongoose.startSession).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("You cannot send money on yourself"));
        });
        it("expect commit transaction to NOT Be called if transaction or user models throw an error", async () => {
            User.findById = jest.fn(() => ({ _id: 3 }));
            User.findByIdAndUpdate = jest.fn(() => {
                throw new Error();
            });
            Transaction.create = jest.fn(() => {
                throw new Error();
            });
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(startSessionMock.startTransaction).toHaveBeenCalledTimes(1);
            expect(startSessionMock.commitTransaction).toHaveBeenCalledTimes(0);
        });
        it("expect response to be called in the happy case", async () => {
            User.findById = jest.fn(() => ({ _id: 3 }));
            User.findByIdAndUpdate = jest.fn();
            Transaction.create = jest.fn();
            await transactionFunds(mockReq, mockRes, mockNext);

            expect(startSessionMock.startTransaction).toHaveBeenCalledTimes(1);
            expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(2);
            expect(Transaction.create).toHaveBeenCalledTimes(1);
            expect(Transaction.create).toHaveBeenCalledWith({ sender: 10, receiver: 3, amount: 100 });
            expect(startSessionMock.commitTransaction).toHaveBeenCalledTimes(1);
            expect(startSessionMock.endSession).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ status: "success" });
        });
    });

    describe("listUserTransactions", () => {
        const mockReq = {
            user: { _id: 5 },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const mockNext = jest.fn();

        // There is no reason the Transaction to throw an error
        it("expect error if Transaction throw an error", async () => {
            Transaction.find = jest.fn(() => {
                throw new Error();
            });
            await listUserTransactions(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
        });
        it("expect response to be triggered in the happy path", async () => {
            Transaction.find = jest
                .fn()
                .mockResolvedValueOnce(["transaction 1", "transaction 2"])
                .mockResolvedValueOnce(["transaction 3"]);
            await listUserTransactions(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: "success",
                transaction_as_sender: ["transaction 1", "transaction 2"],
                transaction_as_receiver: ["transaction 3"],
            });
        });
    });
});
