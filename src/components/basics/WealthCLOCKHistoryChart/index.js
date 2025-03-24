import DropDownForForm from 'components/basics/DropDownForForm';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import util, { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { processColor, View } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.wealthCLOCKChart';

const WealthCLOCKHistoryChart = ({
  borderColor,
  style,
  title,
  chartLabel,
  onChangeFilter,
  dropdownFilterData = [],
  dropdownValue,
  data = {},
  loading = false,
}) => {
  const CONFIG_LINECHART_1 = {
    lineWidth: 1,
    drawValues: false,
    drawCircles: false,
    color: processColor('#008FEB'),

    mode: 'CUBIC_BEZIER',
    drawCubicIntensity: 0.01,
    highlightEnabled: true,
    valueTextSize: 16,
  };
  const CONFIG_LINECHART_2 = {
    lineWidth: 1,
    drawValues: false,
    drawCircles: false,
    color: processColor('#541868'),

    mode: 'CUBIC_BEZIER',
    drawCubicIntensity: 0.01,
    highlightEnabled: true,

    valueTextSize: 16,
  };
  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle });
  const [currentWidthChartLabel, setCurrentWidthChartLabel] = useState(0);

  const [layoutRendered, setLayoutRendered] = useState(false);

  const dataSets = useMemo(() => {
    return {
      dataSets: [
        {
          values: data.projection ?? [],
          label: t(`${i18nScope}.projection`),
          config: CONFIG_LINECHART_1,
        },
        {
          values: data.actual ?? [],
          label: t(`${i18nScope}.actual`),
          config: CONFIG_LINECHART_2,
        },
      ],
    };
  }, [CONFIG_LINECHART_1, CONFIG_LINECHART_2, data, t]);

  const xAxis = useMemo(
    () => ({
      drawGridLines: false,
      position: 'BOTTOM',
      labelRotationAngle: -90,
      valueFormatter: 'date',
      locale: 'en-AU',
      valueFormatterPattern:
        dropdownValue?.value === '2Y' ||
        dropdownValue?.value === '3Y' ||
        dropdownValue?.value === 'ALL'
          ? 'MMM YY'
          : 'MMM',
      textColor: processColor('black'),

      labelCount: data.length >= 12 ? 12 : data.length,
      labelCountForce: true,
    }),
    [dropdownValue, data],
  );
  const yAxis = useMemo(() => {
    return {
      left: {
        drawGridLines: true,
        drawLabels: true,
        valueFormatter: '$#',
        labelCount: 9,
        textColor: processColor('black'),
      },
      right: { enabled: false },
    };
  }, []);
  const onLayout = useCallback(() => {
    setTimeout(() => {
      setLayoutRendered(true);
    }, 500);
  }, []);

  const onLayoutChartLable = ({ nativeEvent }) => {
    // if (currentWidthChartLabel === 0) {
    const { width } = nativeEvent.layout;
    setCurrentWidthChartLabel(width);
    // }
  };

  return (
    <View style={[styles.container, AppStyle.padLeft10]}>
      <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
        <View style={[styles.rangeSelector, AppStyle.marginX10]} />
        {typeof title === 'function' ? (
          <View style={[AppStyle.flex1]}>{title()}</View>
        ) : (
          <View style={[AppStyle.flex1]}>
            <TextField type="heading-3" style={[AppStyle.textCenter]}>
              {title}
            </TextField>
          </View>
        )}
        <View style={[styles.rangeSelector, AppStyle.marginX10]}>
          <DropDownForForm
            showsVerticalScrollIndicator={false}
            value={dropdownValue}
            options={dropdownFilterData}
            onSelect={index => {
              // setDropdownValue(dropdownFilterData[index]);
              typeof onChangeFilter === 'function' && onChangeFilter(dropdownFilterData[index]);
            }}
          />
        </View>
      </View>
      {loading ? (
        <ContentLoader
          name="customChart"
          height={util.safePositiveValue(styles.container?.height - 60)}
        />
      ) : (
        <View
          style={[styles.wrapperChart, AppStyle.rowFlex]}
          onLayout={!layoutRendered && onLayout}>
          {!layoutRendered && (
            <ContentLoader
              name="customChart"
              height={util.safePositiveValue(styles.container?.height - 60)}
            />
          )}
          {chartLabel && layoutRendered && (
            <View
              style={[
                styles.yTitle,
                currentWidthChartLabel > 0 && {
                  transform: [{ rotate: '270deg' }],
                  left: -currentWidthChartLabel / 2 + 18,
                },
              ]}
              onLayout={onLayoutChartLable}>
              <TextField style={styles.yTitleText}>{chartLabel}</TextField>
            </View>
          )}

          <LineChart
            style={[styles.chart, chartLabel && AppStyle.marginLeft30]}
            data={dataSets}
            chartDescription={{ text: '' }}
            legend={{
              enabled: true,
              textSize: 14,
              fontFamily: 'Poppins-Regular',
              form: 'LINE',
              formSize: 24,
              verticalAlignment: 'TOP',
              horizontalAlignment: 'CENTER',
              xEntrySpace: 30,
              yEntrySpace: 0,
              formToTextSpace: 10,
              wordWrapEnabled: true,
              maxSizePercent: 1,
            }}
            marker={{
              enabled: true,
              markerColor: processColor(styles.marker.color),
              textColor: processColor('white'),
              markerFontSize: 16,
              textAlign: 'center',
            }}
            borderColor={borderColor}
            borderWidth={1}
            yAxis={yAxis}
            xAxis={xAxis}
            // onChange={event => console.log(event.nativeEvent)}
            // ref=
            scaleYEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

export default WealthCLOCKHistoryChart;
