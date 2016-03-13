/**
 * @name addAnimeHandler
 * @description Add anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Constants
var constants = require('../constants');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = addAnimeHandler;

function addAnimeHandler(req, res, next) {

    var error;

    if (!req.is('application/json')) {
        error = new Error('Content-type must be application/json');
        error.status = constants.HTTP_NOT_ACCEPTABLE;
        return next(error);
    }

    if (typeof req.body !== 'object') {
        error = new Error('Request body must be a JSON object');
        error.status = constants.HTTP_BAD_REQUEST;
        return next(error);
    }

    if (!req.body.myStatus) {
        error = new Error('Status of the anime missing');
        error.status = constants.HTTP_BAD_REQUEST;
        return next(error);
    }

    var myStatus = {
        watching: 1,
        completed: 2,
        onHold: 3,
        dropped: 4,
        planToWatch: 6
    };

    var id = req.params.id;
    var user = req.params.user;
    var secureKey = req.params.secureKey;
    var time = new Date().getTime();
    var url = '/api/animelist/add/' + req.params.id + '.xml';

    logger.log('addAnimeHandler: add anime ' + id + ' in the anime list of user ' + user);

    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry><status>' + myStatus[req.body.myStatus] + '</status></entry>';

    myAnimeList.post(url, xml, user, secureKey).then(function (data) {

        logger.log('addAnimeHandler: anime ' + id + ' added in the anime list of user ' + user + ' in ' + (new Date().getTime() - time) + 'ms');

        res.status(200).end();

    }, function (error) {
        error.message = 'Cannot update anime ' + id + ' of user ' + user + ': ' + error.message.toLowerCase();
        next(error);
    });
}