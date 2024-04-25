const mongoSanitize = require("express-mongo=sanitize");
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");

const app = express();

// Security
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Body parser and limiter
app.use(express.json({ limit: "100kb" }));

module.exports = app;
