const {
    validateCardNumber,
    validateExpireDate,
    validateExpireDateFormat,
    validatePhoneNumber,
} = require("../../utils/validators");

describe("validators", () => {
    describe("validateCardNumber", () => {
        let cardNumber;
        beforeEach(() => {
            cardNumber = "0123456789123456";
        });
        it("expect to return false if input contains 15 digits", () => {
            cardNumber = cardNumber.slice(0, 15);

            const result = validateCardNumber(cardNumber);
            expect(result).toBeFalsy();
        });
        it("expect to return false if input contains 17 digits", () => {
            cardNumber += "7";

            const result = validateCardNumber(cardNumber);
            expect(result).toBeFalsy();
        });
        it("expect to return false if input contains symbols instead of digits", () => {
            const cardNumber = "aaaaaaaaaaaaaaaa";
            const cardNumber2 = "***************1";

            const result = validateCardNumber(cardNumber);
            const result2 = validateCardNumber(cardNumber2);

            expect(result).toBeFalsy();
            expect(result2).toBeFalsy();
        });
        it("expect to return true if input is 16 digits", () => {
            const result = validateCardNumber(cardNumber);

            expect(result).toBeTruthy();
        });
        it("expect to return true if input is 16 zeros", () => {
            const cardNumber = "0000000000000000";

            const result = validateCardNumber(cardNumber);

            expect(result).toBeTruthy();
        });
    });

    describe("validateExpireDateFormat", () => {
        let date;

        it("expect false if provide MM/YYYY", () => {
            date = "12/2020";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect false if provide M/YY", () => {
            date = "2/25";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect false if provide MM/Y", () => {
            date = "12/2";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect false if provide mount/year", () => {
            date = "Jan/2024";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect false if provide MM / YY", () => {
            date = "12 / 2020";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect false if provide -MM/YY", () => {
            date = "-12/25";

            const result = validateExpireDateFormat(date);

            expect(result).toBeFalsy();
        });
        it("expect true if provide MM/YY", () => {
            date = "12/12";

            const result = validateExpireDateFormat(date);

            expect(result).toBeTruthy();
        });
    });

    describe("validateExpireDate", () => {
        let date;
        const originalDate = Date;
        beforeEach(() => {
            // Mock Date constructor
            global.Date = jest.fn(() => ({
                getFullYear: jest.fn().mockReturnValue(2023), // Set a specific year for testing
                getMonth: jest.fn().mockReturnValue(5), // Set a specific month for testing (0-indexed)
            }));
        });

        afterEach(() => {
            // Restore original Date constructor
            global.Date = originalDate;
        });

        it("expect false if provide 05/23", () => {
            date = "05/23";

            const result = validateExpireDate(date);

            expect(result).toBeFalsy();
        });
        it("expect true if provide 05/24", () => {
            date = "05/24";

            const result = validateExpireDate(date);

            expect(result).toBeTruthy();
        });
        it("expect true if provide 06/23", () => {
            date = "06/23";

            const result = validateExpireDate(date);

            expect(result).toBeTruthy();
        });
        it("expect false if provide 06/22", () => {
            date = "06/22";

            const result = validateExpireDate(date);

            expect(result).toBeFalsy();
        });
        // it("")
    });

    describe("validatePhoneNumber", () => {
        let number;
        it("expect false if provide 9 digits", () => {
            number = "081234563";

            const result = validatePhoneNumber(number);

            expect(result).toBeFalsy();
        });
        it("expect false if provide 11 digits", () => {
            number = "08123456311";

            const result = validatePhoneNumber(number);

            expect(result).toBeFalsy();
        });
        it("expect false if provide input starts 09 and it's 10 digits", () => {
            number = "0912345631";

            const result = validatePhoneNumber(number);

            expect(result).toBeFalsy();
        });
        it("expect false if provide input starts 08 and it's 10 symbols but not all of the digits", () => {
            number = "081234563*";

            const result = validatePhoneNumber(number);

            expect(result).toBeFalsy();
        });
        it("expect true if provide 10 digits input starts with 08", () => {
            number = "0812345631";

            const result = validatePhoneNumber(number);

            expect(result).toBeTruthy();
        });
    });
});
