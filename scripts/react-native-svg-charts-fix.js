/* eslint-disable no-console */
const { replace } = require('./utils');

try {
  console.log('React native svg chart fix...');

  // NOTE: update progress-circle.js
  replace({
    path: 'react-native-svg-charts/src/progress-circle.js',
    pairs: [
      ['.outerRadius(outerDiameter / 2)', '.outerRadius(parseInt(outerDiameter / 2))'],
      [
        '.innerRadius(outerDiameter / 2 - strokeWidth)',
        '.innerRadius(parseInt(outerDiameter / 2) - strokeWidth)',
      ],
    ],
  });

  // NOTE: update chart.js
  replace({
    path: 'react-native-svg-charts/src/chart/chart.js',
    pairs: [
      [
        'x: xAccessor({ item, index }),',
        'x: xAccessor({ item, index }),\n\t\t\tnewX: item?.x,\n\t\t\tnewY: item?.y',
      ],
    ],
  });

  console.log('> Done');
} catch (error) {
  console.error(error);
}
