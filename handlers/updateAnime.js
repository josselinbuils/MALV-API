/**
 * @name updateAnimeHandler
 * @description Update anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Constants
var constants = require('../constants');

// Configuration
var config = require('../config');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = updateAnimeHandler;

function updateAnimeHandler(req, res, next) {

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
    var url = '/api/animelist/update/' + req.params.id + '.xml';

    logger.log('updateAnimeHandler: update anime ' + id + ' of user ' + user);

    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry>';

    if (req.body.myFinishDate) {
        xml += '<date_finish>' + req.body.myFinishDate + '</date_finish>';
    }

    if (req.body.myStartDate) {
        xml += '<date_start>' + req.body.myStartDate + '</date_start>';
    }

    if (req.body.myWatchedEpisodes) {
        xml += '<episode>' + req.body.myWatchedEpisodes + '</episode>';
    }

    if (req.body.myScore) {
        xml += '<score>' + req.body.myScore + '</score>';
    }

    if (req.body.myStatus) {
        xml += '<status>' + myStatus[req.body.myStatus] + '</status>';
    }

    xml += '</entry>';

    myAnimeList.post(url, xml, user, secureKey).then(function (data) {

        if (data === 'Updated') {
            logger.log('updateAnimeHandler: anime ' + id + ' of user ' + user + ' updated in ' + (new Date().getTime() - time) + 'ms');
            res.status(200).end();
        } else {
            next(new Error('MyAnimeList error: ' + data));
        }

    }, function (error) {
        error.message = 'Cannot update anime ' + id + ' of user ' + user + ': ' + error.message.toLowerCase();
        next(error);
    });
}