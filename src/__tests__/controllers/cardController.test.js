const { validateMaxNumberCards, createCard, deleteCard, listAllCards } = require("../../controllers/cardController");
const Card = require("../../models/cardModel");
const AppError = require("../../utils/appError");

describe("Card Controller", () => {
    jest.mock("../../models/cardModel");

    describe("validateMaxNumberCards", () => {
        const user = { _id: 5 };
        it("expect Card find to be called with proper data", async () => {
            Card.find = jest.fn(() => [1, 2]);

            await validateMaxNumberCards(user);

            expect(Card.find).toHaveBeenCalledWith({ user: 5 });
        });
        it("expect if Card length 0 to return true", async () => {
            Card.find = jest.fn(() => []);

            const result = await validateMaxNumberCards(user);
            expect(result).toBe(true);
        });
        it("expect if Card length 4 to return true", async () => {
            Card.find = jest.fn(() => [1, 1, 1, 1]);

            const result = await validateMaxNumberCards(user);
            expect(result).toBe(true);
        });
        it("expect if Card length 5 to return false", async () => {
            Card.find = jest.fn(() => [1, 1, 1, 1, 1]);

            const result = await validateMaxNumberCards(user);
            expect(result).toBe(false);
        });
    });

    describe("deleteCard", () => {
        const req = {
            params: { id: 5 },
            user: { _id: 3 },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const next = jest.fn();

        it("expect Card to be called if id is provided", async () => {
            Card.findById = jest.fn(() => {});
            await deleteCard(req, res, next);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
        });

        it("expect next to be called if id is wrong format", async () => {
            Card.findById = jest.fn(() => {
                throw new Error("Cast error");
            });
            await deleteCard(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(new Error("Cast error"));
        });
        it("expect next to be called if card doesn't have id", async () => {
            Card.findById = jest.fn(() => {
                {
                }
            });

            await deleteCard(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                new AppError("You don't have permissions to delete this card or this card doesn't exist!")
            );
        });
        it("expect next to be called if card user id is not same as request user id", async () => {
            Card.findById = jest.fn(() => {
                {
                    user: {
                        _id: 8;
                    }
                }
            });
            await deleteCard(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(
                new AppError("You don't have permissions to delete this card or this card doesn't exist!")
            );
        });
        it("expect Card model be called if card user id is the same as request user id", async () => {
            Card.findById = jest.fn(() => ({
                user: {
                    _id: 3,
                },
            }));
            Card.findByIdAndDelete = jest.fn();

            await deleteCard(req, res, next);
            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(Card.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(Card.findByIdAndDelete).toHaveBeenCalledWith(5);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ status: "success" });
        });
    });

    describe("listAllCards", () => {
        const req = {
            user: { _id: 3 },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const next = jest.fn();

        it("expect response to be called with proper information about cards", async () => {
            Card.find = jest.fn(() => ["card 1", "card 2"]);

            await listAllCards(req, res, next);

            expect(Card.find).toHaveBeenCalledTimes(1);
            expect(Card.find).toHaveBeenCalledWith({ user: 3 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ status: "success", cards: ["card 1", "card 2"] });
        });
        it("expect next to be called if there is error in the Card model", async () => {
            Card.find = jest.fn(() => {
                throw new Error();
            });

            await listAllCards(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(new Error());
        });
    });
});
