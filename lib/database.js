/*jslint devel:true*/
/*global module, require, PouchDB*/
var database = (function () {
    "use strict";
    var lib = require("lib/lib"),  // Libraries
        designs = require("lib/couchdb.designs"),
        current = lib.guessCurrentDb(), // Internal Variables
        Monitor; // Internal Functions

    Monitor = function (db) {
        var stop, // Internal Functions
            start,
            watch,
            mon, // Internal Variables
            watching = {};
        stop = function () {
            if (mon) {
                mon.cancel();
            }
        };
        start = function () {
            if (!mon) {
                mon = db.changes({
                    onChange: function (change) {
                        if (change.id && (typeof watching[change.id] === "function")) {
                            console.log("change");
                            watching[change.id](change);
                        }
                    },
                    continuous: true
                });
            }
        };
        watch = function (id, func) {
            if (typeof func !== "function") {
                throw "not a function";
            }
            watching[id] = func;
            if (!mon) {
                start();
            }
        };
        return {
            register: watch,
            unregister: function (id) {
                if (watching[id]) {
                    delete watching[id];
                }
            },
            stop: stop,
            start: start
        };
    };

    return {
        replicate: function () {
            PouchDB.replicate(current.origin + "/" + current.db, current.db, {
                filter: designs.filters.typed,
                continuous: true
            });
        },
        createMonitor: function (db) {
            return new Monitor(db);
        }
    };
}());

module.exports = database;
