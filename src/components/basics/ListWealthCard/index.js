/* eslint-disable quotes */
import CustomGauge from 'components/basics/CustomGauge';
import WealthCLOCK from 'components/basics/CustomGauge/components/WealthCLOCK';
import Swiper from 'components/basics/Swiper';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { useThemedStyle } from 'providers';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { selectWealthData, selectWeathLoading } from 'store/Wealth/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const ListWealthCard = ({
  showTextSeeDetails,
  onPressGauge = () => {},
  onPressDetail = () => {},
  initialIndex = 0,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const wealthData = useSelector(selectWealthData);
  const loading = useSelector(selectWeathLoading);
  const {
    wealthCLOCK,
    wealthSPEED,
    assetSpeed,
    incomeSpeed,
    savingSpeed,
    spendingSpeed,
    debtReductionSpeed,
    netWorthPosition,
  } = wealthData;
  const networthValue = netWorthPosition?.netWorth || 0;
  const [pageIndex, setPageIndex] = useState(initialIndex);

  const renderGauge = useCallback(
    (data = {}, level = 1, selected) => {
      const { key } = data;
      const isSpendingSpeed = key === AppConstants.wealthKeys.spendingSpeed;
      let latestDateFormat;
      let previousDateFormat;
      switch (level) {
        case 1:
          latestDateFormat = "DD MMM 'YY h:mm:ssa";
          previousDateFormat = "DD MMM 'YY";
          break;
        case 2:
          latestDateFormat = "DD MMM 'YY";
          break;
        case 3:
          latestDateFormat = "DD MMM 'YY";
          break;

        default:
          break;
      }
      return (
        <View style={[styles.chartContainer, AppStyle.alignContent]}>
          {data.key === AppConstants.wealthKeys.wealthCLOCK ? (
            <WealthCLOCK
              loading={loading}
              level={level}
              content={{
                title: data.info.label,
                latest: data.latest,
                previous: data.previous,
                money: data.money,
                percent: data.percent,
              }}
              type={data.key}
              size={300}
              selected={selected}
              onSelect={() => typeof onPressGauge === 'function' && onPressGauge(data)}
              trademark={data.info.trademark}
              style={{ progress: { color: data.info.color } }}
              latestDateFormat={latestDateFormat}
              previousDateFormat={previousDateFormat}
              wealthSPEED={wealthSPEED}
              networthValue={networthValue}
            />
          ) : (
            <CustomGauge
              loading={loading}
              level={level}
              content={{
                title: data.info.label,
                latest: data.latest,
                previous: data.previous,
                money: data.money,
                percent: data.percent,
              }}
              type={data.key}
              size={300}
              selected={selected}
              onSelect={() => typeof onPressGauge === 'function' && onPressGauge(data)}
              trademark={data.info.trademark}
              style={[
                {
                  progress: { color: data.info.color },
                },
                ...(isSpendingSpeed
                  ? [
                      {
                        percentNumberNegative: styles.percentNumberNegative,
                        percentNumber: styles.percentNumber,
                      },
                    ]
                  : []),
              ]}
              latestDateFormat={latestDateFormat}
              previousDateFormat={previousDateFormat}
            />
          )}
          <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignEnd]}>
            <View style={[AppStyle.flex1, styles.width0]} />

            <View style={[AppStyle.flex1, AppStyle.marginLeft10, AppStyle.alignEnd, styles.width0]}>
              <TouchableField
                onPress={() =>
                  typeof onPressDetail === 'function' ? onPressDetail(data, pageIndex) : null
                }>
                <View
                  style={[
                    AppStyle.rowFlex,
                    styles.seeDetailsContainer,
                    AppStyle.padLeft25,
                    AppStyle.padTop25,
                  ]}>
                  {showTextSeeDetails && (
                    <TextField type="captain" style={[styles.seeDetailsText]}>
                      {t(`screens.home.seeDetails`)}
                    </TextField>
                  )}
                  <IonIcon
                    style={AppStyle.marginLeft5}
                    name="arrow-forward-circle"
                    size={14}
                    color={styles.seeDetailsIcon.color}
                  />
                </View>
              </TouchableField>
            </View>
          </View>
        </View>
      );
    },
    [
      styles,
      t,
      showTextSeeDetails,
      onPressGauge,
      onPressDetail,
      loading,
      pageIndex,
      wealthSPEED,
      networthValue,
    ],
  );

  return (
    <Swiper
      key={'wealth'}
      views={[
        {
          view: renderGauge(wealthCLOCK, 1, pageIndex === 0),
        },
        {
          view: renderGauge(wealthSPEED, 2, pageIndex === 1),
        },
        {
          view: renderGauge(assetSpeed, 2, pageIndex === 2),
        },
        {
          view: renderGauge(savingSpeed, 2, pageIndex === 3),
        },
        {
          view: renderGauge(debtReductionSpeed, 2, pageIndex === 4),
        },
        {
          view: renderGauge(incomeSpeed, 2, pageIndex === 5),
        },
        {
          view: renderGauge(spendingSpeed, 2, pageIndex === 6),
        },
      ]}
      onChangePage={page => {
        setPageIndex(page);
      }}
      initialIndex={initialIndex}
    />
  );
};

export default ListWealthCard;
