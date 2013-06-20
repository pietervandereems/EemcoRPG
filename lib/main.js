/*global module, document*/
module.exports = function () {
    "use strict";
    var db = require("lib/db"),
        event = new (require("events").EventEmitter)(),
        current = db.guessCurrent();

    event.on("playerLoaded", function (player) {
        console.log("player", player);
    });

    event.on("characterLoaded", function (character) {
        console.log("character", character);
    });

    event.on("typeLoaded", function (type) {
        console.log("type loaded", type);
        if (type) {
            db.getView(current.db, "rpg", "listByPlayer", {startkey: [type], endkey: [type, {}], reduce: false, include_docs: true}, function (err, result) {
                var i,
                    ev;
                if (!err) {
                    for (i = result.rows.length - 1; i >= 0; i -= 1) {
                        ev = result.rows[i].key[1] + "Loaded";
                        console.log("ev", ev);
                        event.emit(ev, result.rows[i].doc);
                    }
                }
            });
        }
    });

    db.getShow(current.db, "rpg", "player", "d1ff13bf9ce957c955e46b228f0003b2", function (err, result) {
        var player;
        if (!err) {
            player = document.getElementById("player");
            player.innerHTML = result;
        }
    });

    db.getView(current.db, "rpg", "listTypes", {key: ["player", "Pieter van der Eems"], reduce: false}, function (err, result) {
        if (!err) {
            event.emit("typeLoaded", result.rows[0].id);
        }
    });
};
