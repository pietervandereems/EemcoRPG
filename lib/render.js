/*jslint browser:true*/
/*global module*/
var render = (function () {
    "use strict";
    var arrayToRow; // Functions

    arrayToRow = function (list, type) {
        var open = "<" + type + ">" || "<td>",
            close = "</" + type + ">" || "</td>",
            row = "<tr>",
            i,
            l;
        for (i = 0, l = list.length; i < l; i += 1) {
            row += open + list[i] + close;
        }
        row += "</tr>";
        return row;
    };

    return {
        body: function (body, id) {
            var part,
                html = "<table id=\"" + id + "\"><tr><th>Part</th><th>SP</th><th>Wounds</th><th>Bruises</th></tr>";
            for (part in body) {
                if (body.hasOwnProperty(part)) {
                    html += "<tr><td>" + part + "</td><td>" + body[part].sp + "</td><td data-editable=\"true\">" + body[part].wounds + "</td><td data-editable=\"true\">" + body[part].bruises + "</td></tr>";
                }
            }
            html += "</table>";
            return html;
        },
        toTable: function (list) {
            var items,
                i,
                nrOfItems,
                j,
                nrOfStats,
                html = "<table>",
                stats,
                stat,
                parts = [],
                header;
            items = Object.keys(list);
            nrOfItems = items.length;
            stats = list[items[0]];
            header = Object.keys(stats);
            header.unshift("name");
            html += arrayToRow(header, "th");
            stats = Object.keys(stats);
            nrOfStats = stats.length;
            for (i = 0; i < nrOfItems; i += 1) {
                parts = [items[i]];
                for (j = 0; j < nrOfStats; j += 1) {
                    parts.push(list[items[i]][stats[j]]);
                }
                html += arrayToRow(parts, "td");
            }
            html += "</table>";
            return html;
        },
        toList: function (list) {
            var item,
                html = "<ul>";
            for (item in list) {
                if (list.hasOwnProperty(item)) {
                    html += "<li>" + item + " : " + list[item] + "</li>";
                }
            }
            html += "</ul>";
            return html;
        },

    };
}());

module.exports = render;
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
