/**
 * @name logger
 * @description Log provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

// External libraries
var fs = require('fs');

module.exports = {
    /**
     * @name error
     * @description Log an error.
     * @param {string} str Error to log.
     */
    error: error,

    /**
     * @name log
     * @description Log a message.
     * @param {string} str Message to log.
     */
    log: info
};

function error(str) {
    log('ERROR', str);
}

function info(str) {
    log('INFO', str);
}

function log(level, str) {
    str = '[' + new Date().toDateString() + ' ' + new Date().toLocaleTimeString() + '] [' + level + '] ' + str;
    console.log(str);

    if (config.logging !== false) {
        fs.appendFile('logs.txt', str + '\n');
    }
}