/**
 * @name crypt
 * @description Encryption provider.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

var config = require('../config'),
    crypto = require('crypto');

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

function encrypt(str) {
    var cipher = crypto.createCipher(config.encryptionAlgorithm, config.encryptionKey);
    return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(str) {
    var decipher = crypto.createDecipher(config.encryptionAlgorithm, config.encryptionKey);
    return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}
