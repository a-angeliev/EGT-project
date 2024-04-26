const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const authRouter = require("./routers/authRouter");
const cardRouter = require("./routers/cardRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Security
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Body parser and limiter
app.use(express.json({ limit: "100kb" }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/card", cardRouter);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
