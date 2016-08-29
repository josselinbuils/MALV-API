/**
 * @name myAnimeList
 * @description MyAnimeList HTTP requests provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// External libraries
var http = require('https');
var querystring = require('querystring');

// Constants
var constants = require('../constants');

// Configuration
var config = require('../../config');

// Services
var crypt = require('./crypt');
var logger = require('./logger');

module.exports = {

    /**
     * @name del
     * @description Make a HTTP DELETE request.
     * @param {string} url Url to get.
     * @param {string} user Username to use for authentication.
     * @param {string} url Secure key to use for authentication.
     * @returns {string} Data got.
     */
    del: del,

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
     * @param {string} data Data to send.
     * @param {string} user Username to use for authentication.
     * @param {string} secureKey Secure key to use for authentication.
     * @returns {string} Data got.
     */
    post: post
};

var agent = new http.Agent({
    maxSockets: config.myAnimeList.maxSockets || constants.DEFAULT_MY_ANIME_LIST_MAX_SOCKETS
});

function del(url, user, secureKey) {
    return request(url, 'DELETE', null, user, secureKey);
}

function get(url, user, secureKey) {
    return request(url, 'GET', null, user, secureKey);
}

function post(url, data, user, secureKey) {
    return request(url, 'POST', data, user, secureKey);
}

function request(url, method, data, user, secureKey, retries) {
    logger.log('myAnimeList: ' + method + ' ' + url);

    return new Promise(function (resolve, reject) {

        var reqConfig = {
            hostname: constants.MY_ANIME_LIST_HOSTNAME,
            path: url,
            method: method,
            agent: agent
        };

        if (method === 'POST') {

            data = querystring.stringify({
                data: data
            });

            reqConfig.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': Buffer.byteLength(data)
            };
        }

        if (user && secureKey) {
            reqConfig.auth = user + ':' + crypt.decrypt(secureKey);
        }

        var req = http.request(reqConfig, function (res) {
            var body = '';

            if (res.statusCode === constants.HTTP_OK || res.statusCode === constants.HTTP_CREATED) {
                res.setEncoding('utf8');

                res.on('data', function (data) {
                    body += data;
                });

                res.on('end', function () {
                    resolve(body);
                });

            } else {

                if (retries === undefined) {
                    retries = config.retries || constants.DEFAULT_MY_ANIME_LIST_RETRIES;
                }

                if (res.statusCode === constants.HTTP_TOO_MANY_REQUESTS && retries > 0) {

                    var retryDelay = config.myAnimeList.retryDelay || constants.DEFAULT_MY_ANIME_LIST_RETRY_DELAY;

                    logger.error('myAnimeList: too many requests, retry #' + (config.retries - retries + 1) + ' in ' + retryDelay + 'ms');

                    setTimeout(function () {
                        request(url, method, data, user, secureKey, retries - 1).then(function (body) {
                            resolve(body);
                        }, function (error) {
                            reject(error);
                        });
                    }, retryDelay);

                } else {
                    var error = new Error(res.statusMessage);
                    error.status = res.statusCode;
                    reject(error);
                }
            }
        });

        req.on('error', function (error) {
            error.message = error.code;

            switch (error.message) {

                case 'ENOTFOUND':
                    error.message = 'MyAnimeList server not found';
                    break;

                case 'ETIMEDOUT':
                    error.message = 'Connection timed out';
            }

            reject(error);
        });

        if (method === 'POST') {
            req.write(data);
        }

        req.setTimeout(config.myAnimeList.timeout || constants.DEFAULT_MY_ANIME_LIST_TIMEOUT);
        req.end();
    });
}