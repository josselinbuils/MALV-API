/**
 * @name utils
 * @description Shared methods.
 * @author Josselin Buils <josselin.buils@gmail.com>
 */

module.exports = {

    /**
     * @name getMatchGroup
     * @description Allow to safety get a group of a regex match.
     * @param {object} match Regex match.
     * @param {number} index Index of the wanted group.
     * @param {string} type Type of data to return: 'date', 'int', 'float' or 'string'.
     * @returns {string} Wanted group if its exists or empty string or null regarding the wanted type.
     */
    getMatchGroup: getMatchGroup,

    /**
     * @name timeToString
     * @description Convert a timestamp to a date string with format mmddyyyy.
     * @param {number} timestamp Timestamp.
     * @returns {string} Formatted date.
     */
    timeToString: timeToString
};

function getMatchGroup(match, index, type) {

    if (!match) {
        return type === 'string' ? '' : null;
    }

    var group = match[index];

    switch (type) {

        case 'date':
            group = Date.parse(group) || null;
            break;

        case 'int':
            group = parseInt(group) || null;
            break;

        case 'float':
            group = parseFloat(group) || null;
            break;

        case 'string':
            group = group || '';
    }

    return group;
}

function timeToString(timestamp) {
    var isoDate = new Date(timestamp).toISOString().match(/(\d{4})-(\d{2})-(\d{2})/);
    return isoDate[2] + isoDate[3] + isoDate[1];
}