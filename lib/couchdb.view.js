/*jslint couch:true, nomen: true*/
/*global module*/
var views = (function () {
    "use strict";
    return {
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
}());

module.exports = views;
