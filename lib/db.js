/*global module, XMLHttpRequest, window*/
/*jslint nomen: true, regexp:true*/
var events = require("events"),
    guessCurrent,   // Internal Functions,
    encode,
    request,
    db;             // The export

// Internal Functions

/**
 * Attempts to guess the database name and design doc id from the current URL,
 * or the loc paramter. Returns an object with 'db', 'design_doc' and 'root'
 * properties, or null for a URL not matching the expected format (perhaps
 * behing a vhost).
 *
 * You wouldn't normally use this function directly, but use `db.current()` to
 * return a DB object bound to the current database instead.
 *
 * @name guessCurrent([loc])
 * @param {String} loc - An alternative URL to use instead of window.location
 *     (optional)
 * @returns {Object|null} - An object with 'db', 'design_doc' and 'root'
 *     properties, or null for a URL not matching the
 *     expected format (perhaps behing a vhost)
 * @api public
 */

guessCurrent = function (location) {
    "use strict";
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
            root: '/'
        };
    }
    return null;
};

/**
 * Encodes a document id or view, list or show name. This also will make sure
 * the forward-slash is not escaped for documents with id's beginning with
 * "\\_design/".
 *
 * @name encode(str)
 * @param {String} str - the name or id to escape
 * @returns {String}
 * @api public
 */

encode = function (str) {
    "use strict";
    return encodeURIComponent(str).replace(/^_design%2F/, '_design/');
};

request = function (url, options, callback) {
    "use strict";
    var xhr = new XMLHttpRequest(),
        opt = {},
        data;

    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    opt.method = options.method || "GET";
    opt.contentType = options.contentType || "application/json";
    opt.data = options.data || null;
    if (opt.method === "GET" && opt.data) {
        url += "?";
        for (data in opt.data) {
            if (opt.data.hasOwnProperty(data)) {
//                if (opt.data[data] !== "true" && opt.data[data] !== "false" && isNaN(opt.data[data])) {
//                    quotes = '';
//                } else {
//                    quotes = '';
//                }
                url += encode(data) + '=' + encode(opt.data[data]) + '&';
            }
        }
        url = url.substr(0, url.length - 1);
        opt.data = null;
    }
    xhr.onload = function () {
        var response;
        try {
            response = JSON.parse(this.responseText);
        } catch (e) {
            response = this.responseText;
        }
        callback(null, response);
    };
    xhr.onerror = function () {
        callback({error: "xhr error"});
    };
    xhr.open(opt.method, url, true);
    xhr.setRequestHeader("Content-Type", opt.contentType);
    xhr.send(opt.data);
};


// The module

db = function (database) {
    "use strict";
    if (!database) {
        database = guessCurrent().db;
    }
    this.database = database;
    this.url = "/" + database;
    events.EventEmitter.call(this);
};

//db.prototype.__proto__ = events.EventEmitter.prototype;

// The DB functions

/**
 * Properly encodes query parameters to CouchDB views etc. Handle complex
 * keys and other non-string parameters by passing through JSON.stringify.
 * Returns a shallow-copied clone of the original query after complex values
 * have been stringified.
 *
 * @name stringifyQuery(query)
 * @param {Object} query
 * @returns {Object}
 * @api public
 */

db.prototype.stringifyQuery = function (query) {
    "use strict";
    var q = {},
        k;
    for (k in query) {
        if (query.hasOwnProperty(k)) {
            if (typeof query[k] !== 'string') {
                q[k] = JSON.stringify(query[k]);
            } else {
                q[k] = query[k];
            }
        }
    }
    return q;
};

db.prototype.getDoc = function (id, callback) {
    "use strict";
    request("/" + this.database + "/" + id,
        {
            method: "GET",
            contentType: "application/json"
        },
        callback);
};

/**
 * Fetches a view from the database the app is running on. Results are
 * passed to the callback, with the first argument of the callback reserved
 * for any exceptions that occurred (node.js style).
 *
 * @name DB.getView(name, view, [q], callback)
 * @param {String} name - name of the design doc to use
 * @param {String} view - name of the view
 * @param {Object} q (optional)
 * @param {Function} callback(err,response)
 * @api public
 */

db.prototype.getView = function (name, view, /*opt*/q, callback) {
    "use strict";
    var viewname = encode(view),
        data,
        options,
        url;
    if (!callback) {
        callback = q;
        q = {};
    }
    try {
        data = this.stringifyQuery(q);
    } catch (e) {
        return callback(e);
    }
    url = "/" + this.database +
            '/_design/' + encode(name) +
            '/_view/' + viewname;
    options = {data: data};
    request(url, options, callback);
};

db.prototype.getShow = function (name, show, doc, /*opt*/q, callback) {
    "use strict";
    var showname = encode(show),
        data,
        options,
        url;
    if (!callback) {
        callback = q;
        q = {};
    }
    try {
        data = this.stringifyQuery(q);
    } catch (e) {
        return callback(e);
    }
    url = "/" + this.database +
            '/_design/' + encode(name) +
            '/_show/' + showname + '/' + doc;
    options = {data: data};
    request(url, options, callback);
};

/**
* Gets information about the database.
*
* @name DB.info(callback)
* @param {Function} callback(err,response)
* @api public
*/

db.prototype.info = function (callback) {
    "use strict";
    var req = {
        url: this.url,
        contentType: 'application/json'
    };
    request(req.url, req, callback);
};

/**
 * Saves a document to the database the app is running on. Results are
 * passed to the callback, with the first argument of the callback reserved
 * for any exceptions that occurred (node.js style).
 *
 * @name DB.saveDoc(doc, callback)
 * @param {Object} doc
 * @param {Function} callback(err,response)
 * @api public
 */

db.prototype.saveDoc = function (doc, callback) {
    "use strict";
    var method,
        url = "/" + this.database,
        data,
        options;
    if (doc._id === undefined) {
        method = "POST";
    } else {
        method = "PUT";
        url += '/' + doc._id;
    }
    try {
        data = JSON.stringify(doc);
    } catch (e) {
        return callback(e);
    }
    options = {
        method: method,
        url: url,
        data: data,
        contentType: 'application/json'
    };
    request(url, options, callback);
};

/**
* Listen to the changes feed for a database.
*
* __Options:__
* * _filter_ - the filter function to use
* * _since_ - the update_seq to start listening from
* * _heartbeat_ - the heartbeat time (defaults to 10 seconds)
* * _include_docs_ - whether to include docs in the results
*
* Returning false from the callback will cancel the changes listener
*
* @name DB.changes([q], callback)
* @param {Object} q (optional) query parameters (see options above)
* @param {Function} callback(err,response)
* @api public
*/

db.prototype.changes = function (/*optional*/q, callback) {
    "use strict";
    if (!callback) {
        callback = q;
        q = {};
    }

    var that = this,
        url = "/" + this.database;

    q = q || {};
    q.feed = 'longpoll';
    q.heartbeat = q.heartbeat || 10000;

    function getChanges(since) {
        var data,
            req,
            cb;
        q.since = since;
        try {
            data = that.stringifyQuery(q);
        } catch (e) {
            return callback(e);
        }
        req = {
            method: 'GET',
            url: that.url + '/_changes',
            data: data,
            contentType: 'application/json'
        };
        cb = function (err, data) {
            var result = callback.apply(this, arguments);
            if (result !== false) {
                getChanges(data.last_seq);
            }
        };
        request(req.url, req, cb);
    }

    // use setTimeout to pass control back to the browser briefly to
    // allow the loading spinner to stop on page load
    setTimeout(function () {
        if (q.hasOwnProperty('since')) {
            getChanges(q.since);
        } else {
            that.info(function (err, info) {
                if (err) {
                    return callback(err);
                }
                getChanges(info.update_seq);
            });
        }
    }, 0);
};

module.exports = db;

// A lot of the code in this file is based on the db module of kanso: https://github.com/kanso/db by caolan (https://github.com/caolan)
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
