"use strict";

var table;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** 
 * Gets the innerText of the cell in the table_1
 * @param {Number} x -	column
 * @param {Number} y -	row
 * @return {Text} innerText of the cell 
 */
function get(x, y) {
    return table.rows[y].children[x].innerText;
}
/**
 * Sets the innerText of the cell
 * @param {Number} x -	column
 * @param {Number} y -	row
 */
function set(x, y, text) {
    table.rows[y].children[x].innerText = text;
}

function click() {
    alert('There may be script soon!');
}

/**
 * Sets the table size
 * @param {Number} width
 * @param {Number} height
 */
/*async*/ 
function setTableSize(width, height) {
    var h = table.rows.length;
    var w = table.rows[0].children.length

    if (h < height) {
        var inner = "";
        var extra = "";
        for (var j = 0; j < width; j++) {
            inner += "<td></td>"
            if (j == Math.abs(width - h) - 1)
                extra = inner;
        }
        for (var i = h; i < height; i++) {
            var row = table.insertRow();
            row.innerHTML = inner;
            /*await sleep(300);*/
        }
        for (var i = 0; i < w; i++) {
            table.rows[i].innerHTML += extra;
        }
    } else if (h > height) {
        for (var i = h - 1; i >= height; i--) {
            table.deleteRow(i);
        }
    }
}

addLoadEvent(function() {
    table = document.getElementById("table_1");
	//setTableSize(4, 5);
});
