/**
 * @name searchHandler
 * @description Search request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');
var utils = require('../services/utils');

module.exports = searchHandler;

function searchHandler(req, res, next) {

    var query = req.params.q;
    var time = new Date().getTime();
    var url = '/anime.php?q=' + query.replace(' ', '+');

    if (req.params.stype !== undefined) {
        url += '&type=' + req.params.stype + '&score=' + req.params.score + '&status=' + req.params.status + '&r=' + req.params.r + '&sm=' + req.params.sm + '&sy=' + req.params.sy + '&em=' + req.params.em + '&ey=' + req.params.ey;
    }

    logger.log('searchHandler: search "' + query + '"');

    myAnimeList.get(url).then(function (data) {

        logger.log('searchHandler: search "' + query + '" got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatSearch(data));
        } catch (error) {
            error.message = 'Cannot format the result of the search "' + query + '": ' + error.message.toLowerCase();
            next(error);
        }

    }, function (error) {
        error.message = 'Cannot retrieve search "' + query + '": ' + error.message.toLowerCase();
        next(error);
    });
}

/**
 * @name formatSearch
 * @description Format search from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatSearch(data) {

    var animes = [];

    var reg = /<tr>(\s*<td class="borderClass[^>]*>\s*<div class="picSurround((?!<\/tr>)(.||\s))*)<\/tr>/g;
    var match;

    while (match = reg.exec(data)) {
        var anime = {};
        var animeData = match[0];

        anime.id = utils.getMatchGroup(animeData.match(/rel="#sinfo([^"]*)/), 1, 'int');
        anime.imageUrl = utils.getMatchGroup(animeData.match(/<img[^>]*data-src="([^?]*)/), 1, 'string').replace('/r/50x70', '');
        anime.episodes = utils.getMatchGroup(animeData.match(/<td class="borderClass[^"]*" width="40">\s*(\S*)/), 1, 'int');
        anime.membersScore = utils.getMatchGroup(animeData.match(/<td class="borderClass[^"]*" width="50">\s*(\S*)/), 1, 'float');
        anime.title = utils.getMatchGroup(animeData.match(/<strong>(.*)<\/strong>/), 1, 'string');
        anime.type = utils.getMatchGroup(animeData.match(/<td class="borderClass[^"]*" width="45">\s*(\S*)/), 1, 'string');

        animes.push(anime);
    }

    return animes;
}