const jwt = require("jsonwebtoken");

const User = require("../../models/userModel");
const AppError = require("../../utils/appError");
const { signup, signToken, createSendToken, protectMiddleware, login } = require("../../controllers/authController");

jest.mock("jsonwebtoken");
jest.mock("../../models/userModel");

describe("Authentication Controller", () => {
    jwt.verify = jest.fn(() => ({ id: 5 }));
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    const mockNext = jest.fn();
    process.env.JWT_SECRET = "testsecret";
    process.env.JWT_EXPIRES_IN = "90d";

    describe("protectMiddleware", () => {
        let mockReq;
        beforeEach(() => {
            mockReq = {
                headers: {
                    authorization: "Bearer token",
                },
            };
        });
        it("expect error if it's not provided headers authorization", async () => {
            mockReq = {
                headers: {},
            };
            await protectMiddleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new AppError("Invalid token. Please login or provide valid token."));
        });
        it("expect error if it's provided headers authorization but doesn't starts with Bearer", async () => {
            mockReq = {
                headers: {
                    authorization: "token",
                },
            };
            await protectMiddleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new AppError("Invalid token. Please login or provide valid token."));
        });
        it("expect error if it's provided headers authorization but starts with Bearer and token missing", async () => {
            mockReq = {
                headers: {
                    authorization: "Bearer",
                },
            };
            await protectMiddleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new AppError("Invalid token. Please login or provide valid token."));
        });
        it("expect error if User doesn't exists", async () => {
            User.findById = jest.fn(() => null);

            await protectMiddleware(mockReq, mockRes, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith("token", "testsecret");
            expect(User.findById).toHaveBeenCalledWith(5);
            expect(mockNext).toHaveBeenCalledWith(
                new AppError("Invalid token. Please login or provide valid token.", 401)
            );
        });
        it("expect request user to be changed", async () => {
            User.findById = jest.fn(() => "user");
            await protectMiddleware(mockReq, mockRes, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith("token", "testsecret");
            expect(User.findById).toHaveBeenCalledWith(5);
            expect(mockReq.user).toEqual("user");
        });
    });

    describe("login", () => {
        let mockReq;
        beforeEach(() => {
            mockReq = {
                body: {
                    email: "email",
                    password: "password",
                },
            };
        });
        it("expect error if email is not provided", async () => {
            mockReq.body = { password: "password" };

            await login(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new AppError("You must provide email and password"));
        });
        it("expect error if password is not provided", async () => {
            mockReq.body = { email: "email" };

            await login(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new AppError("You must provide email and password"));
        });
        it("expect error if user doesn't exists", async () => {
            User.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue(null),
            });

            await login(mockReq, mockRes, mockNext);
            expect(User.findOne).toHaveBeenCalledWith({ email: "email" });
            expect(mockNext).toHaveBeenCalledWith(new AppError("Wrong email or password"));
        });
        it("expect error if user exists but provided password do not match", async () => {
            const mockUser = {
                _id: "user_id",
                email: "test@example.com",
                password: "hashed_password",
                correctPassword: jest.fn(() => false),
            };
            User.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue(mockUser),
            });

            await login(mockReq, mockRes, mockNext);
            expect(User.findOne).toHaveBeenCalledWith({ email: "email" });
            expect(mockNext).toHaveBeenCalledWith(new AppError("Wrong email or password"));
        });
        it("expect no error if provided user exists and password match", async () => {
            const mockUser = {
                _id: "user_id",
                email: "test@example.com",
                password: "hashed_password",
                correctPassword: jest.fn(() => true),
            };
            User.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue(mockUser),
            });

            await login(mockReq, mockRes, mockNext);
            expect(User.findOne).toHaveBeenCalledWith({ email: "email" });
            expect(mockNext).toHaveBeenCalledTimes(0);
        });
    });
    describe("signToken", () => {
        it("expect an error when it's not provided id", () => {
            expect(() => signToken()).toThrow(Error);
            expect(() => signToken()).toThrow("Provide id to sign token!");
        });

        it("expect generate a token with correct payload and options", () => {
            const id = "123";
            jwt.sign.mockReturnValue("fakeToken");

            const token = signToken(id);

            expect(token).toBe("fakeToken");
            expect(jwt.sign).toHaveBeenCalledWith({ id: "123" }, "testsecret", { expiresIn: "90d" });
        });
    });

    describe("createSendToken", () => {
        const user = { _id: "123", password: "secret" };

        it("expect to send a token as a response and delete user password", () => {
            createSendToken(user, 200, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: "success",
                token: "fakeToken",
                user: expect.objectContaining({ _id: "123", password: undefined }),
            });
        });
    });

    describe("signup", () => {
        User.create = jest.fn().mockReturnValue({ first_name: "Test", last_name: "Test", id: "1234" });

        const mockReq = {
            body: { first_name: "Test", last_name: "Test" },
        };

        it("expect User create to be called with provided data", async () => {
            await signup(mockReq, mockRes, mockNext);

            expect(User.create).toHaveBeenCalledWith({ first_name: "Test", last_name: "Test" });
        });
        it("expect error if User throw an error", async () => {
            User.create = jest.fn(() => {
                throw new Error();
            });
            await signup(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new Error());
        });
    });
});
