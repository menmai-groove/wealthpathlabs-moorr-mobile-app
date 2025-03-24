import CustomTab from 'components/basics/CustomTab';
import { PieChart } from 'components/basics/PieChart';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import util from 'libs/util';
import { includes, isEmpty } from 'lodash';
import { useOnScreenRefresh, useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { selectUser } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.home';

const NetMonthlyIncomeChart = props => {
  const { chartWidth, moneyInBreakdown, onPress, moneySmartsAllLoaded } = props;

  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const user = useSelector(selectUser);
  const [tabIndex, setTabIndex] = useState(0);
  const { screenRefreshId } = useOnScreenRefresh();

  const ownershipFilters = useMemo(() => {
    let primaryName = [user?.client1?.fName, user?.client1?.lName].join(' ');
    if (isEmpty(primaryName.trim())) {
      primaryName = t('global.primaryUser');
    }

    let partnerName = [user?.client2?.fName, user?.client2?.lName].join(' ');
    if (isEmpty(partnerName.trim())) {
      partnerName = t('global.partner');
    }
    return [
      {
        label: primaryName,
      },
      {
        label: partnerName,
      },
    ];
  }, [t, user]);

  const title = useMemo(() => {
    if (tabIndex === 0 || isEmpty(user?.client2?._id)) {
      return `${ownershipFilters[0].label}'s ${t(`${i18nScope}.moneyIN`)}`;
    }
    return `${ownershipFilters[1].label}'s ${t(`${i18nScope}.moneyIN`)}`;
  }, [t, user, tabIndex, ownershipFilters]);

  const data = useMemo(() => {
    if (moneyInBreakdown) {
      let groups = moneyInBreakdown[0]?.monthly?.groups ?? [];
      let listFiltered = groups.filter(
        item => !includes(AppConstants.keyExcludeNetMonthlyIncome, item.key),
      );
      let list = listFiltered.map((item, index) => ({
        ...item,
        color: UtilLib.getColorByIndex(index),
      }));
      return {
        list: list,
        total: moneyInBreakdown[0]?.monthly?.total,
      };
    }
    return { list: [], total: 0 };
  }, [moneyInBreakdown]);

  const dataPartner = useMemo(() => {
    if (moneyInBreakdown.length === 2) {
      let groups = moneyInBreakdown[1].monthly?.groups ?? [];
      let listFiltered = groups.filter(
        item => !includes(AppConstants.keyExcludeNetMonthlyIncome, item.key),
      );
      let list = listFiltered.map((item, index) => ({
        ...item,
        color: UtilLib.getColorByIndex(index),
      }));
      return {
        list: list,
        total: moneyInBreakdown[1]?.monthly?.total,
      };
    }
    return { list: [], total: 0 };
  }, [moneyInBreakdown]);

  const showToggle = useMemo(() => {
    let totalIncome = 0;
    if (moneyInBreakdown[1]) {
      totalIncome = moneyInBreakdown[1]?.monthly?.total;
    }
    return !isEmpty(user?.client2?._id) && totalIncome > 0;
  }, [moneyInBreakdown, user]);

  const showChart = useMemo(() => {
    return (
      <PieChart
        loading={!moneySmartsAllLoaded}
        style={styles.pieSVG}
        width={util.safePositiveValue(chartWidth)}
        data={data.list}
        labelAccessor={item => item.key}
        valueAccessor={item => item.total}
        formatValue={value => UtilLib.formatCurrency(value)}
        centeredText={() => {
          return (
            <View style={AppStyle.flex1}>
              <TextField type="heading-2" style={styles.pieCenterDescriptionText} numberOfLines={2}>
                {UtilLib.formatCurrency(data.total, '$')}
              </TextField>
            </View>
          );
        }}
      />
    );
  }, [chartWidth, data, moneySmartsAllLoaded, styles]);

  const showChartPartner = useMemo(() => {
    return (
      <PieChart
        loading={!moneySmartsAllLoaded}
        style={styles.pieSVG}
        width={util.safePositiveValue(chartWidth)}
        data={dataPartner.list}
        labelAccessor={item => item.key}
        valueAccessor={item => item.total}
        formatValue={value => UtilLib.formatCurrency(value)}
        centeredText={() => {
          return (
            <View style={AppStyle.flex1}>
              <TextField type="heading-2" style={styles.pieCenterDescriptionText} numberOfLines={2}>
                {UtilLib.formatCurrency(dataPartner.total, '$')}
              </TextField>
            </View>
          );
        }}
      />
    );
  }, [chartWidth, dataPartner, moneySmartsAllLoaded, styles]);

  return (
    <View style={[AppStyle.flex1, AppStyle.flexEndContent]}>
      <TextField style={AppStyle.textCenter} type="heading-4">
        {title}
      </TextField>
      <View style={[AppStyle.flex1, AppStyle.justifyContent]}>
        <View
          style={
            tabIndex === 1 ? [AppStyle.hide, { transform: [{ scale: 0 }] }] : styles.displayChart
          }>
          {showChart}
        </View>
        <View
          style={
            tabIndex === 0 ? [AppStyle.hide, { transform: [{ scale: 0 }] }] : styles.displayChart
          }>
          {showChartPartner}
        </View>

        {showToggle && (
          <View key={screenRefreshId}>
            <CustomTab
              data={ownershipFilters}
              value={tabIndex}
              onSelect={index => {
                setTabIndex(index);
              }}
              containerStyle={styles.containerTabStyle}
              fontStyle={styles.fontTabStyle}
              activeTabStyle={styles.activeTabStyle}
              activeFontStyle={styles.activeFontStyle}
            />
          </View>
        )}
      </View>
      <View style={[AppStyle.marginTop5, AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
        <View style={[AppStyle.flex1, styles.width0]} />
        {typeof onPress === 'function' && (
          <View style={[AppStyle.flex1, AppStyle.marginLeft10, AppStyle.alignEnd, styles.width0]}>
            <TouchableField onPress={onPress}>
              <View style={[AppStyle.rowFlex, styles.seeDetailsContainer]}>
                <TextField type="captain" style={[styles.seeDetailsText]}>
                  {t(`${i18nScope}.seeDetails`)}
                </TextField>
                <IonIcon
                  style={AppStyle.marginLeft5}
                  name="arrow-forward-circle"
                  size={14}
                  color={styles.seeDetailsIcon.color}
                />
              </View>
            </TouchableField>
          </View>
        )}
      </View>
    </View>
  );
};

export default NetMonthlyIncomeChart;
