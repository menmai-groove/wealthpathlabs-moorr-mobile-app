import CheckCircleIcon from 'assets/svgs/onboardingInterview/checkCircleIcon';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers/';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

import themedStyles from './style';

function SelectHousehold({ text, type, style, selected, onPress }) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({
    ...themedStyles,
    container: {
      ...themedStyles.container,
      ...convertedStyle,
    },
  });

  const getImage = useMemo(() => {
    switch (type) {
      case AppConstants.householdType.justMe:
        return require('assets/images/optiIcon/justMe.png');
      case AppConstants.householdType.mePartner:
        return require('assets/images/optiIcon/mePartner.png');
      case AppConstants.householdType.meKids:
        return require('assets/images/optiIcon/meKids.png');
      case AppConstants.householdType.usKids:
        return require('assets/images/optiIcon/usKids.png');
      default:
        break;
    }
  }, [type]);

  const getImageStyle = useMemo(() => {
    switch (type) {
      case AppConstants.householdType.justMe:
        return styles.justMeIcon;
      case AppConstants.householdType.mePartner:
        return styles.mePartnerIcon;
      case AppConstants.householdType.meKids:
        return styles.meKidsIcon;
      case AppConstants.householdType.usKids:
        return styles.usKidsIcon;
      default:
        break;
    }
  }, [type, styles]);

  const color = useMemo(() => {
    switch (type) {
      case AppConstants.householdType.justMe:
        return styles.justMe;
      case AppConstants.householdType.mePartner:
        return styles.mePartner;
      case AppConstants.householdType.meKids:
        return styles.meKids;
      case AppConstants.householdType.usKids:
        return styles.usKids;
      default:
        return {};
    }
  }, [type, styles]);

  return (
    <TouchableField
      onPress={onPress}
      style={[styles.container, { backgroundColor: color.backgroundColor }]}>
      <View style={[styles.imageBorder, { borderColor: color.borderColor }]}>
        <FastImage
          style={getImageStyle}
          source={getImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <View style={styles.iconRight}>{selected ? <CheckCircleIcon /> : null}</View>
      <TextField style={styles.text} font="medium">
        {text}
      </TextField>
    </TouchableField>
  );
}

export default SelectHousehold;
