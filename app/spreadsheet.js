/**
 * @class represents and object that is able to store and call event listeners
 * @example
 *   const manager = new EventManager();
 *   const tag = Symbol("my_event");
 *   const listener = (...args) => console.log(args);
 *   manager.addEventListener(tag, listener);
 *   manager.triggerEvent(tag, 1, 2, 3);
 *   manager.removeEventListener(listener);
 */
const EventManager = class {

    /**
     * @constructor
     */
    constructor() {

        /**
         * @type {Array}
         * @private
         */
        this._events = [];

    }

    /**
     * Adds new event listener
     * @param {Symbol} tag
     * @param {function} listener
     */
    addEventListener(tag, listener) {
        this._events.push(
            new EventManager._Event(tag, listener)
        );
    }

    /**
     * Removes event listener
     * @param {function} listener
     */
    removeEventListener(listener) {
        for(let i = this._events.length - 1; i >= 0; i--)
            if(this._events[i].listener === listener) this._events.splice(i, 1);
    }

    /**
     * Calls all event listeners whose tags match the given tag
     * @param {Symbol} tag
     * @param {...*} args Arguments passed to event listener
     */
    triggerEvent(tag, ...args) {
        this._events.forEach(event => {
            if(event.tag === tag) event.listener.apply(this, args);
        });
    }

};

/**
 * @class represents an event — a pair of a tag and a listener function
 * @private
 * @static
 * @memberOf EventManager
 */
EventManager._Event = class {

    /**
     * @constructor
     * @param {Symbol} tag
     * @param {function} listener
     */
    constructor(tag, listener) {
        this.tag = tag;
        this.listener = listener;
    }

};

/**
 * @class represents a spreadsheet
 * @extends EventManager
 */
const Spreadsheet = class extends EventManager {

    /**
     * @constructor
     */
    constructor() {

        super();
        /**
         * @type {!Array<Array<Spreadsheet._Cell>>} Array of spreadsheet cells
         */
        this.cells = [];
    }

    /**
     * Updates size of table
     * @param {int} i New row index
     * @param {int} j New column index
     */
    _updateSize(i, j) {
        let columns = this.cells.length;
        let rows = this.cells.length > 0 ? this.cells[0].length : 0;
        if (i < 0 || j < 0) return;
        if (i > columns) {
            for (let index = columns - 1; index < i; index++) {
                this.cells[index] = [new Spreadsheet._Cell()];
            }
        } else if (i < columns) {
            for (let index = i; index < columns; index++) {
                this.cells.pop();
            }
        }
        if (j < rows) {
            for (let indexI = 0; indexI < i; indexI++) {
                for (let indexJ = 0; indexJ <= rows - this.cells[indexI].length; indexJ++) {
                    this.cells[indexI].pop();
                }
            }
        }
        for (let indexI = 0; indexI < i; indexI++) {
            for (let indexJ = this.cells[indexI].length ; indexJ < j; indexJ++) {
                this.cells[indexI][indexJ] = new Spreadsheet._Cell();
            }
        }
    }

    /**
     * Gets string representation of a formula in a cell
     * @param {int} i Row index
     * @param {int} j Column index
     * @returns {string} Formula
     */
    getFormula(i, j) {



        return "";

    }

    /**
     * Puts a formula into a cell and evaluates it
     * @param {int} i Row index
     * @param {int} j Column index
     * @param {string} formula Formula
     * @throws {Spreadsheet.FormulaSyntaxError} on syntax error in formula
     */
    setFormula(i, j, formula) {

    }

};

/**
 * Enum for defined event types
 * @enum {Symbol}
 * @readonly
 */
Spreadsheet.Event = Object.freeze({

    /**
     * When cell value is updated.
     * @param {int} Row index
     * @param {int} Column index
     * @param {*} Cell value
     */
    CELL_VALUE_UPDATED: Symbol("cell_value_updated"),

    /**
     * When formula in the cell is updated
     * @param {int} Row index
     * @param {int} Column index
     * @param {string} Formula
     */
    CELL_FORMULA_UPDATED: Symbol("cell_formula_updated"),

    /**
     * When it is detected that cell is a part or a circular dependency
     * @param {int} Row index
     * @param {int} Column index
     */
    CELL_CIRCULAR_DEPENDENCY_DETECTED: Symbol("cell_circular_dependency_detected"),

});


/**
 * @class represents an error in formula
 */
Spreadsheet.FormulaError = class extends Error {
    constructor(reason, position) {
        super(`${reason} at character ${position}`);
        this.name = "Formula Error";
        this.position = position;
    }
};

/**
 * @class represents an argument type error in formula
 */
Spreadsheet.ArgumentTypeError = class extends Spreadsheet.FormulaError {
    constructor(position) {
        super("Invalid type of argument(s)", position);
        this.name = "Type of Argument Error";
        this.position = position;
    }
};

/**
 * @class represents a quantity of arguments error in formula
 */
Spreadsheet.QuantityOfArgumentsError = class extends Spreadsheet.FormulaError {
    constructor(position) {
        super("Invalid quantity of arguments", position);
        this.name = "Quantity of Arguments Error";
        this.position = position;
    }
};

/**
 * @class represents a syntax error in formula
 */
Spreadsheet.FormulaSyntaxError = class extends Spreadsheet.FormulaError {

    /**
     * @constructor
     * @param {string} reason Description of a syntax error
     * @param {int} position Index of character in formula where error has occurred
     */
    constructor(reason, position) {
        super(`${reason} at character ${position}`);
        this.name = "Formula Syntax Error";
        this.position = position;
    }

};

Spreadsheet._Cell = class {

    /**
     * @constructor
     */
    constructor() {
        /**
         * @type {undefined} Cell value
         */
        this.value = undefined;
        /**
         * @type {Spreadsheet._Expression} Parsed formula
         */
        this.expression = undefined;
    }

};

/**
 * Enum for functions that can be used in formulas
 * @enum
 * @private
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
        if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
        if (typeof value === "boolean") return !value; 
        throw new ArgumentTypeError(this.position);
    },

    /**
     * Logical AND
     * @param {...boolean} values
     * @returns {boolean}
     * @function
     */
    AND(...values) {
        if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
        if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
        return values.every(e => e);
    },

    /**
     * Logical OR
     * @param {...boolean} values
     * @returns {boolean}
     * @function
     */
    OR(...values) {
        if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
        if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
        return values.some(e => e);
    },

    /**
     * Concatenates strings
     * @param {...string} args
     * @returns {string}
     * @function
     */
    CONCATENATE(...args) {
        if (args.length === 0) throw new QuantityOfArgumentsError(this.position);
        if (args.some(e => typeof e !== "string")) throw new ArgumentTypeError(this.position);
        return args.join("");
    },

    /**
     * Casts value to number
     * @param {number|string|boolean} value
     * @returns {number}
     * @function
     */
    NUMBER(value) { 
        if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
        if (!isNaN(value)) return +value; 
        throw new ArgumentTypeError(this.position);
    },

    /**
     * Casts value to boolean
     * @param {number|string|boolean} value
     * @returns {boolean}
     * @function
     */
    BOOLEAN(value) {
        if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
        return !(!value || value === "0" || (typeof value === "string" && value.toLowerCase() === "false"));
    },

    /**
     * Casts value to string
     * @param {number|string|boolean} value
     * @returns {string}
     * @function
     */
    STRING(value) {
        if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
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
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
        return a + b;
    },


    /**
     * Subtracts second number from first; also a `-` operator
     * @param {number} a
     * @param {number} b
     * @returns {number}
     * @function
     */
    SUBTRACT(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
        return a - b;
    },

    /**
     * Negates a number; also a unary `-` operator
     * @param {number} a
     * @returns {number}
     * @function
     */
    NEGATE(a) {
        if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== "number") throw new ArgumentTypeError(this.position);
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
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
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
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
        return a / b;
    },

    /**
     * Checks if two values are equal; also an `=` operator
     * @param {number|string|boolean} a
     * @param {number|string|boolean} b
     * @returns {boolean}
     * @function
     */
    EQUALS(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b) throw new ArgumentTypeError(this.position);
        return a == b;
    },

    /**
     * Checks if a is greater than b; also a `>` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    GREATER(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
        return a > b;
    },

    /**
     * Checks if a is less or equal than b; also a `<=` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    LESSOREQUALS(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
        return a <= b;
    },

    /**
     * Checks if a is less than b; also a `<` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    LESS(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
        return a < b;
    },

    /**
     * Checks if a is greater or equal than b; also a `>=` operator
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @function
     */
    GREATEROREQUALS(a, b) {
        if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
        if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
        return a >= b;
    }
    
});

/**
 * @class represents position of token in formula
 * @private
 */
Spreadsheet._Position = class {

    /**
     * @constructor
     * @param {string} formula Formula
     * @param {int} index Index of current character in formula
     */
    constructor(formula, index) {
        /**
         * @type {String} formula
         */
        this.formula = formula;
        /**
         * @type {int} start index of token in text
         */
        this.index = index;
    }

    /**
     * Gets code of character
     * @returns {int} Code of character at position or -5 if reached end of text
     */
    getCharCode() {
        return this.index < this.formula.length ? this.formula.codePointAt(this.index) : -5;
    }

    /**
     * Check if character match RegExp condition
     * @param {RegExp} p
     * @returns {boolean} character satisfaction to condition
     */
    satisfies(p) {
        let code = this.getCharCode();
        if (code !== -5) {
            return String.fromCodePoint(code).match(p) !== null
        }
        return false
    }

    /**
     * Return next position
     * @returns {Spreadsheet._Position} Position of next character
     */
    skip() {
        const code = this.getCharCode();
        if (code === -5) {
            return this;
        }
        return new Spreadsheet._Position(this.formula, this.index + (code > 0xFFFF ? 2 : 1));
    }

    /**
     * Skip characters as long as condition
     * @param {RegExp} p
     * @returns {Spreadsheet._Position} Position of next token
     */
    skipWhile(p) {
        let pos = this;
        while(pos.satisfies(p)) pos = pos.skip();
        return pos;
    }
};

/**
 * @class represents token of formula
 * @private
 */
Spreadsheet._Token = class {

    /**
     * @constructor
     * @param {Spreadsheet._Position} cur current position
     * @throws {Spreadsheet.FormulaError} if unexpected token occurs
     */
    constructor(cur) {
        /**
         * @type {Spreadsheet._Position} Start position of current token
         */
        this.start = cur;
        while (cur.getCharCode() !== -5 && String.fromCodePoint(cur.getCharCode()) === ' ') {
            this.start = this.start.skip();
        }
        /**
         * @type {Spreadsheet._Position} End position of current token
         */
        this.follow = this.start.skip();
        let code = this.start.getCharCode();
        if (code === -5) {
            this.tag = Spreadsheet._Token.Tag.END_OF_TEXT;
            return;
        }
        switch(String.fromCodePoint(code)) {
            case '+':
                this.tag = Spreadsheet._Token.Tag.PLUS;
                break;
            case '-':
                this.tag = Spreadsheet._Token.Tag.MINUS;
                break;
            case '*':
                this.tag = Spreadsheet._Token.Tag.TIMES;
                break;
            case '/':
                this.tag = Spreadsheet._Token.Tag.DIVIDES;
                break;
            case '(':
                this.tag = Spreadsheet._Token.Tag.PARENTHESIS_OPENING;
                break;
            case ')':
                this.tag = Spreadsheet._Token.Tag.PARENTHESIS_CLOSING;
                break;
            case ',':
                this.tag = Spreadsheet._Token.Tag.COMMA;
                break;
            case '=':
                this.tag = Spreadsheet._Token.Tag.EQUAL;
                break;
            case '\"':
                while (this.follow.getCharCode() !== -5
                && !(String.fromCodePoint(this.follow.getCharCode()) !== "\\"
                    && String.fromCodePoint(this.follow.skip().getCharCode()) === "\"")) {
                    this.follow = this.follow.skip();
                }
                this.follow = this.follow.skip();
                this.follow = this.follow.skip();
                this.tag = Spreadsheet._Token.Tag.STRING;
                break;
            case '<':
                if (this.follow.getCharCode() !== -5 && String.fromCodePoint(this.follow.getCharCode()) === '=') {
                    this.follow = this.follow.skip();
                    this.tag = Spreadsheet._Token.Tag.SMALLER_OR_EQUAL;
                } else {
                    this.tag = Spreadsheet._Token.Tag.SMALLER;
                }
                break;
            case '>':
                if (this.follow.getCharCode() !== -5 && String.fromCodePoint(this.follow.getCharCode()) === '=') {
                    this.follow = this.follow.skip();
                    this.tag = Spreadsheet._Token.Tag.BIGGER_OR_EQUAL;
                } else {
                    this.tag = Spreadsheet._Token.Tag.BIGGER;
                }
                break;
            default:
                if(this.start.satisfies(/[a-zA-Z]/i)) {
                    this.follow = this.follow.skipWhile(/[0-9a-zA-Z]/i);
                    let startIndex = this.start.index;
                    let endIndex = this.follow.index;
                    let identifier = this.start.formula.substr(startIndex, endIndex-startIndex);
                    if (identifier === 'TRUE') {
                        this.tag = Spreadsheet._Token.Tag.TRUE
                    } else if (identifier === 'FALSE') {
                        this.tag = Spreadsheet._Token.Tag.FALSE
                    } else {
                        this.tag = Spreadsheet._Token.Tag.IDENTIFIER;
                    }
                } else if(this.start.satisfies(/[0-9]/i)) {
                    this.follow = this.follow.skipWhile(/[0-9]/i);
                    if(this.follow.satisfies(/[a-zA-Z]/i)) {
                        throw new Spreadsheet.FormulaError("delimiter expected", this.start.index);
                    }
                    this.tag = Spreadsheet._Token.Tag.NUMBER;
                } else {
                    throw new Spreadsheet.FormulaError("invalid character", this.start.index);
                }
        }
    }

    /**
     * Check equality of current token and passed parameter
     * @param {Spreadsheet._Token.Tag} t
     * @returns {boolean} equality of tokens
     */
    matches(t) {
        return t === this.tag
    }

    /**
     * Returns next token
     * @returns {Spreadsheet._Token} next token
     */
    next() {
        return new Spreadsheet._Token(this.follow);
    }
};

/**
 * Enum for token types
 * @enum
 * @readonly
 */
Spreadsheet._Token.Tag = Object.freeze({
    SMALLER_OR_EQUAL: Symbol("SMALLER_OR_EQUAL"),
    BIGGER_OR_EQUAL: Symbol("BIGGER_OR_EQUAL"),
    EQUAL: Symbol("EQUAL"),
    SMALLER: Symbol("SMALLER"),
    BIGGER: Symbol("BIGGER"),
    STRING: Symbol("STRING"),
    NUMBER: Symbol("NUMBER"),
    IDENTIFIER: Symbol("IDENTIFIER"),
    PLUS: Symbol("PLUS"),
    MINUS: Symbol("MINUS"),
    TIMES: Symbol("TIMES"),
    DIVIDES: Symbol("DIVIDES"),
    TRUE: Symbol("TRUE"),
    FALSE: Symbol("FALSE"),
    PARENTHESIS_OPENING: Symbol("PARENTHESIS_OPENING"),
    PARENTHESIS_CLOSING: Symbol("PARENTHESIS_CLOSING"),
    COMMA: Symbol("COMMA"),
    END_OF_TEXT: Symbol("END_OF_TEXT")
});

/**
 * @class checks formula for grammar
 * @private
 */
Spreadsheet._Parser = class {

    /**
     * @constructor
     * @param {String} text Formula
     */
    constructor(text) {
        /**
         * @type {Spreadsheet._Token} Start position of current token
         */
        this.token = new Spreadsheet._Token(new Spreadsheet._Position(text, 0));
    }

    /**
     * Check equality of current token tag and parameter token tag
     * @param {Spreadsheet._Token.Tag} tag
     * @throws {Spreadsheet.FormulaError} if unexpected token occurs
     */
    expect(tag) {
        if(!this.token.matches(tag)) {
            throw new Spreadsheet.FormulaError("unexpected token", this.token.start.index);
        }
        this.token = this.token.next();
    }

    /**
     * Parses formula
     */
    parse() {
        this.parseExpression();
        this.expect(Spreadsheet._Token.Tag.END_OF_TEXT);
    }

    /**
     * Parses Expression rule
     */
    parseExpression() {
        // <Expression> :== <Compared> <ComparedRest>
        console.log("< Expression> :== <Compared> <ComparedRest>");
        this.parseCompared();
        this.parseComparedRest();
    }

    /**
     * Parses ComparedRest rule
     */
    parseComparedRest() {
        //<ComparedRest> :== <ComparisonOperator> <Compared> <ComparedRest> | ε
        if (this.parseComparisonOperator()) {
            console.log("< ComparedRest> :== <ComparisonOperator> <Compared> <ComparedRest>");
            this.parseCompared();
            this.parseComparedRest()
        } else {
            console.log("< ComparedRest> :== ε");
        }

    }

    /**
     * Parses ComparisonOperator rule
     * @returns {boolean} equality of current token and any of сomparison tokens
     */
    parseComparisonOperator() {
        //<ComparisonOperator> :== "=" | "<" | ">" | "<=" | ">="
        switch (this.token.tag) {
            case Spreadsheet._Token.Tag.EQUAL:
                console.log("< ComparisonOperator> :== \"=\"");
                this.token = this.token.next();
                return true;
            case Spreadsheet._Token.Tag.SMALLER_OR_EQUAL:
                console.log("< ComparisonOperator> :== \"<=\"");
                this.token = this.token.next();
                return true;
            case Spreadsheet._Token.Tag.SMALLER:
                console.log("< ComparisonOperator> :== \"<\"");
                this.token = this.token.next();
                return true;
            case Spreadsheet._Token.Tag.BIGGER_OR_EQUAL:
                console.log("< ComparisonOperator> :== \">=\"");
                this.token = this.token.next();
                return true;
            case Spreadsheet._Token.Tag.BIGGER:
                console.log("< ComparisonOperator> :== \">\"");
                this.token = this.token.next();
                return true;
            default: return false;
        }
    }

    /**
     * Parses Compared rule
     */
    parseCompared() {
        //<Compared> :== <Term> <Terms>
        console.log("< Compared> :== <Term> <Terms>");
        this.parseTerm();
        this.parseTerms();
    }

    /**
     * Parses Terms rule
     */
    parseTerms() {
        //<Terms> :== "-" <Term> <Terms> | "+" <Term> <Terms> | ε
        if (this.token.tag === Spreadsheet._Token.Tag.MINUS) {
            console.log("< Terms> :== \"-\" <Term> <Terms>");
            this.token = this.token.next();
            this.parseTerm();
            this.parseTerms();
        } else if (this.token.tag === Spreadsheet._Token.Tag.PLUS) {
            console.log("< Terms> :== \"+\" <Term> <Terms>");
            this.token = this.token.next();
            this.parseTerm();
            this.parseTerms();
        } else {
            console.log("< Terms> :== ε");
        }
    }

    /**
     * Parses Term rule
     */
    parseTerm() {
        //<Term> :== <Factor> <Factors>
        console.log("< Term> :== <Factor> <Factors>");
        this.parseFactor();
        this.parseFactors();
    }

    /**
     * Parses Factors rule
     */
    parseFactors() {
        //<Factors> :== "*" <Factor> <Factors> | "/" <Factor> <Factors> | ε
        if (this.token.tag === Spreadsheet._Token.Tag.TIMES) {
            console.log("< Factors> :== \"*\" <Factor> <Factors>");
            this.token = this.token.next();
            this.parseFactor();
            this.parseFactors();
        } else if (this.token.tag === Spreadsheet._Token.Tag.DIVIDES) {
            console.log("< Factors> :== \"/\" <Factor> <Factors>");
            this.token = this.token.next();
            this.parseFactor();
            this.parseFactors();
        } else {
            console.log("< Factors> :== ε");
        }
    }

    /**
     * Parses Factor rule
     */
    parseFactor() {
        //<Factor> :== NUMBER | STRING | "TRUE" | "FALSE" | <Identifiable> | "(" <Expression> ")" | "-" <Factor>
        let tag = this.token.tag;
        if (tag === Spreadsheet._Token.Tag.NUMBER) {
            console.log("< Factor> :== NUMBER");
            this.token = this.token.next();
        } else if (tag === Spreadsheet._Token.Tag.STRING) {
            console.log("< Factor> :== STRING");
            this.token = this.token.next();
        } else if (tag === Spreadsheet._Token.Tag.TRUE) {
            console.log("< Factor> :== \"TRUE\"");
            this.token = this.token.next();
        } else if (tag === Spreadsheet._Token.Tag.FALSE) {
            console.log("< Factor> :== \"FALSE\"");
            this.token = this.token.next();
        } else if (tag === Spreadsheet._Token.Tag.IDENTIFIER) {
            console.log("< Factor> :== <Identifiable>");
            this.parseIdentifiable();
        } else if (tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) {
            console.log("< Factor> :== \"(\" <Expression> \")\"");
            this.token = this.token.next();
            this.parseExpression();
            this.expect(Spreadsheet._Token.Tag.PARENTHESIS_OPENING);
        } else if (tag === Spreadsheet._Token.Tag.MINUS) {
            console.log("< Factor> :== \"-\" <Factor>");
            this.token = this.token.next();
            this.parseFactor();
        } else {
            throw new Spreadsheet.FormulaError("unexpected token", this.token.index);
        }
    }

    /**
     * Parses Identifiable rule
     */
    parseIdentifiable() {
        //<Identifiable> :== IDENTIFIER <Call>
        console.log("< Identifiable> :== IDENTIFIER <Call>");
        this.expect(Spreadsheet._Token.Tag.IDENTIFIER);
        this.parseCall();
    }

    /**
     * Parses Call rule
     */
    parseCall() {
        //<Call> :== "(" <Arguments> ")" | ε
        if (this.token.tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) {
            console.log("< Call> :== \"(\" <Arguments> \")\"");
            this.parseArguments();
            this.expect(Spreadsheet._Token.Tag.PARENTHESIS_CLOSING);
        } else {
            console.log("< Call> :== ε");
        }
    }

    /**
     * Parses Arguments rule
     */
    parseArguments() {
        //<Arguments> :== <Expression> <ArgumentsRest> | ε
        let tag = this.token.tag;
        if (tag === Spreadsheet._Token.Tag.NUMBER || tag === Spreadsheet._Token.Tag.STRING ||
            tag === Spreadsheet._Token.Tag.TRUE || tag === Spreadsheet._Token.Tag.FALSE ||
            tag === Spreadsheet._Token.Tag.IDENTIFIER || tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING ||
            tag === Spreadsheet._Token.Tag.MINUS ) {
            console.log("< Arguments> :== <Expression> <ArgumentsRest>");
            this.parseExpression();
            this.parseArgumentsRest();
        } else {
            console.log("< Arguments> :== ε");
        }
    }

    /**
     * Parses ArgumentsRest rule
     */
    parseArgumentsRest() {
        //<ArgumentsRest> :== "," <Expression> <ArgumentsRest> | ε
        if (this.token.tag === Spreadsheet._Token.Tag.COMMA) {
            console.log("< ArgumentsRest> :== \",\" <Expression> <ArgumentsRest>");
            this.token = this.token.next();
            this.parseExpression();
            this.parseArgumentsRest();
        } else {
            console.log("< ArgumentsRest> :== ε");
        }
    }
};

Spreadsheet._CellGraph = class {

    /**
    * @constructor
    */
    constructor() {
        this.vertices = [];
    }
    /**
    * Adds a new vertex;
    * @param {Vertex}
    * @method
    */
    addVertex(vertex) {
        this.vertices.push(vertex);
    }
    /**
    * Adds a new edge;
    * @param {Vertex}
    * @param {Vertex}
    * @method
    */
    addEdge(vertex1, vertex2) {
        vertex1.edges.push(vertex2);
    }
    /**
    * Finds all the vertices that are in cycle with the "vertex" in @param;
    * @param {Vertex}
    * @method
    */
    findCycleFrom(vertex) {
        vertex.ifCyclic(vertex);
        this.vertices.forEach (v => {
            v._color = 0;
            v._parent = null; 
        });
        if (vertex.cycle.length === 0) return null;
        let ret = vertex.cycle;
        vertex.cycle = [];
        return ret;
    }
    
    detachVertex(vertex) {у
        this.vertices.forEach(v => {
            let arr = [];
            v.edges.forEach(to => {
                if (to !== vertex) arr.push(to);
            });
            v.edges = arr;
        });
    }
};

Spreadsheet._CellGraph.Vertex = class {
    
    /**
    * @constructor
    * @param cell row
    * @param cell column
    */
    constructor(row, column) {
        this.row = row;
        this.column = column;
        this.edges = [];
        /**
        * color, used in ifCyclic
        * @private
        */
        this._color = 0;
        /**
        * parent, used in addAll for the search of the vertices in cycle
        * @private
        */
        this._parent = null;
        this.cycle = [];
    }
    
    /**
    * Finds a cycle and triggers addAll();
    * @param {Vertex}
    * @method
    */
    ifCyclic(current)  {
        
        current._color = 1;  
        current.edges.forEach(to => {
            if (to._color === 0) {
                to._parent = current;
                this.ifCyclic(to);
            }
            else if (to === this) {
                this._parent = current;
                   this.addAll();
            }
        });
        current._color = 2;
    }

    /**
    * Adds the vertices that are in cycle with "this";
    * @param {Vertex}
    * @method
    */
    addAll() {
        let current = this._parent;
        while (current !== this) {
            if (this.cycle.indexOf(current) === -1) this.cycle.push(current);
            current = current._parent;
        }
    }
};




/*let v1 = new Spreadsheet._CellGraph.Vertex(1, 1, null);
let v2 = new Spreadsheet._CellGraph.Vertex(1, 2, null);
let v3 = new Spreadsheet._CellGraph.Vertex(1, 3, null);
let v4 = new Spreadsheet._CellGraph.Vertex(1, 4, null);
let v5 = new Spreadsheet._CellGraph.Vertex(1, 5, null);
let v6 = new Spreadsheet._CellGraph.Vertex(1, 6, null);

let a1 = [];
a1.push(v2);
a1.push(v6);
v1.edges = a1;

let a2 = [];
a2.push(v1);
a2.push(v1);
a2.push(v3);
v2.edges = a2;


let a3 = [];
a3.push(v4);
v3.edges = a3;

let a4 = [];
a4.push(v5);
v4.edges = a4;

let a5 = [];
a5.push(v2);
a5.push(v1);
v5.edges = a5;

let arr = [];
arr.push(v1);
arr.push(v2);
arr.push(v3);
arr.push(v4);
arr.push(v5);
arr.push(v6);


let g = new Spreadsheet._CellGraph(arr);
let array = g.findCycleFrom(v1);

for (let i = 0; i < array.length; i++) {
    alert(array[i].column)
}*/








