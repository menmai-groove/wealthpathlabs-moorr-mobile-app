import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { getBiometricInfo } from 'services/biometrics';
import { AppStyle } from 'theme';
import { useAsyncMemo } from 'use-async-memo';

import themedStyles from './style';

const i18nScope = 'components.biometricSetupPrompt';
function BiometricSetupPrompt({ onCancel, onConfirm }) {
  const styles = useThemedStyle(themedStyles);
  const biometricInfo = useAsyncMemo(async () => await getBiometricInfo(), []);
  const { t } = useTranslation();
  const type = useMemo(() => {
    return biometricInfo?.isFaceID
      ? t(`${i18nScope}.faceID`)
      : biometricInfo?.isTouchID
      ? t(`${i18nScope}.touchID`)
      : t(`${i18nScope}.biometricAndroid`);
  }, [biometricInfo, t]);
  return (
    <View style={[AppStyle.middleContent]}>
      <View style={[AppStyle.padY15, AppStyle.padX10]}>
        <View style={AppStyle.middleContent}>
          {biometricInfo?.isFaceID && (
            <FastImage
              style={styles.noFaceIDIcon}
              source={require('assets/images/optiIcon/faceIDborder.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          {biometricInfo?.isTouchID && (
            <FastImage
              style={styles.noFingerPrintIcon}
              source={require('assets/images/optiIcon/touchIdborder.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          {biometricInfo?.isAndroidBiometrics && (
            <FastImage
              style={styles.noFingerPrintIcon}
              source={require('assets/images/optiIcon/touchIdborder.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>
        <View style={styles.titleContainer}>
          <TextField style={AppStyle.textCenter} type="heading-2">
            {t(`${i18nScope}.title`, { type })}
          </TextField>
        </View>
        <View style={AppStyle.padTop15}>
          <TextField style={AppStyle.textCenter} type="paragraph-2">
            {t(`${i18nScope}.description`, { type })}
          </TextField>
        </View>
        <View style={AppStyle.padTop15}>
          <TextField style={AppStyle.textCenter} type="paragraph-2">
            {t(`${i18nScope}.question`, { type })}
          </TextField>
        </View>
      </View>

      <View style={[AppStyle.rowFlex]}>
        <View style={[AppStyle.flex1, AppStyle.alignStart]}>
          <ButtonField
            type={'secondary'}
            text={t('global.no')}
            style={[styles.buttonNoContainer]}
            onPress={onCancel}
          />
        </View>
        <View style={[AppStyle.flex1, AppStyle.alignEnd]}>
          <ButtonField
            text={t('global.yes')}
            style={[styles.buttonYesContainer]}
            onPress={onConfirm}
          />
        </View>
      </View>
    </View>
  );
}

export default BiometricSetupPrompt;
