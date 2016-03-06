/**
 * @name verifyCredentialsHandler
 * @description Verify credentials request handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 * @param {object} req Request provider.
 * @param {object} res Result provider.
 */

// Services
var crypt = require('../services/crypt'),
    logger = require('../services/logger'),
    myAnimeList = require('../services/myAnimeList');

module.exports = function (req, res) {

    var user = req.params.user,
        secureKey = crypt.encrypt(req.params.password),
        time = new Date().getTime(),
        url = '/api/account/verify_credentials.xml';

    logger.log('Verify credentials of user ' + user);

    res.setHeader('Content-Type', 'application/json');

    myAnimeList.get(url, user, secureKey).then(function () {

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
};