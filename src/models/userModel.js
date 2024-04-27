const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const { validatePhoneNumber } = require("./../utils/validators");

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    password: { type: String, required: true },
    address: { type: String, required: true },
    phone_number: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validatePhoneNumber,
            message: `Provided phone is not a valid phone number. It must have 10 digits and start with '08'.`,
        },
    },
    birth_date: { type: Date, required: true },
    balance: { type: Number, default: 0 },
});

userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
