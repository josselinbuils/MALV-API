/**
 * @name myAnimeList
 * @description MyAnimeList HTTP requests provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var Promise = require('promise');
var request = require('request');

// Constants
var constants = require('../constants');

// Configuration
var config = require('../config');

// Services
var crypt = require('../services/crypt');
var logger = require('../services/logger');

module.exports = {
    /**
     * @name get
     * @description Make a HTTP GET request.
     * @param {string} url Url to get.
     * @param {string} user Username to use for authentication.
     * @param {string} url Secure key to use for authentication.
     * @returns {string} Data got.
     */
    get: get,

    /**
     * @name get
     * @description Make a HTTP POST request.
     * @param {string} url Url to get.
     * @param {string} xmlData XML data to send.
     * @param {string} user Username to use for authentication.
     * @param {string} url Secure key to use for authentication.
     * @returns {string} Data got.
     */
    post: post
};

var http = request.defaults({
    pool: {
        maxSockets: config.myAnimeList.maxSockets || constants.DEFAULT_MY_ANIME_LIST_MAX_SOCKETS
    },
    timeout: config.myAnimeList.timeout || constants.DEFAULT_MY_ANIME_LIST_TIMEOUT
});

function get(url, user, secureKey, retries) {

    return new Promise(function (resolve, reject) {

        var headers = {
            'User-Agent': config.myAnimeList.apiKey
        };

        if (user && secureKey) {
            headers.Authorization = 'Basic ' + new Buffer(user + ':' + crypt.decrypt(secureKey)).toString('base64');
        }

        http({
            url: constants.MY_ANIME_LIST_HOST + url,
            headers: headers
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {

                if (retries === undefined) {
                    retries = config.retries || constants.DEFAULT_MY_ANIME_LIST_RETRIES;
                }

                if (response && response.statusMessage === 'Too Many Requests' && retries > 0) {
                    var retryDelay = config.myAnimeList.retryDelay || constants.DEFAULT_MY_ANIME_LIST_RETRY_DELAY;

                    logger.error('myAnimeList: too many requests, retry #' + (config.retries - retries + 1) + ' in ' + retryDelay + 'ms');

                    setTimeout(function () {
                        get(url, user, secureKey, retries - 1).then(function (body) {
                            resolve(body);
                        }, function (error) {
                            reject(error);
                        });
                    }, retryDelay);

                } else {

                    error.message = response.statusMessage || error.code;
                    error.status = response.statusCode || undefined;

                    if (error.message === 'ETIMEDOUT') {
                        error.message = 'connection timed out'
                    }

                    reject(error);
                }
            }
        });
    });
}