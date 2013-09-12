/*jslint browser:true*/
/*global module, require, PouchDB, console*/
module.exports = function () {
    "use strict";
    var lib = require("lib/lib"),  // Libraries
        render = require("lib/render"),
        event = new (require("events").EventEmitter)(),
        actions = require("lib/actions"),
        views = require("lib/couchdb.view"),
        current = lib.guessCurrentDb(), // Variables
        db = new PouchDB(current.db),  // Pouchdb should be a module.;
        statsElm = document.getElementById("stats"), // Elements
        skillsElm = document.getElementById("skills"),
        bodyElm = document.getElementById("body"),
        equipElm = document.getElementById("equipment"),
        weaponsElm = document.getElementById("weapons");

// EVENTS
    event.on("changed", function () {
    // Retrieve Information
        db.query({map: views.listTypes.map}, {key: ["player", "Pieter van der Eems"], reduce: false}, function (err, result) {
            if (!err) {
                console.log(result);
                event.emit("typeLoaded", result.rows[0].id);
            }
        });
    });

    event.on("playerLoaded", function (player) {
        //To be filled
    });

    event.on("characterLoaded", function (character) {
        statsElm.innerHTML = render.toList(character.stats);
        skillsElm.innerHTML = render.toList(character.skills);
        bodyElm.innerHTML = render.body(character.body, "bod");
        document.getElementById("bod").addEventListener("contextmenu", actions.valueDown);
        document.getElementById("bod").addEventListener("click", actions.valueUp);
        equipElm.innerHTML = render.toTable(character.equipment);
        weaponsElm.innerHTML = render.toTable(character.weapons);
    });

    event.on("typeLoaded", function (type) {
        if (type) {
            db.query({map: views.listByPlayer.map}, {startkey: [type], endkey: [type, {}], reduce: false, include_docs: true}, function (err, result) {
                var i,
                    ev;
                if (!err) {
                    for (i = result.rows.length - 1; i >= 0; i -= 1) {
                        ev = result.rows[i].key[1] + "Loaded";
                        event.emit(ev, result.rows[i].doc);
                    }
                }
            });
        }
    });

    db.replicate.from(current.origin + "/" + current.db, {
        complete: function (een, twee) {
            console.log("replication complete", een, twee);
            event.emit("changed");
        }
    });

};
//Copyright 2013 Pieter van der Eems
//    This file is part of EemcoRPG
//
//    EemcoRPG is free software: you can redistribute it and/or modify
//    it under the terms of the Affero GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    EemcoRPG is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    Affero GNU General Public License for more details.
//
//    You should have received a copy of the Affero GNU General Public License
//    along with EemcoRPG.  If not, see <http://www.gnu.org/licenses/>.