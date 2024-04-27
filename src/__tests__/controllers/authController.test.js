const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const AppError = require("../../utils/appError");
const { signup, signToken, createSendToken, protectMiddleware } = require("../../controllers/authController");

jest.mock("jsonwebtoken");
jest.mock("../../models/userModel");
jest.mock("../../utils/appError");

describe("signToken", () => {
    it("throws an error when its not provided id", () => {
        expect(() => signToken()).toThrow(Error);
        expect(() => signToken()).toThrow("Provide id to sign token!");
    });

    it("should generate a token with correct payload and options", () => {
        process.env.JWT_SECRET = "testsecret";
        process.env.JWT_EXPIRES_IN = "90d";
        const id = "123";
        jwt.sign.mockReturnValue("fakeToken");

        const token = signToken(id);

        expect(token).toBe("fakeToken");
        expect(jwt.sign).toHaveBeenCalledWith({ id: "123" }, "testsecret", { expiresIn: "90d" });
    });
});

describe("createSendToken", () => {
    jest.mock("../../controllers/authController", () => ({
        ...jest.requireActual("../../controllers/authController"), // this line imports all other exports from the module as they are
        signToken: jest.fn().mockReturnValue("fakeToken"),
    }));
    jest.mock("../../controllers/authController", () => {
        const originalModule = jest.requireActual("../../controllers/authController");
        return {
            ...originalModule,
            signToken: jest.fn(), // Mock the signToken function
        };
    });

    const authController = require("../../controllers/authController");

    authController.signToken.mockImplementation(() => "test");
    const user = { _id: "123", password: "secret" };
    const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    it("should send a token as a response and delete user password", () => {
        createSendToken(user, 200, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            token: "fakeToken",
            user: expect.objectContaining({ _id: "123", password: undefined }),
        });
    });
});

// describe("signup", () => {
//     jest.mock("../../controllers/authController", () => ({
//         ...jest.requireActual("../../controllers/authController"),
//         createSendToken: jest.fn(),
//     }));
//     User.create = jest.fn().mockReturnValue({ first_name: "Test", last_name: "Test", id: "1234" });

//     const req = {
//         body: { first_name: "Test", last_name: "Test" },
//     };
//     const res = jest.fn();
//     const next = jest.fn();

//     it("expect User create to be called with provided data", () => {
//         signup(req, res, next);

//         expect(User.create).toHaveBeenCalledWith({ first_name: "Test", last_name: "Test" });
//     });

//     it("expect createSendToken to be called with provided data", async () => {
//         const createSendToken = jest.fn();
//         await signup(req, res, next);
//         // expect(User.create).toHaveBeenCalledWith({ first_name: "Test", last_name: "Test" });

//         expect(createSendToken).toHaveBeenCalledWith({ first_name: "Test", last_name: "Test" }, expect.any(Number));
//         // expect(createSendToken).toHaveBeenCalledWith({ first_name: "Test", last_name: "Test" }, 201);
//     });
//     it("expect next to be called when occur error into the try block", async () => {
//         const next = jest.fn();

//         User.create = jest.fn().mockReturnValue(new Error("Test"));
//         await signup(req, res, next);
//         expect(next).toHaveBeenCalledTimes(1);
//         expect(next).toHaveBeenCalledWith("Test");
//     });
// });
