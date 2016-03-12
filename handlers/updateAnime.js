/**
 * @name updateAnimeHandler
 * @description Update anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var xml2js = require('xml2js');

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
        error.status = constants.NOT_ACCEPTABLE;
        return next(error);
    }

    if (typeof req.body !== 'object') {
        error = new Error('Request body must be a JSON object');
        error.status = constants.BAD_REQUEST;
        return next(error);
    }

    console.log(new xml2js.Builder(constants.XML_BUILDER_OPTIONS).buildObject({
        date_finish: req.body.myFinishDate,
        date_start: req.body.myStartDate,
        episodes: req.body.myWatchedEpisodes,
        score: req.body.myScore
    }));

    res.status(200).end();
}