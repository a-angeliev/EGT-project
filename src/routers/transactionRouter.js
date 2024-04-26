const express = require("express");

const authController = require("./../controllers/authController");
const transactionController = require("./../controllers/transactionController");

const router = express.Router();

router.route("/deposit").post(authController.protectMiddleware, transactionController.depositFunds);
router.route("/transfer").post(authController.protectMiddleware, transactionController.transactionFunds);

module.exports = router;
