if(typeof window !== "object" || window === null || typeof document !== "object" || document === null) {
    throw new Error("A window with a document is required");
}

const ui = {

    /**
     * Attaches spreadsheet to user interface
     * @param {Spreadsheet} spreadsheet
     */
    attach(spreadsheet) {

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_VALUE_UPDATED, (i, j, value) => {

        });

    }

};