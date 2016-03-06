/**
 * @name MALV-API
 * @description Node.js REST API that allows to interact with MyAnimeList.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var express = require('express');

// Configuration
var config = require('./config');

// Handlers
var animeHandler = require('./handlers/anime'),
    animeListHandler = require('./handlers/animeList'),
    topListHandler = require('./handlers/topList'),
    verifyCredentialsHandler = require('./handlers/verifyCredentials');

// Services
var logger = require('./services/logger');

// Application
var app = express();

logger.log('MALV API is running');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", config.originsAllowed);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * @name /anime/:id
 * @description Provide details on an anime that are not available in the animelist.
 * @param {number} id Id of the anime.
 * @returns {object} JSON object containing the details.
 */
app.get('/anime/:id', animeHandler);

/**
 * @name /animelist/:user
 * @description Provide the animelist of a user.
 * @param {string} user User.
 * @returns {Array} Array of JSON objects containing anime information.
 */
app.get('/animelist/:user', animeListHandler);

/**
 * @name /toplist/:name/:page
 * @description Provide a top anime list.
 * @param {string} name Name of the top list.
 * @param {number} page Page.
 * @returns {Array} Array of JSON objects containing anime information.
 */
app.get('/toplist/:name/:page', topListHandler);

/**
 * @name /verifycredentials/:user/:password
 * @description Verify credentials of a MyAnimeList account.
 * @param {string} user User.
 * @param {string} password Password.
 * @returns {object} JSON object containing the verification result.
 */
app.get('/verifycredentials/:user/:password', verifyCredentialsHandler);

app.listen(config.port);