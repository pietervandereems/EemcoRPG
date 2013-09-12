/*global module, document*/
module.exports = function (Pouch) {
    "use strict";
    var DB = "rpg",
        ID = "d1ff13bf9ce957c955e46b228f0003b2",
        render = require("lib/render"),  // Libraries
        event = new (require("events").EventEmitter)(),
        sheet = require("view/sheet"),
        db = new Pouch(DB),
        statsElm = document.getElementById("stats"), // Elements
        skillsElm = document.getElementById("skills"),
        bodyElm = document.getElementById("body"),
        equipElm = document.getElementById("equipment"),
        weaponsElm = document.getElementById("weapons"),
        processChange, // Functions
        processComplete,
        getCharacter;
// EVENTS
    event.on("playerLoaded", function (player) {
    });

    event.on("characterLoaded", function (character) {
        statsElm.innerHTML = render.toList(character.stats);
        skillsElm.innerHTML = render.toList(character.skills);
        bodyElm.innerHTML = render.body(character.body);
        equipElm.innerHTML = render.toTable(character.equipment);
        weaponsElm.innerHTML = render.toTable(character.weapons);
    });

// Functions
    getCharacter = function () {
        db.query({map: sheet.views.listByPlayer}, {startkey: [ID], endkey: [ID, {}], reduce: false, include_docs: true}, function (err, result) {
            var i,
                ev;
            if (!err) {
                for (i = result.rows.length - 1; i >= 0; i -= 1) {
                    ev = result.rows[i].key[1] + "Loaded";
                    event.emit(ev, result.rows[i].doc);
                }
            }
        });
    };

    processChange = function (change) {
        console.log("change", change);
    };

    processComplete = function (err, result, three) {
        console.log("complete", err, result, three);
    };

// Replication
    Pouch.replicate("http://ganassi.iriscouch.com/rpg", DB, {
        continuous: true,
        onChange: processChange,
        filter: "rpg/myDocs",
        query_params: {id: ID}
    }, processComplete);
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
