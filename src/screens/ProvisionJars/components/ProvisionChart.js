import { PieChart } from 'components/basics/PieChart';
import TextField from 'components/basics/TextField';
import { UtilLib } from 'libs';
import { isNil } from 'lodash';
import PropTypes from 'prop-types';
import { useThemedStyle } from 'providers';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.provisionsJar';
const i18nScopeChart = 'components.chart';

function ProvisionChart({ summary, isExpense }) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);

  const data = useMemo(() => {
    if (isNil(summary)) {
      return [];
    }
    const { spentAmount, remainingAmount } = summary;
    if (spentAmount === 0 && remainingAmount === 0) {
      return [];
    }
    return [
      {
        label: isExpense ? t(`${i18nScopeChart}.spent`) : t(`${i18nScopeChart}.totalSpent`),
        value: spentAmount,
        color: [styles.pieSliceColor.primary1, styles.pieSliceColor.primary2],
      },
      {
        label: isExpense ? t(`${i18nScopeChart}.remaining`) : t(`${i18nScopeChart}.totalRemaining`),
        value: remainingAmount,
        color: [styles.pieSliceColor.secondary1, styles.pieSliceColor.secondary2],
        svg:
          remainingAmount < 0
            ? {
                fill: styles.pieSliceColor.fill,
                stroke: styles.pieSliceColor.secondary2,
                strokeWidth: 1,
              }
            : {},
      },
    ];
  }, [summary, isExpense, t, styles]);

  return (
    <PieChart
      height={250}
      data={data}
      labelAccessor={item => item.label}
      valueAccessor={item => item.value}
      formatValue={value => UtilLib.formatCurrency(value, '$')}
      centeredText={() => {
        return (
          <View style={AppStyle.flex1}>
            <View>
              <TextField type="captain" style={styles.pieCenterTitleText} numberOfLines={3}>
                {isExpense
                  ? t(`${i18nScope}.itemCenterChartText`)
                  : t(`${i18nScope}.centerChartText`)}
              </TextField>
            </View>
            <View style={AppStyle.padTop5}>
              <TextField type="heading-2" style={styles.pieCenterDescriptionText} numberOfLines={2}>
                {UtilLib.formatCurrency(summary.totalAmount, '$')}
              </TextField>
            </View>
          </View>
        );
      }}
    />
  );
}

ProvisionChart.propTypes = {
  summary: PropTypes.shape({
    remainingAmount: PropTypes.number,
    spentAmount: PropTypes.number,
    totalAmount: PropTypes.number,
  }),
  isExpense: PropTypes.bool, // render on provision screen or provision item detail screen
};

ProvisionChart.defaultProps = {
  summary: {
    remainingAmount: 0,
    spentAmount: 0,
    totalAmount: 0,
  },
  isExpense: false, // render on provision screen or provision expense detail screen
};

export default memo(ProvisionChart);
