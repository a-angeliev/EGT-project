const express = require("express");

const authController = require("./../controllers/authController");
const cardController = require("./../controllers/cardController");

const router = express.Router();

router.route("/create").post(authController.protectMiddleware, cardController.createCard);
router.route("/delete/:id").delete(authController.protectMiddleware, cardController.deleteCard);

module.exports = router;
