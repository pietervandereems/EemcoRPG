/*global module, XMLHttpRequest, window*/
var exports = module.exports;

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

exports.stringifyQuery = function (query) {
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

exports.encode = function (str) {
    "use strict";
    return encodeURIComponent(str).replace(/^_design%2F/, '_design/');
};

var request = function (url, options, callback) {
    "use strict";
    var xhr = new XMLHttpRequest(),
        opt = {},
        data,
        quotes = "";

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
                if (opt.data[data] !== "true" && opt.data[data] !== "false" && isNaN(opt.data[data])) {
                    quotes = '"';
                } else {
                    quotes = '';
                }
                url += exports.encode(data) + '=' + quotes + exports.encode(opt.data[data]) + quotes + '&';
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
exports.guessCurrent = function (location) {
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

exports.getDoc = function (db, id, callback) {
    "use strict";
    request("/" + db + "/" + id,
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

exports.getView = function (db, name, view, /*opt*/q, callback) {
    "use strict";
    var viewname = exports.encode(view),
        data,
        options,
        url;
    if (!callback) {
        callback = q;
        q = {};
    }
    try {
        data = exports.stringifyQuery(q);
    } catch (e) {
        return callback(e);
    }
    url = "/" + db +
            '/_design/' + exports.encode(name) +
            '/_view/' + viewname;
    options = {data: data};
    request(url, options, callback);
};

exports.getShow = function (db, name, show, doc, /*opt*/q, callback) {
    "use strict";
    var showname = exports.encode(show),
        data,
        options,
        url;
    if (!callback) {
        callback = q;
        q = {};
    }
    try {
        data = exports.stringifyQuery(q);
    } catch (e) {
        return callback(e);
    }
    url = "/" + db +
            '/_design/' + exports.encode(name) +
            '/_show/' + showname + '/' + doc;
    options = {data: data};
    request(url, options, callback);
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

exports.saveDoc = function (db, doc, callback) {
    "use strict";
    var method,
        url = "/" + db,
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
