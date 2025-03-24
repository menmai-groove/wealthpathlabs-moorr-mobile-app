const fs = require('fs');

try {
  console.log('React Keyboard Aware ScrollView RN 0.65.1 fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/react-native-keyboard-aware-scroll-view/lib/KeyboardAwareHOC.js`;
  var data = fs.readFileSync(file, 'utf8');
  var beforeFix = /responder.scrollResponderScrollTo/g;
  var afterFix = 'responder.scrollTo';

  if (data.indexOf(afterFix) !== -1) {
    throw '> Already fixed';
  }

  var result = data.replace(beforeFix, afterFix);
  fs.writeFileSync(file, result, 'utf8');
  console.log('> Done');
} catch (error) {
  console.error(error);
}
