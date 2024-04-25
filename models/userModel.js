const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        require: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    password: { type: String, require: true },
    address: { type: String, require: true },
    phone_number: {
        type: String,
        require: true,
        validate: {
            validator: async function (value) {
                const existingUser = await this.constructor.findOne({ phone: value });
                return !existingUser;
            },
            message: "This phone number is already in use",
        },
    },
    birth_date: { type: Date, require: true },
    balance: { type: Number, default: 0 },
});

userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
