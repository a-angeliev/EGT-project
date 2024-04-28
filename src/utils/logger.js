const winston = require("winston");

const signupLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/authentication/signupLogger.log`,
        }),
    ],
});

const loginLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/authentication/loginLogger.log`,
        }),
    ],
});

const createCardLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/cards/createCardLogger.log`,
        }),
    ],
});

const deleteCardLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/cards/deleteCardLogger.log`,
        }),
    ],
});

const depositFundsLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/transactions/depositFundsLogger.log`,
        }),
    ],
});

const transactionFundsLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/transactions/transactionFundsLogger.log`,
        }),
    ],
});

const errorHandlerLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { data: new Date() },

    transports: [
        new winston.transports.File({
            filename: `${process.env.LOG_FILE_LOCATION}/errorHandler/errorHandlerLogger.log`,
        }),
    ],
});

module.exports = {
    signupLogger,
    loginLogger,
    createCardLogger,
    deleteCardLogger,
    depositFundsLogger,
    transactionFundsLogger,
    errorHandlerLogger,
};
