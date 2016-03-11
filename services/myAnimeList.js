/**
 * @name myAnimeList
 * @description MyAnimeList HTTP requests provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var Promise = require('promise');
var request = require('request');

// Configuration
var config = require('../config');

// Services
var crypt = require('../services/crypt');
var logger = require('../services/logger');

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

var http = request.defaults({
    pool: {
        maxSockets: config.maxSockets
    },
    timeout: config.requestTimeout
});

function get(url, user, secureKey, retries) {

    return new Promise(function (resolve, reject) {

        var headers = {
            'User-Agent': config.myAnimeListApiKey
        };

        if (user && secureKey) {
            headers.Authorization = 'Basic ' + new Buffer(user + ':' + crypt.decrypt(secureKey)).toString('base64');
        }

        http({
            url: config.myAnimeListHost + url,
            headers: headers
        }, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {

                if (retries === undefined) {
                    retries = config.retries;
                }

                if (response && response.statusMessage === 'Too Many Requests' && retries > 0) {

                    logger.error('myAnimeList: too many requests, retry #' + (config.retries - retries + 1) + ' in ' + config.retryDelay + 'ms');

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
                    var statusMessage = response ? response.statusMessage : error.code;

                    if (statusMessage === 'ETIMEDOUT') {
                        statusMessage = 'connection timed out'
                    }

                    reject({
                        statusCode: response ? response.statusCode : null,
                        statusMessage: statusMessage
                    });
                }
            }
        });
    });
}