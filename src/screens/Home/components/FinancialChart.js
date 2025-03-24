import CustomChart from 'components/basics/CustomChart';
import { Y_AXIS_WIDTH } from 'components/basics/FinancialTemplate/FinancialTemplate';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import util, { formatCurrency } from 'libs/util';
import { debounce } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppStyle } from 'theme';

const FinancialChart = React.memo(function FinancialChart({
  graphTitle,
  color,
  timeIndex = 3,
  data,
  totalValue = 0,
  onPress,
  loadingDuration = 1000,
}) {
  const [loading, setLoading] = useState(true);
  const [graphWidth, setGraphWidth] = useState(AppConstants.graphWidth);
  const [rangeChartData, setRangeChartData] = useState([]);
  const [viewportWidth, setViewportWidth] = useState(null);

  const originalData = data?.originalData;

  const chartFilter = AppConstants.listFilterChart.find((_, idx) => idx === timeIndex) || {};

  useEffect(() => {
    let timeout;
    setLoading(true);
    timeout = setTimeout(() => {
      const chartData = UtilLib.getChartGraph(viewportWidth, chartFilter.value, originalData);
      if (chartData) {
        setRangeChartData(chartData?.rangeChartNetworthData || []);
        setGraphWidth(chartData?.graphWidth);
      }
      setLoading(false);
    }, loadingDuration);
    return () => {
      clearTimeout(timeout);
    };
  }, [originalData, viewportWidth, chartFilter, loadingDuration, data]);

  return (
    <View>
      <Pressable onPress={() => !loading && onPress()}>
        <TextField type="heading-4" numberOfLines={1}>
          {graphTitle?.toUpperCase()}
        </TextField>
        <TextField
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ fontSize: 32, lineHeight: 32 * 1.5 }}
          type="heading-3"
          numberOfLines={1}>
          {formatCurrency(totalValue, '$', { decimal: 2 })}
        </TextField>
      </Pressable>
      <View style={AppStyle.marginTop5}>
        {loading ? (
          <ContentLoader name="customChart" height={300 + 20} />
        ) : (
          <CustomChart
            loading={loading}
            type="range-chart"
            data={rangeChartData}
            width={util.safePositiveValue(graphWidth)}
            color={color}
            valueAccessor={item => item?.value}
            formatValue={value => UtilLib.formatCurrency(value)}
            tooltipValueAccessor={item => item?.date}
            tooltipFormatValue={value => moment(value).format('D MMM')}
            diff={0.2}
            multiple={false}
            onScroll={debounce(event => {
              const width = event.layoutWidth - Y_AXIS_WIDTH;
              if (viewportWidth == null) {
                setViewportWidth(width);
              }
            }, 300)}
            scrollToEnd={true}
            contentInset={{
              top: 20,
              bottom: 20,
              left: 20,
              right: 20,
            }}
            yAxisWidth={Y_AXIS_WIDTH}
            viewportWidth={util.safePositiveValue(viewportWidth)}
            rangeChartVersion={2}
          />
        )}
      </View>
    </View>
  );
});

export default FinancialChart;
