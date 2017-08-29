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
        /**
         * @type {Spreadsheet._CellGraph} Graph
         */
        this.graph = new Spreadsheet._CellGraph();
    }

    /**
     * Makes table at least i rows in height at j column in width
     * @param {int} height Minimum table height
     * @param {int} width Minimum table width
     * @private
     */
    _expandTo(height, width) {
        const rows = this.cells.length;
        const columns = this.cells.length > 0 ? this.cells[0].length : 0;
        const newI = rows < height ? height : rows;
        const newJ = columns < width ? width : columns;
        if (newI > rows) {
            for (let indexJ = rows; indexJ < height; indexJ++) {
                if (this.cells[indexJ] === undefined) this.cells[indexJ] = [];               
                for (let indexI = 0; indexI < columns; indexI++) {
                    this.cells[indexJ][indexI] = new Spreadsheet._Cell(height, width);
                }
            }
        }
        if (newJ > columns) {
            for (let indexJ = 0; indexJ < newI; indexJ++) {
                if (this.cells[indexJ] === undefined) this.cells[indexJ] = [];
                for (let indexI = columns; indexI < width; indexI++) {                    
                    this.cells[indexJ][indexI] = new Spreadsheet._Cell(height, width);
                }
            }
        }
    }

    /**
     * Checks whether a cell with given coordinates exists in the table
     * @param {int} i
     * @param {int} j
     * @returns {boolean}
     * @private
     */
    _cellExists(i, j) {
        return i >= 0 && j >= 0 && i < this.cells.length && j < this.cells[0].length;
    }

    /**
     * Gets string representation of a formula in a cell
     * @param {int} i Row index
     * @param {int} j Column index
     * @returns {string} Formula
     */
    getFormula(i, j) {
        return this._cellExists(i, j) ? this.cells[i][j].formula : "";
    }

    /**
     * Parses formula, puts into a cell and evaluates it
     * @param {int} i Row index
     * @param {int} j Column index
     * @param {string} formula
     * @throws {Spreadsheet.FormulaSyntaxError} on syntax error in formula
     * @function
     */
    setFormula(i, j, formula) {

        this._expandTo(i + 1, j + 1);
        this.cells[i][j].formula = formula;
        this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_UPDATED, i, j, formula);

        const parser = new Spreadsheet._Parser(formula);
        const expression = parser.parse();
        this._setExpression(i, j, expression);
    }

    /**
     * Puts a formula into a cell and evaluates it
     * @param {int} i Row index
     * @param {int} j Column index
     * @param {Spreadsheet._Expression} expression
     * @function
     */
    _setExpression(i, j, expression) {

        this.cells[i][j].expression = expression;
        const vertex = this.graph.getVertexByCoordinates(i, j);
        this.graph.detachVertex(vertex);
        const lookThroughExpression = expression => {
            if (expression instanceof Spreadsheet._CellReference) {
                const topVertex = this.graph.getVertexByCoordinates(expression.row, expression.column);
                this.graph.addEdge(topVertex, vertex);
            } else if (expression instanceof Spreadsheet._Expression) {
                expression.args.forEach(expression => lookThroughExpression(expression));
            } else if (expression instanceof Spreadsheet._Range) {
                for (let i = expression.getStartColumn(); i <= expression.getEndColumn(); i++ ) {
                    for (let j = expression.getStartRow(); j <= expression.getEndRow(); j++) {
                        const topVertex = this.graph.getVertexByCoordinates(j, i);
                        this.graph.addEdge(topVertex, vertex);
                    }
                }
            }
        };
        lookThroughExpression(expression);

        const cycle = this.graph.findCycleFrom(vertex);
        if (cycle) {
            cycle.forEach(vertex =>
                this.triggerEvent(Spreadsheet.Event.CELL_CIRCULAR_DEPENDENCY_DETECTED, vertex.row, vertex.column));
            return;
        }

        this.graph.iterateFrom(vertex, vertex => {
            const cell = this.cells[vertex.row][vertex.column];
            if (cell.expression instanceof Spreadsheet._Expression) {
                try {
                    cell.value = cell.expression.evaluate(this);
                }
                catch (error) {
                    if (error instanceof Spreadsheet.FormulaError) {
                        this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_ERROR, vertex.row, vertex.column, error);
                    } else console.log(error);
                    return;
                }
            } else if (cell.expression instanceof Spreadsheet._CellReference) {
                if (!this._cellExists(cell.expression.row, cell.expression.column) || this.cells[cell.expression.row][cell.expression.column].value == null) {
                    cell.value = undefined;
                    this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_ERROR, vertex.row, vertex.column,
                        new Spreadsheet.FormulaDependencyOnEmptyCellError(cell.expression.position));
                    return;
                }
                cell.value = this.cells[cell.expression.row][cell.expression.column].value;
            } else if (cell.expression instanceof Spreadsheet._Range) {
                let cellsValues = [];
                for (let i = cell.expression.getStartColumn() ; i <= cell.expression.getEndColumn(); i++ ) {
                    let values = [];
                    for (let j = cell.expression.getStartRow(); j <= cell.expression.getEndRow(); j++) {
                        if (!this._cellExists(j, i) || this.cells[j][i].value == null) {
                            cell.value = undefined;
                            this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_ERROR, j, i,
                                new Spreadsheet.FormulaDependencyOnEmptyCellError(cell.expression.position));
                            return;
                        }
                        values.push(this.cells[j][i].value);
                    }
                    cellsValues.push(values);
                }
                cell.value = new Spreadsheet.Table(cellsValues)
            } else {
                cell.value = cell.expression;
            }
            this.triggerEvent(Spreadsheet.Event.CELL_VALUE_UPDATED, vertex.row, vertex.column, cell.value);
        });
    }

    /**
     * Copies cell to another position
     * @param {int} fromRow From row index
     * @param {int} fromColumn From column index
     * @param {int} toRow To row index
     * @param {int} toColumn To column index
     * @function
     */
    copyCell(fromRow, fromColumn, toRow, toColumn) {
        this._expandTo(toRow + 1, toColumn + 1);
        const newExpression = Spreadsheet._Cell.moveExpression(this.cells[fromRow][fromColumn].expression,
            fromRow, fromColumn, toRow, toColumn);
        const formula = Spreadsheet._Cell.stringifyExpression(newExpression);
        this._setExpression(toRow, toColumn, newExpression);
        this.cells[toRow][toColumn].formula = formula;
        this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_UPDATED, toRow, toColumn, formula);
    }

    /**
     * Copies cell with first coordinates to every cell within the given range
     * @param {int} startRow
     * @param {int} startColumn
     * @param {int} endRow
     * @param {int} endColumn
     */
    spread(startRow, startColumn, endRow, endColumn) {
        for (let i = Math.min(startRow, endRow); i <= Math.max(startRow, endRow); i++) {
            for (let j = Math.min(startColumn, endColumn); j <= Math.max(startColumn, endColumn); j++) {
                if (i !== startRow || j !== startColumn) this.copyCell(startRow, startColumn, i, j);
            }
        }
    }

    /**
     * Saves current state of the spreadsheet within the given range
     * @param {int} startRow
     * @param {int} startColumn
     * @param {int} endRow
     * @param {int} endColumn
     */
    bufferize(startRow, startColumn, endRow, endColumn) {
        return new Spreadsheet.CellBuffer(this, startRow, startColumn, endRow, endColumn);
    }

    /**
     * Inserts cells from buffer into the spreadsheet
     * @param {Spreadsheet.CellBuffer} buffer
     * @param {int} row
     * @param {int} column
     */
    paste(buffer, row, column) {

        let lastRow = this.cells.length - 1;
        let lastColumn = (this.cells.length && this.cells[0].length) - 1;
        buffer.expressions.forEach((expressionRow, i) => expressionRow.forEach((expression, j) => {
            if (expression == null) return;
            if (row + i > lastRow) lastRow = row + i;
            if (column + j > lastColumn) lastColumn = column + j;
        }));
        this._expandTo(lastRow + 1, lastColumn + 1);

        buffer.expressions.forEach((expressionRow, i) => expressionRow.forEach((expression, j) => {
            const toRow = row + i;
            const toColumn = column + j;
            const newExpression = Spreadsheet._Cell.moveExpression(expression,
                buffer.startRow + i, buffer.startColumn + j, toRow, toColumn);
            const formula = Spreadsheet._Cell.stringifyExpression(newExpression);
            if(expression != null || this._cellExists(toRow, toColumn)) {
                this._setExpression(toRow, toColumn, newExpression);
                this.cells[toRow][toColumn].formula = formula;
            }
            this.triggerEvent(Spreadsheet.Event.CELL_FORMULA_UPDATED, toRow, toColumn, formula);
        }));

    }

    /**
     * Converts to CSV format
     * @returns {string} CSV
     */
    toCSV(){

        var csv = "";
        for(let cells of this.cells){
            for(let cell of cells){
                switch(typeof(cell.value)){
                    case "string":
                        csv += (cell.value.search(/,|"/) == -1 ? cell.value : "\"" + cell.value.replace(/"/g, "\"\"") + "\"") + ",";
                        break;
                    case "boolean":
                        csv += cell.value ? "TRUE" : "FALSE";
                        break;
                    case "number":
                        csv += cell.value.toString() + ",";
                        break;
                    default:
                        csv += ","
                }
            }
            csv = csv.slice(0,-1);
            csv += '\n';
        }

        csv = csv.slice(0,-1);
        return csv;
    }

    /**
     * Converts from CSV format
     * @param {string} csv
     * @returns {Spreadsheet} spreadsheet filled with values
     */
    fromCSV(csv){

        const rows = csv.split(/\r\n|\r|\n/).length;
        let cols = 1, found = 0;
        for(let i in csv){
            if(csv[i] == '\n'){
                break;
            }
            if((csv[i] == ",") && found%2 == 0){
                cols++;
            }else if(csv[i] == "\""){
                found++;
            }
        }

        this._expandTo(rows, cols);

        const getValues = (text) => {
            text = text.split('\\n').join('\n');
            let found = 0, result = [], temp = '';
            for(let i in text){
                switch (text[i]){
                    case '\"':
                        found++;
                        temp = temp.concat(text[i]);
                        break;
                    case ',':
                    case '\n':
                        if(!(found % 2)){
                            result.push(temp);
                            temp = '';
                            break;
                        }
                    default:
                        temp = temp.concat(text[i]);
                }
            }
            result.push(temp);
            return result;
        };

        csv = JSON.stringify(csv).slice(1,-1);
        let i = 0, j = 0;
        for(let row of csv.split(/\r\n|\n/)){
            for(let value of getValues(row)){
                if(isNaN(value)) value = JSON.stringify(value);
                this.setFormula(i, j++, value);
                if(j == cols){
                    i++;
                    j = 0;
                }
            }
        }
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
     * When error occurs in a cell
     * @param {int} Row index
     * @param {int} Column index
     * @param {Spreadsheet.FormulaError} Error object
     */
    CELL_FORMULA_ERROR: Symbol("cell_formula_error"),

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
    constructor(position) {
        super(`Dependency on empty cell`, position);
        this.name = "Cell Reference Error";
    }
};

/**
 * @class represents an argument type error in formula
 */
Spreadsheet.ArgumentTypeError = class extends Spreadsheet.FormulaError {
    constructor(position) {
        super("Invalid type of argument(s)", position);
        this.name = "Arguments Type Error";
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

/**
 * @class represents cell
 */
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
         * @type {number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference|Spreadsheet._Range} Parsed formula
         */
        this.expression = undefined;
        /**
         * @type {string}
         */
        this.formula = "";
    }

    static moveExpression(expression, fromRow, fromColumn, toRow, toColumn) {
        if (expression instanceof Spreadsheet._CellReference) {
            return expression.move(fromRow, fromColumn, toRow, toColumn);
        } else if (expression instanceof Spreadsheet._Expression) {
            const res = expression.args.map(expression =>
                Spreadsheet._Cell.moveExpression(expression, fromRow, fromColumn, toRow, toColumn));
            return new Spreadsheet._Expression(expression.func, res, expression.position, expression.operator);
        } else if (expression instanceof Spreadsheet._Range) {
            const start = expression.start.move(fromRow, fromColumn, toRow, toColumn);
            const end = expression.end.move(fromRow, fromColumn, toRow, toColumn);
            return new Spreadsheet._Range(start,end);
        } else {
            return expression;
        }
    }

    static stringifyExpression(expression) {
        if (expression instanceof Spreadsheet._Expression) {
            return expression.stringifyAndSetPositions();
        } else if (expression instanceof Spreadsheet._CellReference) {
            return expression.toString();
        } else if (expression instanceof Spreadsheet._Range) {
            return expression.toString();
        } else if (typeof expression === "boolean") {
            return expression ? "TRUE" : "FALSE";
        } else if (typeof expression === "string") {
            return JSON.stringify(expression);
        } else if (typeof expression === "number") {
            return expression + "";
        }
        return "";
    }

};

/**
 * @class Represents cell range matrix
 *
 */
Spreadsheet.Table = class {
    /**
     * @constructor
     * @param {Array} table of values
     */
    constructor(table) {
        /**
         * @type {Array} table
         */
        this.table = table
    }

    /**
     * Apply given function to all values
     * @param {function} callback
     */
    forEachValue(callback) {
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                callback(this.table[i][j], i, j);
            }
        }
    }
};

/**
 * @class Represents cell range
 *
 */
Spreadsheet._Range = class {

    /**
     * @constructor
     * @param {Spreadsheet._CellReference} start of range
     * @param {Spreadsheet._CellReference} end of range
     */
    constructor(start, end) {
        /**
         * @type {Spreadsheet._CellReference} start
         */
        this.start = start;
        /**
         * @type {Spreadsheet._CellReference} end
         */
        this.end = end;
    }

    /**
     * Calculate start row
     * @returns {int} row of top left range's corner
     */
    getStartRow() {
        return Math.min(this.start.row, this.end.row);
    }

    /**
     * Calculate start column
     * @returns {int} column of top left range's corner
     */
    getStartColumn() {
        return Math.min(this.start.column, this.end.column);
    }

    /**
     * Calculate end row
     * @returns {int} row of bottom right range's corner
     */
    getEndRow() {
        return Math.max(this.start.row, this.end.row);
    }

    /**
     * Calculate end column
     * @returns {int} column of bottom right range's corner
     */
    getEndColumn() {
        return Math.max(this.start.column, this.end.column);
    }

    toString() {
        return this.start.toString() + ":" + this.end.toString();
    }

};

/**
 * @class Represents a _Cell reference
 *
 */
Spreadsheet._CellReference = class {
    /**
     * @constructor
     * @param {int} row
     * @param {int} column
     * @param {int} position
     * @param {boolean} rowFixed
     * @param {boolean} columnFixed
     */
    constructor(row, column, position, rowFixed, columnFixed) {

        /**
         * @type {int}
         */
        this.position = position;
        /**
         * @type {int}
         */
        this.row = row;
        /**
         * @type {int}
         */
        this.column = column;
        /**
         * @type {boolean}
         */
        this.rowFixed = rowFixed;
        /**
         * @type {boolean}
         */
        this.columnFixed = columnFixed;

    }

    move(fromRow, fromColumn, toRow, toColumn) {
        const newRow = this.rowFixed ? this.row : this.row + (toRow - fromRow);
        const newColumn = this.columnFixed ? this.column : this.column + (toColumn - fromColumn);
        return new Spreadsheet._CellReference(newRow, newColumn, this.position, this.rowFixed, this.columnFixed);
    }

    toString() {
        let string = "";
        let j = this.column + 1;
        for (let a = 1, b = 26; (j -= a) >= 0; a = b, b *= 26) {
            string = String.fromCharCode(parseInt((j % b) / a) + 65) + string;
        }
        if (this.columnFixed) string = "$" + string;
        if (this.rowFixed) string += "$";
        return string + (this.row + 1).toString();
    }

    /**
     * Creates a CellReference from a string representation of a cell
     * @param {string} cell
     * @param {int} position
     * @param {boolean} rowFixed
     * @param {boolean} columnFixed
     * @returns {Spreadsheet._CellReference}
     */
    static fromString(cell, position, rowFixed, columnFixed) {
        let column = 0;
        let i = 0;
        for (; cell.charCodeAt(i) > 64;  i++) {
            column += (cell.charCodeAt(i) - 65) + 26 * i;
        }
        const row = (+cell.slice(i)) - 1;
        return new Spreadsheet._CellReference(row, column, position, rowFixed, columnFixed);
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
     * @param {boolean} operator
     */
    constructor(func, args, position, operator = false) {
        this.func = func;
        this.args = Array.isArray(args) ? args : [args];
        this.position = position.index + 1;
        this.operator = operator;
    }

    /**
     * Returns readable expression for function's arguments
     */
    _argumentsStringifyAndSetPositions(position, separator) {
        return this.args.map(arg => {
            if (arg instanceof Spreadsheet._CellReference) {
                arg.position = position;
                const name = arg.toString();
                position += name.length + separator.length;
                return name;
            } else if (arg instanceof Spreadsheet._Range) {
                arg.start.position = position;
                let range = arg.toString();
                position += range.length + separator.length;
                arg.end.position = position - separator.length;
                return range;
            } else if (typeof arg === "boolean") {
                position += arg ? 6 : 7;
                return arg ? "TRUE" : "FALSE";
            } else if (typeof  arg === "string") {
                const str = JSON.stringify(arg);
                position += str.length + separator.length;
                return str;
            } else if (arg instanceof Spreadsheet._Expression) {
                arg.position = position;
                const str = arg.stringifyAndSetPositions(position);
                position += str.length + separator.length;
                return str;
            } else {
                const str = arg.toString();
                position += str.length + separator.length;
                return str;
            }
        }).join(separator);
    }

    /**
     * Returns readable expression
     */
    stringifyAndSetPositions(position = 1) {
        if (this.operator) {
            if (this.func === Spreadsheet._Function.UNMINUS) {
                const arg = this.args[0];
                if (arg instanceof Spreadsheet._CellReference) {
                    arg.position = position;
                    const name = arg.toString();
                    position += name.length + 1;
                    return "-" + name;
                } else if (arg instanceof Spreadsheet._Range) {
                    arg.start.position = position;
                    let range = arg.toString();
                    position += range.length + 1;
                    arg.end.position = position - 1;
                    return "-" + range;
                } else if (typeof arg === "boolean") {
                    position += arg ? 6 : 7;
                    return arg ? "-TRUE" : "-FALSE";
                } else if (typeof  arg === "string") {
                    const str = JSON.stringify(arg);
                    position += str.length + 1;
                    return "-" + str;
                } else if (arg instanceof Spreadsheet._Expression) {
                    arg.position = position;
                    const str = arg.stringifyAndSetPositions(position);
                    position += str.length + 1;
                    return "-" + str;
                } else {
                    const str = arg.toString();
                    position += str.length + 1;
                    return "-" + str;
                }
            }
            let operator = "";
            switch (this.func) {
                case Spreadsheet._Function.MULTIPLY:
                    operator = "*"; break;
                case Spreadsheet._Function.DIVIDE:
                    operator = "/"; break;
                case Spreadsheet._Function.MINUS:
                    operator = "-"; break;
                case Spreadsheet._Function.ADD:
                    operator = "+"; break;
                case Spreadsheet._Function.EQ:
                    operator = "="; break;
                case Spreadsheet._Function.LTE:
                    operator = "<="; break;
                case Spreadsheet._Function.LT:
                    operator = "<"; break;
                case Spreadsheet._Function.GTE:
                    operator = ">="; break;
                case Spreadsheet._Function.GT:
                    operator = ">"; break;
            }
            return this._argumentsStringifyAndSetPositions(position, operator);
        } else {
            return this.func.name + "(" + this._argumentsStringifyAndSetPositions(position + this.func.name.length + 1, ", ") + ")";
        }
    }

    /**
     * Evaluates formula in the cell
     * @param {Spreadsheet} spreadsheet
     * @returns {number|string|boolean|Array} new cell value
     * @throws {Spreadsheet.FormulaDependencyOnEmptyCellError}
     * @see Spreadsheet._CellReference.check
     *
     */
    evaluate(spreadsheet) {
        const newArgs = this.args.map((elem)=>{
            if (elem instanceof Spreadsheet._Expression) {
                return elem.evaluate(spreadsheet);
            } else if (elem instanceof Spreadsheet._CellReference) {
                if (!spreadsheet._cellExists(elem.row, elem.column) || spreadsheet.cells[elem.row][elem.column].value == null) {
                    throw new Spreadsheet.FormulaDependencyOnEmptyCellError(elem.position);
                }
                return spreadsheet.cells[elem.row][elem.column].value;
            } else if (elem instanceof Spreadsheet._Range) {
                let cellsValues = [];
                for (let i = elem.getStartColumn(); i <= elem.getEndColumn(); i++ ) {
                    let values = [];
                    for (let j = elem.getStartRow(); j <= elem.getEndRow(); j++) {
                        if (!spreadsheet._cellExists(j, i) || spreadsheet.cells[j][i].value === undefined) {
                            throw new Spreadsheet.FormulaDependencyOnEmptyCellError(elem.start.position);
                        }
                        values.push(spreadsheet.cells[j][i].value);
                    }
                    cellsValues.push(values);
                }
                return new Spreadsheet.Table(cellsValues);
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
        return code === -5 ? false : p.test(String.fromCodePoint(code))
    }

    /**
     * Return next position while collecting token body
     * @returns {Spreadsheet._Position} Position of next character
     * @param {Spreadsheet._Token} t
     */
    skipWithBody(t) {
        const code = this.getCharCode();
        t.body+= String.fromCharCode(code);
        return code === -5 ? this : new Spreadsheet._Position(this.formula, this.index + 1);
    }

    /**
     * Return next position
     * @returns {Spreadsheet._Position} Position of next character
     */
    skip() {
        const code = this.getCharCode();
        return code === -5 ? this : new Spreadsheet._Position(this.formula, this.index + 1);
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
        while (this.start.getCharCode() !== -5 && (this.start.getCharCode() === 32 || this.start.getCharCode() === 160)) {
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
            case ':':
                this.tag = Spreadsheet._Token.Tag.COLON;
                break;
            case '=':
                this.tag = Spreadsheet._Token.Tag.EQUALS;
                break;
            case '\"':
                while (true) {
                    if (this.follow.getCharCode() === -5) throw new Spreadsheet.FormulaError(`Could not find end of string`, this.follow.index+1); 
                    if (String.fromCodePoint(this.follow.getCharCode()) === "\"") break;
                    if (String.fromCodePoint(this.follow.getCharCode()) === "\\" && this.follow.skip().getCharCode() !== -5) {
                        this.follow = this.follow.skip();
                        this.body += String.fromCodePoint(this.follow.getCharCode());
                        this.follow = this.follow.skip();
                        continue;
                    }
                    this.body += String.fromCodePoint(this.follow.getCharCode());
                    this.follow = this.follow.skip();
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
                if(this.start.satisfies(/[a-zA-Z$]/i)) {
                    this.body+=String.fromCharCode(this.start.getCharCode());
                    this.follow = this.follow.skipWhile(/[0-9a-zA-Z$]/i, this);
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
                        this.follow = this.follow.skipWithBody(this);
                        this.follow = this.follow.skipWhile(/[0-9]/i, this);
                    }
                    if(this.follow.satisfies(/[a-zA-Z]/i)) {
                        throw new Spreadsheet.FormulaError("delimiter expected", this.start.index+1);
                    }
                    this.tag = Spreadsheet._Token.Tag.NUMBER;
                } else {
                    throw new Spreadsheet.FormulaError(`Unexpected '${this.start.formula[this.start.index]}'`, this.start.index+1);
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
    COLON: "':'",
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
            throw new Spreadsheet.FormulaError(`Unexpected ${this.token.tag}`, this.token.start.index+1);
        }
        this.token = this.token.next();
    }

    /**
     * Parses formula
     */
    parse() {
        if (this.token.tag === Spreadsheet._Token.Tag.END_OF_TEXT) return undefined;
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
            let currentExpression = new Spreadsheet._Expression(type, [leftArg, rightArg], currentPosition, true);
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
                return Spreadsheet._Function.EQ ;
            case Spreadsheet._Token.Tag.LESS_OR_EQUALS:
                console.log("< ComparisonOperator> :== \"<=\"");
                this.token = this.token.next();
                return Spreadsheet._Function.LTE;
            case Spreadsheet._Token.Tag.LESS:
                console.log("< ComparisonOperator> :== \"<\"");
                this.token = this.token.next();
                return Spreadsheet._Function.LT;
            case Spreadsheet._Token.Tag.GREATER_OR_EQUALS:
                console.log("< ComparisonOperator> :== \">=\"");
                this.token = this.token.next();
                return Spreadsheet._Function.GTE ;
            case Spreadsheet._Token.Tag.GREATER:
                console.log("< ComparisonOperator> :== \">\"");
                this.token = this.token.next();
                return Spreadsheet._Function.GT;
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
            res = new Spreadsheet._Expression(Spreadsheet._Function.MINUS, [leftArg, rightArg], currentPosition, true);
            return this.parseTerms(res);
        } else if (this.token.tag === Spreadsheet._Token.Tag.PLUS) {
            console.log("< Terms> :== \"+\" <Term> <Terms>");
            this.token = this.token.next();
            rightArg = this.parseTerm();
            res = new Spreadsheet._Expression(Spreadsheet._Function.ADD, [leftArg, rightArg], currentPosition, true);
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
            res = new Spreadsheet._Expression(Spreadsheet._Function.MULTIPLY, [leftArg, rightArg], currentPosition, true);
            return this.parseFactors(res);
        } else if (this.token.tag === Spreadsheet._Token.Tag.DIVIDES) {
            console.log("< Factors> :== \"/\" <Factor> <Factors>");
            this.token = this.token.next();
            rightArg = this.parseFactor();
            res = new Spreadsheet._Expression(Spreadsheet._Function.DIVIDE, [leftArg, rightArg], currentPosition, true);
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
            return new Spreadsheet._Expression(Spreadsheet._Function.UNMINUS, this.parseFactor(), res, true);
        } else {
            throw new Spreadsheet.FormulaError(`Unexpected ${this.token.tag}`, this.token.start.index+1);
        }
    }

    /**
     * Parses Identifiable rule
     * @returns {Spreadsheet._Expression|Spreadsheet._CellReference}
     */
    parseIdentifiable() {
        //<Identifiable> :== IDENTIFIER <CallOrSpan>
        const currentPosition = this.token.start;
        const res = this.token.body;
        console.log("< Identifiable> :== IDENTIFIER <CallOrSpan>");
        this.expect(Spreadsheet._Token.Tag.IDENTIFIER);
        const index = this.token.start.index;
        const callArgsOrEndOfRange = this.parseCallOrSpan();
        const regExps = /^(\$?)([A-Z]+)(\$?)([1-9][0-9]*)$/i;
        if (callArgsOrEndOfRange === null) {
            let match = res.match(regExps);
            if (match) {
                return Spreadsheet._CellReference.fromString(match[2]+match[4], currentPosition.index + 1, match[3] === '$', match[1] === '$');
            } else {
                throw new Spreadsheet.FormulaError(`'(' expected`, index + 1 - res.length);
            }
        } else if (typeof callArgsOrEndOfRange === 'string') {
            let start = undefined;
            let match = res.match(regExps);
            if (match) {
                start = Spreadsheet._CellReference.fromString(match[2]+match[4], currentPosition.index + 1, match[3] === '$', match[1] === '$');
            } else {
                throw new Spreadsheet.FormulaError(`Undefined function '${res}'`, index + 1 - res.length);
            }
            let end = undefined;
            match = callArgsOrEndOfRange.match(regExps);
            if (match) {
                end = Spreadsheet._CellReference.fromString(match[2]+match[4], this.token.start.index + 1, match[3] === '$', match[1] === '$');
            } else {
                throw new Spreadsheet.FormulaError(`Undefined function '${res}'`, index + 1 - res.length);
            }
            this.token = this.token.next();
            return new Spreadsheet._Range(start, end);
        } else if (Spreadsheet._Function.hasOwnProperty(res)) {
            return new Spreadsheet._Expression(Spreadsheet._Function[res], callArgsOrEndOfRange, currentPosition);
        } else {
            throw new Spreadsheet.FormulaError(`Undefined function '${res}'`, index + 1 - res.length);
        }
    }

    /**
     * Parses Call rule
     * @returns {Array | String}
     */
    parseCallOrSpan() {
        //<CallOrSpan> :== "(" <Arguments> ")" | ":" IDENTIFIER | ε
        if (this.token.tag === Spreadsheet._Token.Tag.PARENTHESIS_OPENING) {
            console.log("< Call> :== \"(\" <Arguments> \")\"");
            this.token = this.token.next();
            const args = this.parseArguments();
            this.expect(Spreadsheet._Token.Tag.PARENTHESIS_CLOSING);
            return args;
        } else if (this.token.tag === Spreadsheet._Token.Tag.COLON) {
            console.log("< Call> :== \":\" IDENTIFIER ");
            this.token = this.token.next();
            if (this.token.tag === Spreadsheet._Token.Tag.IDENTIFIER) {
                let res = this.token.body;
                if (/^\$?[A-Z]+\$?[1-9][0-9]*$/i.test(res)) {
                    return res;
                } else {
                    throw new Spreadsheet.FormulaError(`Unexpected function '${res}'`, this.token.start.index + 1 - res.length);
                }
            } else {
                throw new Spreadsheet.FormulaError(`Unexpected ${this.token.tag}`, this.token.start.index+1);
            }
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
        if (vertex1.edges.indexOf(vertex2) === -1) vertex1.edges.push(vertex2);
    }
    /**
     * Finds all the vertices that are in cycle with the "vertex" in @param;
     * @param {Spreadsheet._CellGraph.Vertex} vertex
     * @method
     */
    findCycleFrom(vertex) {
        vertex.ifCyclic(vertex);
        this.vertices.forEach(v => {
            v.color = 0;
            v.parents = [];
        });
        if (vertex.cycle.length === 0) return null;
        let ret = vertex.cycle;
        vertex.cycle = [];
        return ret;
    }

    getVertexByCoordinates(row, column) {
        for(let vertex of this.vertices) if(vertex.row === row && vertex.column === column) return vertex;
        const vertex = new Spreadsheet._CellGraph.Vertex(row, column);
        this.vertices.push(vertex);
        return vertex;
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
        this.vertices.forEach(v => {
            v.edges.forEach(to => {
               to.parents.push(v);
            });
        });
        this.dfs(vertex, vertex, callback);
        this.vertices.forEach(v => {
            v.color = 0;
            v.parents = [];
        });
    }


    /**
     * Browses all the vertices and calls callback() from every vertex
     * @param {Spreadsheet._CellGraph.Vertex} startVertex
     * @param {Spreadsheet._CellGraph.Vertex} current
     * @param {function} callback
     * @method
     */
    dfs(startVertex, current, callback) {
        current.color = 1;
        callback(current);
        current.edges.forEach(to => 
            to.color === 0 &&
            !to.parents.some(parent => to.hasStartAsParent(parent, startVertex) && parent.color === 0) &&
            this.dfs(startVertex, to, callback));
        //current._hasWhiteParent = current._parent.some(parent => parent._color === 0);
        current.color = 2;
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
         * @type {int} color, used in ifCyclic
         */
        this.color = 0;
        /**
         * @type {Spreadsheet._CellGraph.Vertex[]};
         */
        this.parents = [];
        /**
         * @type {Spreadsheet._CellGraph.Vertex[]}
         */
        this.cycle = [];
    }

    hasStartAsParent(current, start) {
        if (current === start) return true;
        for (let parent of current.parents) {
            if (parent === start) return true;
            if (this.hasStartAsParent(parent, start)) return true;
        }
        return false;
    }

    /**
     * Finds a cycle and triggers addAll();
     * @param {Spreadsheet._CellGraph.Vertex} current
     * @method
     */
    ifCyclic(current)  {

        current.color = 1;
        current.edges.forEach(to => {
            if (to.color === 0) {
                to.parents.push(current);
                this.ifCyclic(to);
            }
            else if (to === this) {
                this.parents.push(current);
                this.addAll();
            }
        });
        current.color = 2;
    }

    /**
     * Adds the vertices that are in cycle with "this";
     * @method
     */
    addAll() {
        let current = this.parents[this.parents.length - 1];
        while (current !== this) {
            if (this.cycle.indexOf(current) === -1) this.cycle.push(current);
            current = current.parents[current.parents.length - 1];
        }
        if (this.cycle.indexOf(this) === -1) this.cycle.push(this);
    }
};

Spreadsheet.CellBuffer = class {

    /**
     *
     * @param {Spreadsheet} spreadsheet
     * @param {int} startRow
     * @param {int} startColumn
     * @param {int} endRow
     * @param {int} endColumn
     */
    constructor(spreadsheet, startRow, startColumn, endRow, endColumn) {

        /**
         * Top-left row index
         */
        this.startRow = startRow;

        /**
         * Top-left column index
         */
        this.startColumn = startColumn;

        /**
         * Matrix of expressions
         * @type {Array<Array<number|string|boolean|Spreadsheet._Expression|Spreadsheet._CellReference|Spreadsheet._Range>>}
         */
        this.expressions = [];

        for (let i = startRow; i <= endRow; i++) {
            this.expressions[i - startRow] = [];
            for (let j = startColumn; j <= endColumn; j++) {
                this.expressions[i - startRow][j - startColumn] = spreadsheet._cellExists(i, j) ?
                    spreadsheet.cells[i][j].expression : undefined;
            }
        }

    }

    /**
     * @returns {int}
     */
    width() {
        return this.expressions[0].length;
    }

    /**
     * @returns {int}
     */
    height() {
        return this.expressions.length;
    }

};