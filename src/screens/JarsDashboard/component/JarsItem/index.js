import ArrowRight from 'assets/svgs/menu/arrowRight';
import ProgressBar from 'components/basics/ProgressBar';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants, AppScreenID } from 'constant';
import { NavigationServiceLib, UtilLib } from 'libs';
import { get } from 'lodash';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { selectMoneySmarts, selectProvisionsJar } from 'store/MoneySmartsDashboard/selector';
import { AppStyle } from 'theme';

import themedStyles from '../../styles';

export const JarsItem = ({ label, icon, color, type, description, value }) => {
  const { t } = useTranslation();
  const { summary: provisionSummary } = useSelector(selectProvisionsJar);
  const { weekly7DayFloatAllocation } = useSelector(selectMoneySmarts);
  const styles = useThemedStyle(themedStyles, 'screens.jars_dashboard');

  const weeklyDay = get(weekly7DayFloatAllocation, ['weekly', 'total'], 0);

  const onPress = () => {
    switch (type) {
      case AppConstants.listTypeByJars.Provision:
        NavigationServiceLib.navigate(AppScreenID.ProvisionJarsScreen);
        break;
      case AppConstants.listTypeByJars.Living_LifeStyle:
        NavigationServiceLib.navigate(AppScreenID.LivingLifeStyleJar);
        break;
      case AppConstants.listTypeByJars.Credit:
        NavigationServiceLib.navigate(AppScreenID.CreditCardJar);
        break;
      case AppConstants.listTypeByJars.Direct:
        NavigationServiceLib.navigate(AppScreenID.DirectPaymentJar);
        break;
      case AppConstants.listTypeByJars.Loans:
        NavigationServiceLib.navigate(AppScreenID.LoansJar);
        break;
      default:
        NavigationServiceLib.navigate(AppScreenID.PrimarySavingAccountJar);
        break;
    }
  };

  return (
    <TouchableField onPress={onPress}>
      <View style={[styles.jarsItem, AppStyle.rowFlex]}>
        <View style={[AppStyle.flex1, styles.borderItemJars, AppStyle.pad15]}>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <LinearGradient style={styles.linear} colors={[...color]} />
            <TextField type="paragraph-1" style={[AppStyle.flex1, styles.textTitle]}>
              {label}
            </TextField>
            <Image source={icon} style={styles.icon} resizeMode="contain" />
          </View>
          <View style={[AppStyle.rowFlex, AppStyle.marginTop10, AppStyle.flex1]}>
            <View style={[AppStyle.flex3]}>
              <TextField type="captain" numberOfLines={2}>
                {description}
              </TextField>
            </View>
            <View style={AppStyle.flex2}>
              <TextField
                type="captain"
                font="semi-bold"
                numberOfLines={2}
                style={[styles.total]}
                number>
                {UtilLib.formatCurrency(value, '$')}
              </TextField>
            </View>
          </View>
          {type === AppConstants.listTypeByJars.Provision && provisionSummary ? (
            <View style={AppStyle.marginTop10}>
              <ProgressBar
                progress={provisionSummary?.spentAmount / provisionSummary?.totalAmount}
                barStyle={
                  provisionSummary?.remainingAmount >= 0
                    ? styles.progressBar
                    : styles.progressOverloadBar
                }
              />
            </View>
          ) : null}
          {type === AppConstants.listTypeByJars.Living_LifeStyle && weeklyDay ? (
            <View style={[AppStyle.marginTop10, styles.living]}>
              <TextField type="captain" font="medium" style={styles.textLiving}>
                {t('screens.jars_dashboard.weekly7DayFloat', {
                  value: UtilLib.formatCurrency(weeklyDay, '$'),
                })}
              </TextField>
            </View>
          ) : null}
        </View>

        <View style={styles.arrowRight}>
          <ArrowRight />
        </View>
      </View>
    </TouchableField>
  );
};
