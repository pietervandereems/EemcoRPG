/*jslint nomen: true, couch: true*/
/*global define*/
// view/sheet

define(function () {
    'use strict';
    var views,
        shows,
        filters;

    views = {
        "listByType": {
            "map": function (doc) {
                var name = null;
                if (doc.name) {
                    name = doc.name;
                }
                if (doc.type && doc.type === "player") {
                    emit([doc._id, "player", name], 1);
                } else {
                    if (doc.player) {
                        emit([doc.player, doc.type, name], 1);
                    }
                }
            },
            "reduce": "_count"
        },
        "listByPlayer": {
            "map": function (doc) {
                var name = null;
                if (doc.name) {
                    name = doc.name;
                }
                if (doc.type && doc.type === "player") {
                    emit([doc._id, "player", name], 1);
                } else {
                    if (doc.player) {
                        emit([doc.player, doc.type, name], 1);
                    }
                }
            },
            "reduce": "_count"
        },
        "listTypes": {
            "map": function (doc) {
                var name = null;
                if (doc.name) {
                    name = doc.name;
                }
                if (doc.type) {
                    emit([doc.type, name], 1);
                }
            },
            "reduce": "_count"
        }
    };

    shows = {
        player: function (doc) {
            if (doc.type && doc.type === "player") {
                return "<h1>" + doc.name + "</h1>";
            }
        }
    };

    filters = {
        typedDocs: function (doc) {
            if (doc._deleted) {
                return true;
            }
            return !!(doc.type);
        },
        myDocs: function (doc, req) {
            if (doc._deleted) {
                return true;
            }
            if (doc.type) {
                if (doc.type === "player" && doc._id === req.query.id) {
                    return true;
                }
                if (doc.type === "character" && doc.player === req.query.id) {
                    return true;
                }
            }
            return false;
        },
        userDocs: function (doc) {
            if (doc._deleted) {
                return true;
            }
            return (doc.user && doc.user === "req.query.user");
        }
    };

    return {
        views: views,
        shows: shows,
        filters: filters
    };
});
//Copyright 2014 Pieter van der Eems
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
