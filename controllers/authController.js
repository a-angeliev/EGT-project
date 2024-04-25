const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOption.secure = true;

    res.cookie("jwt", token, cookieOption);
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        user,
    });
};

const signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            ...req.body,
        });
        createSendToken(newUser, 201, res);
    } catch (err) {
        next(err);
    }
};

module.exports = { signup };
