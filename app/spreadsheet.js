/**
 * @class represents and object that is able to store and call event listeners
 * @example
 *   const manager = new EventManager();
 *   const tag = new Symbol("my_event");
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
         * @type {!Array<Spreadsheet._Cell>} Array of spreadsheet cells
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
                this.cells[index] = [new _Cell()];
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
                this.cells[indexI][indexJ] = new _Cell();
            }
        }
    }

    /** Clears table */
    clearTable() {
        for (let indexI = 0; indexI < this.i; indexI++) {
            for (let indexJ = 0 ; indexJ < this.j; indexJ++) {
                this.cells[indexI][indexJ] = new _Cell();
            }
        }
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
    CELL_VALUE_UPDATED: Symbol("cell_value_updated")

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
}

/**
 * @class represents an argument type error in formula
 */
Spreadsheet.ArgumentTypeError = class extends Error {
	constructor(position) {
		super("Invalid type of argument(s)", position);
		this.name = "Type of Argument Error";
		this.position = position;
	}
}

/**
 * @class represents a quantity of arguments error in formula
 */
Spreadsheet.QuantityOfArgumentsError = class extends Error {
	constructor(position) {
		super("Invalid quantity of arguments", position);
		this.name = "Quantity of Arguments Error";
		this.position = position;
	}
}

/**
 * @class represents a syntax error in formula
 */
Spreadsheet.FormulaSyntaxError = class extends FormulaError {

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

Spreadsheet._Function = Object.freeze({
	
	NOT(value) { 
		if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
		if (typeof value === "boolean") return !value; 
		throw new ArgumentTypeError(this.position);
	},

	AND(...values) {
	    if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
	    if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
	    return values.every(e => e);
	},

	OR(...values) {
	    if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
	    if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
	    return values.some(e => e);
	},

	CONCATENATE(...args) {
		if (args.length === 0) throw new QuantityOfArgumentsError(this.position);
		if (args.some(e => typeof e !== "string")) throw new ArgumentTypeError(this.position);
		return args.join("");
	},

	NUMBER(value) { 
		if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
		if (!isNaN(value)) return +value; 
		throw new ArgumentTypeError(this.position);
	},


	BOOLEAN(value) {
		if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
		return !(!value || value === "0" || (typeof value === "string" && value.toLowerCase() === "false"));
	},


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


	ADD(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
		return a + b;
	},



	SUBTRACT(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
		return a - b;
	},


	NEGATE(a) {
		if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== "number") throw new ArgumentTypeError(this.position);
		return -a;
	},



	MULTIPLY(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
		return a * b;
	},



	DIVIDE(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
		return a / b;
	},

	//=
	EQUALS(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== typeof b) throw new ArgumentTypeError(this.position);
		return a == b;
	},

	//>
	GREATER(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
		return a > b;
	},

	//<=
	LESSOREQUALS(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
		return a <= b;
	},

	//<
	LESS(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
		return a < b;
	},

	//>=
	GREATEROREQUALS(a, b) {
		if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
		if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
		return a >= b;
	}
});






















