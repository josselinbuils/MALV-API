/**
 * @name topListHandler
 * @description Top list request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

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

        var score = animeData.match(/<td class="score[^>]*>.*<span[^>]*>((\d||\.)*)/);

        anime.imageUrl = animeData.match(/<img[^>]*src="([^"]*)t.jpg"/)[1] + '.jpg';
        anime.topRank = parseInt(animeData.match(/<span[^>]*top-anime-rank[^>]*>(\d*)/)[1]);
        anime.membersScore = score[1] ? parseFloat(score[1]) : null;
        anime.title = animeData.match(/<a class="hoverinfo_trigger[^>]*>([^<]*)<\/a>/)[1];

        animes.push(anime);
    }

    return animes;
}