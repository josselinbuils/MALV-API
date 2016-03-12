/**
 * @name animeHandler
 * @description Anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Configuration
var config = require('../config');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = animeHandler;

function animeHandler(req, res, next) {

    var id = req.params.id;
    var time = new Date().getTime();
    var url = '/anime/' + id;

    logger.log('animeHandler: get details of anime ' + id);

    myAnimeList.get(url).then(function (data) {

        logger.log('animeHandler: details of anime ' + id + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatAnime(data));
        } catch (error) {
            error.message = 'Cannot format details of anime ' + id;
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

    // Get synonyms

    var match;
    var reg = /<span[^>]*>(English|Synonyms):<\/span>\s?(.*)/g;
    var synonyms = [];

    while (match = reg.exec(data)) {
        synonyms = synonyms.concat(match[2].split(', '));
    }

    // Get start timestamp

    var aired = data.match(/<span[^>]*>Aired:<\/span>\s*(.*)/)[1];
    var startDate = Date.parse(aired.match(/(((?! to)[^?])*)/)[1]) || null;

    // Fill the anime object

    anime.endDate = aired.indexOf(' to ') !== -1 ? (Date.parse(aired.match(/to ([^?]*)/)[1]) || null) : startDate;
    anime.episodes = data.match(/<span[^>]*>Episodes:<\/span>\s*(\d*)/)[1];
    anime.genres = data.match(/<span[^>]*>Genres:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/)[1].replace(/<[^>]*>/g, '').split(', ');
    anime.imageUrl = data.match(/<img src="([^"]*)"[^>]*itemprop="image">/)[1];
    anime.membersScore = parseFloat(data.match(/<span\s*itemprop="ratingValue"\s*>([\.\d]+)/)[1]);
    anime.popularity = parseInt(data.match(/<span[^>]*>Popularity:<\/span>\s*#(\d*)/)[1]);
    anime.rank = parseInt(data.match(/<span[^>]*>Ranked:<\/span>\s*#(\d*)/)[1]);
    anime.rating = data.match(/<span[^>]*>Rating:<\/span>\s*(.*)/)[1];
    anime.startDate = startDate;
    anime.status = data.match(/<span[^>]*>Status:<\/span>\s*(.*)/)[1];
    anime.studios = data.match(/<span[^>]*>Studios:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/)[1].replace(/<[^>]*>/g, '').split(', ');
    anime.synonyms = synonyms;
    anime.synopsis = data.match(/<span itemprop="description">(((?!<\/span>).||\s)*)/)[1].replace(/(\r\n|\n|\r)/gm, '');
    anime.title = data.match(/<h1[^>]*><span itemprop="name">([^<]*)/)[1];
    anime.type = data.match(/<span[^>]*>Type:<\/span>\s*<a[^>]*>(.*)<\/a>/)[1];

    return anime;
}