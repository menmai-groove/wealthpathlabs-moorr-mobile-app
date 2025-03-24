/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import { useThemedStyle } from 'providers';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import EvilIconsIcon from 'react-native-vector-icons/EvilIcons';
import { useSelector } from 'react-redux';
import { selectFlags } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const i18nScope = 'components.financialCardTab';

const FinancialCardTopTab = props => {
  const {
    height = 60,
    topBarHeight,
    tabIndex = 0,
    onChangeTab = () => {},
    type,
    onArchived = () => {},
    onDelete = () => {},
    isArchived,
    assetType,
  } = props;
  const styles = useThemedStyle(themedStyles, '');
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const {
    mobileCardTabs,
    mobileCardTabsInsights,
    mobileCardTabsTransactions,
    insightsMobileOvertimeChart,
  } = useSelector(selectFlags);
  const color = useMemo(() => {
    switch (type) {
      case AppConstants.cardCategory.Asset:
        return '#008FEB';
      case AppConstants.cardCategory.Income:
        return '#38C976';
      case AppConstants.cardCategory.Expense:
        return '#FFA850';
      case AppConstants.cardCategory.Borrowing:
        return '#E34242';

      default:
        break;
    }
  }, [type]);

  const menus = useMemo(() => {
    let result = [];
    if (insightsMobileOvertimeChart) {
      if (mobileCardTabs) {
        result.push({ value: 0, label: t('details') });
      }
      if (mobileCardTabsInsights) {
        result.push({ value: 1, label: t('insights') });
      }
    } else {
      if (mobileCardTabsInsights) {
        result.push({ value: 0, label: t('insights') });
      }
      if (mobileCardTabs) {
        result.push({ value: 1, label: t('details') });
      }
    }
    if (mobileCardTabsTransactions) {
      result.push({ value: 2, label: t('transactions') });
    }
    if (insightsMobileOvertimeChart && assetType === AppConstants.AssetType.LifeInsurance) {
      result = result.filter(r => r.label !== t('insights'));
    }
    return result;
  }, [
    mobileCardTabs,
    mobileCardTabsInsights,
    mobileCardTabsTransactions,
    t,
    insightsMobileOvertimeChart,
  ]);

  useEffect(() => {}, [menus, mobileCardTabsInsights]);

  if (!mobileCardTabs) {
    return <></>;
  }
  return (
    <Animated.View
      style={[
        {
          height,
          opacity: topBarHeight,
        },
        AppStyle.marginBottom10,
      ]}>
      <View style={styles.container}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={AppStyle.flex1}
          style={[AppStyle.flex1, AppStyle.rowFlex]}>
          {menus.map(_ => (
            <AnimatedTouchable
              key={_.value}
              style={[
                styles.tab,
                {
                  height,
                  borderBottomColor: color,
                  borderBottomWidth: tabIndex === _.value ? 3 : 0,
                },
              ]}
              onPress={() => {
                onChangeTab(_.value);
              }}>
              <TextField
                style={[styles.text, { color: tabIndex === _.value ? color : '#C4C4C4' }]}
                font={tabIndex === _.value ? 'medium' : 'regular'}>
                {_.label}
              </TextField>
            </AnimatedTouchable>
          ))}
        </ScrollView>
        <Menu>
          <MenuTrigger>
            <View style={[AppStyle.pad10, AppStyle.padX15]}>
              <EntypoIcon name="dots-three-horizontal" size={16} color={'#541868'} />
            </View>
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                marginTop: 30,
                padding: 5,
                width: 160,
              },
              optionTouchable: {
                activeOpacity: 70,
              },
            }}>
            <MenuOption onSelect={isArchived ? onDelete : onArchived}>
              <View style={{ paddingHorizontal: 5, paddingVertical: 5, flexDirection: 'row' }}>
                <EvilIconsIcon
                  name={isArchived ? 'trash' : 'archive'}
                  size={22}
                  color={isArchived ? '#E34242' : '#541868'}
                />
                <TextField style={{ color: isArchived ? '#E34242' : '#541868', paddingLeft: 5 }}>
                  {isArchived ? t('delete') : t('archive')}
                </TextField>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </Animated.View>
  );
};

export default FinancialCardTopTab;
