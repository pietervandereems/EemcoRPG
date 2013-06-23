/*jslint browser:true*/
/*global module*/
var render = (function () {
    "use strict";
    return {
        stats: function (stats) {
            var stat,
                html = "<ul>";
            for (stat in stats) {
                if (stats.hasOwnProperty(stat)) {
                    html += "<li>" + stat + " : " + stats[stat] + "</li>";
                }
            }
            html += "</ul>";
            console.log("html", html);
            return html;
        }
    };
}());

module.exports = render;
