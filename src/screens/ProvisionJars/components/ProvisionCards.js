import CustomCard from 'components/basics/CustomCard';
import Marquee from 'components/basics/Marquee';
import ProgressBar from 'components/basics/ProgressBar';
import TextField from 'components/basics/TextField';
import { AppScreenID } from 'constant';
import { NavigationServiceLib } from 'libs';
import { formatCurrency } from 'libs/util';
import { isArray, isNil } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useThemedStyle } from 'providers';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.provisionsJar';

export default function ProvisionCards({ cardList = [], isPreviousProvision }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();

  const getArchivedDateRange = useCallback(item => {
    const { archivedAndPreviousDateRange } = item;
    const list = archivedAndPreviousDateRange.map(x => {
      return moment(x.from).format('DD MMM YYYY') + ' to ' + moment(x.to).format('DD MMM YYYY');
    });
    return list.join(', ');
  }, []);

  const renderModalCard = useCallback(
    ({ item, index }) => {
      const isLast = index === cardList.length - 1;
      const onPress = () => {
        NavigationServiceLib.navigate(AppScreenID.ProvisionExpenseScreen, {
          _id: item.expense?._id,
          name: item.expense?.name,
          isPreviousProvision: isPreviousProvision,
        });
      };
      if (isNil(item)) {
        return null;
      }
      return (
        <CustomCard
          containerStyle={[
            styles.cardContainer,
            isLast && AppStyle.marginBottom0,
            item?.isArchived && styles.cardArchived,
          ]}
          style={[
            {
              contentStyle: styles.cartContentStyle,
            },
          ]}
          key={index}
          id={item.expense?._id || index}
          onPress={onPress}
          title={() => (
            <View style={styles.cartTitleContainer}>
              <View style={AppStyle.flex1}>
                <TextField font="medium" style={styles.cartTitle} numberOfLines={2}>
                  {item.expense?.name}
                </TextField>
              </View>
              <View style={styles.cartPriceContainer}>
                <TextField font="medium" style={styles.cartTitle}>
                  {formatCurrency(item.totalAmount)}
                </TextField>
                <FontAwesome5Icon
                  style={styles.cartArrow.iconStyle}
                  name="chevron-circle-right"
                  size={12}
                  color={styles.cartArrow.iconColor}
                />
              </View>
            </View>
          )}
          description={() => (
            <ProgressBar
              progress={item.spentAmount / item.totalAmount}
              barStyle={
                item.remainingAmount >= 0
                  ? item?.isArchived
                    ? styles.progressBarArchived
                    : styles.progressBar
                  : styles.progressOverloadBar
              }>
              {item?.archivedAndPreviousDateRange && (
                <View style={styles.titleOnProgressBar}>
                  <Marquee
                    style={[
                      styles.textTitleOnProgressBar,
                      // (item.remainingAmount < 0 || !item?.isArchived) &&
                      //   styles.textTitleOnProgressOverloadBar,
                    ]}
                    speed={0.5}
                    marqueeOnStart={true}
                    loop={true}
                    delay={1500}>
                    {'Active between ' + getArchivedDateRange(item)}
                  </Marquee>
                </View>
              )}
            </ProgressBar>
          )}
          renderFooter={() => (
            <View style={styles.cartFooterContainer}>
              <TextField style={styles.cartFooterText}>
                {t(`${i18nScope}.numberSpent`, {
                  number: formatCurrency(item.spentAmount),
                })}
              </TextField>
              <TextField style={styles.cartFooterText}>
                {t(`${i18nScope}.numberRemaining`, {
                  number: formatCurrency(item.remainingAmount),
                })}
              </TextField>
            </View>
          )}
        />
      );
    },
    [styles, t, cardList],
  );

  if (!isArray(cardList)) {
    return null;
  }
  return cardList.map((item, index) => renderModalCard({ item, index }));
}

ProvisionCards.propTypes = {
  cardList: PropTypes.arrayOf(
    PropTypes.shape({
      expense: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
      remainingAmount: PropTypes.number,
      spentAmount: PropTypes.number,
      totalAmount: PropTypes.number,
      transactions: PropTypes.array,
    }),
  ).isRequired,
};
