const { validateMaxNumberCards, createCard, deleteCard, listAllCards } = require("../../controllers/cardController");
const Card = require("../../models/cardModel");
const AppError = require("../../utils/appError");

describe("Card Controller", () => {
    jest.mock("../../models/cardModel");
    const mockReq = {
        params: { id: 5 },
        user: { _id: 3 },
    };
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    const mockNext = jest.fn();

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

    describe("createCard", () => {
        it("expect error if the user have more or than 5 cards", async () => {
            Card.find = jest.fn(() => ["card 1", "card 2", "card 3", "card 4", "card 5"]);

            await createCard(mockReq, mockRes, mockNext);

            expect(Card.find).toHaveBeenCalledTimes(1);
            expect(Card.find).toHaveBeenCalledWith({ user: 3 });
            expect(mockNext).toHaveBeenCalledWith(
                new AppError(
                    "User can have maximum 5 cards into the account. If you want to add new card to your account, you must delete any card before that."
                )
            );
        });
        it("expect Card model be called if the user has less than 5 cards", async () => {
            Card.find = jest.fn(() => ["card 1", "card 2", "card 3", "card 4"]);
            Card.create = jest.fn(() => "new card");

            await createCard(mockReq, mockRes, mockNext);

            expect(Card.find).toHaveBeenCalledWith({ user: 3 });
            expect(Card.create).toHaveBeenCalledWith({ user: 3 });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ status: "success", card_information: "new card" });
        });
    });

    describe("deleteCard", () => {
        it("expect Card to be called if id is provided", async () => {
            Card.findById = jest.fn(() => {});
            await deleteCard(mockReq, mockRes, mockNext);

            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
        });

        it("expect next to be called if id is wrong format", async () => {
            Card.findById = jest.fn(() => {
                throw new Error("Cast error");
            });
            await deleteCard(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("Cast error"));
        });
        it("expect next to be called if card doesn't have id", async () => {
            Card.findById = jest.fn(() => {
                {
                }
            });

            await deleteCard(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(
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
            await deleteCard(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(
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

            await deleteCard(mockReq, mockRes, mockNext);
            expect(Card.findById).toHaveBeenCalledTimes(1);
            expect(Card.findById).toHaveBeenCalledWith(5);
            expect(Card.findByIdAndDelete).toHaveBeenCalledTimes(1);
            expect(Card.findByIdAndDelete).toHaveBeenCalledWith(5);
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.json).toHaveBeenCalledWith({ status: "success" });
        });
    });

    describe("listAllCards", () => {
        it("expect response to be called with proper information about cards", async () => {
            Card.find = jest.fn(() => ["card 1", "card 2"]);

            await listAllCards(mockReq, mockRes, mockNext);

            expect(Card.find).toHaveBeenCalledTimes(1);
            expect(Card.find).toHaveBeenCalledWith({ user: 3 });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ status: "success", cards: ["card 1", "card 2"] });
        });
        it("expect next to be called if there is error in the Card model", async () => {
            Card.find = jest.fn(() => {
                throw new Error();
            });

            await listAllCards(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith(new Error());
        });
    });
});
