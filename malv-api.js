/**
 * @name MALV-API
 * @description API which allows MALV to exchange data with MyAnimeList.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Dependencies
var crypto = require('crypto'),
    express = require('express'),
    fs = require('fs'),
    Promise = require('promise'),
    request = require('request'),
    xml2js = require('xml2js');

// Application
var app = express();

/**
 * @name logger
 * @description Log provider.
 */
var logger = (function () {

    return {
        /**
         * @name error
         * @description Log an error.
         * @param {string} str Error to log.
         */
        error: error,

        /**
         * @name log
         * @description Log a message.
         * @param {string} str Message to log.
         */
        log: info
    };

    function error(str) {
        log('ERROR', str);
    }

    function info(str) {
        log('INFO', str);
    }

    function log(level, str) {
        str = '[' + new Date().toDateString() + ' ' + new Date().toLocaleTimeString() + '] [' + level + '] ' + str;
        console.log(str);
        fs.appendFile('logs.txt', str + '\n');
    }
})();

/**
 * @name crypt
 * @description Encryption provider.
 */
var crypt = (function () {

    var algorithm = 'aes256',
        key = 'malv-api-encryption-tag';

    return {
        /**
         * @name encrypt
         * @description Encrypt data.
         * @param {string} str Data to encrypt.
         */
        encrypt: encrypt,

        /**
         * @name decrypt
         * @description Decrypt data.
         * @param {string} str Data to decrypt.
         */
        decrypt: decrypt
    };

    function encrypt(str) {
        var cipher = crypto.createCipher(algorithm, key);
        return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
    }

    function decrypt(str) {
        var decipher = crypto.createDecipher(algorithm, key);
        return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
    }
})();

/**
 * @name http
 * @description HTTP requests provider.
 */
var http = (function () {

    var apiKey = 'MyAnimeList API key';

    return {
        /**
         * @name get
         * @description Make an http get request.
         * @param {string} url Url to get.
         * @param {string} user Username to use for authentication.
         * @param {string} url Secure key to use for authentication.
         * @returns {string} Data got.
         */
        get: get
    };

    function get(url, user, secureKey) {

        return new Promise(function (resolve, reject) {

            var headers = {
                'User-Agent': apiKey
            };

            if (user && secureKey) {
                headers.Authorization = 'Basic ' + new Buffer(user + ':' + crypt.decrypt(secureKey)).toString('base64');
            }

            request({
                url: url,
                headers: headers
            }, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    logger.error('Error ' + response.statusCode + ': ' + response.statusMessage);
                    reject({
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    });
                }
            });
        });
    }

})();

logger.log('MALV API is running');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * @name /anime/:id
 * @description Provide details on an anime that are not available in the animelist.
 * @param {number} id Id of the anime.
 * @returns {object} JSON object containing the details.
 */
app.get('/anime/:id', function (req, res) {

    var id = req.params.id,
        time = new Date().getTime(),
        url = 'http://myanimelist.net/anime/' + id;

    logger.log('Get details of anime ' + id);

    res.setHeader('Content-Type', 'application/json');

    http.get(url).then(function (data) {

        logger.log('Details of anime ' + id + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.send(formatAnime(data));
        } catch (e) {
            var error = 'Cannot format details of anime ' + id;
            logger.error(error + ': ' + e.stack);
            res.status(500).json({error: error});
        }

    }, function (error) {
        var errorMessage = 'Cannot retrieve details of anime ' + id + ': ' + error.statusMessage;
        logger.error(errorMessage);
        res.status(statusCode).json({error: errorMessage});
    });

});

/**
 * @name /animelist/:user
 * @description Provide the animelist of a user.
 * @param {string} user User.
 * @returns {Array} Array of JSON objects containing anime information.
 */
app.get('/animelist/:user', function (req, res) {

    var user = req.params.user,
        time = new Date().getTime(),
        url = 'http://myanimelist.net/malappinfo.php?u=' + user + '&status=all';

    logger.log('Get animelist of user ' + user);

    res.setHeader('Content-Type', 'application/json');

    http.get(url).then(function (data) {

        logger.log('Animelist of user ' + user + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            formatAnimeList(data).then(function (animelist) {
                res.json(animelist);
            });
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

});

/**
 * @name /top/:name/:page
 * @description Provide a top anime list.
 * @param {string} name Name of the top list.
 * @param {number} page Page.
 * @returns {Array} Array of JSON objects containing anime information.
 */
app.get('/top/:name/:page', function (req, res) {

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
        url = 'http://myanimelist.net/topanime.php?limit=' + ((req.params.page - 1) * 50) + (name !== 'all' ? '&type=' + name : '');

    logger.log('Get page ' + page + ' of top ' + name);

    res.setHeader('Content-Type', 'application/json');

    http.get(url).then(function (data) {

        logger.log('Page ' + page + ' of top ' + name + ' got in ' + (new Date().getTime() - time) + 'ms');

        try {
            res.json(formatTop(data));
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

});

/**
 * @name /verifycredentials/:user/:password
 * @description Verify credentials of a MyAnimeList account.
 * @param {string} user User.
 * @param {string} password Password.
 * @returns {object} JSON object containing the verification result.
 */
app.get('/verifycredentials/:user/:password', function (req, res) {

    var user = req.params.user,
        secureKey = crypt.encrypt(req.params.password),
        time = new Date().getTime(),
        url = 'http://myanimelist.net/api/account/verify_credentials.xml';

    logger.log('Verify credentials of user ' + user);

    res.setHeader('Content-Type', 'application/json');

    http.get(url, user, secureKey).then(function () {

        logger.log('Credentials of user ' + user + ' verified in ' + (new Date().getTime() - time) + 'ms');

        res.json({
            authenticated: true,
            secureKey: secureKey
        });

    }, function (error) {
        if (error.statusCode === 401) {
            res.json({
                authenticated: false
            });
        } else {
            var errorMessage = 'Cannot verify credentials of user ' + user + ': ' + error.statusMessage;
            logger.error(error);
            res.status(error.statusCode).json({error: errorMessage});
        }
    });
});

app.listen(8080);

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
                throw Error('error during xml parsing');
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

/**
 * @name formatTop
 * @description Format top data from MyAnimeList.
 * @param {string} data Data to format.
 */
function formatTop(data) {

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