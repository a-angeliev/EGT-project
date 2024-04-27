const jwt = require("jsonwebtoken");

const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

const signToken = (id) => {
    if (!id) throw new Error("Provide id to sign token!");
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

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

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("You must provide email and password", 400));
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError("Wrong email or password", 401));
        }

        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

const protectMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            if (token == "null") token = undefined;
        }

        if (!token) {
            return next(new AppError("Invalid token. Please login or provide valid token.", 401));
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decode.id);
        if (!currentUser) {
            return next(new AppError("Invalid token. Please login or provide valid token.", 401));
        }

        req.user = currentUser;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { signup, signToken, createSendToken, protectMiddleware, login };
