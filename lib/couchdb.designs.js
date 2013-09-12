/*jslint couch:true, nomen: true*/
/*global module*/
var designs = (function () {
    "use strict";
    var views,
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

    filters = {
        typedDocs: function (doc, req) {
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
        }
    };

    return {
        views: views,
        filters: filters
    };
}());

module.exports = designs;
