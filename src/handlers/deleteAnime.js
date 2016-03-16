/**
 * @name deleteAnimeHandler
 * @description Delete anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// Constants
var constants = require('../constants');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = deleteAnimeHandler;

function deleteAnimeHandler(req, res, next) {

    var id = req.params.id;
    var user = req.params.user;
    var secureKey = req.params.secureKey;
    var time = new Date().getTime();
    var url = '/api/animelist/delete/' + req.params.id + '.xml';

    logger.log('deleteAnimeHandler: delete anime ' + id + ' in the anime list of user ' + user);

    myAnimeList.del(url, user, secureKey).then(function (data) {

        if (data === 'Deleted') {
            logger.log('deleteAnimeHandler: anime ' + id + ' deleted in the anime list of user ' + user + ' in ' + (new Date().getTime() - time) + 'ms');
            res.status(200).end();
        } else {
            next(new Error('MyAnimeList error: ' + data));
        }

    }, function (error) {
        error.message = 'Cannot delete anime ' + id + ' of user ' + user + ': ' + error.message.toLowerCase();
        next(error);
    });
}