/* eslint-disable quotes */
import BackgroundTimerBySecond from 'components/basics/BackgroundTimer';
import WealthCLOCKSVG from 'components/basics/CustomGauge/svgs/wealthCLOCK';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import util, { formatCurrency, mergeArrayObjectIntoObject } from 'libs/util';
import { isNaN, isNil, isNumber } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { AppStyle } from 'theme';

import themedStyles from '../style';

const i18nScope = 'components.customGauge';

const STICK_LENGTH = 8;

function WealthCLOCK(
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
    latestDateFormat = "DD MMM 'YY",
    previousDateFormat = "DD MMM 'YY",
    loading = false,
    wealthSPEED = 0,
    networthValue = 0,
  },
  ref,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const { t } = useTranslation();

  const [wealthCLOCKValue, setWealthCLOCKValue] = useState({
    value: networthValue,
    percent: 0,
    datetime: moment().unix(),
  });
  const [newKey, setNewKey] = useState(Math.random());

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    if (content && wealthSPEED !== null) {
      setNewKey(Math.random() * 999999);
    }
  }, [content, wealthSPEED]);

  const renderPercent = useCallback(percent => {
    if (isNil(percent) || isNaN(percent)) {
      return '+0%';
    }
    if (isNumber(percent)) {
      return percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
    }
    return percent;
  }, []);

  const titleContent = useMemo(() => {
    return <WealthCLOCKSVG />;
  }, []);

  const onChange = useCallback(
    currentTime => {
      const diff = currentTime - moment(content.latest).unix();
      const newValue = networthValue + (Math.max(diff, 0) / 3600) * wealthSPEED.money;
      const newPercent = networthValue === 0 ? 0 : (newValue / networthValue - 1) * 100;
      const result = { value: newValue, percent: newPercent, datetime: currentTime };
      setWealthCLOCKValue(result);
    },
    [content, wealthSPEED, networthValue],
  );

  const renderContentV1 = useCallback(() => {
    const defaultSizeChart = size;
    const defaultViewBox = 193;
    const ratioRN = defaultSizeChart / defaultViewBox;

    const defaultDateTextFS = 9;
    const currentDateTextObject = {
      fontSize: defaultDateTextFS * ratioRN,
      lineHeight: defaultDateTextFS * ratioRN * 1.5,
    };

    const currencyTextFS = 19;
    const percentNumberTextFS = 12;

    const currencyTextObjet = {
      fontSize: currencyTextFS * ratioRN,
      lineHeight: currencyTextFS * ratioRN * 1.5,
    };
    const percentNumberObject = {
      fontSize: percentNumberTextFS * ratioRN,
      lineHeight: percentNumberTextFS * ratioRN * 1.5,
    };
    const previousDateTextObject = {
      fontSize: defaultDateTextFS * ratioRN,
      lineHeight: defaultDateTextFS * ratioRN * 1.5,
    };

    return (
      <View
        style={[
          AppStyle.absolute,
          {
            height: size,
            top: (size * 79) / defaultViewBox - 9 * ratioRN,
            width: size - strokeWidth * 2,
          },
        ]}>
        <View style={[AppStyle.alignContent]}>
          <TextField
            style={[styles.currentDateText, currentDateTextObject]}
            type="paragraph-2"
            numberOfLines={1}>
            {moment(wealthCLOCKValue?.datetime, 'X').format(latestDateFormat)}
          </TextField>
          <View style={styles.underline}>
            <TextField
              type="heading-1"
              style={[styles.currencyText, currencyTextObjet]}
              numberOfLines={1}>
              {formatCurrency(wealthCLOCKValue?.value, '$', { decimal: 2 })}
            </TextField>
          </View>
        </View>

        <View style={[AppStyle.alignContent, AppStyle.marginTop10]}>
          <TextField
            style={[
              isNumber(wealthCLOCKValue?.percent) && wealthCLOCKValue?.percent < 0
                ? styles.percentNumberNegative
                : styles.percentNumber,
              percentNumberObject,
            ]}
            numberOfLines={1}>
            {renderPercent(wealthCLOCKValue?.percent)}
          </TextField>

          <TextField type="captain" style={previousDateTextObject}>
            {t(`${i18nScope}.since`)}
          </TextField>
          <TextField
            type="captain"
            style={[styles.previousDateText, previousDateTextObject]}
            numberOfLines={1}>
            {moment().format(previousDateFormat)}
          </TextField>
        </View>
      </View>
    );
  }, [
    styles,
    size,
    latestDateFormat,
    previousDateFormat,
    renderPercent,
    t,
    strokeWidth,
    wealthCLOCKValue,
  ]);

  const renderSticks = useCallback(() => {
    return [...Array(STICK_LENGTH).keys()].map((_, index) => {
      const deltaTheta = 360 / STICK_LENGTH;
      const isEven = index % 2 === 0;
      return (
        <View
          key={`stick-${index}`}
          style={[
            styles.stickContainer,
            {
              transform: [
                {
                  rotate: `${deltaTheta * index}deg`,
                },
              ],
            },
          ]}>
          <View
            style={[
              styles.stick,
              isEven ? styles.evenOpacity : styles.oddOpacity,
              {
                left: strokeWidth,
                top: size / 2,
                borderColor: styles.progress.color,
              },
            ]}
          />
        </View>
      );
    });
  }, [size, strokeWidth, styles]);

  if (loading) {
    return (
      <View style={[contentStyle]}>
        <ContentLoader name="gauge" height={util.safePositiveValue(size)} />
      </View>
    );
  }

  const defaultSizeChart = 270;
  strokeWidth = (size * strokeWidth) / defaultSizeChart;
  return (
    <View style={[contentStyle]}>
      <TouchableField
        style={[
          styles.progressContainer,
          {
            borderRadius: size / 2,
          },
          selected && Platform.OS === 'android' && styles.shadow,
        ]}
        onPress={() => {
          typeof onSelect === 'function' && onSelect(!selected);
        }}
        activeOpacity={1}>
        <View
          style={[
            styles.background,
            {
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
              borderRadius: size / 2,
              top: strokeWidth,
            },
          ]}
        />
        <ProgressCircle
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            selected && Platform.OS === 'ios' && styles.shadow,
          ]}
          progress={1}
          progressColor={styles.progress.color}
          strokeWidth={util.safePositiveValue(strokeWidth)}>
          {renderSticks()}
          <View style={[AppStyle.justifyContent, AppStyle.alignContent]}>{renderContentV1()}</View>
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
      <BackgroundTimerBySecond
        key={`${newKey}-WealthCLOCK`}
        useBackgroundTimer
        onChange={onChange}
      />
    </View>
  );
}

export default forwardRef(WealthCLOCK);
