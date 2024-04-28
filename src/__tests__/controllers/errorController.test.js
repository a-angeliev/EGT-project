const {
    globalErrorHandler,
    sendErrorProd,
    sendErrorDev,
    handleJWTError,
    handleJWTExpiredError,
    handleDuplicateFieldsDB,
    handleValidationErrorDB,
    handleCastErrorDB,
} = require("../../controllers/errorController");

describe("Error Controller", () => {
    let error;
    beforeEach(() => {
        error = {
            path: "path",
            value: "field 1",
            keyValue: {
                email: "email",
                username: "username",
            },
            errors: {
                er1: { message: "error1" },
                er2: { message: "error2" },
            },
            message: "Error message",
            stack: "Error stack",
            status: "error",
            statusCode: 123,
        };
    });
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    describe("handleCastErrorDB", () => {
        it("expect result to be error", () => {
            const result = handleCastErrorDB(error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual(`Invalid ${error.path}: ${error.value}.`);
            expect(result.statusCode).toEqual(400);
        });
    });

    describe("handleDuplicationFieldsDB", () => {
        it("expect result to be error", () => {
            const result = handleDuplicateFieldsDB(error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual(`Duplicate field: email,username. Please insert other value`);
            expect(result.statusCode).toEqual(400);
        });
    });

    describe("handleValidationErrorDB", () => {
        it("expect result to be error", () => {
            const result = handleValidationErrorDB(error);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual("Invalid data. error1. error2");
            expect(result.statusCode).toEqual(400);
        });
    });

    describe("handleJWTError", () => {
        it("expect result to be error", () => {
            const result = handleJWTError();

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual("Invalid token. Please login");
            expect(result.statusCode).toEqual(401);
        });
    });

    describe("handleJWTExpiredError", () => {
        it("expect result to be error", () => {
            const result = handleJWTExpiredError();

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual("Expired token! Please login");
            expect(result.statusCode).toEqual(401);
        });
    });

    describe("sendErrorDev", () => {
        it("expect response to be called with provided data", () => {
            sendErrorDev(error, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(123);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: error.status,
                error,
                message: error.message,
                stack: error.stack,
            });
        });
    });

    describe("sendErrorProd", () => {
        it("expect response to be called with correct status code if the error is operational", () => {
            error.isOperational = true;
            sendErrorProd(error, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(123);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: error.status,
                message: error.message,
            });
        });
        it("expect response to be called with 500 status code if the error is not marked as operational", () => {
            process.env.ENV = "TESTING";
            sendErrorProd(error, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: "error",
                message: "Internal error. Please contact the maintenance team.",
            });
        });
    });
});
