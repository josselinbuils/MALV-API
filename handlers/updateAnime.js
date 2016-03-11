/**
 * @name updateAnimeHandler
 * @description Update anime request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var xml2js = require('xml2js');

// Configuration
var config = require('../config');

// Services
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = updateAnimeHandler;

function updateAnimeHandler(req, res, next) {

    if (!req.is('application/json')) {
        var error = new Error('The content-type must be application/json');
        error.status = 406;
        return next(error);
    }

    console.log(req.body);

    var xmlOptions = {
        rootName: 'entry',
        renderOpts: {
            pretty: false
        }
    };

    console.log(new xml2js.Builder(xmlOptions).buildObject({
        test: 'kikou'
    }));

    res.status(200).end();
}