/**
 * @name topListHandler
 * @description Top list request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// Constants
var constants = require('../constants');

// Configuration
var config = require('../../config');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');
var utils = require('../services/utils');

module.exports = topListHandler;

function topListHandler(req, res, next) {

    var name = req.params.name;
    var validNames = ['all', 'airing', 'bypopularity', 'movie', 'ova', 'special', 'tv', 'upcoming'];

    if (validNames.indexOf(name) === -1) {
        return next(new Error('Invalid top name: ' + name));
    }

    var page = req.params.page;
    var time = new Date().getTime();
    var url = '/topanime.php?limit=' + ((req.params.page - 1) * 50) + (name !== 'all' ? '&type=' + name : '');

    logger.log('topListHandler: get page ' + page + ' of top ' + name);

    if (config.mock === true) {
        logger.log('topListHandler: mock top list sent');
        return res.json(constants.MOCK_TOP_LIST);
    }

    myAnimeList.get(url).then(function (data) {

        logger.log('topListHandler: page ' + page + ' of top ' + name + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatTopList(data));
        } catch (error) {
            error.message = 'Cannot format the page ' + page + ' of top ' + name + ': ' + error.message.toLowerCase();
            next(error);
        }

    }, function (error) {
        error.message = 'Cannot retrieve the page ' + page + ' of top ' + name + ': ' + error.message.toLowerCase();
        next(error);
    });
}

/**
 * @name formatTopList
 * @description Format top data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatTopList(data) {

    var animes = [];

    var reg = /<tr class="ranking-list">((?!<\/tr>)(.||\s))*<\/tr>/g;
    var match;

    while (match = reg.exec(data)) {
        var anime = {};
        var animeData = match[0];

        anime.id = utils.getMatchGroup(animeData.match(/rel="#info([^"]*)/), 1, 'int');
        anime.imageUrl = utils.getMatchGroup(animeData.match(/<img[^>]*data-src="([^?]*)/), 1, 'string').replace('/r/50x70', '');
        anime.topRank = utils.getMatchGroup(animeData.match(/<span[^>]*top-anime-rank[^>]*>(\d*)/), 1, 'int');
        anime.membersScore = utils.getMatchGroup(animeData.match(/<td class="score[^>]*>.*<span[^>]*>((\d||\.)*)/), 1, 'float');
        anime.title = utils.getMatchGroup(animeData.match(/<a class="hoverinfo_trigger[^>]*>([^<]*)<\/a>/), 1, 'string');

        animes.push(anime);
    }

    return animes;
}