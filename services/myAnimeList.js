/**
 * @name myAnimeList
 * @description MyAnimeList HTTP requests provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var Promise = require('promise'),
    request = require('request');

// Configuration
var config = require('../config');

// Services
var crypt = require('../services/crypt'),
    logger = require('../services/logger');

module.exports = {
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

function get(url, user, secureKey, retries) {

    return new Promise(function (resolve, reject) {

        var headers = {
            'User-Agent': config.myAnimeListApiKey
        };

        if (user && secureKey) {
            headers.Authorization = 'Basic ' + new Buffer(user + ':' + crypt.decrypt(secureKey)).toString('base64');
        }

        request({
            url: config.myAnimeListHost + url,
            headers: headers
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {

                retries = retries || config.retries;

                if (response.statusMessage === 'Too Many Requests' && retries > 0) {

                    logger.error('Too many requests, retry #' + (config.retries - retries + 1) + ' in ' + config.retryDelay + 'ms');

                    setTimeout(function () {
                        get(url, user, secureKey, retries - 1).then(function (body) {
                            resolve(body);
                        }, function (error) {
                            reject({
                                statusCode: error.statusCode,
                                statusMessage: error.statusMessage
                            });
                        });
                    }, config.retryDelay);

                } else {
                    reject({
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    });
                }
            }
        });
    });
}