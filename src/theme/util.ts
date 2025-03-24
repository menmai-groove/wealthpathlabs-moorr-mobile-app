// @ts-nocheck
import { AppConfigs } from 'constant';
import { get, isNumber, isObject } from 'lodash';
import { Dimensions } from 'react-native';
import { SIZE_MATTERS_BASE_HEIGHT, SIZE_MATTERS_BASE_WIDTH } from 'react-native-dotenv';
import { ScaledSheet, moderateScale } from 'react-native-size-matters/extend';

const createThemedEntry = (key, value, theme, customMapping) => {
  const autoScale = AppConfigs.autoScaleSizeMatters;
  const { width, height } = Dimensions.get('screen');
  let mapValue = get(theme, value) || value;
  if (customMapping) {
    mapValue = get(theme, ['custom', customMapping].join('.')) || mapValue;
  }
  if (autoScale > 0 && checkValidScaleField(key, value)) {
    mapValue = `${mapValue}@ms${autoScale}r`;
    if (
      width === parseInt(SIZE_MATTERS_BASE_WIDTH, 10) &&
      height !== parseInt(SIZE_MATTERS_BASE_HEIGHT, 10)
    ) {
      mapValue = ScaledSheet.create({ [key]: mapValue })[key];
      mapValue = `${mapValue}@vsr`;
    }
  }
  return mapValue;
};

const checkValidScaleField = (key, value) => {
  if (isNumber(value) && value === parseInt(value, 10)) {
    return (
      ['height', 'minHeight', 'maxHeight'].includes(key) ||
      ['width', 'minWidth', 'maxWidth', 'borderRadius'].includes(key) ||
      key.indexOf('padding') !== -1 ||
      key.indexOf('margin') !== -1
    );
  }
};

const createThemed = (styles, theme = {}, customMapping) => {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key];
    if (isObject(value)) {
      const val = createThemed(value, theme, customMapping ? customMapping + '.' + key : null);
      try {
        return {
          ...acc,
          ...ScaledSheet.create({ [key]: val }),
        };
      } catch (error) {
        return {
          ...acc,
          [key]: val,
        };
      }
    } else {
      return {
        ...acc,
        [key]: createThemedEntry(
          key,
          value,
          theme,
          customMapping ? customMapping + '.' + key : null,
        ),
      };
    }
  }, {});
};

function createScaledSheet<T>(styles: T, theme: object = {}, customMapping?: string): T {
  return createThemed(styles, theme, customMapping);
}

export default { createThemed, createScaledSheet, moderateScale };
