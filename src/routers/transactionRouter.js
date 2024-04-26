const express = require("express");

const authController = require("./../controllers/authController");
const transactionController = require("./../controllers/transactionController");

const router = express.Router();

router.route("/deposit").post(authController.protectMiddleware, transactionController.depositFunds);

module.exports = router;
