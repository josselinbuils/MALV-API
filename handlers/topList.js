/**
 * @name topListHandler
 * @description Top list request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 * @param {object} req Request provider.
 * @param {object} res Result provider.
 */

// Services
var logger = require('../services/logger'),
    myAnimeList = require('../services/myAnimeList');

module.exports = function (req, res) {

    var name = req.params.name,
        validNames = ['all', 'airing', 'bypopularity', 'movie', 'ova', 'special', 'tv', 'upcoming'];

    if (validNames.indexOf(name) === -1) {
        var error = 'Invalid top name: ' + name;
        logger.error(error);
        res.status(500).json({error: error});
        return;
    }

    var page = req.params.page,
        time = new Date().getTime(),
        url = '/topanime.php?limit=' + ((req.params.page - 1) * 50) + (name !== 'all' ? '&type=' + name : '');

    logger.log('Get page ' + page + ' of top ' + name);

    res.setHeader('Content-Type', 'application/json');

    myAnimeList.get(url).then(function (data) {

        logger.log('Page ' + page + ' of top ' + name + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatTopList(data));
        } catch (e) {
            var error = 'Cannot format the page ' + page + ' of top ' + name;
            logger.error(error + ': ' + e.stack);
            res.status(500).json({error: error});
        }

    }, function (error) {
        var errorMessage = 'Cannot retrieve the page ' + page + ' of top ' + name + ': ' + error.statusMessage;
        logger.error(errorMessage);
        res.status(statusCode).json({error: errorMessage});
    });
};

/**
 * @name formatTopList
 * @description Format top data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatTopList(data) {

    var animes = [];

    var reg = /<tr class="ranking-list">((?!<\/tr>)(.||\s))*<\/tr>/g,
        match;

    while (match = reg.exec(data)) {
        var anime = {},
            animeData = match[0];

        anime.imageUrl = animeData.match(/<img[^>]*src="([^"]*)t.jpg"/)[1] + '.jpg';
        anime.rank = parseInt(animeData.match(/<span[^>]*top-anime-rank[^>]*>(\d*)/)[1]);
        anime.score = parseFloat(animeData.match(/<span class="text on">((\d||\.)*)/)[1]);
        anime.title = animeData.match(/<a class="hoverinfo_trigger[^>]*>([^<]*)<\/a>/)[1];

        animes.push(anime);
    }

    return animes;
}