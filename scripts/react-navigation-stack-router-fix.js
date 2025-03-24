const fs = require('fs');

try {
  console.log('React Navigation Stack Router fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/@react-navigation/routers/src/StackRouter.tsx`;
  var data = fs.readFileSync(file, 'utf8');
  var beforeFix = /options.routeGetIdList/g;
  var afterFix = 'options.routeNames';

  if (data.indexOf(afterFix) !== -1) {
    throw '> Already fixed';
  }

  var result = data.replace(beforeFix, afterFix);
  fs.writeFileSync(file, result, 'utf8');
  console.log('> Done');
} catch (error) {
  console.error(error);
}
