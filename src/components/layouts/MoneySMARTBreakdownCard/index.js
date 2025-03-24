import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import { UtilLib } from 'libs';
import { isArray, isNil, isNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.moneySMARTBreakdownCard';

function MoneySMARTBreakdownCard({ label, data, loading }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const _data = useMemo(() => {
    if (isNumber(data)) {
      return data;
    }
    if (isArray(data)) {
      return data;
    }
    if (!isNil(data?.groups)) {
      return data?.groups;
    }
    return null;
  }, [data]);

  useImperativeHandle(ref, () => ({}));

  if (loading) {
    return (
      <View style={styles.simpleCardContainer}>
        <ContentLoader name="moneySMARTBreakdownCard" height={150} />
      </View>
    );
  }

  if (isNil(_data)) {
    return null;
  }

  return (
    <View style={styles.simpleCardContainer}>
      <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
        <View style={[AppStyle.flex3]}>
          <TextField style={styles.titleText} font="semi-bold">
            {label}
          </TextField>
        </View>
        <View style={[AppStyle.flex2, AppStyle.alignEnd, AppStyle.marginLeft10]}>
          <TextField style={styles.titleText} font="semi-bold">
            {typeof _data === 'number'
              ? UtilLib.formatCurrency(_data, '$')
              : typeof _data === 'object' && _data.length === 0
              ? UtilLib.formatCurrency(0, '$')
              : t(`${i18nScope}.total`)}
          </TextField>
        </View>
      </View>
      {typeof _data === 'object' &&
        _data.length > 0 &&
        _data.map((item, index) => {
          return (
            <View
              key={`row-${index}`}
              style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginTop15]}>
              <View style={[AppStyle.flex3]}>
                <TextField style={styles.valueText} font="regular">
                  {item.key}
                </TextField>
              </View>
              <View style={[AppStyle.flex2, AppStyle.alignEnd, AppStyle.marginLeft10]}>
                <TextField style={[styles.valueText]} font="medium">
                  {UtilLib.formatCurrency(item?.total, '$')}
                </TextField>
              </View>
            </View>
          );
        })}
    </View>
  );
}

export default forwardRef(MoneySMARTBreakdownCard);
