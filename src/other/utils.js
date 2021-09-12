/**
 * Check if this string only consists of numbers
 * @param {string} str the value to check
 * @returns {boolean} true if the string is numeric, otherwise false
 */
const isNumeric = (str) => /^\d+$/.test(str);

/**
 * Is the given string null, undefined or empty?
 * @param {string} str 
 * @returns {boolean}
 */
const isEmptyString = (str) => (str === undefined || str === null || str.trim().length === 0);

/**
 * Check if this string is in uppercase
 * @param {string} str the value to check
 * @returns {boolean} true if the string is in uppercase, otherwise false
 */
const isUppercase = (str) => str === str.toUpperCase();

const setCharAt = (str, index, chr) => {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
};

const keysToPosKey = (lowKey, highKey) => `${lowKey}|${highKey}`;

const download = (filename, text) => {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';

  element.click();
}

/**
 * @returns {Promise<File>}
 */
const requestFile = () => {
  const element = document.createElement('input');
  element.setAttribute('type', 'file');
  element.setAttribute('name', 'files[]');

  element.style.display = 'none';

  element.click();

  return new Promise((resolve, reject) => {
    element.addEventListener("change", () => {
      return resolve(element.files[0]);
    });
  });
}
