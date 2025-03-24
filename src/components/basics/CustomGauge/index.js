/* eslint-disable quotes */
import AssetSPEEDSVG from 'components/basics/CustomGauge/svgs/assetSPEED';
import DebtReductionSPEEDSVG from 'components/basics/CustomGauge/svgs/debtReductionSPEED';
import IncomeSPEEDSVG from 'components/basics/CustomGauge/svgs/incomeSPEED';
import SavingSPEEDSVG from 'components/basics/CustomGauge/svgs/savingSPEED';
import SpendingSPEEDSVG from 'components/basics/CustomGauge/svgs/spendingSpeed';
import WealthCLOCKSVG from 'components/basics/CustomGauge/svgs/wealthCLOCK';
import WealthSPEEDSVG from 'components/basics/CustomGauge/svgs/wealthSPEED';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants } from 'constant';
import util, { formatCurrency, mergeArrayObjectIntoObject } from 'libs/util';
import { isNil, isNumber } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { ProgressCircle } from 'react-native-svg-charts';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.customGauge';

function CustomGauge(
  {
    contentStyle,
    style,
    size = 240, // size > 250 android clipped bottom
    strokeWidth = 240 / 12, // default value = 20
    content = {
      title: null,
      latest: new Date().toISOString(),
      previous: new Date().toISOString(),
      money: null,
      percent: null,
    },
    selected = false,
    onSelect = () => {},
    level = 1,
    latestDateFormat = "DD MMM 'YY",
    previousDateFormat = "DD MMM 'YY",
    type,
    loading = false,
  },
  ref,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const { t } = useTranslation();

  // const [wealthCLOCKValue, setWealthCLOCKValue] = useState(content.money);
  // const [wealthCLOCKDatetime, setWealthCLOCKDatetime] = useState(moment().unix());

  useImperativeHandle(ref, () => ({}));

  const renderPercent = useCallback(percent => {
    if (isNil(percent)) {
      return '+0%';
    }
    if (isNumber(percent)) {
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    }
    return percent;
  }, []);

  const renderContentV3 = useCallback(
    ({ selected: selectedInput }) => {
      const defaultDateTextFS = 8;
      const defaultSizeChart = 80;
      const fontSize = (size * defaultDateTextFS) / defaultSizeChart;
      const lineHeight = fontSize * 1.5;
      const currentDateTextObject = { fontSize, lineHeight };
      const currencyTextObjet = {
        fontSize: (fontSize * 14) / defaultDateTextFS,
        lineHeight: (lineHeight * 12) / defaultDateTextFS,
      };
      const unitCurrencyTextObjet = {
        fontSize: (fontSize * 12) / defaultDateTextFS,
        lineHeight: (lineHeight * 10) / defaultDateTextFS,
      };
      const percentNumberObject = {
        fontSize: (fontSize * 11) / defaultDateTextFS,
        lineHeight: (lineHeight * 11) / defaultDateTextFS,
      };
      const previousDateTextObject = {
        fontSize,
        lineHeight,
      };
      return (
        <View
          style={[
            AppStyle.justifyContent,
            AppStyle.marginLeft30,
            AppStyle.padRight25,
            AppStyle.marginTop5,
            {
              width: size + 20,
              height: size - 5,
            },
          ]}>
          <View>
            <TextField
              style={[styles.currencyTextColor, currentDateTextObject]}
              type="captain"
              numberOfLines={1}>
              {moment(content.latest).format(latestDateFormat)}
            </TextField>

            <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
              <TextField
                type="captain"
                style={[styles.currencyText, currencyTextObjet]}
                numberOfLines={1}>
                {formatCurrency(content.money)}
              </TextField>
              <TextField style={[styles.currencyTextColor, unitCurrencyTextObjet]}>
                {' p/hr'}
              </TextField>
            </View>
          </View>

          {selectedInput ? (
            <View
              style={[
                styles.bottomTextContainer,
                {
                  left: size / 2 - 25,
                },
              ]}>
              <TextField
                type="captain"
                style={[
                  isNumber(content.percent) && content.percent < 0
                    ? styles.percentNumberNegative
                    : styles.percentNumber,
                  percentNumberObject,
                ]}
                numberOfLines={1}>
                {renderPercent(content.percent)}
              </TextField>
              <TextField
                type="captain"
                style={[styles.currencyTextColor, previousDateTextObject]}
                numberOfLines={1}>
                {t(`${i18nScope}.since`)} {moment(content.previous).format(previousDateFormat)}
              </TextField>
            </View>
          ) : null}
        </View>
      );
    },
    [size, styles, content, latestDateFormat, renderPercent, t, previousDateFormat],
  );

  const renderContentV2 = useCallback(() => {
    const defaultSizeChart = size;
    const defaultViewBox = 193;
    const ratioRN = defaultSizeChart / defaultViewBox;

    const defaultDateTextFS = size < 200 ? 11 : 9;
    const currentDateTextObject = {
      fontSize: defaultDateTextFS * ratioRN,
      lineHeight: defaultDateTextFS * ratioRN * 1.5,
    };

    const currencyTextFS = size < 200 ? 17 : 16;
    const unitCurrencyTextFS = size < 200 ? 15 : 14;

    const currencyTextObjet = {
      fontSize: currencyTextFS * ratioRN,
      lineHeight: currencyTextFS * ratioRN * 1.5,
    };
    const unitCurrencyTextObjet = {
      fontSize: unitCurrencyTextFS * ratioRN,
      lineHeight: unitCurrencyTextFS * ratioRN * 1.5,
    };
    const percentNumberObject = {
      fontSize: unitCurrencyTextFS * ratioRN,
      lineHeight: unitCurrencyTextFS * ratioRN * 1.5,
    };
    const previousDateTextObject = {
      fontSize: defaultDateTextFS * ratioRN,
      lineHeight: defaultDateTextFS * ratioRN * 1.2,
    };
    return (
      <View
        style={[
          AppStyle.absolute,
          {
            height: size,
            top: (size * 90) / defaultViewBox - 9 * ratioRN,
            left: (size * 40) / defaultViewBox,
            right: size - (size * 153) / defaultViewBox,
          },
        ]}>
        <View style={styles.underline}>
          <TextField
            style={[styles.currentDateText, currentDateTextObject]}
            type="captain"
            numberOfLines={1}>
            {moment(content.latest).format(latestDateFormat)}
          </TextField>
          <View style={[AppStyle.alignContent, AppStyle.rowFlex, AppStyle.justifyContent]}>
            <TextField
              type="heading-1"
              style={[styles.currencyText, currencyTextObjet]}
              numberOfLines={1}>
              {formatCurrency(content.money)}
            </TextField>
            <TextField style={[styles.currencyTextColor, unitCurrencyTextObjet]}>
              {' p/hr'}
            </TextField>
          </View>
        </View>

        <View style={[AppStyle.alignEnd, AppStyle.marginTop5]}>
          <TextField
            style={[
              isNumber(content.percent) && content.percent < 0
                ? styles.percentNumberNegative
                : styles.percentNumber,
              percentNumberObject,
            ]}
            numberOfLines={1}>
            {renderPercent(content.percent)}
          </TextField>
          <TextField
            type="captain"
            style={[styles.previousDateText, previousDateTextObject]}
            numberOfLines={1}>
            {t(`${i18nScope}.since`)} {moment(content.previous).format(previousDateFormat)}
          </TextField>
        </View>
      </View>
    );
  }, [content, styles, size, latestDateFormat, previousDateFormat, renderPercent, t]);

  const titleContent = useMemo(() => {
    switch (type) {
      case AppConstants.wealthKeys.wealthSPEED:
        return <WealthSPEEDSVG />;
      case AppConstants.wealthKeys.wealthCLOCK:
        return <WealthCLOCKSVG />;
      case AppConstants.wealthKeys.incomeSpeed:
        return <IncomeSPEEDSVG />;
      case AppConstants.wealthKeys.savingSpeed:
        return <SavingSPEEDSVG />;
      case AppConstants.wealthKeys.assetSpeed:
        return <AssetSPEEDSVG />;
      case AppConstants.wealthKeys.debtReductionSpeed:
        return <DebtReductionSPEEDSVG />;
      case AppConstants.wealthKeys.spendingSpeed:
        return <SpendingSPEEDSVG />;

      default:
        return <></>;
    }
  }, [type]);

  const GradientLevel3 = useCallback(
    ({ index, color }) => (
      <Defs key={`gradient-defs-${index}-level-3`}>
        <LinearGradient id={'gradient-level-3'} x1={0} y1={0} x2={1} y2={-0.5}>
          <Stop offset={'0%'} stopColor={color} stopOpacity={1} />
          <Stop offset={'100%'} stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
    ),
    [],
  );

  const GradientLevel2 = useCallback(
    ({ index, color }) => (
      <Defs key={`gradient-defs-${index}-level-2`}>
        <LinearGradient id={'gradient-level-2'} x1={0} y1={0} x2={1} y2={-0.5}>
          <Stop offset={'0%'} stopColor={color} stopOpacity={1} />
          <Stop offset={'100%'} stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
    ),
    [],
  );

  if (loading) {
    return (
      <View style={[contentStyle]}>
        <ContentLoader name="gauge" height={util.safePositiveValue(size)} />
      </View>
    );
  }

  if (level === 3) {
    return (
      <TouchableField
        style={[contentStyle]}
        onPress={() => {
          typeof onSelect === 'function' && onSelect(!selected);
        }}
        activeOpacity={1}>
        {renderContentV3({ selected })}
        <View style={[styles.progressContainer, styles.absolute]}>
          <ProgressCircle
            style={[{ width: size, height: size }]}
            progress={1}
            startAngle={-Math.PI}
            endAngle={Math.PI * 0.25}
            progressColor={selected ? styles.progress.color : 'url(#gradient-level-3)'}
            strokeWidth={util.safePositiveValue(strokeWidth)}
            cornerRadius={0}>
            <GradientLevel3 color={styles.progress.color} />
          </ProgressCircle>
        </View>
      </TouchableField>
    );
  }

  if (level === 2) {
    const defaultSizeChart = 270;
    strokeWidth = (size * strokeWidth) / defaultSizeChart;
    return (
      <View style={[contentStyle]}>
        <TouchableField
          style={[styles.progressContainer]}
          onPress={() => {
            typeof onSelect === 'function' && onSelect(!selected);
          }}
          activeOpacity={1}>
          <ProgressCircle
            style={[
              {
                width: size,
                height: size,
              },
            ]}
            progress={1}
            startAngle={-Math.PI * 0.75}
            endAngle={Math.PI * 0.75}
            progressColor={selected ? styles.progress.color : 'url(#gradient-level-2)'}
            strokeWidth={util.safePositiveValue(strokeWidth)}
            cornerRadius={0}>
            <GradientLevel2 color={styles.progress.color} />
            <View style={[AppStyle.justifyContent, AppStyle.alignContent]}>
              {renderContentV2()}
            </View>
          </ProgressCircle>
          <View
            style={[
              AppStyle.justifyContent,
              AppStyle.alignContent,
              styles.contentV2,
              { width: size, height: size },
            ]}>
            {titleContent}
          </View>
        </TouchableField>
      </View>
    );
  }

  return <></>;
}

export default forwardRef(CustomGauge);
