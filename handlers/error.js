/**
 * @name errorHandler
 * @description Error handler.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// Services
var logger = require('../services/logger');

module.exports = errorHandler;

function errorHandler(error, req, res, next) {

    logger.error(error.stack);

    res.status(error.status || 500).json({
        error: error.message
    });

    next();
}