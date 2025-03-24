/* eslint-disable no-console */
const fs = require('fs');

const replace = ({ path = '', pairs = [] }) => {
  var rootDir = process.cwd();
  var file = `${rootDir}/node_modules/${path}`;
  let data = fs.readFileSync(file, 'utf8');

  for (var i = 0; i < pairs.length; i++) {
    const findValue = pairs[i][0];
    const replaceValue = pairs[i][1];

    if (data.indexOf(replaceValue) !== -1) {
      console.log(`> Already fixed ${replaceValue}`);
      continue;
    }

    data = data.replace(findValue, replaceValue);
  }

  fs.writeFileSync(file, data, 'utf8');
  console.log(`Updated: ${path}`);
};

module.exports = {
  replace,
};
