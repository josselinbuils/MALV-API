/**
 * @name constants
 * @description Constants of the application.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

module.exports = {
    BAD_REQUEST: 400,
    DEFAULT_MY_ANIME_LIST_MAX_SOCKETS: 3,
    DEFAULT_MY_ANIME_LIST_RETRIES: 3,
    DEFAULT_MY_ANIME_LIST_RETRY_DELAY: 500,
    DEFAULT_MY_ANIME_LIST_TIMEOUT: 10000,
    DEFAULT_ENCRYPTION_ALGORITHM: 'aes256',
    DEFAULT_ORIGINS_ALLOWED: '*',
    DEFAULT_PORT: 8080,
    INTERNAL_ERROR: 500,
    MY_ANIME_LIST_HOST: 'http://myanimelist.net',
    NOT_ACCEPTABLE: 406,
    STACK_TRACE_LIMIT: 5,
    XML_BUILDER_OPTIONS: {
        rootName: 'entry',
        renderOpts: {
            pretty: false
        }
    }
};