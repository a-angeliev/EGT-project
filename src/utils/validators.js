const validateCardNumber = (value) => {
    const regex = /^\d{16}$/; // Regex for exactly 16 digits
    return regex.test(value);
};

const validateExpireDateFormat = (value) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/; // Regex for MM/YY format
    return regex.test(value);
};

const validateExpireDate = (value) => {
    const [month, year] = value.split("/");
    const currentYear = new Date().getFullYear() % 100; // Get current year (last two digits)
    const currentMonth = new Date().getMonth() + 1; // Get current month
    return Number(year) > currentYear || (Number(year) === currentYear && Number(month) > currentMonth);
};

module.exports = { validateCardNumber, validateExpireDateFormat, validateExpireDate };
