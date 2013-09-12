/*jslint browser:true*/
/*global module, require, PouchDB, console*/
module.exports = function (player, target) {
    "use strict";
    var lib = require("lib/lib"),  // Libraries
        render = require("lib/render"),
        event = new (require("events").EventEmitter)(),
        actions = require("lib/actions"),
        designs = require("lib/couchdb.designs"),
        current = lib.guessCurrentDb(), // Variables
        db = new PouchDB(current.db),  // Pouchdb should be a module.;
        statsElm = target.querySelector(".stats"), // Elements
        skillsElm = target.querySelector(".skills"),
        bodyElm = target.querySelector(".body"),
        equipElm = target.querySelector(".equipment"),
        weaponsElm = target.querySelector(".weapons");

// EVENTS
    event.on("changed", function () {
    // Retrieve Information
        db.query({map: designs.views.listTypes.map}, {key: ["player", player], reduce: false}, function (err, result) {
            if (!err) {
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
        bodyElm.innerHTML = render.body(character.body, target + "_bod");
        document.getElementById(target + "_bod").addEventListener("contextmenu", actions.valueDown);
        document.getElementById(target + "_bod").addEventListener("click", actions.valueUp);
        equipElm.innerHTML = render.toTable(character.equipment);
        weaponsElm.innerHTML = render.toTable(character.weapons);
    });

    event.on("typeLoaded", function (type) {
        if (type) {
            db.query({map: designs.views.listByPlayer.map}, {startkey: [type], endkey: [type, {}], reduce: false, include_docs: true}, function (err, result) {
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
        filter: designs.filters.typed,
        complete: function (err, result) {
            event.emit("complete", err, result);
        },
        onChange: function (change) {
            console.log("change", change);
            event.emit("changed");
        },
        continuous: true
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
