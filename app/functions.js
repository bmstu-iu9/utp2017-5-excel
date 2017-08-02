// КЛАССЫ ОШИБОК
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





//ПЕРВОСТЕПЕННЫЕ ФУНКЦИИ
function NOT(value) { 
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (typeof value === "boolean") return !value; 
	else throw new ArgumentTypeError(this.position);
}
//alert(NOT(false));

function AND(value1, value2) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof(value1) === "boolean" && typeof(value2) === "boolean") return value1 && value2;
	else throw new ArgumentTypeError(this.position); 
}
//alert(AND(true, false));

function OR(value1, value2) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof(value1) === "boolean" && typeof(value2) === "boolean") return value1 || value2;
	else throw new ArgumentTypeError(this.position); 
}
//alert(OR(false, true));

function CONCATENATE() {
	if (arguments.length === 0) throw new QuantityOfArgumentsError(this.position);
	var str_ret = "";
	for (var i = 0; i < arguments.length; i++) {
		if (!(typeof arguments[i] === "String")) throw new ArgumentTypeError(this.position); 
		str_ret += arguments[i];
	}
	return str_ret;	
}
//alert(CONCATENATE("hi", " my name is", " Dan"));

function NUMBER(value) { 
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (!isNaN(value)) return +value; 
	else throw new ArgumentTypeError(this.position); 
}

//alert(NUMBER("123"));

// accessory function for BOOLEAN() function
function is_str_false(str) {
	if (typeof str !== "string") return false;
	if (str.length !== 5) return false;
	if ((str[0] === 'F' || str[0] === 'f') &&
		(str[1] === 'A' || str[1] === 'a') && 
		(str[2] === 'L' || str[2] === 'l') &&
		(str[3] === 'S' || str[3] === 's') &&
		(str[4] === 'E' || str[4] === 'e')) return true;
	return false;
		
}


function BOOLEAN(value) {
	if (arguments.length !== 1) throw new QuantityOfArgumentsError(this.position);
	if (value === "0" || value === 0 || value === false || is_str_false(value)) return false;
	return true;
}

/*var a = "string";
alert(BOOLEAN(a));*/

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



function MINUS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== "number" || typeof b !== "number") throw new ArgumentTypeError(this.position);
	return a - b;
}


function UNARYMINUS(a) {
	if (arguments.length != 1) throw new QuantityOfArgumentsError(this.position);
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
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a == b ? true : false;
}

//>
function GREATER(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a > b ? true : false;
}

//<=
function LESSOREQUALS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a <= b ? true : false;
}

//<
function LESS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a < b ? true : false;
}

//>=
function GREATEROREQUALS(a, b) {
	if (arguments.length !== 2) throw new QuantityOfArgumentsError(this.position);
	if (typeof a !== typeof b || typeof a === "boolean") throw new ArgumentTypeError(this.position);
	return a >= b ? true : false;
}
































