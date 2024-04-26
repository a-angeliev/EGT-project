const express = require("express");

const authController = require("./../controllers/authController");
const cardController = require("./../controllers/cardController");

const router = express.Router();

router.route("/create").post(authController.protectMiddleware, cardController.createCard);

module.exports = router;
