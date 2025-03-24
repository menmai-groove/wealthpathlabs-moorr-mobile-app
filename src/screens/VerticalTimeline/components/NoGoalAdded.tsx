import React from 'react';
import TextField from 'components/basics/TextField';
import ButtonField from 'components/basics/ButtonField';
import FastImage from 'react-native-fast-image';
import { View, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useThemedStyle } from 'providers';
import { useTranslation } from 'react-i18next';
import { AppConstants, AppScreenID } from 'constant';
import { AppStyle } from 'theme';
import { NavigationServiceLib } from 'libs';

const i18nScope = 'screens.personalGoal.verticalTimeline';

export function NoGoalAdded() {
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const styles = useThemedStyle(themedStyle, i18nScope);

  return (
    <View style={styles.container}>
      <FastImage source={require('assets/images/bulls-eye.png')} style={styles.image} />
      <View style={[AppStyle.pad40, AppStyle.padBottom0, AppStyle.alignContent]}>
        <TextField type="heading-2" style={[AppStyle.textAlign]}>
          {t('noPersonalGoalAdded')}
        </TextField>
        <TextField type="paragraph-2" style={[AppStyle.textAlign, AppStyle.marginTop10]}>
          {t('pleaseClickOnTheButton')}
        </TextField>
        <ButtonField
          onPress={() => {
            NavigationServiceLib.navigate(AppScreenID.AddPersonalGoal);
          }}
          style={[AppStyle.marginTop30, styles.btnAdd]}
          text={t('addANewGoal')}
        />
      </View>
    </View>
  );
}

type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };

const themedStyle: NamedStyles = {
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  image: {
    height: 100,
    width: 100,
  },
  btnAdd: {
    minWidth: 200,
  },
};
