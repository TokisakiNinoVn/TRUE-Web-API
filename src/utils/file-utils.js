/**
 * Convert Linux URL to URI.
 * @param {*} str 
 * @returns 
 */

function fileUrl(str) {
  if (typeof str !== 'string') {
      throw new Error('Expected a string');
  }

  var pathName = str.replace(/\\/g, '/').replace('public','');
  return pathName;
};


module.exports = {
  fileUrl
}