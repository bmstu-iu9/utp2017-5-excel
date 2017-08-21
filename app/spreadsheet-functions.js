/**
 * Enum for functions that can be used in formulas
 * @enum
 * @readonly
 */
Spreadsheet._Function = Object.freeze({

    /**
     * Logical NOT
     * @param {boolean} value
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
     * @returns {string}
     * @function
     */
    CONCATENATE(...args) {
        if (args.length === 0) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (args.some(e => typeof e !== "string")) throw new Spreadsheet.ArgumentTypeError(this.position);
        return args.join("");
    },

    /**
     * Casts value to number
     * @param {number|string|boolean} value
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
     * @returns {string}
     * @function
     */
    TEXT(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        switch (typeof value) {
            case "boolean":
                return value ? "TRUE" : "FALSE";
            case "number":
                return "" + value;
            case "string":
                return value;
        }
    },

    /**
     * Add up to numbers; also a `+` operator
     * @param {number} a
     * @param {number} b
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
     * @returns {number}
     * @function
     */
    DIVIDE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a / b;
    },

    /**
     * Checks if two values are equal; also an `=` operator
     * @param {number|string|boolean} a
     * @param {number|string|boolean} b
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
     * @returns {boolean}
     * @function
     */
    GT(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a > b;
    },

    /**
     * Checks if a is less or equal than b; also a `<=` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    LTE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a <= b;
    },

    /**
     * Checks if a is less than b; also a `<` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    LT(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a < b;
    },

    /**
     * Checks if a is greater or equal than b; also a `>=` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    GTE(a, b) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        return a >= b;
    },

    /**
     * Abs
     * @param x
     * @returns {number}
     * @function
     */
    ABS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.abs(x);
    },

    /**
     * Arccosine
     * @param x
     * @returns {number}
     * @function
     */
    ACOS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.acos(x);
    },

    /**
     * Arcsine
     * @param x
     * @returns {number}
     * @function
     */
    ASIN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.asin(x);
    },

    /**
     * Arctangent
     * @param x
     * @returns {number}
     * @function
     */
    ATAN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.arc(x);
    },

    /**
     * Arccotangent
     * @param x
     * @returns {number}
     * @function
     */
    ACOT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.atan(1/x);
    },

    /**
     *
     * @param x
     * @returns {number}
     * @function
     */
    COS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.cos(x);
    },

    /**
     * Cotangent
     * @param x
     * @returns {number}
     * @function
     */
    COT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.cos(x)/Math.sin(x);
    },

    /**
     *
     * @param x
     * @returns {number}
     * @function
     */
    CEILING(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.ceil(x);
    },

    /**
     * Radians to degrees
     * @param x
     * @returns {number}
     * @function
     */
    DEGREES(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*180/Math.PI;
    },

    /**
     * Exponent of x
     * @param x
     * @returns {number}
     * @function
     */
    EXP(x = 1) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.exp(x);
    },

    /**
     * Factorial of x
     * @param x
     * @returns {number}
     * @function
     */
    FACT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (x === 0 || x === 1) return 1;
        let factorial = 1;
        while (x > 1) {
            factorial *= x;
            x--;
        }
        return factorial;
    },

    /**
     *
     * @param x
     * @returns {number}
     * @function
     */
    FLOOR(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.floor(x);
    },

    /**
     *
     * @param x
     * @param y
     * @returns {number}
     * @function
     */
    GCD(x, y) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof y !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        while (y) {
            let z = x%y;
            x = y;
            y = z;
        }
        return x;
    },

    /**
     * Checks if x is even
     * @param x
     * @returns {boolean}
     * @function
     */
    ISEVEN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x%2 === 0;
    },

    /**
     * Checks if x is odd
     * @param x
     * @returns {boolean}
     * @function
     */
    ISODD(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x%2 === 1;
    },

    /**
     *
     * @param x
     * @param y
     * @returns {number}
     * @function
     */
    LCM(x, y) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof y !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*y/GCD(x, y);
    },

    /**
     * Natural logarithm of x
     * @param x
     * @returns {number}
     * @function
     */
    LN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.log(x);
    },

    /**
     * A logarithm of x to the base 10
     * @param x
     * @returns {number}
     * @function
     */
    LOG10(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.log10(x);
    },

    /**
     * A logarithm of x to the base "base"
     * @param x
     * @param base
     * @returns {number}
     * @function
     */
    LOG(x, base) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof base !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.log(x)/Math.log(base);
    },

    /**
     *
     * @param dividend
     * @param divisor
     * @returns {number}
     * @function
     */
    MOD(dividend, divisor) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof dividend !== "number" || typeof divisor !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return dividend%divisor;
    },

    /**
     *
     * @returns {number}
     * @function
     */
    PI() {
        return Math.PI;
    },

    /**
     *
     * @param base
     * @param exponent
     * @returns {number}
     * @function
     */
    POW(base, exponent) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof base !== "number" || typeof exponent !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.pow(base, exponent);
    },

    /**
     * целочисленное деление
     * @param dividend
     * @param divisor
     * @returns {number}
     * @function
     */
    QUOTIENT(dividend, divisor) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof dividend !== "number" || typeof divisor !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return divident/divisor;
    },

    /**
     * Degrees to radians
     * @param x
     * @returns {number}
     * @function
     */
    RADIANS(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return x*Math.PI/180;
    },

    /**
     *
     * @returns {number}
     * @function
     */
    RAND() {
        return Math.random();
    },

    /**
     *
     * @param low
     * @param high
     * @returns {number}
     * @function
     */
    RANDBETWEEN(low, high) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof low !== "number" || typeof high !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.random()*(high - low) + low;
    },

    /**
     *
     * @param x
     * @param places
     * @returns {number}
     * @function
     */
    ROUND(x, places = 0) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number" || typeof places !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.round(x*Math.pow(10, places))/Math.pow(10, places);
    },

    /**
     *
     * @param x
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
     * Sine
     * @param x
     * @returns {number}
     * @function
     */
    SIN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.sin(x);
    },

    /**
     * Square root
     * @param x
     * @returns {number}
     * @function
     */
    SQRT(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.sqrt(x);
    },

    /**
     * Tangent
     * @param x
     * @returns {number}
     * @function
     */
    TAN(x) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof x !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return Math.tan(x);
    },

    /**
     * Returns a symbol, which Unicode index is "index"
     * @param index
     * @returns {string}
     * @function
     */
    CHAR(index) {
        if (args.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof index !== "number") throw new Spreadsheet.ArgumentTypeError(this.position);
        return String.fromCharCode(index);
    },

    /**
     * Returns Unicode index of the first str symbol
     * @param str
     * @returns {Number}
     * @function
     */
    CODE(str) {
        if (args.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.charCodeAt(0);
    },

    /**
     *
     * @param str
     * @param text
     * @param start
     * @returns {Number|number}
     * @function
     */
    FIND(str, text, start = 0) {
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || typeof text !== "string" || typeof start !== "number")
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return text.indexOf(str, start);
    },

    /**
     *
     * @param num
     * @param placesAfterFloatingPoint
     * @returns {string}
     * @function
     */
    FIXED(num, placesAfterFloatingPoint) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof num !== "number" || typeof placesAfterFloatingPoint !== "number") {
            throw new Spreadsheet.ArgumentTypeError(this.position);
        }
        return num.toFixed(placesAfterFloatingPoint);
    },

    /**
     *
     * @param str
     * @param len
     * @returns {string}
     * @function
     */
    LEFT(str, len) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || typeof len !== "number") {
            throw new Spreadsheet.ArgumentTypeError(this.position);
        }
        return str.substr(0, len);
    },

    /**
     *
     * @param str
     * @function
     */
    LEN(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.length;
    },

    /**
     *
     * @param str
     * @returns {string}
     * @function
     */
    LOWER(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.toLowerCase();
    },

    /**
     * Substring
     * @param str
     * @param start
     * @param len
     * @returns {string}
     * @function
     */
    MID(str, start, len) {
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || typeof start !== "number" || typeof len !== "number")
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.substr(start, len);
    },

    /**
     *
     * @param str
     * @param len
     * @returns {string}
     * @constructor
     */
    RIGHT(str, len) {
        if (arguments.length !== 2) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || typeof len !== "number")
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.substr(str.length - len, len);
    },

    /**
     *
     * @param str
     * @param text
     * @param start
     * @returns {Number}
     * @function
     */
    SEARCH(str, text, start = 0) {
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string" || typeof text !== "string" || typeof start !== "number")
            throw new Spreadsheet.ArgumentTypeError(this.position);
        return text.toLowerCase().indexOf(str.toLowerCase(), start);
    },

    /**
     *
     * @param str
     * @returns {string}
     * @function
     */
    UPPER(str) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof str !== "string") throw new Spreadsheet.ArgumentTypeError(this.position);
        return str.toUpperCase();
    },

    /**
     *
     * @param value
     * @returns {boolean}
     * @function
     */
    ISNUMBER(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "number";
    },

    /**
     *
     * @param value
     * @returns {boolean}
     * @function
     */
    ISLOGICAL(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "boolean";
    },

    /**
     *
     * @param value
     * @returns {boolean}
     * @function
     */
    ISTEXT(value) {
        if (arguments.length !== 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        return typeof value === "string";
    },

    /**
     * Returns one value if a logical expression is `true` and another if it is `false`.
     * @param condition
     * @param ifTrue
     * @param ifFalse
     * @returns {*}
     * @function
     */
    IF(condition, ifTrue, ifFalse) {
        if (arguments.length !== 3) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        if (typeof condition !== "boolean") throw new Spreadsheet.ArgumentTypeError(this.position);
        if (condition) return ifTrue;
        return ifFalse;
    },
    
    SUM(...args) {
        console.log(args);
        if (args.length < 1) throw new Spreadsheet.QuantityOfArgumentsError(this.position);
        const p = this.position;
        return args.reduce((sum, element) => {
            if (element instanceof Spreadsheet._Table) {
                let rangeSum = 0;
                element.forEachValue(cell => {
                    if (typeof cell !== 'number') throw new Spreadsheet.ArgumentTypeError(p);
                    rangeSum += cell;
                });
                return sum + rangeSum;
            } else if (typeof element === "number") {
                return sum + element;
            } else {
                throw new Spreadsheet.ArgumentTypeError(p);
            }
        }, 0);
    }
});


