/**
 *
 * NoDataAvailable
 *
 */

import React from 'react';
import Condition from 'components/basics/Condition';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import { Image, View, StyleProp, ViewStyle } from 'react-native';
import { AppStyle } from 'theme';
import ButtonField from 'components/basics/ButtonField';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { AppConstants } from 'constant';
import util from 'libs/util';

import themedStyles from './style';

const i18nScope = 'components.noDataAvailable';

interface NoDataAvailableProps {
  type: 'none' | 'button';
  imageType?: 'default' | 'opti' | 'empty';
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function NoDataAvailable(props: NoDataAvailableProps) {
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const {
    type = 'none',
    title = t('title'),
    description = t('noDataAvailable'),
    imageType = 'default',
    buttonText,
    onPress,
    style,
  } = props;
  const styles = useThemedStyle(themedStyles);

  return (
    <View style={[styles.container, style]}>
      <Condition display={imageType === 'default'}>
        <Image
          height={util.safePositiveValue(styles.logo.height)}
          width={util.safePositiveValue(styles.logo.width)}
          source={require('assets/images/optiIcon/nodata.png')}
          style={styles.logo}
        />
      </Condition>
      <Condition display={imageType === 'opti'}>
        <LottieView
          resizeMode="contain"
          style={styles.confusedOpti}
          source={require('assets/images/optiIcon/confused.json')}
          autoPlay
          loop
        />
      </Condition>
      <TextField type="heading-2" style={styles.title}>
        {title}
      </TextField>
      <TextField type="paragraph-2" style={styles.description}>
        {description}
      </TextField>
      {type === 'button' && (
        <ButtonField
          onPress={onPress}
          style={[AppStyle.marginTop30, styles.btnAdd]}
          text={buttonText}
        />
      )}
    </View>
  );
}

export default NoDataAvailable;
