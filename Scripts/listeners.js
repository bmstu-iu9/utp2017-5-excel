"use strict";
var cell;

/**
 * Executes the function(s), when the document is loaded
 */
function addLoadEvent(func) {
    var mem = window.onload;
    if (typeof window.onload != "function") {
        window.onload = func;
    } else {
        window.onload = function() {
            if (mem) {
                mem();
            }
            func();
        }
    }
}
/**
 * The initialization of listeners is held here
 */
function initListeners() {
    document.getElementById("test").onclick = click;
    document.getElementById("table_1").addEventListener('click', tableClick, false)
    var inp = document.getElementById("in");
    inp.addEventListener('input', track, false);
}
/**
 * Function tracks changes in the input "in" and 
 * displays the changed values in the table
 */
function track() {
    if (cell) {
        cell.innerText = this.value;
    }
}
/**
 * Table click event
 */
function tableClick(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    var text = "";
    if (target) {
        text = target.textContent || text.innerText || "";
    }
    document.getElementById('in').value = text;
    cell = target;
}

addLoadEvent(initListeners);