/**
 * @name animeListHandler
 * @description Anime list request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 * @param {object} req Request provider.
 * @param {object} res Result provider.
 */

// External libraries
var Promise = require('Promise'),
    xml2js = require('xml2js');

// Services
var logger = require('../services/logger'),
    myAnimeList = require('../services/myAnimeList');

module.exports = function (req, res) {

    var user = req.params.user,
        time = new Date().getTime(),
        url = '/malappinfo.php?u=' + user + '&status=all';

    logger.log('Get animelist of user ' + user);

    res.setHeader('Content-Type', 'application/json');

    myAnimeList.get(url).then(function (data) {

        logger.log('Anime list of user ' + user + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            formatAnimeList(data).then(function (animeList) {
                    res.json(animeList);
                }, function (error) {
                    var errorMessage = 'Cannot format the animelist of user ' + user + ': ' + error.toLowerCase();
                    logger.error(errorMessage);
                    res.status(500).json({error: errorMessage});
                }
            );
        } catch (e) {
            var error = 'Cannot format the animelist of user ' + user;
            logger.error(error + ': ' + e.stack);
            res.status(500).json({error: error});
        }

    }, function (error) {
        var errorMessage = 'Cannot retrieve animelist of user ' + user + ': ' + error.statusMessage;
        logger.error(errorMessage);
        res.status(statusCode).json({error: errorMessage});
    });
};

/**
 * @name formatAnimeList
 * @description Format animelist data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatAnimeList(data) {

    var myStatus = {
        1: 'watching',
        2: 'completed',
        3: 'onhold',
        4: 'dropped',
        6: 'plantowatch'
    };

    var status = {
        1: 'Currently Airing',
        2: 'Finished Airing',
        3: 'Not yet aired'
    };

    var types = {
        1: 'TV',
        2: 'OVA',
        3: 'Movie',
        4: 'Special',
        5: 'ONA',
        6: 'Music'
    };

    return new Promise(function (resolve, reject) {
        xml2js.parseString(data, function (err, res) {

            if (err) {
                reject('error during xml parsing');
                return;
            }

            if (!res.myanimelist) {
                reject('invalid data received from myanimelist');
                return;
            }

            if (res.myanimelist.error) {
                reject(String(res.myAnimeList.error));
                return;
            }

            var animelist = [];

            res.myanimelist.anime.forEach(function (anime) {

                var synonyms = anime.series_synonyms[0].split('; '),
                    filteredSynonyms = [];

                synonyms.forEach(function (synonym) {
                    if (synonym && synonym !== anime.series_title[0]) {
                        filteredSynonyms.push(synonym);
                    }
                });

                animelist.push({
                    endDate: Date.parse(anime.series_end[0]) || null,
                    episodes: parseInt(anime.series_episodes[0]),
                    id: parseInt(anime.series_animedb_id[0]),
                    imageUrl: anime.series_image[0],
                    myFinishDate: Date.parse(anime.my_finish_date[0]) || null,
                    myScore: parseInt(anime.my_score[0]),
                    myStartDate: Date.parse(anime.my_start_date[0]) || null,
                    myStatus: myStatus[anime.my_status[0]],
                    myWatchedEpisodes: parseInt(anime.my_watched_episodes[0]),
                    startDate: Date.parse(anime.series_start[0]) || null,
                    status: status[anime.series_status[0]],
                    synonyms: filteredSynonyms,
                    title: anime.series_title[0],
                    type: types[anime.series_type[0]]
                });
            });

            resolve(animelist);
        });
    });
}