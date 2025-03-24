const fs = require('fs');

try {
  console.log('React KeyboardAvoidingView fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/react-native/Libraries/Components/Keyboard/KeyboardAvoidingView.js`;
  var data = fs.readFileSync(file, 'utf8');
  var beforeFix = /if \(!frame \|\| !keyboardFrame\)/g;
  var afterFix = 'if (!frame || !keyboardFrame || keyboardFrame.screenY === 0)';

  if (data.indexOf(afterFix) !== -1) {
    throw '> Already fixed';
  }

  var result = data.replace(beforeFix, afterFix);
  fs.writeFileSync(file, result, 'utf8');
  console.log('> Done');
} catch (error) {
  console.error(error);
}
