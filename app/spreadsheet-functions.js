/**
 * Enum for functions that can be used in formulas
 * @enum
 * @readonly
 */
Spreadsheet._Function = Object.freeze({

    /**
     * Logical NOT
     * @param {boolean} value
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} arguments must be of type boolean
     * @returns {boolean}
     * @function
     */
    NOT(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof value === "boolean") return !value;
        throw new Spreadsheet.ArgumentTypeError(this.position);
    },

    /**
     * Logical AND
     * @param {...boolean} values
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least 2
     * @throws {Spreadsheet.ArgumentTypeError} arguments must be of type boolean
     * @returns {boolean}
     * @function
     */
    AND(...values) {
        if (values.length < 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (values.some(e => typeof e !== "boolean")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return values.every(e => e);
    },

    /**
     * Logical OR
     * @param {...boolean} values
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least 2
     * @throws {Spreadsheet.ArgumentTypeError} arguments must be of type boolean
     * @returns {boolean}
     * @function
     */
    OR(...values) {
        if (values.length < 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (values.some(e => typeof e !== "boolean")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return values.some(e => e);
    },

    /**
     * Concatenates strings
     * @param {...string} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least 1
     * @throws {Spreadsheet.ArgumentTypeError} arguments must be of type string
     * @returns {string}
     * @function
     */
    CONCATENATE(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (args.some(e => typeof e !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return args.join("");
    },

    /**
     * Casts value to number
     * @param {number|string|boolean} value
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} value must be of type number, string or boolean
     * @returns {number}
     * @function
     */
    N(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (!isNaN(value)) return +value;
        throw new Spreadsheet.ArgumentTypeError(this.position);
    },

    /**
     * Casts value to boolean
     * @param {number|string|boolean} value
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @returns {boolean}
     * @function
     */
    BOOLEAN(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return !(!value || value === "0" || (typeof value === "string" && value.toLowerCase() === "false"));
    },

    /**
     * Casts value to string
     * @param {number|string|boolean} value
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} value must be of type number, string or boolean
     * @returns {string}
     * @function
     */
    TEXT(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        switch (typeof value) {
            case "boolean":
                return value ? "TRUE" : "FALSE";
            case "number":
                return value.toString();
            case "string":
                return value;
            default:
            	throw new Spreadsheet.ArgumentTypeError(this.position);
        }
    },

    /**
     * Add up to numbers; also a `+` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be numbers
     * @returns {number}
     * @function
     */
    ADD(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a + b;
    },


    /**
     * Subtracts second number from first; also a `-` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be numbers
     * @returns {number}
     * @function
     */
    MINUS(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a - b;
    },

    /**
     * Negates a number; also a unary `-` operator
     * @param {number} a
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} a must be number
     * @returns {number}
     * @function
     */
    UNMINUS(a) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return -a;
    },

    /**
     * Multiplies two numbers; also a `*` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be numbers
     * @returns {number}
     * @function
     */
    MULTIPLY(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a * b;
    },


    /**
     * Divides first number by second; also a `/` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be non zero numbers
     * @returns {number}
     * @function
     */
    DIVIDE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number" || a === 0 || b === 0) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a / b;
    },

    /**
     * Checks if two values are equal; also an `=` operator
     * @param {number|string|boolean} a
     * @param {number|string|boolean} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b have different types
     * @returns {boolean}
     * @function
     */
    EQ(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a == b;
    },

    /**
     * Checks if a is greater than b; also a `>` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be of type number or string
     * @returns {boolean}
     * @function
     */
    GT(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || (typeof a !== "number" && typeof a !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a > b;
    },

    /**
     * Checks if a is less or equal than b; also a `<=` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be of type number or string
     * @returns {boolean}
     * @function
     */
    LTE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || (typeof a !== "number" && typeof a !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a <= b;
    },

    /**
     * Checks if a is less than b; also a `<` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be of type number or string
     * @returns {boolean}
     * @function
     */
    LT(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || (typeof a !== "number" && typeof a !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a < b;
    },

    /**
     * Checks if a is greater or equal than b; also a `>=` operator
     * @param {number} a
     * @param {number} b
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} a and b must be of type number or string
     * @returns {boolean}
     * @function
     */
    GTE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || (typeof a !== "number" && typeof a !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return a >= b;
    },

    /**
     * Returns the absolute value of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    ABS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.abs(x);
    },

    /**
     * Returns the arccosine of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must be from -1 to 1
     * @returns {number}
     * @function
     */
    ACOS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (Math.abs(x) > 1) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.acos(x);
    },

    /**
     * Returns the arcsine of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must be from -1 to 1
     * @returns {number}
     * @function
     */
    ASIN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (Math.abs(x) > 1) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.asin(x);
    },

    /**
     * Returns the arctangent of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    ATAN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.arc(x);
    },

    /**
     * Returns the principal value of the arccotangent of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    ACOT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.atan(1/x);
    },

    /**
     * Returns the cosine of the given angle.
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    COS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.cos(x);
    },

    /**
     * Return the cotangent of an angle specified in radians
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must not be multiple of PI
     * @returns {number}
     * @function
     */
    COT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (Number.isInteger(x/PI)) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.cos(x)/Math.sin(x);
    },

    /**
     * Returns number rounded up, away from zero, to the nearest multiple of significance
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {int}
     * @function
     */
    CEILING(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.ceil(x);
    },

    /**
     * Converts radians into degrees
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    DEGREES(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*180/Math.PI;
    },

    /**
     * Returns e raised to the power of number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1 or 0
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    EXP(x = 1) {
        if (arguments.length > 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.exp(x);
    },

    /**
     * Returns the factorial of a number
     * @param {number} y
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} y must be of type number
     * @throws {Spreadsheet.FormulaError} x must be >= 0
     * @returns {int}
     * @function
     */
    FACT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || !Number.isInteger(x)) throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x < 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        if (x === 0 || x === 1) return 1;
        let factorial = 1;
        while (x > 1) {
            factorial *= x;
            x--;
        }
        return factorial;
    },

    /**
     * Rounds number down, toward zero, to the nearest multiple of significance
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {int}
     * @function
     */
    FLOOR(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.floor(x);
    },

    /**
     * Returns the greatest common divisor of two or more integers
     * @param {int} x
     * @param {int} y
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} x and y must be of type int
     * @returns {int}
     * @function
     */
    GCD(x, y) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof y !== "number" || !Number.isInteger(x) || !Number.isInteger(y)) throw new Spreadsheet.ArgumentTypeError(this.position);
        while (y) {
            let z = x%y;
            x = y;
            y = z;
        }
        return x;
    },

    /**
     * Returns FALSE if number is odd, or TRUE if number is even
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {boolean}
     * @function
     */
    ISEVEN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || !Number.isInteger(x)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return x%2 === 0;
    },

    /**
     * Returns TRUE if number is odd, or FALSE if number is even
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {boolean}
     * @function
     */
    ISODD(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number"  || !Number.isInteger(x)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return x%2 === 1;
    },

    /**
     * Returns the least common multiple of integers
     * @param {int} x
     * @param {int} y
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} x and y must be of type int
     * @returns {int}
     * @function
     */
    LCM(x, y) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof y !== "number" || !Number.isInteger(x) || !Number.isInteger(y)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*y/GCD(x, y);
    },

    /**
     * Returns the natural logarithm of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must be > 0
     * @returns {number}
     * @function
     */
    LN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x <= 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.log(x);
    },

    /**
     * Returns the base-10 logarithm of a number
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must be > 0
     * @returns {number}
     * @function
     */
    LOG10(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x <= 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.log10(x);
    },

    /**
     * Returns the logarithm of a number to the base you specify
     * @param {number} x
     * @param {number} base
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} x and base must be of type number
     * @throws {Spreadsheet.FormulaError} x must be > 0, base must be > 0 and !== 1
     * @returns {number}
     * @function
     */
    LOG(x, base) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof base !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x <= 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        if (base <= 0 || base === 1) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.log(x)/Math.log(base);
    },

    /**
     * Returns the remainder after number is divided by divisor
     * @param {number} dividend
     * @param {number} divisor
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} dividend and divisor must be of type number
     * @returns {number}
     * @function
     */
    MOD(dividend, divisor) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof dividend !== "number" || typeof divisor !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return dividend % divisor;
    },

    /**
     * Returns the mathematical constant pi
     * @returns {number}
     * @function
     */
    PI() {
        return Math.PI;
    },

    /**
     * Returns the result of a number raised to a power
     * @param {number} base
     * @param {number} exponent
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} base and exponent must be of type number
     * @throws {Spreadsheet.FormulaError} if base < 0, exponent must be odd
     * @returns {number}
     * @function
     */
    POW(base, exponent) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof base !== "number" || typeof exponent !== "number" || !Number.isInteger(exponent)) throw new Spreadsheet.ArgumentTypeError(this.position);
        if (base < 0 && Number.isInteger(exponent) && exponent%2 === 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.pow(base, exponent);
    },

    /**
     * Returns the integer portion of a division
     * @param {number} dividend
     * @param {number} divisor
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} dividend and divisor must be of type number
     * @returns {int}
     * @function
     */
    QUOTIENT(dividend, divisor) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof dividend !== "number" || typeof divisor !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.floor(dividend/divisor);
    },

    /**
     * Converts degrees to radians
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    RADIANS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*Math.PI/180;
    },

    /**
     * Returns an evenly distributed random real number greater than or equal to 0 and less than 1
     * @returns {number}
     * @function
     */
    RAND() {
        return Math.random();
    },

    /**
     * Returns a random integer number between the numbers you specify
     * @param {number} low
     * @param {number} high
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} low and high must be of type number
     * @returns {int}
     * @function
     */
    RANDBETWEEN(low, high) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof low !== "number" || typeof high !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Spreadsheet._Function.ROUND(Math.random()*(high - low) + low);
    },

    /**
     * Rounds a number to a specified number of digits
     * @param {number} x
     * @param {int} places
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1 or 2
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number, places must be of type int
     * @returns {number}
     * @function
     */
    ROUND(x, places = 0) {
        if (arguments.length !== 2 && arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || !Number.isInteger(places)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.round(x*Math.pow(10, places))/Math.pow(10, places);
    },

    /**
     * Determines the sign of a number. Returns 1 if the number is positive, zero (0) if the number is 0, and -1 if the number is negative.
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    SIGN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x > 0) return 1;
        if (x < 0) return -1;
        return 0;
    },

    /**
     * Returns the sine of the given angle
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @returns {number}
     * @function
     */
    SIN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.sin(x);
    },

    /**
     * Returns a positive square root
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must be >= 0
     * @returns {number}
     * @function
     */
    SQRT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x < 0) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.sqrt(x);
    },

    /**
     * Returns the tangent of the given angle
     * @param {number} x
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} x must be of type number
     * @throws {Spreadsheet.FormulaError} x must not be multiple of PI/2
     * @returns {number}
     * @function
     */
    TAN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (Number.isInteger(x/(PI/2))) throw new Spreadsheet.FormulaError("Incorrect value", this.position);
        return Math.tan(x);
    },

    /**
     * Returns the character specified by a number
     * @param {number} index
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} index must be of type number
     * @returns {string}
     * @function
     */
    CHAR(index) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof index !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return String.fromCharCode(index)
    },

    /**
     * Returns a numeric code for the first character in a text string
     * @param {string} str
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string
     * @returns {int}
     * @function
     */
    CODE(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.charCodeAt(0);
    },

    /**
     * Locate one text string within a second text string, and return the number of the starting position of the first text string
     * from the first character of the second text string. Case-sensitive.
     * @param {string} str
     * @param {string} text
     * @param {int} start
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 3
     * @throws {Spreadsheet.ArgumentTypeError} str and text must be of type string, start must be of type number
     * @returns {int|string}
     * @function
     */
    FIND(str, text, start = 1) {
        if (arguments.length !== 3 && arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        start = start - 1;
        if (typeof str !== "string" || typeof text !== "string" || !Number.isInteger(start) || start < 0)
            throw new Spreadsheet.ArgumentTypeError(this.position);
        const index = text.indexOf(str, start)
        return index === -1 ? -1 : index + 1;
    },

    /**
     * Rounds a number to the specified number of decimals, formats the number in decimal format using a period and commas,
     * and returns the result as text
     * @param {number} num
     * @param {int} placesAfterFloatingPoint
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} num must be of type number, placesAfterFloatingPoint must be of type int
     * @returns {number}
     * @function
     */
    FIXED(num, placesAfterFloatingPoint) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof num !== "number" || !Number.isInteger(placesAfterFloatingPoint)) {
            throw new Spreadsheet.ArgumentTypeError(this.position);
        }
        return num.toFixed(placesAfterFloatingPoint);
    },

    /**
     * Returns the first character or characters in a text string, based on the number of characters you specify
     * @param {string} str
     * @param {int} len
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string, len must be of type int
     * @returns {string}
     * @function
     */
    LEFT(str, len) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || !Number.isInteger(len) || len < 0) {
            throw new Spreadsheet.ArgumentTypeError(this.position);
        }
        return str.substr(0, len);
    },

    /**
     * Returns the number of characters in a text string
     * @param {string} str
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string
     * @returns {int}
     * @function
     */
    LEN(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.length;
    },

    /**
     * Converts all uppercase letters in a text string to lowercase
     * @param {string} str
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 1
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string
     * @returns {string}
     * @function
     */
    LOWER(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.toLowerCase();
    },

    /**
     * MID returns a specific number of characters from a text string, starting at the position you specify,
     * based on the number of characters you specify
     * @param {string} str
     * @param {int} start
     * @param {int} len
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 3
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string, start and len must be of type int
     * @returns {string}
     * @function
     */
    MID(str, start, len) {
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        start = start - 1
        if (typeof str !== "string" || !Number.isInteger(start) || start < 0 || !Number.isInteger(len) || len < 0)
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.substr(start, len);
    },

    /**
     * Returns the last character or characters in a text string, based on the number of characters you specify
     * @param {string} str
     * @param {int} len
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 2
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string, len must be of type int
     * @returns {string}
     * @function
     */
    RIGHT(str, len) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || !Number.isInteger(len) || len < 0)
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return len < str.length ? str.substr(str.length - len, len) : str;
    },

    /**
     * Locate one text string within a second text string, and return the number of the starting position of the first text string
     * from the first character of the second text string. Case-insensitive.
     * @param {string} str
     * @param {string} text
     * @param {int} start
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 3
     * @throws {Spreadsheet.ArgumentTypeError} str and text must be of type string, start must be of type number
     * @returns {int|string}
     * @function
     */
    SEARCH(str, text, start = 1) {
        if (arguments.length !== 3 && arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        start = start - 1;
        if (typeof str !== "string" || typeof text !== "string" || !Number.isInteger(start) || start < 0)
            throw new Spreadsheet.ArgumentTypeError(this.position);
        const index = text.toLowerCase().indexOf(str.toLowerCase(), start)
        return index === -1 ? -1 : index + 1;
    },

    /**
     * Converts text to uppercase
     * @param {string|number|boolean} str
     * @throws {Spreadsheet.QuantityOfArgumentsError} Value must be not empty
     * @throws {Spreadsheet.ArgumentTypeError} str must be of type string
     * @returns {string}
     * @function
     */
    UPPER(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.toUpperCase();
    },

    /**
     * Return TRUE if value is number
     * @param {string|number|boolean} value
     * @throws {Spreadsheet.ArgumentTypeError} Value must be not empty
     * @returns {boolean}
     * @function
     */
    ISNUMBER(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "number";
    },

    /**
     * Return TRUE if value is boolean
     * @param {string|number|boolean} value
     * @throws {Spreadsheet.ArgumentTypeError} Value must be not empty
     * @returns {boolean}
     * @function
     */
    ISLOGICAL(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "boolean";
    },

    /**
     * Return TRUE if value is string
     * @param {string|number|boolean} value
     * @throws {Spreadsheet.ArgumentTypeError} Value must be not empty
     * @returns {boolean}
     * @function
     */
    ISTEXT(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "string";
    },

    /**
     * Returns one value if a logical expression is `true` and another if it is `false`
     * @param {boolean} condition
     * @param {number|string|boolean} ifTrue
     * @param {number|string|boolean} ifFalse
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be 3
     * @throws {Spreadsheet.ArgumentTypeError} condition must be of type boolean
     * @returns {number|string|boolean}
     * @function
     */
    IF(condition, ifTrue, ifFalse) {
        console.log(ifTrue);
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof condition !== "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (condition) return ifTrue;
        return ifFalse;
    },

    /**
     * Returns sum of given arguments
     * @param {number|Spreadsheet.Table} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} Values must be of type number
     * @returns {number}
     * @function
     */
    SUM(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return args.reduce((sum, element) => {
            if (element instanceof Spreadsheet.Table) {
                let rangeSum = 0;
                element.forEachValue(cell => {
                    if (typeof cell !== 'number') throw new Spreadsheet.ArgumentTypeError(this.position);
                    rangeSum += cell;
                });
                return sum + rangeSum;
            } else if (typeof element === "number") {
                return sum + element;
            } else {
                throw new Spreadsheet.ArgumentTypeError(this.position);
            }
        }, 0);
    },

    /**
     * PRODUCT function multiplies all the numbers given as arguments and returns the product
     * @param {number|Spreadsheet.Table} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} Values must be of type number
     * @returns {number}
     * @function
     */
    PRODUCT(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return args.reduce((product, element) => {
            if (element instanceof Spreadsheet.Table) {
                let rangeSum = 1;
                element.forEachValue(cell => {
                    if (typeof cell !== 'number') throw new Spreadsheet.ArgumentTypeError(this.position);
                    rangeSum *= cell;
                });
                return product * rangeSum;
            } else if (typeof element === "number") {
                return product * element;
            } else {
                throw new Spreadsheet.ArgumentTypeError(this.position);
            }
        }, 1);
    },

    /**
     * Returns number of columns in range
     * @param {Spreadsheet.Table} range
     * @throws {Spreadsheet.ArgumentTypeError} Range must be of type Spreadsheet.Table
     * @returns {int}
     * @function
     */
    COLUMNS(range) {
        if (!(range instanceof Spreadsheet.Table)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return range.table.length
    },

    /**
     * Returns number of rows in range
     * @param {Spreadsheet.Table} range
     * @throws {Spreadsheet.ArgumentTypeError} Range must be of type Spreadsheet.Table
     * @returns {int}
     * @function
     */
    ROWS(range) {
        if (!(range instanceof Spreadsheet.Table)) throw new Spreadsheet.ArgumentTypeError(this.position);
        return range.table.length && range.table[0].length;
    },

    /**
     * Returns the average (arithmetic mean) of the arguments
     * @param {number|Spreadsheet.Table} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} Values must be of type number
     * @returns {number}
     * @function
     */
    AVERAGE(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return Spreadsheet._Function.SUM(...args)/Spreadsheet._Function.COUNT(...args);
    },

    /**
     * Counts the number of cells that contain numbers
     * @param {number|boolean|string|Spreadsheet.Table} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @returns {int}
     * @function
     */
    COUNT(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return args.reduce((sum, element) => {
            if (element instanceof Spreadsheet.Table) {
                let rangeSum = 0;
                element.forEachValue(cell => {
                    if (typeof cell === 'number') rangeSum += 1;
                });
                return sum + rangeSum;
            } else if (typeof element === "number") {
                return sum + 1;
            } else {
                return sum;
            }
        }, 0);
    },

    /**
     * Count unique values among duplicates
     * @param {number|boolean|string|Spreadsheet.Table} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @returns {int}
     * @function
     */
    COUNTUNIQUE(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        const set = new Set();
        args.forEach(function (element) {
            if (element instanceof Spreadsheet.Table) {
                element.forEachValue(cell => {
                    set.add(cell);
                });
            } else {
                set.add(element);
            }
        });
        return set.size;
    },

    /**
     * Returns maximum number or string
     * @param {Spreadsheet.Table|number|string} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} All values must be of type number or string
     * @returns {int|string}
     * @function
     */
    MAX(...args) {
        let first = args[0] instanceof Spreadsheet.Table ? args[0].table[0][0] : args[0];
        if (typeof first !== "number" && typeof first !== "string" || !args.every(value => {
                if (value instanceof Spreadsheet.Table) {
                    let flag = true;
                    value.forEachValue(cell => flag = flag && typeof cell === typeof first);
                    return flag;
                }
                return typeof value === typeof first;
            })) throw new Spreadsheet.ArgumentTypeError(this.position);
        for (let element of args) {
            if (element instanceof Spreadsheet.Table) {
                element.forEachValue(cell => {
                    if (cell > first) first = cell
                });
            } else {
                if (element > first) first = element
            }
        }
        return first;
    },

    /**
     * Returns minimum number or string
     * @param {Spreadsheet.Table|number|string} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} All values must be of type number or string
     * @returns {int|string}
     * @function
     */
    MIN(...args) {
        let first = args[0] instanceof Spreadsheet.Table ? args[0].table[0][0] : args[0];
        if (typeof first !== "number" && typeof first !== "string" || !args.every(value => {
                if (value instanceof Spreadsheet.Table) {
                    let flag = true;
                    value.forEachValue(cell => flag = flag && typeof cell === typeof first);
                    return flag;
                }
                return typeof value === typeof first;
            })) throw new Spreadsheet.ArgumentTypeError(this.position);
        for (let element of args) {
            if (element instanceof Spreadsheet.Table) {
                element.forEachValue(cell => {
                    if (cell < first) first = cell
                });
            } else {
                if (element < first) first = element
            }
        }
        return first;
    },

    /**
     * Returns the median of the given numbers. The median is the number in the middle of a set of numbers.
     * @param {Spreadsheet.Table|number} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} Values must be of type number
     * @returns {int|string}
     * @function
     */
    MEDIAN(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        let values = [];
        args.forEach(function (element) {
            if (element instanceof Spreadsheet.Table) {
                element.forEachValue(cell => {
                    values.push(cell);
                });
            } else if (typeof element === "number") {
                values.push(element)
            } else {
                throw new Spreadsheet.ArgumentTypeError(this.position);
            }
        });
        values.sort();
        if (values.length & 1) {
            return values[parseInt(values.length / 2)];
        }
        return (values[values.length / 2] + values[values.length / 2 - 1])/2;
    },

    /**
     * Returns the most frequently occurring, or repetitive, value
     * @param {Spreadsheet.Table|number} args
     * @throws {Spreadsheet.QuantityOfArgumentsError} Number of arguments must be at least one
     * @throws {Spreadsheet.ArgumentTypeError} Values must be of type number
     * @returns {int}
     * @function
     */
    MODE(...args) {
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        const map = new Map();
        const updateValue = value => map.set(value, (map.get(value) ||0 ) + 1);
        args.forEach(function (element) {
            if (element instanceof Spreadsheet.Table) {
                element.forEachValue(cell => {
                    if (typeof cell === "number") {
                        updateValue(cell);
                    } else {
                        throw new Spreadsheet.ArgumentTypeError(this.position);
                    }
                });
            } else if (typeof element === "number") {
                updateValue(element);
            } else {
                throw new Spreadsheet.ArgumentTypeError(this.position);
            }
        });
        let key = 0, value = 0;
        for (let [k,v] of map) {
            if (v > value) {
                key = k;
                value = v;
            }
        }
        return key;
    },

    /**
     * Returns the value of an element in a table, selected by the row and column integer indexes
     * @param {Spreadsheet.Table} range
     * @param {int} row
     * @param {int} column
     * @throws {Spreadsheet.FormulaError} Column and Row must be smaller than range.table size
     * @throws {Spreadsheet.ArgumentTypeError} Range must be of type Spreadsheet.Table, row and column must be of type int
     * @returns {int|string|boolean}
     * @function
     */
    INDEX(range, row, column) {
        if (!(range instanceof Spreadsheet.Table) || typeof row !== 'number' || typeof column !== 'number') {
            throw new Spreadsheet.ArgumentTypeError(this.position);
        }
        if (column < range.table.length && row < range.table[0].length) {
            return range.table[column][row];
        } else {
            throw new Spreadsheet.FormulaError(`Table index out of range`, this.position);
        }
    }
});