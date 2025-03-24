/**
 * componentExists
 *
 * Check whether the given component exist in either the components or containers directory
 */

const fs = require('fs');
const path = require('path');
const reduxLogic = fs.readdirSync(path.join(__dirname, '../../../src/store'));

function componentExists(comp) {
  return reduxLogic.indexOf(comp) >= 0;
}

module.exports = componentExists;
