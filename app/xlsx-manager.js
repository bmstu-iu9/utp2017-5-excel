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
            let zip = new JSZip();
            let sheet = new XLSXManager._Sheet();
            let sharedStrings = new XLSXManager._SharedStrings();
            sheet.fillData(this._cells);

            zip.folder("_rels").file(".rels", XLSXManager._Samples.rels);
            zip.folder("xl").folder("worksheets").file("sheet1.xml", sheet.toString());
            zip.folder("xl/worksheets/_rels").file("sheet1.xml.rels", XLSXManager._Samples.sheetRels);
            zip.folder("xl/_rels").file("workbook.xml.rels", XLSXManager._Samples.workbookRels);
            zip.file("xl/styles.xml", XLSXManager._Samples.styles);
            zip.file("xl/sharedStrings.xml", sharedStrings.toString());
            zip.file("xl/workbook.xml", XLSXManager._Samples.workbook);
            zip.folder("xl/drawings").file("drawing1.xml", XLSXManager._Samples.drawing);
            zip.file("[Content_Types].xml", XLSXManager._Samples.contentInfo);
            return zip.generateAsync({type: type});
        }

        /**
         * Loads the content to the attached spreadsheet
         * @param blob - *.xlsx file blob
         */
        fill(blob) {
            JSZip.loadAsync(blob).then((zip) => {
                let cells = zip.files["xl/worksheets/sheet1.xml"].async("string").then((data) => {
                    return (new window.DOMParser()).parseFromString(data, "text/xml")
                        .getElementsByTagName("sheetData")[0].childNodes;
                });
                cells.then((arr) => {
                    let rowsCount = arr.length; // REQUIRE HEIGHT -> automatically
                    let colCount = 0;
                    arr.forEach((row) => {
                        const cs = row.getElementsByTagName("c");
                        if (colCount < cs.length) {
                            colCount = cs.length; // REQUIRE WIDTH -> automatically
                        }
                        Array.from(cs).forEach(obj => {
                            let addr = this._getIndexes(obj.getAttribute("r"));
                            if (obj.getElementsByTagName("f")[0]) {
                                console.log("formula:", obj.getElementsByTagName("f")[0].textContent);
                                this._spreadsheet.setFormula(addr.row, addr.column, obj.getElementsByTagName("f")[0].textContent);
                            } else if (obj.getElementsByTagName("v")[0]) {
                                console.log("textContent:", obj.getElementsByTagName("v")[0].textContent);
                                this._spreadsheet.setFormula(obj.getElementsByTagName("v")[0].textContent)
                            }
                        });
                    });
                })
            });
        }

        /**
         * Get row and column index of the string cell representation
         * @param address
         * @returns {{row: number, column: number}}
         * @private
         */
        _getIndexes(address) { // No validation checks!
            let i = 0;
            while (!/^\d+$/.test(address[i]) && i < address.length) {
                i++;
            }
            let column = XLSXManager._numberize(address.substring(0, i));
            let row = parseInt(address.substring(i));

            return {row: row - 1, column: column - 1};
        }

        /**
         * Get the base64 encoding of the *.xlsx file
         * @returns {string} base64 string of the binary *.xlsx file
         * @deprecated
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
XLSXManager._Samples.rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
XLSXManager._Samples.workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';

XLSXManager._Samples.drawing = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:dgm="http://schemas.openxmlformats.org/drawingml/2006/diagram"/>';

XLSXManager._Samples.styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><fonts count="2"><font><sz val="10.0"/><color rgb="FF000000"/><name val="Arial"/></font><font/></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="lightGray"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/></border></borders><cellStyleXfs count="1"><xf borderId="0" fillId="0" fontId="0" numFmtId="0" applyAlignment="1" applyFont="1"/></cellStyleXfs><cellXfs count="2"><xf borderId="0" fillId="0" fontId="0" numFmtId="0" xfId="0" applyAlignment="1" applyFont="1"><alignment/></xf><xf borderId="0" fillId="0" fontId="1" numFmtId="0" xfId="0" applyAlignment="1" applyFont="1"><alignment/></xf></cellXfs><cellStyles count="1"><cellStyle xfId="0" name="Normal" builtinId="0"/></cellStyles><dxfs count="0"/></styleSheet>';
XLSXManager._Samples.workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main"><workbookPr/><sheets><sheet state="visible" name="Sheet1" sheetId="1" r:id="rId3"/></sheets><definedNames/><calcPr/></workbook>';
XLSXManager._Samples.sheetRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>';
XLSXManager._Samples.contentInfo = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + String.fromCharCode(13) + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default ContentType="application/xml" Extension="xml"/><Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet1.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.drawing+xml" PartName="/xl/drawings/drawing1.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/><Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/></Types>';
