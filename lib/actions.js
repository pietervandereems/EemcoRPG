/*jslint browser:true*/
/*global module*/
var actions = (function () {
    "use strict";
    var valueUpDown; // Functions

    valueUpDown = function (add) {
        return function (event) {
            event.preventDefault();
            var value = parseInt(event.target.innerHTML, 10),
                editable = event.target.getAttribute("data-editable");
            if (editable && editable === "true") {
                if (!isNaN(value)) {
                    event.target.innerHTML = value + add;
                }
            }
        };
    };

    return {
        valueUp: valueUpDown(1),
        valueDown: valueUpDown(-1)
    };
}());

module.exports = actions;
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
