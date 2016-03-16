/**
 * @name animeListHandler
 * @description Anime list request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// Configuration
var config = require('../../config');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');
var utils = require('../services/utils');

module.exports = animeListHandler;

function animeListHandler(req, res, next) {

    var user = req.params.user;
    var time = new Date().getTime();
    var url = '/malappinfo.php?u=' + user + '&status=all';

    logger.log('animeListHandler: get animelist of user ' + user);

    myAnimeList.get(url).then(function (data) {

        logger.log('animeListHandler: anime list of user ' + user + ' got in ' + (new Date().getTime() - time) + 'ms');

        time = new Date().getTime();

        try {
            var animeList = formatAnimeList(data);
            logger.log('animeListHandler: anime list of user ' + user + ' formatted in ' + (new Date().getTime() - time) + 'ms');
            res.json(animeList);
        } catch (error) {
            error.message = 'Cannot format the animelist of user ' + user + ': ' + error.message.toLowerCase();
            next(error);
        }

    }, function (error) {
        error.message = 'Cannot retrieve animelist of user ' + user + ': ' + error.message.toLowerCase();
        next(error);
    });
}

/**
 * @name formatAnimeList
 * @description Format animelist data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatAnimeList(data) {

    var myStatus = {
        1: 'watching',
        2: 'completed',
        3: 'onHold',
        4: 'dropped',
        6: 'planToWatch'
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

    var animeList = [];

    var anime;
    var reg = /<anime>(((?!<\/anime).)*)/g;

    while (anime = reg.exec(data)) {
        anime = anime[1];

        var title = utils.getMatchGroup(anime.match(/<series_title>(((?!<\/series_title).)*)/), 1, 'string');
        var synonyms = utils.getMatchGroup(anime.match(/<series_synonyms>(((?!<\/series_synonyms).)*)/), 1, 'string').split('; ');
        var formattedSynonyms = [];

        synonyms.forEach(function (synonym) {
            if (synonym && synonym !== title) {
                formattedSynonyms.push(synonym);
            }
        });

        animeList.push({
            endDate: utils.getMatchGroup(anime.match(/<series_end>(((?!<\/series_end).)*)/), 1, 'date'),
            episodes: utils.getMatchGroup(anime.match(/<series_episodes>(((?!<\/series_episodes).)*)/), 1, 'int'),
            id: utils.getMatchGroup(anime.match(/<series_animedb_id>(((?!<\/series_animedb_id).)*)/), 1, 'int'),
            imageUrl: utils.getMatchGroup(anime.match(/<series_image>(((?!<\/series_image).)*)/), 1, 'string'),
            myFinishDate: utils.getMatchGroup(anime.match(/<my_finish_date>(((?!<\/my_finish_date).)*)/), 1, 'date'),
            myScore: utils.getMatchGroup(anime.match(/<my_score>(((?!<\/my_score).)*)/), 1, 'int'),
            myStartDate: utils.getMatchGroup(anime.match(/<my_start_date>(((?!<\/my_start_date).)*)/), 1, 'date'),
            myStatus: myStatus[utils.getMatchGroup(anime.match(/<my_status>(((?!<\/my_status).)*)/), 1, 'int')],
            myWatchedEpisodes: utils.getMatchGroup(anime.match(/<my_watched_episodes>(((?!<\/my_watched_episodes).)*)/), 1, 'int'),
            startDate: utils.getMatchGroup(anime.match(/<series_start>(((?!<\/series_start).)*)/), 1, 'date'),
            status: status[utils.getMatchGroup(anime.match(/<series_status>(((?!<\/series_status).)*)/), 1, 'int')],
            synonyms: formattedSynonyms,
            title: title,
            type: types[utils.getMatchGroup(anime.match(/<series_type>(((?!<\/series_type).)*)/), 1, 'int')]
        });
    }

    return animeList;
}