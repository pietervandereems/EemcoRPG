/*jslint regexp:true, browser:true, devel:true*/
/*global module, require, PouchDB*/
var database = (function () {
    "use strict";
    var designs = require("lib/couchdb.designs"), // Libraries
        Monitor, // Internal Functions
        guessCurrent,
        getdb,
        pouchdb;// Internal Variables

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

    guessCurrent = function (location) {
        /**
         * A database must be named with all lowercase letters (a-z), digits (0-9),
         * or any of the _$()+-/ characters and must end with a slash in the URL.
         * The name has to start with a lowercase letter (a-z).
         *
         * http://wiki.apache.org/couchdb/HTTP_database_API
         */
        var re = /\/([a-z][a-z0-9_\$\(\)\+-\/]*)\/_design\/([^\/]+)\//,
            loc = location || window.location,
            match = re.exec(loc.pathname);

        if (match) {
            return {
                db: match[1],
                design_doc: match[2],
                root: '/',
                origin: loc.origin
            };
        }
        return null;
    };

    getdb = function () {
        var current = guessCurrent();
        if (pouchdb) {
            return pouchdb;
        }
        pouchdb = new PouchDB(current.db);
        return pouchdb;
    };

    return {
        guessCurrent: guessCurrent,
        replicate: function () {
            var current = guessCurrent();
            PouchDB.replicate(current.origin + "/" + current.db, current.db, {
                filter: designs.filters.typed,
                continuous: true
            });
        },
        createMonitor: function (db) {
            return new Monitor(db);
        },
        getdb: getdb
    };
}());

module.exports = database;