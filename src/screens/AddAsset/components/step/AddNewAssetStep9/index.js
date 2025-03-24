import ButtonField from 'components/basics/ButtonField';
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import { NavigationServiceLib } from 'libs';
import LottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAssetName, selectAssetType } from 'store/Asset/selector';
import { AppSize, AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'forms.asset';

function AddNewAssetStep9() {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const assetName = useSelector(selectAssetName);
  const assetType = useSelector(selectAssetType);

  function onSubmitData() {
    NavigationServiceLib.pop();
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <LottieView
          resizeMode="contain"
          style={{
            width: AppSize.screen.width,
            height: AppSize.screen.height / 3,
          }}
          source={require('assets/images/optiIcon/confetti.json')}
          autoPlay
          loop={true}
        />
        <LottieView
          resizeMode="contain"
          style={styles.opti}
          source={require('assets/images/optiIcon/excited.json')}
          autoPlay
          loop
        />
      </View>
      <TextField style={AppStyle.marginTop10} type="heading-2">
        {assetName
          ? t(`${i18nScope}.cardHasBeenCreated`, { name: assetName })
          : t(`${i18nScope}.cardHasBeenCreated2`)}
      </TextField>
      <TextField style={styles.contentText} type="paragraph-2">
        {assetType === AppConstants.AssetType.Property
          ? t(`${i18nScope}.cardHasBeenCreatedContent`)
          : t(`${i18nScope}.cardHasBeenCreatedContentInvestment`)}
      </TextField>
      <ButtonField text={t('global.finish')} style={styles.buttonField} onPress={onSubmitData} />
    </View>
  );
}

export default AddNewAssetStep9;
