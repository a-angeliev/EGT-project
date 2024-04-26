const express = require("express");

const authController = require("./../controllers/authController");
const transactionController = require("./../controllers/transactionController");

const router = express.Router();

router.route("/deposit").post(authController.protectMiddleware, transactionController.depositFunds);
router.route("/transfer").post(authController.protectMiddleware, transactionController.transactionFunds);
router.route("/").get(authController.protectMiddleware, transactionController.listUserTransactions);

module.exports = router;
