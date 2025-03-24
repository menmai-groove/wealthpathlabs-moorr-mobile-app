import Condition from 'components/basics/Condition';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConfigs } from 'constant';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectFlags } from 'store/Auth/selector';
import { selectOpenedCheckup } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.monthlyCheckUp';

const HeaderList = ({ formatDateTimeString, onPress }) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);

  const currentCheckup = useSelector(selectOpenedCheckup);
  const { checkUpPage } = useSelector(selectFlags);

  return (
    <View
      style={[
        AppStyle.rowFlex,
        AppStyle.padRight15,
        AppStyle.marginBottom10,
        AppStyle.marginTop10,
        AppStyle.marginX15,
      ]}>
      <Condition display={currentCheckup}>
        <TouchableField style={AppStyle.flex1} onPress={onPress}>
          <TextField style={styles.textHeader}>
            {moment(currentCheckup?.startDate).format(formatDateTimeString) +
              `\n${t(`${i18nScope}.to`)} ` +
              moment(currentCheckup?.startDate)
                .add(AppConfigs.circleMonthCheckUp - 1, 'months')
                .subtract(1, 'day')
                .format(formatDateTimeString)}
          </TextField>
        </TouchableField>
      </Condition>
      <View style={styles.cardItemSpace} />
      <View>
        <TextField type="captain" style={styles.widthColumn}>
          {checkUpPage
            ? t(`${i18nScope}.bankAccountsHeader`)
            : t(`${i18nScope}.primaryAccountHeader`)}
        </TextField>
      </View>
      <View style={styles.cardItemSpace} />
      <View>
        <TextField type="captain" style={[styles.widthColumn, AppStyle.padRight10]}>
          {checkUpPage
            ? t(`${i18nScope}.creditAccountsHeader`)
            : t(`${i18nScope}.creditAccountHeader`)}
        </TextField>
      </View>
    </View>
  );
};

export default React.memo(HeaderList);
