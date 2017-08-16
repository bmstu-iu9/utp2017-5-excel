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
        if (i < 0 || j < 0) return;
        const rows = this.cells.length;
        const columns = this.cells.length > 0 ? this.cells[0].length : 0;
        if (i<rows) {
            for (let index = i; index < rows; index++) {
                this.cells.pop();
            }
        } else if (i>rows) {
            for (let index = rows; index < i; index++) {
                this.cells[index] = Array(columns).fill(new Spreadsheet._Cell());
            }
        }

        if (j<columns) {
            for (let indexJ = 0; indexJ < i; indexJ++) {
                for (let indexI = j; indexI < columns; indexI++) {
                    this.cells[indexJ].pop();
                }
            }
        } else if (j>columns) {
            for (let indexJ = 0; indexJ < i; indexJ++) {
                for (let indexI = columns; indexI < j; indexI++) {
                    this.cells[indexJ][indexI] = new Spreadsheet._Cell();
                }
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
     * @function
     */
    setFormula(i, j, formula) {
        let cell = this.cells[i][j];
        let parser = new Spreadsheet._Parser(formula);
        let parsed = parser.parse();
        cell.expression = parsed;
        if (parsed instanceof Spreadsheet._Expression) {
            cell.value = parsed.evaluate();
        } else if (parsed instanceof Spreadsheet._CellReference) {
            cell.value = parsed.cell.value;
        } else {
            cell.value = parsed;
        }
        this.triggerEvent(Spreadsheet.Event.CELL_VALUE_UPDATED, i, j, cell.value);
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
 * @class represents an error in cell value
 */
Spreadsheet.FormulaDependencyOnEmptyCellError = class extends Spreadsheet.FormulaError {
    constructor(cellName, position) {
        super(`Uninitialized cell ${cellName}`, position);
        this.name = "Cell Value Error";
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
         * @type {number|string|boolean} Cell value
         */
        this.value = undefined;
        /**
         * @type {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference} Parsed formula
         */
        this.expression = undefined;
    }

};

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
 * @class Represents a _Cell reference
 *
 */
Spreadsheet._CellReference = class {
    /**
     * @constructor
     * @param {String} cell name, letter/s + number/s
     */
    constructor(cell) {
        let row = 0;
        let i = 0;
        for (; cell.charCodeAt(i) > 64;  i++) {
            row += (cell.charCodeAt(i) - 65) + 26 * i;
        }
         const column = (+cell.slice(i)) - 1;
        /**
         * @type {Spreadsheet._Cell}
         */
        this.cell = Spreadsheet.cells[row][column];
        /**
         * @type {boolean}
         */
        this.rowFixed = undefined;
        /**
         * @type {boolean}
         */
        this.columnfixed = undefined;
    }

};

/**
 * @class Represents cell formula
 *
 */
Spreadsheet._Expression = class {
    /**
     * @constructor
     * @param {Spreadsheet._Function} func
     * @param args Array of function arguments
     * @param {Spreadsheet._Position} position of the Spreadsheet._Token in the formula text
     */
    constructor(func, args, position) {
        this.func = func;
        this.args = args;
        this.position = position;
    }
    /**
     * Evaluates formula in the cell
     * @function
     * @returns {number|string|boolean} new cell value
     * @throws {Spreadsheet.FormulaDependencyOnEmptyCellError}
     * @see Spreadsheet._CellReference.check
     *
     */
    evaluate() {
        const newArgs = this.args.map((elem)=>{
            if (elem instanceof Spreadsheet._Expression) {
                return elem.evaluate();
            } else if (elem instanceof Spreadsheet._CellReference) {
                const value = elem.cell.value;
                if (typeof value === "undefined" || value === null) {
                    throw new Spreadsheet.FormulaDependencyOnEmptyCellError(this.args[i], this.position);
                }
                return elem.cell.value;
            } else {
                return elem;
            }
        });
        return this.func.apply(this, newArgs);
    }


};

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
        const code = this.getCharCode();
        if (code !== -5) {
            return String.fromCodePoint(code).match(p) !== null
        }
        return false
    }

    /**
     * Return next position while collecting token body
     * @returns {Spreadsheet._Position} Position of next character
     * @param {Spreadsheet._Token} t
     */
    skipWithBody(t) {
        const code = this.getCharCode();
        t.body+= String.fromCharCode(code);
        if (code === -5) {
            return this;
        }
        return new Spreadsheet._Position(this.formula, this.index + (code > 0xFFFF ? 2 : 1));
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
     * @param {Spreadsheet._Token} withBody is present if skipping with collecting token body is needed
     * @returns {Spreadsheet._Position} Position of next token
     */
    skipWhile(p, withBody) {
        let pos = this;
        if (withBody) {
            while(pos.satisfies(p)) pos = pos.skipWithBody(withBody);
        } else {
            while(pos.satisfies(p)) pos = pos.skip();
        }
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
        /**
         * @type {string} This token's body: identifier or cell name if present.
         */
        this.body = "";
        while (this.start.getCharCode() !== -5 && String.fromCodePoint(this.start.getCharCode()) === ' ') {
            this.start = this.start.skip();
        }
        /**
         * @type {Spreadsheet._Position} End position of current token
         */
        this.follow = this.start.skip();
        const code = this.start.getCharCode();
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
                this.tag = Spreadsheet._Token.Tag.EQUALS;
                break;
            case '\"':
                while (this.follow.getCharCode() !== -5 && String.fromCodePoint(this.follow.getCharCode()) !== "\"") {
                    this.follow = this.follow.skip(this);
                }
                this.follow = this.follow.skip();
                this.tag = Spreadsheet._Token.Tag.STRING;
                break;
            case '<':
                if (this.follow.getCharCode() !== -5 && String.fromCodePoint(this.follow.getCharCode()) === '=') {
                    this.follow = this.follow.skip();
                    this.tag = Spreadsheet._Token.Tag.LESS_OR_EQUALS;
                } else {
                    this.tag = Spreadsheet._Token.Tag.LESS;
                }
                break;
            case '>':
                if (this.follow.getCharCode() !== -5 && String.fromCodePoint(this.follow.getCharCode()) === '=') {
                    this.follow = this.follow.skip();
                    this.tag = Spreadsheet._Token.Tag.GREATER_OR_EQUALS;
                } else {
                    this.tag = Spreadsheet._Token.Tag.GREATER;
                }
                break;
            default:
                if(this.start.satisfies(/[a-zA-Z]/i)) {
                    this.body+=String.fromCharCode(this.start.getCharCode());
                    this.follow = this.follow.skipWhile(/[0-9a-zA-Z]/i, this);
                    let startIndex = this.start.index;
                    let endIndex = this.follow.index;
                    const identifier = this.start.formula.substr(startIndex, endIndex-startIndex);
                    if (identifier === 'TRUE') {
                        this.tag = Spreadsheet._Token.Tag.TRUE
                    } else if (identifier === 'FALSE') {
                        this.tag = Spreadsheet._Token.Tag.FALSE
                    } else {
                        this.tag = Spreadsheet._Token.Tag.IDENTIFIER;
                    }
                } else if(this.start.satisfies(/[0-9]/i)) {
                    this.body+=String.fromCharCode(this.start.getCharCode());
                    this.follow = this.follow.skipWhile(/[0-9]/i, this);
                    if (this.follow.satisfies(/[.]/i)) {
                        this.follow = this.follow.skipWithBody();
                        this.follow = this.follow.skipWhile(/[0-9]/i, this);
                    }
                    if(this.follow.satisfies(/[a-zA-Z]/i)) {
                        throw new Spreadsheet.FormulaError("delimiter expected", this.start.index);
                    }
                    this.tag = Spreadsheet._Token.Tag.NUMBER;
                } else {
                    throw new Spreadsheet.FormulaError(`Unexpected ${this.start.tag}`, this.start.index);
                }
        }
    }

    /**
     * Check equality of current token and passed parameter
     * @param {String} t
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
    LESS_OR_EQUALS: "'<='",
    GREATER_OR_EQUALS: "'>='",
    EQUALS: "'='",
    LESS: "'<'",
    GREATER: "'>'",
    STRING: "string",
    NUMBER: "number",
    IDENTIFIER: "identifier",
    PLUS: "'+'",
    MINUS: "'-'",
    TIMES: "'*'",
    DIVIDES: "'/'",
    TRUE: "TRUE",
    FALSE: "FALSE",
    PARENTHESIS_OPENING: "'('",
    PARENTHESIS_CLOSING: "')'",
    COMMA: "','",
    END_OF_TEXT: "end of formula"
});

/**
 * @class checks formula for grammar
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
     * @param {String} tag
     * @throws {Spreadsheet.FormulaError} if unexpected token occurs
     */
    expect(tag) {
        if(!this.token.matches(tag)) {
            throw new Spreadsheet.FormulaError(`Unexpected ${tag}`, this.token.start.index);
        }
        this.token = this.token.next();
    }

    /**
     * Parses formula
     */
    parse() {
        const res = this.parseExpression();
        this.expect(Spreadsheet._Token.Tag.END_OF_TEXT);
        return res;
    }

    /**
     * Parses Expression rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseExpression() {
        // <Expression> :== <Compared> <ComparedRest>
        console.log("< Expression> :== <Compared> <ComparedRest>");
        const res = this.parseCompared();
        return this.parseComparedRest(res);
    }

    /**
     * Parses ComparedRest rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseComparedRest(leftArg) {
        //<ComparedRest> :== <ComparisonOperator> <Compared> <ComparedRest> | ε
        const type = this.parseComparisonOperator();
        const currentPosition = this.token.start;
        if (type) {
            console.log("< ComparedRest> :== <ComparisonOperator> <Compared> <ComparedRest>");
            const rightArg = this.parseCompared();
            let currentExpression = new Spreadsheet._Expression(type, [leftArg, rightArg], currentPosition);
            return this.parseComparedRest(currentExpression);
        } else {
            console.log("< ComparedRest> :== ε");
            return leftArg;
        }

    }

    /**
     * Parses ComparisonOperator rule
     * @returns {boolean|Spreadsheet._Function} equality of current token and any of сomparison tokens; function ref., if equal
     */
    parseComparisonOperator() {
        //<ComparisonOperator> :== "=" | "<" | ">" | "<=" | ">="
        switch (this.token.tag) {
            case Spreadsheet._Token.Tag.EQUALS:
                console.log("< ComparisonOperator> :== \"=\"");
                this.token = this.token.next();
                return Spreadsheet._Function.EQUALS;
            case Spreadsheet._Token.Tag.LESS_OR_EQUALS:
                console.log("< ComparisonOperator> :== \"<=\"");
                this.token = this.token.next();
                return Spreadsheet._Function.LESSOREQUALS;
            case Spreadsheet._Token.Tag.LESS:
                console.log("< ComparisonOperator> :== \"<\"");
                this.token = this.token.next();
                return Spreadsheet._Function.LESS;
            case Spreadsheet._Token.Tag.GREATER_OR_EQUALS:
                console.log("< ComparisonOperator> :== \">=\"");
                this.token = this.token.next();
                return Spreadsheet._Function.GREATEROREQUALS;
            case Spreadsheet._Token.Tag.GREATER:
                console.log("< ComparisonOperator> :== \">\"");
                this.token = this.token.next();
                return Spreadsheet._Function.GREATER;
            default: return false;
        }
    }

    /**
     * Parses Compared rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseCompared() {
        //<Compared> :== <Term> <Terms>
        console.log("< Compared> :== <Term> <Terms>");
        const res = this.parseTerm();
        return this.parseTerms(res);
    }

    /**
     * Parses Terms rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseTerms(leftArg) {
        //<Terms> :== "-" <Term> <Terms> | "+" <Term> <Terms> | ε
        let res;
        let rightArg;
        const currentPosition = this.token.start;
        if (this.token.tag === Spreadsheet._Token.Tag.MINUS) {
            console.log("< Terms> :== \"-\" <Term> <Terms>");
            this.token = this.token.next();
            rightArg = this.parseTerm();
            res = new Spreadsheet._Expression(Spreadsheet._Function.SUBTRACT, [leftArg, rightArg], currentPosition);
            return this.parseTerms(res);
        } else if (this.token.tag === Spreadsheet._Token.Tag.PLUS) {
            console.log("< Terms> :== \"+\" <Term> <Terms>");
            this.token = this.token.next();
            rightArg = this.parseTerm();
            res = new Spreadsheet._Expression(Spreadsheet._Function.ADD, [leftArg, rightArg], currentPosition);
            return this.parseTerms(res);
        } else {
            console.log("< Terms> :== ε");
            return leftArg;
        }
    }

    /**
     * Parses Term rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseTerm() {
        //<Term> :== <Factor> <Factors>
        console.log("< Term> :== <Factor> <Factors>");
        const res = this.parseFactor();
        return this.parseFactors(res);
    }

    /**
     * Parses Factors rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseFactors(leftArg) {
        //<Factors> :== "*" <Factor> <Factors> | "/" <Factor> <Factors> | ε
        let res;
        let rightArg;
        const currentPosition = this.token.start;
        if (this.token.tag === Spreadsheet._Token.Tag.TIMES) {
            console.log("< Factors> :== \"*\" <Factor> <Factors>");
            this.token = this.token.next();
            rightArg = this.parseFactor();
            res = new Spreadsheet._Expression(Spreadsheet._Function.MULTIPLY, [leftArg, rightArg], currentPosition);
            return this.parseFactors(res);
        } else if (this.token.tag === Spreadsheet._Token.Tag.DIVIDES) {
            console.log("< Factors> :== \"/\" <Factor> <Factors>");
            this.token = this.token.next();
            rightArg = this.parseFactor();
            res = new Spreadsheet._Expression(Spreadsheet._Function.DIVIDE, [leftArg, rightArg], currentPosition);
            return this.parseFactors(res);
        } else {
            console.log("< Factors> :== ε");
            return leftArg;
        }
    }

    /**
     * Parses Factor rule
     * @returns {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseFactor() {
        //<Factor> :== NUMBER | STRING | "TRUE" | "FALSE" | <Identifiable> | "(" <Expression> ")" | "-" <Factor>
        const tag = this.token.tag;
        let res;
        if (tag === Spreadsheet._Token.Tag.NUMBER) {
            console.log("< Factor> :== NUMBER");
            res = +this.token.body;
            this.token = this.token.next();
            return res;
        } else if (tag === Spreadsheet._Token.Tag.STRING) {
            console.log("< Factor> :== STRING");
            res = this.token.body;
            this.token = this.token.next();
            return res;
        } else if (tag === Spreadsheet._Token.Tag.TRUE) {
            console.log("< Factor> :== \"TRUE\"");
            this.token = this.token.next();
            return true;
        } else if (tag === Spreadsheet._Token.Tag.FALSE) {
            console.log("< Factor> :== \"FALSE\"");
            this.token = this.token.next();
            return false;
        } else if (tag === Spreadsheet._Token.Tag.IDENTIFIER) {
            console.log("< Factor> :== <Identifiable>");
            return this.parseIdentifiable();
        } else if (tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) {
            console.log("< Factor> :== \"(\" <Expression> \")\"");
            this.token = this.token.next();
            res = this.parseExpression();
            this.expect(Spreadsheet._Token.Tag.PARENTHESIS_CLOSING);
            return res;
        } else if (tag === Spreadsheet._Token.Tag.MINUS) {
            console.log("< Factor> :== \"-\" <Factor>");
            res = this.token.start;
            this.token = this.token.next();
            return new Spreadsheet._Expression(Spreadsheet._Function.NEGATE, this.parseFactor(), res);
        } else {
            throw new Spreadsheet.FormulaError(`Unexpected ${this.token.tag}`, this.token.start.index);
        }
    }

    /**
     * Parses Identifiable rule
     * @returns {Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseIdentifiable() {
        //<Identifiable> :== IDENTIFIER <Call>
        const currentPosition = this.token.start;
        const res = this.token.body;
        console.log("< Identifiable> :== IDENTIFIER <Call>");
        this.expect(Spreadsheet._Token.Tag.IDENTIFIER);
        const callArgs = this.parseCall();
        if (callArgs === null) {
            console.log(res);
            return new Spreadsheet._CellReference(res);
        } else {
            console.log(res);
            return new Spreadsheet._Expression(Spreadsheet._Function[res], callArgs, currentPosition);
        }
    }

    /**
     * Parses Call rule
     * @returns {Array}
     */
    parseCall() {
        //<Call> :== "(" <Arguments> ")" | ε
        if (this.token.tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) {
            console.log("< Call> :== \"(\" <Arguments> \")\"");
            this.token = this.token.next();
            const args = this.parseArguments();
            this.expect(Spreadsheet._Token.Tag.PARENTHESIS_CLOSING);
            return args;
        } else {
            console.log("< Call> :== ε");
            return null;
        }
    }

    /**
     * Parses Arguments rule
     * @returns {Array}
     */
    parseArguments() {
        //<Arguments> :== <Expression> <ArgumentsRest> | ε
        const tag = this.token.tag;
        if ((tag === Spreadsheet._Token.Tag.NUMBER)||
            (tag === Spreadsheet._Token.Tag.STRING) ||
            (tag === Spreadsheet._Token.Tag.TRUE)||
            (tag === Spreadsheet._Token.Tag.FALSE) ||
            (tag === Spreadsheet._Token.Tag.IDENTIFIER)  ||
            (tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) ||
            (tag === Spreadsheet._Token.Tag.MINUS)) {
            console.log("< Arguments> :== <Expression> <ArgumentsRest>");
            return this.parseArgumentsRest([this.parseExpression()]);
        } else {
            console.log("< Arguments> :== ε");
            return [];
        }
    }

    /**
     * Parses ArgumentsRest rule
     * @returns {Array}
     */
    parseArgumentsRest(currArgs) {
        //<ArgumentsRest> :== "," <Expression> <ArgumentsRest> | ε
        if (this.token.tag === Spreadsheet._Token.Tag.COMMA) {
            console.log("< ArgumentsRest> :== \",\" <Expression> <ArgumentsRest>");
            this.token = this.token.next();
            currArgs.push(this.parseExpression());
            return this.parseArgumentsRest(currArgs);
        } else {
            console.log("< ArgumentsRest> :== ε");
            return currArgs;
        }
    }
};

Spreadsheet._CellGraph = class {

    /**
     * @constructor
     */
    constructor() {
        /**
         * @type {Spreadsheet._CellGraph.Vertex[]}
         */
        this.vertices = [];
    }
    /**
     * Adds a new vertex;
     * @param {Spreadsheet._CellGraph.Vertex} vertex
     * @method
     */
    addVertex(vertex) {
        this.vertices.push(vertex);
    }
    /**
     * Adds a new edge;
     * @param {Spreadsheet._CellGraph.Vertex} vertex1
     * @param {Spreadsheet._CellGraph.Vertex} vertex2
     * @method
     */
    addEdge(vertex1, vertex2) {
        vertex1.edges.push(vertex2);
    }
    /**
     * Finds all the vertices that are in cycle with the "vertex" in @param;
     * @param {Spreadsheet._CellGraph.Vertex} vertex
     * @method
     */
    findCycleFrom(vertex) {
        vertex.ifCyclic(vertex);
        this.vertices.forEach(v => {
            v._color = 0;
            v._parent = null;
        });
        if (vertex.cycle.length === 0) return null;
        let ret = vertex.cycle;
        vertex.cycle = [];
        return ret;
    }

    /**
     * Deletes all the edges to the "vertex";
     * @param {Spreadsheet._CellGraph.Vertex} vertex
     * @method
     */
    detachVertex(vertex) {
        this.vertices.forEach(v => {
            let arr = [];
            v.edges.forEach(to => {
                if (to !== vertex) arr.push(to);
            });
            v.edges = arr;
        });
    }

    /**
     * Calls dfs and clears color data for every vertex
     * @param {Spreadsheet._CellGraph.Vertex} vertex
     * @param {function} callback
     * @method
     */
    iterateFrom(vertex, callback) {
        this.dfs(vertex, callback);
        this.vertices.forEach(v => {
            v._color = 0;
        });
    }

    /**
     * Browses all the vertices and calls callback() from every vertex
     * @param {Spreadsheet._CellGraph.Vertex} current
     * @param {function} callback
     * @method
     */
    dfs(current, callback) {
        current._color = 1;
        callback(current);
        current.edges.forEach(to => {
            if (to._color === 0) {
                this.dfs(to, callback);
            }
        });
        current._color = 2;
    }
};

Spreadsheet._CellGraph.Vertex = class {

    /**
     * @constructor
     * @param {int} row
     * @param {int} column
     */
    constructor(row, column) {
        /**
         * @type {int}
         */
        this.row = row;
        /**
         * @type {int}
         */
        this.column = column;
        /**
         * @type {Spreadsheet._CellGraph.Vertex[]}
         */
        this.edges = [];
        /**
         * @private
         * @type {int} color, used in ifCyclic
         */
        this._color = 0;
        /**
         * @private
         * @type {Spreadsheet._CellGraph.Vertex} used in addAll for the search of the vertices in cycle;
         */
        this._parent = null;
        /**
         * @type {Spreadsheet._CellGraph.Vertex[]}
         */
        this.cycle = [];
    }

    /**
     * Finds a cycle and triggers addAll();
     * @param {Spreadsheet._CellGraph.Vertex} current
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







