const fs = require('fs');

try {
  // console.log('React Native OTP Input fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/@twotalltotems/react-native-otp-input/dist/index.js`;
  var data = fs.readFileSync(file, 'utf-8');
  var beforeFix = /pointerEvents="none"/g;
  var afterFix = 'pointerEvents={selectedIndex === index ? "auto" : "none"}';

  if (data.indexOf(afterFix) !== -1) {
    throw '> Already fixed';
  }

  var result = data.replace(beforeFix, afterFix);

  var beforeFix2 = /this.handleChangeText\(index, text\)/g;
  var afterFix2 = `if (text.length > 1) {
                // paste
                if (!/^\\d{6}$|^$/.test(text)) {
                    this.setState({ digits: [""] }, this.notifyCodeChanged);
                    return
                }
              }
              this.handleChangeText(index, text)`;

  if (result.indexOf(afterFix2) !== -1) {
    throw '> Already fixed';
  }

  var result2 = result.replace(beforeFix2, afterFix2);

  fs.writeFileSync(file, result2, 'utf8');
  // console.log('> Done');
} catch (error) {
  console.error(error);
}
