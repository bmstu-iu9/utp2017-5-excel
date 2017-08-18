if(typeof window !== "object" || window === null || typeof document !== "object" || document === null) {
    throw new Error("A window with a document is required");
}

const ui = {

    DEFAULT_ROWS: 100,
    DEFAULT_COLUMNS: 26,
    MAX_ROWS: 32767,
    MAX_COLUMNS: 256,

    /**
     * Initializes user interface
     */
    init() {

        document.querySelectorAll(".nav-item")
            .forEach((element, index) => element.addEventListener("click", () => {
                element.parentElement.querySelector(".selected").classList.remove("selected");
                element.classList.add("selected");
                const toolbars = document.querySelectorAll("#toolbar > li");
                toolbars.forEach(element => element.classList.remove("active"));
                toolbars[index].classList.add("active");
            }));

        { // Printing cells
            const table = document.querySelector("#table");
            const headingRow = document.createElement("tr");
            table.appendChild(headingRow);
            for (let j = 0; j <= ui.DEFAULT_COLUMNS; j++) {
                let cell;
                if (j) cell = ui._createColumnHeader(j);
                else {
                    cell = document.createElement("td");
                    cell.classList.add("row-header");
                }
                headingRow.appendChild(cell);
            }
            for (let i = 1; i <= ui.DEFAULT_ROWS; i++) table.appendChild(ui._createRow(i));
        }

        { // Making cells resizable
            const dragGuideVertical = document.getElementById("drag-guide-vertical");
            const dragGuideHorizontal = document.getElementById("drag-guide-horizontal");
            const overlay = document.getElementById("overlay");
            const CELL_MIN_WIDTH = 22;
            const CELL_MIN_HEIGHT = 22;
            document.addEventListener("mousedown", event => {
                const isDraggerVertical = event.target.matches(".dragger-vertical");
                const isDraggerHorizontal = event.target.matches(".dragger-horizontal");
                if (isDraggerVertical || isDraggerHorizontal) {
                    const cell = event.target.parentElement;
                    (isDraggerVertical ? dragGuideVertical : dragGuideHorizontal).style.display = "block";
                    overlay.classList.add("sensible");
                    overlay.style.cursor = getComputedStyle(event.target).cursor;
                    const rect = cell.getBoundingClientRect();
                    const setPosition = event => {
                        if (isDraggerVertical) {
                            dragGuideVertical.style.left = Math.max(rect.left + CELL_MIN_WIDTH, event.clientX) + "px";
                        } else {
                            dragGuideHorizontal.style.top = Math.max(rect.top + CELL_MIN_HEIGHT, event.clientY) + "px";
                        }
                    };
                    const apply = event => {
                        if (isDraggerVertical) {
                            cell.style.width = cell.style.minWidth = Math.max(CELL_MIN_WIDTH, event.clientX - rect.left) + "px";
                        } else {
                            cell.style.height = Math.max(CELL_MIN_HEIGHT, event.clientY - rect.top) + "px";
                        }
                        (isDraggerVertical ? dragGuideVertical : dragGuideHorizontal).style.display = "none";
                        overlay.classList.remove("sensible");
                        document.removeEventListener("mousemove", setPosition);
                        document.removeEventListener("mouseup", apply);
                    };
                    setPosition(event);
                    document.addEventListener("mousemove", setPosition);
                    document.addEventListener("mouseup", apply);
                }
            });
        }

        { // Making cells selectable by dragging
            const table = document.getElementById("table");
            const formulaInput = document.getElementById("formula");
            const formulaError = document.getElementById("formula-error");
            const isRegularCell = element => {
                return element.matches("#table td") &&
                    !element.classList.contains("row-header") && !element.classList.contains("column-header");
            };
            const getLocationOf = cell => {
                const tableRow = cell.parentElement;
                const column = Array.prototype.indexOf.call(tableRow.children, cell) - 1;
                const row = Array.prototype.indexOf.call(tableRow.parentElement.children, tableRow) - 1;
                return new ui.CellLocation(row, column);
            };
            document.addEventListener("mousedown", event => {
                if (isRegularCell(event.target)) {
                    const startLocation = getLocationOf(event.target);
                    ui.selection.set(startLocation, startLocation);
                    const formula = ui.spreadsheet.getFormula(startLocation.row, startLocation.column);
                    setTimeout(() => formulaInput.textContent = formula && "=" + formula, 1);
                    const error = event.target.getAttribute("data-error");
                    formulaError.textContent = error || "";
                    const setSelection = event => {
                        if (isRegularCell(event.target)) {
                            const endLocation = getLocationOf(event.target);
                            ui.selection.set(startLocation, endLocation);
                        }
                    };
                    const finish = () => {
                        table.removeEventListener("mouseover", setSelection);
                        document.removeEventListener("mouseup", finish);
                    };
                    table.addEventListener("mouseover", setSelection);
                    document.addEventListener("mouseup", finish);
                }
            });
        }

        { // Managing formulas editing
            let cellEdited = null;
            const formulaInput = document.getElementById("formula");
            const updateCell = () => {
                cellEdited = ui.selection.start;
                if(!ui._getCellByLocation(cellEdited).classList.contains("error")) {
                    ui._setCellText(cellEdited, formulaInput.textContent);
                }
            };
            document.addEventListener("keypress", event => {
                if (ui.selection.exists() && event.target === document.body && event.key.length === 1) {
                    document.getElementById("nav-formula").click();
                    formulaInput.focus();
                }
            });
            const applyFormula = () => {
                if (!cellEdited) return;
                ui._setCellText(cellEdited, "");
                let formulaText = formulaInput.textContent.trim();
                console.log(formulaText);
                if (formulaText.charAt(0) !== "=") {
                    // If text in the formula input does not represent a number or a boolean, converting it to string literal
                    if (formulaText.length && isNaN(formulaText) && formulaText !== "TRUE" && formulaText !== "FALSE") {
                        formulaText = JSON.stringify(formulaText);
                    }
                } else formulaText = formulaText.substring(1);
                try {
                    ui.spreadsheet.setFormula(cellEdited.row, cellEdited.column, formulaText);
                } catch (error) {
                    if (error instanceof Spreadsheet.FormulaError) {
                        ui._setError(new ui.CellLocation(cellEdited.row, cellEdited.column), error.toString());
                    } else console.log(error);
                }
                cellEdited = null;
            };
            formulaInput.addEventListener("keyup", event => {
                if (event.code === "Enter") {
                    // Saving formula on Enter
                    applyFormula();
                    event.preventDefault();
                } else updateCell();
            });
            formulaInput.addEventListener("keydown", event => {
                // Preventing line breaking in the input
                if (event.code === "Enter") event.preventDefault();
                else updateCell();
            });
            // Saving formula, if the input loses focus
            formulaInput.addEventListener("blur", applyFormula);
            // Preventing pasting of formatted text into the input
            formulaInput.addEventListener("paste", () => setTimeout(() => {
                formulaInput.textContent = formulaInput.textContent.replace(/\xa0/g, " ");
                ui._moveFormulaInputCaretToEnd();
            }, 1));
        }

        { // Defining logic of custom input elements
            const hideDropdowns = exclude => {
                const toggles = document.querySelectorAll("#toolbar .dropdown-toggle.active");
                if (toggles) toggles.forEach(toggle => toggle !== exclude && toggle.classList.remove("active"));
            };
            document.addEventListener("click", hideDropdowns);
            document.getElementById("toolbar").addEventListener("click", event => {
                const element = event.target;
                if (element.classList.contains("disabled")) return;
                if (element.classList.contains("dropdown-toggle")) {
                    hideDropdowns(element);
                    element.classList.toggle("active");
                    event.stopPropagation();
                } else if (element.classList.contains("toggle")) {
                    element.classList.toggle("active");
                    element.dispatchEvent(new CustomEvent("change", {detail: {
                        value: element.classList.contains("active")
                    }}));
                } else if (element.classList.contains("switch")) {
                    if(element.classList.contains("active")) return;
                    const group = element.getAttribute("data-group");
                    document.querySelectorAll(`.switch[data-group="${group}"]`)
                        .forEach(element => element.classList.remove("active"));
                    element.classList.add("active");
                    element.dispatchEvent(new CustomEvent("activate"));
                } else if (element.matches(".dropdown > li")) {
                    if(element.classList.contains("selected")) return;
                    const dropdown = element.parentElement;
                    Array.prototype.forEach.call(dropdown.children, element => element.classList.remove("selected"));
                    element.classList.add("selected");
                    const text = element.textContent;
                    if (text) dropdown.previousElementSibling.textContent = element.textContent;
                    dropdown.dispatchEvent(new CustomEvent("change", {detail: {
                        value: dropdown.classList.contains("color") ?
                            element.style.backgroundColor : element.getAttribute("data-value")
                    }}));
                    hideDropdowns();
                } else if (element.matches(".dropdown")) {
                    event.stopPropagation();
                }
            });
        }

        // Applying format
        {
            document.getElementById("bold").addEventListener("change", event => {
                ui.selection.forEachCell(cell => cell.style.fontWeight = event.detail.value ? "bold" : "");
            });
            document.getElementById("italic").addEventListener("change", event => {
                ui.selection.forEachCell(cell => cell.style.fontStyle = event.detail.value ? "italic" : "");
            });
            document.getElementById("underlined").addEventListener("change", event => {
                ui.selection.forEachCell(cell => cell.style.textDecoration = event.detail.value ? "underline" : "");
            });
            document.getElementById("color-text").addEventListener("change", event => {
                ui.selection.forEachCell(cell => cell.style.color = event.detail.value);
            });
            ["left", "center", "right", "justify"].forEach(value =>
                document.getElementById("align-" + value).addEventListener("activate", () => {
                    ui.selection.forEachCell(cell => cell.style.textAlign = value);
                }));
            document.getElementById("color-fill").addEventListener("change", event => {
                ui.selection.forEachCell(cell => cell.style.backgroundColor = event.detail.value);
            });
            const getBorderWidth = () =>
                document.querySelector("#border-width .selected").getAttribute("data-value") + "px";
            const getBorderColor = () =>
                document.querySelector("#color-border .selected").style.backgroundColor;
            const getBorder = () => getBorderWidth() + " solid " + getBorderColor();
            document.getElementById("border-top").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j, row, column) => {
                    if (!i) ui._getCellByCoordinates(row - 1, column).style.borderBottom = getBorder();
                });
            });
            document.getElementById("border-right").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j) =>
                    j === ui.selection.width() && (cell.style.borderRight = getBorder())
                );
            });
            document.getElementById("border-bottom").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j) =>
                    i === ui.selection.height() && (cell.style.borderBottom = getBorder())
                );
            });
            document.getElementById("border-left").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j, row, column) => {
                    if (!j) ui._getCellByCoordinates(row, column - 1).style.borderRight = getBorder();
                });
            });
            document.getElementById("border-horizontal").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j) =>
                    i !== ui.selection.height() && (cell.style.borderBottom = getBorder())
                );
            });
            document.getElementById("border-vertical").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j) =>
                    j !== ui.selection.width() && (cell.style.borderRight = getBorder())
                );
            });
            document.getElementById("border-inner").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j) => {
                    if (i !== ui.selection.height()) cell.style.borderBottom = getBorder();
                    if (j !== ui.selection.width()) cell.style.borderRight = getBorder();
                });
            });
            document.getElementById("border-outer").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j, row, column) => {
                    if (!i) ui._getCellByCoordinates(row - 1, column).style.borderBottom = getBorder();
                    if (!j) ui._getCellByCoordinates(row, column - 1).style.borderRight = getBorder();
                    if (i === ui.selection.height()) cell.style.borderBottom = getBorder();
                    if (j === ui.selection.width()) cell.style.borderRight = getBorder();
                });
            });
            document.getElementById("border-all").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                document.getElementById("border-inner").click();
                document.getElementById("border-outer").click();
            });
            document.getElementById("border-clear").addEventListener("click", event => {
                if (event.target.classList.contains("disabled")) return;
                ui.selection.forEachCell((cell, i, j, row, column) => {
                    if (!i) ui._getCellByCoordinates(row - 1, column).style.borderBottom = "none";
                    if (!j) ui._getCellByCoordinates(row, column - 1).style.borderRight = "none";
                    cell.style.borderBottom = cell.style.borderRight = "none";
                });
            });
        }

    },

    /**
     * Attaches spreadsheet to user interface
     * @param {Spreadsheet} spreadsheet
     */
    attach(spreadsheet) {

        this.spreadsheet = spreadsheet;

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_VALUE_UPDATED, (row, column, value) => {
            let text = "";
            let error = "";
            const location = new ui.CellLocation(row, column);
            switch(typeof value) {
                case "string":
                case "number":
                    text = value + "";
                    break;
                case "boolean":
                    text = value ? "TRUE" : "FALSE";
                    break;
                case "undefined":
                	break;
                default:
                    error = "Calculated value is not printable";

            }
            ui._setCellText(location, text);
            ui._setError(location, error);
        });

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_FORMULA_UPDATED, (row, column, formula) => {
            if(ui.selection.exists() && row === ui.selection.start.row && column === ui.selection.start.column) {
                document.getElementById("formula").textContent = "=" + formula;
                ui._moveFormulaInputCaretToEnd();
            }
        });

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_CIRCULAR_DEPENDENCY_DETECTED, (row, column) => {
            ui._setError(new ui.CellLocation(row, column), "Circular dependency detected");
        });

    },

    /**
     * Returns representation of column index as letter sequence (e.g. 0 => "A", 28 => "AC")
     * @param index
     * @returns {string}
     * @private
     */
    _getColumnNameAt(index) {

        let str = "";
        index++;
        for (let a = 1, b = 26; (index -= a) >= 0; a = b, b *= 26) {
            str = String.fromCharCode("A".charCodeAt(0) + Math.floor((index % b) / a)) + str;
        }
        return str;

    },

    /**
     * Creates a cell with a name of the column
     * @param index
     * @returns {Element}
     * @private
     */
    _createColumnHeader(index) {

        const cell = document.createElement("td");
        cell.textContent = ui._getColumnNameAt(index - 1);
        cell.classList.add("column-header");
        cell.style.zIndex = ui.MAX_COLUMNS - index;
        const dragger = document.createElement("div");
        dragger.classList.add("dragger-vertical");
        cell.appendChild(dragger);
        return cell;

    },

    /**
     * Creates a row
     * @param index
     * @returns {Element}
     * @private
     */
    _createRow(index) {

        const row = document.createElement("tr");
        for (let j = 0; j <= ui.DEFAULT_COLUMNS; j++) {
            const cell = document.createElement("td");
            if (!j) {
                cell.textContent = index;
                cell.classList.add("row-header");
                cell.style.zIndex = ui.MAX_ROWS - index;
                const dragger = document.createElement("div");
                dragger.classList.add("dragger-horizontal");
                cell.appendChild(dragger);
            }
            row.appendChild(cell);
        }
        return row;

    },

    /**
     * Gets cell element by its coordinates
     * @param {int} row
     * @param {int} column
     * @private
     */
    _getCellByCoordinates(row, column) {
        return document.querySelectorAll("#table tr")[row + 1].children[column + 1];
    },

    /**
     * Gets cell element by its location
     * @param {ui.CellLocation} location
     * @returns {HTMLElement}
     * @private
     */
    _getCellByLocation(location) {
        return this._getCellByCoordinates(location.row, location.column);
    },

    /**
     * Re-renders text in the cell
     * @param {HTMLElement} cell
     * @private
     */
    _updateCellText(cell) {
        const value = cell.getAttribute("data-value");
        if (value.length < 2) {
            cell.textContent = value;
            return;
        }
        const originalWidth = cell.clientWidth;
        cell.textContent = value;
        // If text doesn't fit in the cell, shortening it
        if (cell.clientWidth > originalWidth) {
            const hidden = document.getElementById("hidden");
            ["fontFamily", "fontSize", "fontWeight"].forEach(style => hidden.style[style] = cell.style[style]);
            for (let i = 1; i < value.length; i++) {
                hidden.textContent = value.substring(0, i + 1) + "\u2026";
                if (hidden.clientWidth > originalWidth) {
                    cell.textContent = value.substring(0, i) + "\u2026";
                    break;
                }
            }
        }
    },

    /**
     * Sets text to a cell
     * @param {ui.CellLocation} location
     * @param {string} value
     * @private
     */
    _setCellText(location, value) {
        const cell = ui._getCellByLocation(location);
        cell.setAttribute("data-value", value);
        ui._updateCellText(cell);
    },

    /**
     * Sets that cell contains an error and stores its description
     * @param {ui.CellLocation} location
     * @param {string} text
     * @private
     */
    _setError(location, text) {
        if(ui.selection.exists() && location.row === ui.selection.start.row && location.column === ui.selection.start.column) {
            document.getElementById("formula-error").textContent = text;
        }
        const cell = ui._getCellByLocation(location);
        if (text) {
            cell.classList.add("error");
            cell.setAttribute("data-value", "");
            cell.textContent = "";
        }
        else cell.classList.remove("error");
        cell.setAttribute("data-error", text);
    },

    /**
     * Moves caret in focused formula field to the end
     * @private
     */
    _moveFormulaInputCaretToEnd() {
        const formulaInput = document.getElementById("formula");
        if(formulaInput !== document.activeElement) return;
        const range = document.createRange();
        range.selectNodeContents(formulaInput);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },

    /**
     * Tells UI that there are selected cells and controls should be enabled and updated
     * @private
     */
    _setTableSelectionChanged() {

        document.getElementById("formula").contentEditable = true;
        document.querySelectorAll(".requires-selection").forEach(element => element.classList.remove("disabled"));

        document.getElementById("bold").classList[
            ui.selection.everyCell(cell => cell.style.fontWeight === "bold") ? "add" : "remove"
        ]("active");
        document.getElementById("italic").classList[
            ui.selection.everyCell(cell => cell.style.fontStyle === "italic") ? "add" : "remove"
        ]("active");
        document.getElementById("underlined").classList[
            ui.selection.everyCell(cell => cell.style.textDecoration === "underline") ? "add" : "remove"
        ]("active");
        ["left", "center", "right", "justify"].forEach(value =>
            document.getElementById("align-" + value).classList[
                ui.selection.everyCell(cell => cell.style.textAlign === value) ? "add" : "remove"
            ]("active"));

    },

    /**
     * Currently selected cells
     */
    selection: {

        /**
         * First corner of the selection
         * @type {ui.CellLocation}
         */
        start: null,
        /**
         * Second corner of the selection
         * @type {ui.CellLocation}
         */
        end: null,

        /**
         * Check if there are selected cells
         * @returns {boolean}
         */
        exists() {
            return this.start !== null && this.end !== null
        },

        /**
         * Calculates width of the selection
         * @returns {int}
         */
        width() {
            return Math.abs(this.end.column - this.start.column);
        },

        /**
         * Calculates height of the selection
         * @returns {int}
         */
        height() {
            return Math.abs(this.end.row - this.start.row);
        },

        /**
         * Sets selection
         * @param {ui.CellLocation} start
         * @param {ui.CellLocation} end
         */
        set(start, end) {

            if(this.start !== null) this.clear();
            this.start = start;
            this.end = end;

            this.forEachCell((cell, i, j, row, column) => {
                cell.classList.add("selected");
                if(row === this.start.row && column === this.start.column) cell.classList.add("selected-first");
                if(i === 0) ui._getCellByCoordinates(row - 1, column).classList.add("selection-border-bottom");
                if(i === this.height()) cell.classList.add("selection-border-bottom");
                if(j === 0) ui._getCellByCoordinates(row, column - 1).classList.add("selection-border-right");
                if(j === this.width()) cell.classList.add("selection-border-right");
            });

            ui._setTableSelectionChanged();

        },

        /**
         * Removes current selection
         */
        clear() {

            this.start = null;
            this.end = null;

            document.querySelectorAll(
                "#table .selected, #table .selection-border-right, #table .selection-border-bottom"
            ).forEach(element => {
                [
                    "selected", "selected-first", "selection-border-right", "selection-border-bottom"
                ].forEach(className => element.classList.remove(className));
            });

        },

        /**
         * Calls a function for each of the selected cells
         * @param {function} callback
         */
        forEachCell(callback) {

            if(!this.exists()) return;

            const startRow = Math.min(this.start.row, this.end.row);
            const startColumn = Math.min(this.start.column, this.end.column);
            const rows = document.querySelectorAll("#table tr");
            for(let i = startRow; i <= startRow + this.height(); i++) {
                const cells = rows[i + 1].children;
                for (let j = startColumn; j <= startColumn + this.width(); j++) {
                    callback(cells[j + 1], i - startRow, j - startColumn, i, j);
                }
            }

        },

        /**
         * Calls a function for each of the selected cells and returns true if callback
         *   returns true for every cell
         * @param callback
         * @returns {boolean}
         */
        everyCell(callback) {

            let flag = true;
            this.forEachCell((...args) => flag = flag && !!callback(...args));
            return flag;

        }

    }

};

/**
 * Represents a pair of coordinates of a cell
 * @class
 */
ui.CellLocation = class {

    /**
     * @param row
     * @param column
     * @constructor
     */
    constructor(row, column) {
        this.row = row;
        this.column = column;
    }

};