if(typeof window !== "object" || window === null || typeof document !== "object" || document === null) {
    throw new Error("A window with a document is required");
}

const ui = {

    DEFAULT_ROWS: 100,
    DEFAULT_COLUMNS: 26,

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

    },

    /**
     * Attaches spreadsheet to user interface
     * @param {Spreadsheet} spreadsheet
     */
    attach(spreadsheet) {

        spreadsheet.addEventListener(Spreadsheet.Event.CELL_VALUE_UPDATED, (i, j, value) => {

        });

    }

};