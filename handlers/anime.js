/**
 * @name animeHandler
 * @description Anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 * @param {object} req Request provider.
 * @param {object} res Result provider.
 */

// Services
var logger = require('../services/logger'),
    myAnimeList = require('../services/myAnimeList');

module.exports = function (req, res) {

    var id = req.params.id,
        time = new Date().getTime(),
        url = '/anime/' + id;

    logger.log('Get details of anime ' + id);

    res.setHeader('Content-Type', 'application/json');

    myAnimeList.get(url).then(function (data) {

        logger.log('Details of anime ' + id + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.send(formatAnime(data));
        } catch (e) {
            var error = 'Cannot format details of anime ' + id;
            logger.error(error + ': ' + e.stack);
            res.status(500).json({error: error});
        }

    }, function (error) {
        var errorMessage = 'Cannot retrieve details of anime ' + id + ': ' + error.statusMessage.toLowerCase();
        res.status(500).json({error: errorMessage});
    });
};

/**
 * @name formatAnime
 * @description Format anime data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatAnime(data) {
    var anime = {},
        match,
        reg = /<span[^>]*>(English|Japanese|Synonyms):<\/span>\s?(.*)/g,
        synonyms = [];

    while (match = reg.exec(data)) {
        synonyms = synonyms.concat(match[2].split(', '));
    }

    anime.genres = data.match(/<span[^>]*>Genres:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/)[1].replace(/<[^>]*>/g, '').split(', ');
    anime.popularity = parseInt(data.match(/<span[^>]*>Popularity:<\/span>\s*#(\d*)/)[1]);
    anime.rank = parseInt(data.match(/<span[^>]*>Ranked:<\/span>\s*#(\d*)/)[1]);
    anime.rating = data.match(/<span[^>]*>Rating:<\/span>\s*(.*)/)[1];
    anime.score = parseFloat(data.match(/<span\s*itemprop="ratingValue"\s*>([\.\d]+)/)[1]);
    anime.studios = data.match(/<span[^>]*>Studios:<\/span>\s*((<a[^>]*[^<]*<\/a>(, )?)*)\s*<\/div>/)[1].replace(/<[^>]*>/g, '').split(', ');
    anime.synopsis = data.match(/<span itemprop="description">(((?!<\/span>).||\s)*)/)[1].replace(/(\r\n|\n|\r)/gm, '');

    return anime;
}