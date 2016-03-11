/**
 * @name verifyCredentialsHandler
 * @description Verify credentials request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 * @param {object} req Request provider.
 * @param {object} res Result provider.
 */

// Services
var crypt = require('../services/crypt');
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = verifyCredentialsHandler;

function verifyCredentialsHandler(req, res) {

    var user = req.params.user;
    var secureKey = crypt.encrypt(req.params.password);
    var time = new Date().getTime();
    var url = '/api/account/verify_credentials.xml';

    logger.log('verifyCredentialsHandler: verify credentials of user ' + user);

    res.setHeader('Content-Type', 'application/json');

    myAnimeList.get(url, user, secureKey).then(function () {

        logger.log('verifyCredentialsHandler: credentials of user ' + user + ' verified in ' + (new Date().getTime() - time) + 'ms');

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
            logger.error('verifyCredentialsHandler: ' + errorMessage.toLowerCase());
            res.status(500).json({error: errorMessage});
        }
    });
}