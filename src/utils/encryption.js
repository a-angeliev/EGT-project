const crypto = require("crypto");

const secretKey = process.env.ENCRYPTION_KEY;
const iv = Buffer.alloc(16, 0); // Initialize IV with zeros (for AES)

const encryptData = (data) => {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey, "utf-8"), iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

const decryptData = (encryptedData) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "utf-8"), iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

module.exports = { encryptData, decryptData };
