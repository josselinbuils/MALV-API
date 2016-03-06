/**
 * @name myAnimeList
 * @description MyAnimeList HTTP requests provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

var config = require('../config'),
    Promise = require('promise'),
    request = require('request');

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

function get(url, user, secureKey) {

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
                reject({
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage
                });
            }
        });
    });
}