import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { getBiometricInfo } from 'services/biometrics';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './style';

const i18nScope = 'components.biometricModal';

function BiometricPopup({ title, description, buttonText, onPressButton }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);

  return (
    <View style={[AppStyle.middleContent]}>
      <View style={AppStyle.padTop20}>
        <View style={AppStyle.middleContent}>
          {biometricInfo?.isFaceID && (
            <FastImage
              style={styles.noFaceIDIcon}
              source={require('assets/images/optiIcon/noFaceID.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          {biometricInfo?.isTouchID && (
            <FastImage
              style={styles.noFingerPrintIcon}
              source={require('assets/images/optiIcon/noFingerPrint.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          {biometricInfo?.isAndroidBiometrics && (
            <FastImage
              style={styles.noFingerPrintIcon}
              source={require('assets/images/optiIcon/noFingerPrint.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>
        <View style={styles.titleContainer}>
          <TextField style={AppStyle.textCenter} type="heading-2">
            {title}
          </TextField>
        </View>
      </View>
      <View style={AppStyle.padTop10}>
        {typeof description === 'function' ? (
          description()
        ) : (
          <TextField style={AppStyle.textCenter} type="paragraph-2">
            {description}
          </TextField>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <ButtonField text={buttonText} onPress={onPressButton} />
      </View>
    </View>
  );
}

export default BiometricPopup;
