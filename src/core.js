/**
 * @name core
 * @description API core.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var bodyParser = require('body-parser');
var express = require('express');

// Constants
var constants = require('./constants');

// Configuration

var config = require('./../config');

if (!config.encryptionKey) {
    throw new Error('Missing the required parameter encryptionKey in the configuration');
}

// Avoid errors
if (!config.myAnimeList) {
    config.myAnimeList = {};
}

// Handlers
var addAnimeHandler = require('./handlers/addAnime');
var animeHandler = require('./handlers/anime');
var animeListHandler = require('./handlers/animeList');
var deleteAnimeHandler = require('./handlers/deleteAnime');
var errorHandler = require('./handlers/error');
var topListHandler = require('./handlers/topList');
var updateAnimeHandler = require('./handlers/updateAnime');
var verifyCredentialsHandler = require('./handlers/verifyCredentials');

// Services
var logger = require('./services/logger');

// Application
var app = express();

// Allow to receive request data
app.use(bodyParser.json());

// Set the app headers
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Origin', config.originsAllowed || constants.DEFAULT_ORIGINS_ALLOWED);
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, PUT, OPTIONS');
    res.header('Content-Type', 'application/json');
    next();
});

/**
 * @name /addanime/:user/:id/:secureKey
 * @description Add an anime in a user anime list.
 * @param {string} user User.
 * @param {number} id Id of the anime.
 * @param {string} secureKey Secure key of the user.
 * @param {object} data JSON object containing the anime status (ex: watching). Must be provided as request data.
 */
app.put('/addanime/:user/:id/:secureKey', addAnimeHandler);

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
 * @name /deleteanime/:user/:id/:secureKey
 * @description Delete an anime in a user anime list.
 * @param {string} user User.
 * @param {number} id Id of the anime.
 * @param {string} secureKey Secure key of the user.
 */
app.delete('/deleteanime/:user/:id/:secureKey', deleteAnimeHandler);

/**
 * @name /toplist/:name/:page
 * @description Provide a top anime list.
 * @param {string} name Name of the top list.
 * @param {number} page Page.
 * @returns {Array} Array of JSON objects containing anime information.
 */
app.get('/toplist/:name/:page', topListHandler);

/**
 * @name /updateanime/:user/:id/:secureKey
 * @description Update an anime in a user anime list.
 * @param {string} user User.
 * @param {number} id Id of the anime.
 * @param {string} secureKey Secure key of the user.
 * @param {object} data JSON object containing the fields to update. Must be provided as request data.
 */
app.patch('/updateanime/:user/:id/:secureKey', updateAnimeHandler);

/**
 * @name /verifycredentials/:user/:password
 * @description Verify credentials of a MyAnimeList account.
 * @param {string} user User.
 * @param {string} password Password.
 * @returns {object} JSON object containing the verification result.
 */
app.get('/verifycredentials/:user/:password', verifyCredentialsHandler);

// Handle errors
app.use(errorHandler);

var port = config.port || constants.DEFAULT_PORT;

// Run the API server
app.listen(port);

logger.log('MALV API is listening on port ' + port);