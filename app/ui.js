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
                element.parentNode.querySelector(".selected").classList.remove("selected");
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
            const CELL_MIN_WIDTH = 15;
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
                        if(isDraggerVertical) {
                            dragGuideVertical.style.left = Math.max(rect.left + CELL_MIN_WIDTH, event.clientX) + "px";
                        } else {
                            dragGuideHorizontal.style.top = Math.max(rect.top + CELL_MIN_HEIGHT, event.clientY) + "px";
                        }
                    };
                    const apply = event => {
                        if(isDraggerVertical) {
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
                if(isRegularCell(event.target)) {
                    const startLocation = getLocationOf(event.target);
                    console.log(JSON.stringify(startLocation))
                    ui.selection.set(startLocation, startLocation);
                    const setSelection = event => {
                        if(isRegularCell(event.target)) {
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

    },

    /**
     * Attaches spreadsheet to user interface
     * @param {Spreadsheet} spreadsheet
     */
    attach(spreadsheet) {

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_VALUE_UPDATED, (i, j, value) => {

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

            const startRow = Math.min(this.start.row, this.end.row);
            const startColumn = Math.min(this.start.column, this.end.column);
            const rows = document.querySelectorAll("#table tr");
            for(let i = startRow; i <= startRow + this.height(); i++) {
                const cells = rows[i + 1].children;
                for(let j = startColumn; j <= startColumn + this.width(); j++) {
                    const cell = cells[j + 1];
                    cell.classList.add("selected");
                    if(i === this.start.row && j === this.start.column) cell.classList.add("selected-first");
                    if(i === startRow) cell.classList.add("selection-border-top");
                    if(i === startRow + this.height()) cell.classList.add("selection-border-bottom");
                    if(j === startColumn) cell.classList.add("selection-border-left");
                    if(j === startColumn + this.width()) cell.classList.add("selection-border-right");
                }
            }

        },

        /**
         * Removes current selection
         */
        clear() {

            this.start = null;
            this.end = null;

            document.querySelectorAll("#table td.selected").forEach(element => {
                [
                    "selected", "selected-first",
                    "selection-border-top", "selection-border-right", "selection-border-left", "selection-border-bottom"
                ].forEach(className => element.classList.remove(className));
            });

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