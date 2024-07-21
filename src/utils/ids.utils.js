const { v4 } = require("uuid");

function generateIds(quantity) {
  let uuidArray = [];
  for (let i = 0; i < quantity; i++) {
    uuidArray.push(v4());
  }
  return uuidArray;
}

module.exports = {
  generateIds
};
