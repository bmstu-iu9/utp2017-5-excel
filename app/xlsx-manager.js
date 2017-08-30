"use strict";

/**
 * XLSXManager is a class, that generates *.xlsx binary files
 * @example
 * let manager = new XLSXManager();
 * manager.setSpreadsheet(spreadsheet);
 * var xlsxFile = manager.generateB64();
 * @type {XLSXManager}
 */
const XLSXManager = class {
        constructor() {
        }

        /**
         * Converts string address to numeric
         * @param pos {string}
         * @returns {number}
         * @private
         */
        static _numberize(pos) {
            let tmp = 0;
            let pow = 1;
            let posR = pos.split().reverse().join();
            for (let i = 0; !Number.isInteger(posR[i]) && i < pos.length; i++) {
                let d = parseInt(posR[i], 36) - 9;
                tmp += pow * d;
                pow *= 26;
            }
            return tmp;
        }

        /**
         * Translates the number values into literal addresses
         * @example
         * 0    ->  A
         * 26   ->  AA
         * 351  ->  MN
         * 702  ->  AAA
         * @param pos {number} index to be translated
         * @returns {string}
         * @private
         */
        static _letterize(pos) {
            let str = "";
            pos++;
            for (let a = 1, b = 26; (pos -= a) >= 0; a = b, b *= 26) {
                str = String.fromCharCode("A".charCodeAt(0) + Math.floor((pos % b) / a)) + str;
            }
            return str;
        }

        /**
         * Method generates representation of the *.xlsx file
         * @param type "base64" | "blob" | "binarystring" ...
         * @returns {*} whatever type was given
         * @private
         */
        _generate(type) {
            const zip = new JSZip();
            const sheet = new XLSXManager._Sheet();
            const sharedStrings = new XLSXManager._SharedStrings();
            sheet.fillData(this._cells);

            zip.folder("_rels").file(".rels", XLSXManager._Samples.RELS);
            zip.folder("xl").folder("worksheets").file("sheet1.xml", sheet.toString());
            zip.folder("xl/worksheets/_rels").file("sheet1.xml.rels", XLSXManager._Samples.SHEET_RELS);
            zip.folder("xl/_rels").file("workbook.xml.rels", XLSXManager._Samples.WORKBOOK_RELS);
            zip.file("xl/styles.xml", XLSXManager._Samples.STYLES);
            zip.file("xl/sharedStrings.xml", sharedStrings.toString());
            zip.file("xl/workbook.xml", XLSXManager._Samples.WORKBOOK);
            zip.folder("xl/drawings").file("drawing1.xml", XLSXManager._Samples.DRAWING);
            zip.file("[Content_Types].xml", XLSXManager._Samples.CONTENT_INFO);
            return zip.generateAsync({type: type});
        }

        /**
         * Sets the blob, that loads through the fill() call
         * @param blob - *.xlsx file blob
         */
        import(blob) {
            this._blob = blob;
        }

    /**
     * Fills the cells of the spreadsheet with the base64 string given
     * @param {string} base64str base64 string of the *.xlsx file
     */
    fillB64(base64str) {
        this._fill(base64str, {base64: true});
    }

    /**
     * Fills the cells of the spreadsheet with the data, given from import(blob) function
     */
    fill() {
        if (!this._blob) {
            console.error("blob is undefined! Remember calling import(blob)");
            return;
        }
        this._fill(this._blob);
    }

    _fill(obj, opt = undefined) {
        //const data = this._blob;
        JSZip.loadAsync(obj, opt).then((zip) => {
                const cells = zip.files["xl/worksheets/sheet1.xml"].async("string").then((data) => { // The cell data is here
                    return (new DOMParser()).parseFromString(data, "text/xml")
                        .getElementsByTagName("sheetData")[0].childNodes;
                });
                const strings = zip.file("xl/sharedStrings.xml").async("string").then((str) => { // Strings are stored here
                    return (new DOMParser()).parseFromString(str, "text/xml")
                        .getElementsByTagName("t");
                });

                const styles = new XLSXManager.Styles(zip.file("xl/styles.xml").async("string").then((str) => { // Strings are stored here
                    return (new DOMParser()).parseFromString(str, "text/xml");
                    //.getElementsByTagName("")
                }));

                Promise.all([cells, strings]).then((args) => {
                    const arr = args[0];
                    const strings = Array.from(args[1]).map(elem => elem.textContent);
                    let rowsCount = arr.length; // REQUIRE HEIGHT -> automatically
                    let colCount = 0;
                    arr.forEach((row) => {
                        const cs = row.getElementsByTagName("c");

                        if (colCount < cs.length) {
                            colCount = cs.length;
                        } // REQUIRE WIDTH -> automatically
                        Array.from(cs).forEach(obj => {
                            let {row, column} = XLSXManager._getIndices(obj.getAttribute("r"));
                            switch (obj.getAttribute("t")) {
                                case "s": {
                                    if (obj.getElementsByTagName("v")[0]) {
                                        this._spreadsheet.setFormula(row, column, JSON.stringify(strings[obj.getElementsByTagName("v")[0].textContent]));
                                    }
                                    break;
                                }
                                default: {
                                    if (obj.getElementsByTagName("f")[0]) {
                                        //console.log("formula:", obj.getElementsByTagName("f")[0].textContent);
                                        try {
                                            this._spreadsheet.setFormula(row, column, obj.getElementsByTagName("f")[0].textContent);
                                        }
                                        catch (error) {
                                            console.error("The setFormula method shouldn't have thrown an error:\n" + error); // Shouldn't be
                                        }
                                    } else if (obj.getElementsByTagName("v")[0]) {
                                        //console.log("textContent:", obj.getElementsByTagName("v")[0].textContent);
                                        try {
                                            this._spreadsheet.setFormula(row, column, obj.getElementsByTagName("v")[0].textContent);
                                        }
                                        catch (error) {
                                            console.error("The setFormula method shouldn't have thrown an error:\n" + error); // Shouldn't be
                                        }
                                    } // else - ignore empty object
                                }
                            }
                        });
                    });
                });
            });
        }

        /**
         * Get row and column index of the string cell representation
         * @param address
         * @returns {{row: number, column: number}}
         * @private
         */
        static _getIndices(address) { // No validation checks!
            let i = 0;
            while (!/^\d+$/.test(address[i]) && i < address.length) {
                i++;
            }
            const column = XLSXManager._numberize(address.substring(0, i)) - 1;
            const row = parseInt(address.substring(i)) - 1;

            return {row, column};
        }

        /**
         * Get the base64 encoding of the *.xlsx file
         * @returns {string} base64 string of the binary *.xlsx file
         */
        generateB64() {
            return this._generate("base64");
        }

        /**
         *  Get the blob of the *.xlsx file
         * @returns {*}
         */
        generate() {
            return this._generate("blob");
        }

        /**
         * Sets the spreadsheet that is used for file generation
         * @param spreadsheet
         */
        setSpreadsheet(spreadsheet) {
            if (!spreadsheet instanceof Spreadsheet) {
                console.error("spreadsheet parameter should be Spreadsheet class!");
                return "";
            }
            this._spreadsheet = spreadsheet;
            this._cells = spreadsheet.cells;
        }
    }
;

/**
 *
 * @type {XLSXManager.FormattedCell}
 */
XLSXManager.FormattedCell = class {
    /**
     * Properties of the XLSXManager.FormattedCell
     */
    constructor() {
        this._fontFamily = undefined;
        this._fontSize = undefined;
        this._color = undefined;
        this._bold = undefined;
        this._italic = undefined;
        this._underlined = undefined;
        this._textAlign = undefined;
        this._fillColor = undefined;
        this._borderLeft = undefined;
        this._borderTop = undefined;
        this._borderRight = undefined;
        this._borderBottom = undefined;
    }

    /**
     * Sets all the properties to undefined
     */
    reset() {
        this.constructor();
    }

    /**
     * Checks if the value is the typeOf type. Otherwise, throws exception.
     * @param value the given value
     * @param type expected type
     * @param legValues array of legitimate values
     */
    static check(value, type, legValues = undefined) {
        if (!(typeof value === type)) {
            throw new Error(`Incompatible types ${typeof  value} and ${type}!`);
        }
        if (legValues && Object.prototype.toString.call(legValues) === '[object Array]') {
            if (legValues.indexOf(value) < 0) {
                throw new Error(`Legitimate value${legValues.length > 1 ? "s" : ""}: ${legValues.join(" | ")}`);
            }
        } else if (legValues !== undefined) {
            console.error("Invalid XLSXManager.FormattedCell.check(...) usage");
        }
    }

    getFont() {
        let font = new XLSXManager.Styles.Font();
        font.color = this._color;
        font.name = this._fontFamily;
        font.size = this._fontSize;
        return font;
    }

    // = = = STYLE PROPERTIES HERE = = = //

    get fontFamily() {
        return this._fontFamily;
    }

    set fontFamily(value) {
        XLSXManager.FormattedCell.check(value, "string");
        this._fontFamily = value;
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        XLSXManager.FormattedCell.check(value, "number");
        this._fontSize = value;
    }

    get color() {
        return this._color;
    }

    set color(value) { // Check color type?
        this._color = value;
    }

    get bold() {
        return this._bold;
    }

    set bold(value) {
        XLSXManager.FormattedCell.check(value, "boolean");
        this._bold = value;
    }

    get italic() {
        return this._italic;
    }

    set italic(value) {
        XLSXManager.FormattedCell.check(value, "boolean");
        this._italic = value;
    }

    get underlined() {
        return this._underlined;
    }

    set underlined(value) {
        XLSXManager.FormattedCell.check(value, "boolean");
        this._underlined = value;
    }

    get textAlign() {
        return this._textAlign;
    }

    set textAlign(value) {
        XLSXManager.FormattedCell.check(value, "string", ["left", "right", "center", "justify"]);
        this._textAlign = value;
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(value) {
        this._fillColor = value;
    }

    get borderLeft() {
        return this._borderLeft;
    }

    set borderLeft(value) {
        if (!(value instanceof XLSXManager.FormattedCell.Border)) {
            throw new Error("Incompatible type! XLSXManager.FormattedCell.Border object expected!");
        }
        this._borderLeft = value;
    }

    get borderTop() {
        return this._borderTop;
    }

    set borderTop(value) {
        if (!(value instanceof XLSXManager.FormattedCell.Border)) {
            throw new Error("Incompatible type! XLSXManager.FormattedCell.Border object expected!");
        }
        this._borderTop = value;
    }

    get borderRight() {
        return this._borderRight;
    }

    set borderRight(value) {
        if (!(value instanceof XLSXManager.FormattedCell.Border)) {
            throw new Error("Incompatible type! XLSXManager.FormattedCell.Border object expected!");
        }
        this._borderRight = value;
    }

    get borderBottom() {
        return this._borderBottom;
    }

    set borderBottom(value) {
        if (!(value instanceof XLSXManager.FormattedCell.Border)) {
            throw new Error("Incompatible type! XLSXManager.FormattedCell.Border object expected!");
        }
        this._borderBottom = value;
    }
};

XLSXManager.FormattedCell.Border = class /*extends Spreadsheet._Cell*/ {
    constructor() {
        this._position = undefined;
        this._width = undefined;
        this._color = undefined;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        XLSXManager.FormattedCell.check(value, "string", ["top", "left", "right", "bottom"]);
        this._position = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        XLSXManager.FormattedCell.check(value, "number");
        this._width = value;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }
};

/**
 * Generates the representation of the sharedStrings.xml file
 * @type {XLSXManager._SharedStrings}
 * @private
 */
XLSXManager._SharedStrings = class {
    constructor() {
        this.data = "";
        this.counter = 0;
        this._metaTail = "</sst>";
    }

    /**
     * Some meta information about number of strings, version etc
     * @returns {string}
     * @private
     */
    _metaHead() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${this.counter}" uniqueCount="${this.counter}">`
    }

    /**
     * Adds string to the data structure of the sharedStrings.xml file
     * @param str string to be added
     * @returns {XLSXManager._SharedStrings}
     */
    append(str) {
        this.data += "<si><t>" + str + "</t></si>";
        this.counter++;
        return this;
    }

    /**
     * Get xml file data
     * @returns {string}
     */
    toString() {
        return this._metaHead() + this.data + this._metaTail;
    }

    /**
     * Resets all the strings, that were appended
     */
    clear() {
        this.data = "";
        this.counter = 0;
    }
};

/**
 * Class is responsible for styles (fonts, size, color, etc...)
 * @type {XLSXManager.Styles}
 */
XLSXManager.Styles = class {
    constructor() {
        this.fonts = [];
        this.fills = [];
        this.boreders = [];
    }

    addStyle(formattedCell) { // TODO check type
        formattedCell.getFont();

    }
};
XLSXManager.Styles.Font = class {
    constructor() {
        this.size = undefined;
        this.color = undefined;
        this.name = undefined;
        this._hash = undefined;
    }

    toString() {
        let doc = document.implementation.createDocument(null, "font");
        const font = doc.createElement("font");
        if (this.size) {
            const sz = doc.createElement("sz");
            sz.setAttribute("val", this.size.toString());
            font.appendChild(sz);
        }
        if (this.color) {
            const cl = doc.createElement("color");
            cl.setAttribute("rgb", this.color);
            font.appendChild(cl);
        }
        if (this.name) {
            const fn = doc.createElement("name");
            fn.setAttribute("val", this.name);
            font.appendChild(fn);
        }
        doc.documentElement.appendChild(font);
        return new XMLSerializer().serializeToString(doc.documentElement);
    }

    hash() {

    }
};


/**
 * Generates the representation of the sheet1.xml (file in xl/worksheets directory)
 * @type {XLSXManager._Sheet}
 * @private
 */
XLSXManager._Sheet = class {

    constructor() {
        this.data = "";
        this.defaultColWidth = 14.43;
        this.defaultRowHeight = 15.75;
        this._metaTail = '<DRAWING r:id="rId1"/></worksheet>';
    }

    /**
     * Meta info. Includes the information about default column and default row size
     * @returns {string}
     * @private
     */
    _metaHead() {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr customHeight="1" defaultColWidth="${this.defaultColWidth}" defaultRowHeight="${this.defaultRowHeight}"/>`;
    }


    /**
     * Generates xml structure of the given cells
     * @param cells array of array of Spreadsheet._Cells
     */
    fillData(cells) {
        if (!cells instanceof Spreadsheet._Cell) {
            console.error("fillData parameter should be Spreadsheet._Cell class!");
            return "";
        }
        let doc = document.implementation.createDocument(null, "sheetData");

        for (let row = 1; row <= cells.length; row++) {
            let r = doc.createElement("row");
            r.setAttribute("r", row);
            doc.documentElement.appendChild(r);
            for (let ci = 0; ci < cells[0].length; ci++) {
                let obj = cells[row - 1][ci];
                let cell = doc.createElement("c");
                cell.setAttribute("r", XLSXManager._letterize(ci) + row.toString()); // address
                cell.setAttribute("s", "1"); // style
                if (obj.formula) {
                    let formula = doc.createElement("f");
                    formula.textContent = obj.formula; // formula
                    cell.appendChild(formula);
                }
                if (obj.value) {
                    let val = cell.appendChild(doc.createElement("v"));
                    val.textContent = obj.value; // value
                }
                r.appendChild(cell);
            }
        }
        this.data = new XMLSerializer().serializeToString(doc.documentElement);
    }

    /**
     * Get xml file data
     * @returns {string}
     */
    toString() {
        return this._metaHead() + this.data + this._metaTail;
    }
};

/**
 * Samples for generating file content of xml files
 * @type {XLSXManager._Samples}
 * @private
 */
XLSXManager._Samples = class {
};
XLSXManager._Samples.RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
XLSXManager._Samples.WORKBOOK_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';

XLSXManager._Samples.DRAWING = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:dgm="http://schemas.openxmlformats.org/drawingml/2006/diagram"/>';

XLSXManager._Samples.STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><fonts count="2"><font><sz val="10.0"/><color rgb="FF000000"/><name val="Arial"/></font><font/></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="lightGray"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/></border></borders><cellStyleXfs count="1"><xf borderId="0" fillId="0" fontId="0" numFmtId="0" applyAlignment="1" applyFont="1"/></cellStyleXfs><cellXfs count="2"><xf borderId="0" fillId="0" fontId="0" numFmtId="0" xfId="0" applyAlignment="1" applyFont="1"><alignment/></xf><xf borderId="0" fillId="0" fontId="1" numFmtId="0" xfId="0" applyAlignment="1" applyFont="1"><alignment/></xf></cellXfs><cellStyles count="1"><cellStyle xfId="0" name="Normal" builtinId="0"/></cellStyles><dxfs count="0"/></styleSheet>';
XLSXManager._Samples.WORKBOOK = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main"><workbookPr/><sheets><sheet state="visible" name="Sheet1" sheetId="1" r:id="rId3"/></sheets><definedNames/><calcPr/></workbook>';
XLSXManager._Samples.SHEET_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>';
XLSXManager._Samples.CONTENT_INFO = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default ContentType="application/xml" Extension="xml"/><Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet1.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.drawing+xml" PartName="/xl/drawings/drawing1.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/></Types>';