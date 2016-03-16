/**
 * @name crypt
 * @description Encryption provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

'use strict';

// External libraries
var crypto = require('crypto');

// Constants
var constants = require('../constants');

// Configuration
var config = require('../../config');

module.exports = {
    /**
     * @name encrypt
     * @description Encrypt data.
     * @param {string} str Data to encrypt.
     */
    encrypt: encrypt,

    /**
     * @name decrypt
     * @description Decrypt data.
     * @param {string} str Data to decrypt.
     */
    decrypt: decrypt
};

var algorithm = config.encryptionAlgorithm || constants.DEFAULT_ENCRYPTION_ALGORITHM;

function encrypt(str) {
    var cipher = crypto.createCipher(algorithm, config.encryptionKey);
    return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(str) {
    var decipher = crypto.createDecipher(algorithm, config.encryptionKey);
    return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}
