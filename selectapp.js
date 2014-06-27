(function () {
    requirejs(['select'], function (select) {
        'use strict';
        select.start(document.getElementById('players'), document.getElementById('characters'));
    });
}());
