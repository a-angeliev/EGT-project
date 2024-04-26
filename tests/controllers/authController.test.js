const { signToken, createSendToken } = require("../../controllers/authController");
const User = require("./../../models/userModel");
const jwt = require("jsonwebtoken");

describe("Authentication", () => {
    jest.mock("../../controllers/authController");
    describe("createSendToken", () => {
        test("provide valid user ", async () => {
            signToken.mockReturnValue();

            createSendToken({ id: 5 }, 100, {});
        });
    });
});
