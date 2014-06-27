/*jslint browser:true, devel: true*/
/*global module, require, PouchDB*/
define(['lib/database', 'view/sheet'], function (database, sheet) {
    'use strict';
    var defaults = {}, // Internal Variables;
        db = database.getdb(),
        start; // exported function
    start = function (playersElm, charactersElm) {
        defaults.players = playersElm.innerHTML;
        defaults.characters = charactersElm.innerHTML;

        database.replicate();
        console.log('views', sheet.views);
        playersElm.addEventListener('click', function (event) {
            db.query(sheet.views.listByPlayer, function (err, result) {
                console.log('player result', err, result);
            });
        });
    };

    return {
        start: start
    };
});
