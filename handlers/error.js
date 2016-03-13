/**
 * @name errorHandler
 * @description Error handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Constants
var constants = require('../constants');

// Configuration
var config = require('../config');

// Services
var logger = require('../services/logger');

// Set the number of lines to show in error stacks
Error.stackTraceLimit = config.stackTraceLimit || constants.STACK_TRACE_LIMIT;

module.exports = errorHandler;

function errorHandler(error, req, res, next) {

    logger.error(error.stack);

    res.status(error.status || constants.HTTP_INTERNAL_ERROR).json({
        error: error.message
    });

    next();
}