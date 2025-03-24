const fs = require('fs');

try {
  console.log('ReactNative ScrollableTabView fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/react-native-scrollable-tab-view/index.js`;
  var data = fs.readFileSync(file, 'utf8');
  var beforeFix = /this.scrollView.getNode\(\)/g;
  var afterFix = 'this.scrollView';

  if (data.indexOf('this.scrollView.getNode') === -1) {
    throw '> Already fixed';
  }

  var result = data.replace(beforeFix, afterFix);
  fs.writeFileSync(file, result, 'utf8');
  console.log('> Done');
} catch (error) {
  console.error(error);
}
