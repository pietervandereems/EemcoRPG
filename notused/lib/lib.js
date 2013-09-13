/*global module, XMLHttpRequest, window*/
/*jslint nomen: true, regexp:true*/
var lib = (function () {
    "use strict";
    var guessCurrentDb;

    guessCurrentDb = function (location) {
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

    return {
        guessCurrentDb: guessCurrentDb
    };
}());

module.exports = lib;
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
