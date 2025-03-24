/* eslint-disable no-console */
/* eslint-disable quotes */
const fs = require('fs');

try {
  console.log('React Google Place autocomplete fix...');
  var rootDir = process.cwd();

  var file = `${rootDir}/node_modules/react-native-google-places-autocomplete/GooglePlacesAutocomplete.js`;
  var data = fs.readFileSync(file, 'utf8');
  // Use TouchableHighlight from gesture handler
  var beforeFix1 = `} from 'react-native';`;
  var afterFix1 = `} from 'react-native';\nimport { TouchableHighlight } from 'react-native-gesture-handler';`;

  if (data.indexOf(afterFix1) !== -1) {
    throw '> Already fixed';
  }

  //Remove TouchableHighlight from react-native
  var beforeFix2 = 'TouchableHighlight';
  var afterFix2 = 'TouchableHighlight as RNTouchableHighlight';

  var result2 = data.replace(beforeFix2, afterFix2);
  var result1 = result2.replace(beforeFix1, afterFix1);

  fs.writeFileSync(file, result1, 'utf8');
  console.log('> Done');
} catch (error) {
  console.error(error);
}
