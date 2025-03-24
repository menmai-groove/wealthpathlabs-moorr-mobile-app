import Condition from 'components/basics/Condition';
import CustomChart from 'components/basics/CustomChart';
import DropDownForForm from 'components/basics/DropDownForForm';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import LegendSVG from 'components/basics/WealthChart/legendSvg';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import util, { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.wealthCLOCKChart';

const WealthChart = ({
  style,
  title,
  chartLabel,
  chartHeight = 300,
  onChangeFilter,
  dropdownFilterData = [],
  dropdownValue,
  data = [],
  loading = false,
  type,
  onClickLegend,
}) => {
  const { t } = useTranslation();
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle });
  const [currentWidthChartLabel, setCurrentWidthChartLabel] = useState(0);
  const chartRef = useRef(null);
  const onLayoutChartLable = ({ nativeEvent }) => {
    const { width } = nativeEvent.layout;
    setCurrentWidthChartLabel(width);
  };
  const legendSelected = useMemo(() => {
    if (data.length === 1) {
      return data[0].id;
    }
    return null;
  }, [data]);

  return (
    <View style={[styles.container, AppStyle.padX10]}>
      <View style={[AppStyle.rowFlex, AppStyle.middleContent]}>
        <View style={[AppStyle.flex2, AppStyle.marginRight10]}>
          {typeof title === 'function' ? (
            <View style={[AppStyle.flex2, AppStyle.justifyContent]}>{title()}</View>
          ) : (
            <View style={[AppStyle.flex2, AppStyle.justifyContent]}>
              <TextField type="heading-3">{title}</TextField>
            </View>
          )}
        </View>
        <View style={[AppStyle.flex1, AppStyle.alignEnd]}>
          <View style={[styles.rangeSelector]}>
            <DropDownForForm
              showsVerticalScrollIndicator={false}
              value={dropdownValue}
              options={dropdownFilterData}
              onSelect={index => {
                typeof onChangeFilter === 'function' && onChangeFilter(dropdownFilterData[index]);
              }}
            />
          </View>
        </View>
      </View>
      <Condition display={type === AppConstants.wealthKeys.wealthCLOCK}>
        <View style={[AppStyle.rowFlex, AppStyle.marginY15, AppStyle.selfAlignCenter]}>
          <TouchableField
            style={[AppStyle.rowFlex]}
            onPress={() => {
              if (typeof onClickLegend === 'function') {
                onClickLegend(legendSelected === 'actual' ? null : 'actual');
                chartRef.current?.clearTooltip();
              }
            }}>
            <LegendSVG color="#541868" />
            <TextField
              style={[AppStyle.marginRight25, AppStyle.padLeft10]}
              font={legendSelected === 'actual' ? 'bold' : 'regular'}>
              {t(`${i18nScope}.actual`)}
            </TextField>
          </TouchableField>
          <TouchableField
            style={[AppStyle.rowFlex]}
            onPress={() => {
              if (typeof onClickLegend === 'function') {
                onClickLegend(legendSelected === 'projection' ? null : 'projection');
                chartRef.current?.clearTooltip();
              }
            }}>
            <LegendSVG color="#008FEB" />
            <TextField
              style={[AppStyle.padLeft10]}
              font={legendSelected === 'projection' ? 'bold' : 'regular'}>
              {t(`${i18nScope}.projection`)}
            </TextField>
          </TouchableField>
        </View>
      </Condition>

      <View style={[AppStyle.marginTop10]}>
        {loading ? (
          <View style={[chartLabel && AppStyle.marginLeft20]}>
            <ContentLoader name="customChart" height={util.safePositiveValue(chartHeight)} />
          </View>
        ) : (
          <>
            <CustomChart
              type="range-chart"
              data={data}
              width={AppConstants.graphWidth}
              color={styles.netWorthLineChart.color}
              valueAccessor={item => item.value}
              formatValue={value => UtilLib.formatCurrency(value)}
              diff={0.2}
              scrollToEnd
              contentInset={{
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
              }}
            />
            {/* <CustomChart
              type={
                type === AppConstants.wealthKeys.wealthCLOCK ? 'multi-line-chart' : 'area-chart'
              }
              style={[chartLabel && AppStyle.marginLeft20]}
              data={data}
              color={styles.netWorthLineChart.color}
              labelAccessor={item => item.label}
              valueAccessor={item => item.value}
              formatLabel={label => {
                const date = label;
                const formatDateByRange = UtilLib.formatWealthChartLabel(
                  date,
                  dropdownValue?.value,
                );
                return formatDateByRange;
              }}
              formatValue={value => UtilLib.formatCurrency(value)}
              diff={type === AppConstants.wealthKeys.wealthCLOCK ? 0 : 0.2}
              height={chartHeight}
              ref={chartRef}
              contentInset={{
                top: 20,
                bottom: 20,
                left: 40,
                right: 40,
              }}
            /> */}
          </>
        )}
        {chartLabel && (
          <View
            style={[
              styles.yTitle,
              currentWidthChartLabel > 0 && {
                transform: [{ rotate: '270deg' }],
                left: -currentWidthChartLabel / 2 + 8,
                top: chartHeight / 2,
              },
            ]}
            onLayout={onLayoutChartLable}>
            <TextField style={styles.yTitleText}>{chartLabel}</TextField>
          </View>
        )}
      </View>
    </View>
  );
};

export default WealthChart;
