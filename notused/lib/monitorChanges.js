/*jslint browser:true*/
/*global module*/
var events = require('events'),
    db = null;

var monitor = function (db, seq) {
    "use strict";
    var opt = {},
        data,
        getInfo,
        getChange;
    this.seq = seq;
    events.EventEmitter.call(this);

    getInfo = function (callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var response;
            try {
                response = JSON.parse(this.responseText);
            } catch (e) {
                response = this.responseText;
            }
            callback(null, response);
        };
        xhr.open("GET", "url", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(opt.data);
    };
//    if (!seq) {
////        get
//    }
};

monitor.prototype.__proto__ = EventEmitter.prototype;

modules.exports = monitor;
