const fs = require('fs');

try {
  // console.log('React Native Walkthrough Tooltip fix...');
  // var rootDir = process.cwd();
  // var file = `${rootDir}/node_modules/react-native-walkthrough-tooltip/src/tooltip.js`;
  // var data = fs.readFileSync(file, 'utf-8');
  // var beforeFix = /Dimensions.addEventListener/g;
  // var afterFix = 'this.dimensionListener = Dimensions.addEventListener';
  // if (data.indexOf(afterFix) !== -1) {
  //   throw '> Already fixed';
  // }
  // var result = data.replace(beforeFix, afterFix);
  // beforeFix = /Dimensions.removeEventListener\('change', this.updateWindowDims\)/g;
  // afterFix = 'if (this.dimensionListener) { this.dimensionListener.remove(); }';
  // result = result.replace(beforeFix, afterFix);
  // fs.writeFileSync(file, result, 'utf8');
  // console.log('> Done');
} catch (error) {
  console.error(error);
}
