/**
 * Check if this string only consists of numbers
 * @param {string} str the value to check
 * @returns {boolean} true if the string is numeric, otherwise false
 */
const isNumeric = (str) => /^\d+$/.test(str)

/**
 * Check if this string is in uppercase
 * @param {string} str the value to check
 * @returns {boolean} true if the string is in uppercase, otherwise false
 */
const isUppercase = (str) => str === str.toUpperCase()

/**
 * Map a given value from a range to another range
 * @param {number} val the value to map to a new range
 * @param {number} inMin minimal value of input range
 * @param {number} inMax maximal value of input range
 * @param {number} outMin minimal value of output range
 * @param {number} outMax maximal value of output range
 * @returns {number} the value in the new range
 */
const mapToRange = (val, inMin, inMax, outMin, outMax) =>
    ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin

/**
 * Await this function to sleep for `ms` milliseconds
 * @param {number} ms time to wait in milliseconds 
 * @returns {Promise} 
 */
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * This does not work correctly for nested arrays and objects because
 * the values get compared with `===`
 * @param {Array} arrayA 
 * @param {Array} arrayB 
 * @returns {boolean} true if both arrays are the same
 */
const arrayEquals = (arrayA, arrayB) => {
    if (arrayA === undefined && arrayB !== undefined) return false;
    if (arrayA === null && arrayB !== null) return false;
    if (arrayB === null && arrayA !== null) return false;
    if (arrayB === undefined && arrayA !== undefined) return false;

    if (arrayA.length !== arrayB.length) return false;

    return arrayA.every((value, index) => value === arrayB[index]);
}

/**
 * Because this calls `arrayEquals`, nested arrays and objects can give
 * wrong results
 * @param {Array} arrayA 
 * @param {Array} arrayB 
 * @param {number} [limit] let array comparison only happen from element 0 to limit,
 * or full array if undefined
 * @returns {boolean} true if `arrayA` contains `arrayB`
 */
const arrayContainsArray = (arrayA, arrayB, limit) => {
    if (arrayA === undefined || arrayA === null) return false;
    if (arrayB === undefined || arrayB === null) return false;

    for (let i = 0, n = arrayA.length; i < n; i++) {
        if (arrayEquals(arrayA[i].slice(0, limit), arrayB.slice(0, limit))) {
            return true;
        }
    }
    return false;
}