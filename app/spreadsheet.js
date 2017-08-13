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






Spreadsheet._CellGraph = class {

    constructor(vertices) {
        this.vertices = vertices;
    }
    addVertex(vertex) {
        this.vertices.push(vertex);
    }
    addEdge(vertex1, vertex2) {
        vertex1.edges.push(vertex2);
        vertex2.edges.push(vertex1);
    }
    findCycleFrom(vertex) {
        vertex.ifCyclic(vertex);
        if (vertex.cycle.length === 0) return null;
        else return vertex.cycle;
    }
}

Spreadsheet._CellGraph.Vertex = class {
    constructor(row, column, edges) {
        this.row = row;
        this.column = column;
        this.edges = edges;
        this.color = 0;
        this.parent = null;
        this.cycle = [];
    }

    ifCyclic(current)  {
        
        current.color = 1;  
        if (current.edges !== null) {
            current.edges.forEach(to => {
                if (to.color === 0) {
                    to.parent = current;
                    this.ifCyclic(to);
                }
                else if (to === this) {
                    this.parent = current;
                    this.addAll();
                }
            });
        }
        current.color = 2;
    }

    addAll() {
        let current = this.parent;
        while (current !== this) {
            if (this.findEdge(current) === -1) this.cycle.push(current);
            current = current.parent;
        }
    }
    
    findEdge(vertex) {
        const size = this.cycle.length;
        for (let i = 0; i < size; i++) {
            if (this.cycle[i] === vertex) {
                return i;
            }
        }
        return -1;
    }
}

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

for (let i = 0; i < v1.cycle.length; i++) {
    alert(v1.cycle[i].column)
}*/








