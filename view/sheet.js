/*jslint sloppy: true, es5: true, nomen: true*/
/*global emit: false, getRow: false, isArray: false, log: false, provides: false, registerType: false, require: false, send: false, start: false, sum: false, toJSON: false */
// view/sheet

exports.views = {
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

exports.shows = {
    player: function (doc, req) {
        if (doc.type && doc.type === "player") {
            return "<h1>" + doc.name + "</h1>";
        }
    }
};

exports.filters = {
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
