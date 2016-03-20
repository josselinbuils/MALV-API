/**
 * @name animeHandler
 * @description Anime request handler.
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

module.exports = animeHandler;

function animeHandler(req, res, next) {

    var id = req.params.id;
    var time = new Date().getTime();
    var url = '/anime/' + id;

    logger.log('animeHandler: get details of anime ' + id);
    
    if (config.mock === true) {
        logger.log('animeHandler: mock anime details sent');
        res.json(constants.MOCK_ANIME_DETAILS);
    }

    myAnimeList.get(url).then(function (data) {

        logger.log('animeHandler: details of anime ' + id + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatAnime(data));
        } catch (error) {
            error.message = 'Cannot format details of anime ' + id + ': ' + error.message.toLowerCase();
            next(error);
        }

    }, function (error) {
        error.message = 'Cannot retrieve details of anime ' + id + ': ' + error.message.toLowerCase();
        next(error);
    });
}

/**
 * @name formatAnime
 * @description Format anime data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatAnime(data) {
    var anime = {};

    var match;
    var reg = /<span[^>]*>(English|Synonyms):<\/span>\s?(.*)/g;
    var synonyms = [];

    while (match = reg.exec(data)) {
        synonyms = synonyms.concat(match[2].split(', '));
    }

    var aired = utils.getMatchGroup(data.match(/<span[^>]*>Aired:<\/span>\s*(.*)/), 1, 'string');
    var startDate = utils.getMatchGroup(aired.match(/(((?! to)[^?])*)/), 1, 'date');

    var genres = utils.getMatchGroup(data.match(/<span[^>]*>Genres:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/), 1, 'string');

    if (genres) {
        genres = genres.replace(/<[^>]*>/g, '').split(', ');
    }

    anime.endDate = aired.indexOf(' to ') !== -1 ? utils.getMatchGroup(aired.match(/to ([^?]*)/), 1, 'date') : startDate;
    anime.episodes = utils.getMatchGroup(data.match(/<span[^>]*>Episodes:<\/span>\s*(\d*)/), 1, 'int');
    anime.genres = genres;
    anime.imageUrl = utils.getMatchGroup(data.match(/<img src="([^"]*)"[^>]*itemprop="image">/), 1, 'string');
    anime.membersScore = utils.getMatchGroup(data.match(/<span\s*itemprop="ratingValue"\s*>([\.\d]+)/), 1, 'float');
    anime.popularity = utils.getMatchGroup(data.match(/<span[^>]*>Popularity:<\/span>\s*#(\d*)/), 1, 'int');
    anime.rank = utils.getMatchGroup(data.match(/<span[^>]*>Ranked:<\/span>\s*#(\d*)/), 1, 'int');
    anime.rating = utils.getMatchGroup(data.match(/<span[^>]*>Rating:<\/span>\s*(.*)/), 1, 'string');
    anime.startDate = startDate;
    anime.status = utils.getMatchGroup(data.match(/<span[^>]*>Status:<\/span>\s*(.*)/), 1, 'string');
    anime.studios = utils.getMatchGroup(data.match(/<span[^>]*>Studios:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/), 1, 'string').replace(/<[^>]*>/g, '').split(', ');
    anime.synonyms = synonyms;
    anime.synopsis = utils.getMatchGroup(data.match(/<span itemprop="description">(((?!<\/span>).||\s)*)/), 1, 'string').replace(/(\r\n|\n|\r)/gm, '');
    anime.title = utils.getMatchGroup(data.match(/<h1[^>]*><span itemprop="name">([^<]*)/), 1, 'string');
    anime.type = utils.getMatchGroup(data.match(/<span[^>]*>Type:<\/span>\s*<a[^>]*>(.*)<\/a>/), 1, 'string');

    return anime;
}