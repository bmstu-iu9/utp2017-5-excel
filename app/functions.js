
class FormulaError extends Error {
	
	constructor(reason, position) {
		super(`${reason} at character ${position}`);
		this.name = "Formula Error";
		this.position = position;
	}
}

class ArgumentTypeError extends FormulaError {
	
	constructor(position) {
		super("Invalid type of argument(s)", position);
		this.name = "Type of Argument Error";
		this.position = position;
	}
}

class QuantityOfArgumentsError extends FormulaError {
	
	constructor(position) {
		super("Invalid quantity of arguments", position);
		this.name = "Quantity of Arguments Error";
		this.position = position;
	}
}






function NOT(value) { 
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (typeof value === "boolean") return !value; 
	throw new ArgumentTypeError(this.position);
}

function AND(...values) {
    if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
    if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
    return values.every(e => e);
}

function OR(...values) {
    if (values.length < 2) throw new QuantityOfArgumentsError(this.position);
    if (values.some(e => typeof e !== "boolean")) throw new ArgumentTypeError(this.position);
    return values.some(e => e);
}

function CONCATENATE(...args) {
	if (args.length === 0) throw new QuantityOfArgumentsError(this.position);
	if (args.some(e => typeof e !== "string")) throw new ArgumentTypeError(this.position);
	return args.join("");
}

function NUMBER(value) { 
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (!isNaN(value)) return +value; 
	throw new ArgumentTypeError(this.position);
}


function BOOLEAN(value) {
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	return !(!value || value === "0" || (typeof value === "string" && value.toLowerCase() === "false"));
}


function STRING(value) {
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	switch (typeof value) {
		case "boolean":
			return value ? "TRUE" : "FALSE";
		case "number":
			return "" + value;
		case "string":
			return value;
	}
}


function ADD(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
	return a + b;
}



function SUBTRACT(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
	return a - b;
}


function NEGATE(a) {
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number") throw new ArgumentTypeError(this.position);
	return -a;
}



function MULTIPLY(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
	return a * b;
}



function DIVIDE(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
	return a / b;
}

//=
function EQUALS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b) throw new ArgumentTypeError(this.position);
	return a == b;
}

//>
function GREATER(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a > b;
}

//<=
function LESSOREQUALS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a <= b;
}

//<
function LESS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a < b;
}

//>=
function GREATEROREQUALS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a >= b;
}
































