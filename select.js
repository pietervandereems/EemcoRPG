/*jslint browser:true, devel: true*/
/*global module, require, PouchDB*/
(function (global) {
    "use strict";
    var database = require("lib/database"), // Libraries
        sheet = require("view/sheet"),
        defaults = {}, // Internal Variables;
        db = database.getdb(),
        start; // exported function
    start = function (playersElm, charactersElm) {
        defaults.players = playersElm.innerHTML;
        defaults.characters = charactersElm.innerHTML;

        database.replicate();
        console.log("views", sheet.views);
        playersElm.addEventListener("click", function (event) {
            db.query(sheet.views.listByPlayer, function (err, result) {
                console.log("player result", err, result);
            });
        });
    };

    global.select = {
        start: start
    };
}(window));