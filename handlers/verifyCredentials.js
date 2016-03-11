/**
 * @name verifyCredentialsHandler
 * @description Verify credentials request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Services
var crypt = require('../services/crypt');
var logger = require('../services/logger');
var myAnimeList = require('../services/myAnimeList');

module.exports = verifyCredentialsHandler;

function verifyCredentialsHandler(req, res, next) {

    var user = req.params.user;
    var secureKey = crypt.encrypt(req.params.password);
    var time = new Date().getTime();
    var url = '/api/account/verify_credentials.xml';

    logger.log('verifyCredentialsHandler: verify credentials of user ' + user);

    myAnimeList.get(url, user, secureKey).then(function () {

        logger.log('verifyCredentialsHandler: credentials of user ' + user + ' verified in ' + (new Date().getTime() - time) + 'ms');

        res.json({
            authenticated: true,
            secureKey: secureKey
        });

    }, function (error) {
        if (error.status === 401) {
            res.json({
                authenticated: false
            });
        } else {
            error.message = 'Cannot verify credentials of user ' + user + ': ' + error.message.toLowerCase();
            next(error);
        }
    });
}