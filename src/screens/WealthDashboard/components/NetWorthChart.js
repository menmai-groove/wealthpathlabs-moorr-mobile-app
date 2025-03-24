import CustomChart from 'components/basics/CustomChart';
import DropDownForForm from 'components/basics/DropDownForForm';
import TitleDropdown from 'components/basics/TitleDropdown';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants } from 'constant';
import { AnalyticsLib, UtilLib } from 'libs';
import { useDispatchResolve, useIsComponentMounted } from 'libs/hooks';
import util from 'libs/util';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getHistoryWealthSpeedData, setIndex } from 'store/Wealth/action';
import { selectIndex } from 'store/Wealth/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.wealthDashboard';

const _padX = 50;
const keys = ['liabilities', 'savings', 'superannuation', 'personal', 'investments'];
const colors = ['#EC5353', '#008FEB', '#39A8EF', '#5EBEFC', '#27AE60'];

const NetWorthChart = ({}) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatchResolve = useDispatchResolve();
  const { width: layoutWidth } = useWindowDimensions();
  const isComponentMounted = useIsComponentMounted();

  const selectedIndex = useSelector(selectIndex);

  const [chartIndex, setChartIndex] = useState(0);
  const [loadingChart, setLoadingChart] = useState(true);
  const [dataChart, setDataChart] = useState([]);
  const rangeList = AppConstants.dropdownDataFilterChart;
  const chartList = useMemo(
    () => [
      { value: 'netWorthGraph', display: 'WealthTRACKER™' },
      { value: 'netWorthBreakdown', display: 'Net Worth Breakdown' },
    ],
    [],
  );
  const stackedBarChartWidth = layoutWidth - _padX;
  const stackedBarChartLength = 12;
  const _itemWidth = stackedBarChartWidth / stackedBarChartLength;

  const getDataChart = useCallback(
    async ({ range = rangeList[selectedIndex]?.value }) => {
      const res = await dispatchResolve(
        getHistoryWealthSpeedData({
          key: 'netWorthPosition',
          range: range || rangeList[selectedIndex]?.value,
        }),
      );
      return res;
    },
    [dispatchResolve, rangeList, selectedIndex],
  );

  const handleOnSelect = useCallback(
    async index => {
      setLoadingChart(true);
      try {
        const range = rangeList[index]?.value;
        dispatchResolve(setIndex(index));
        const res = await getDataChart({ range });
        if (isComponentMounted.current) {
          if (chartIndex === 0) {
            setDataChart(res.rangeChartNetworthData);
          } else {
            setDataChart(res.netWorthBreakdownData);
          }
        }

        AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardChangeChartRange, {
          range: range,
          chart:
            chartIndex === 0
              ? AppConstants.analytics.params.chartType.wealthTracker
              : AppConstants.analytics.params.chartType.netWorthBreakdown,
        });
      } catch (error) {
        setDataChart([]);
      } finally {
        setLoadingChart(false);
      }
    },
    [rangeList, dispatchResolve, getDataChart, isComponentMounted, chartIndex],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getDataChart({});
        if (isComponentMounted.current) {
          if (chartIndex === 0) {
            setDataChart(res.rangeChartNetworthData);
          } else {
            setDataChart(res.netWorthBreakdownData);
          }
        }
      } catch (error) {
        if (isComponentMounted.current) {
          setDataChart([]);
        }
      } finally {
        if (isComponentMounted.current) {
          setLoadingChart(false);
        }
      }
    };
    init();
    return () => {};
  }, []);

  const handleChangeChart = useCallback(
    async idx => {
      setLoadingChart(true);
      try {
        setChartIndex(idx);
        const res = await getDataChart({});
        if (idx === 0) {
          setDataChart(res.rangeChartNetworthData);
        } else {
          setDataChart(res.netWorthBreakdownData);
        }
        AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardChangeChartType, {
          chart:
            idx === 0
              ? AppConstants.analytics.params.chartType.wealthTracker
              : AppConstants.analytics.params.chartType.netWorthBreakdown,
        });
      } catch (error) {
        setDataChart([]);
      } finally {
        setLoadingChart(false);
      }
    },
    [getDataChart],
  );

  return (
    <View style={[styles.chartContainer]}>
      <View
        style={[
          AppStyle.flex1,
          AppStyle.rowFlex,
          // AppStyle.spaceBetweenContent,
          AppStyle.alignContent,
        ]}>
        <View style={[AppStyle.flex2, AppStyle.marginRight10]}>
          <View style={styles.titleRangeContainer}>
            <TitleDropdown
              value={chartList[chartIndex]}
              options={chartList}
              onSelect={handleChangeChart}
            />
          </View>
        </View>
        <View style={[AppStyle.flex1, AppStyle.alignEnd]}>
          <View style={[styles.rangeContainer]}>
            <DropDownForForm
              value={rangeList[selectedIndex]}
              options={rangeList}
              onSelect={handleOnSelect}
            />
          </View>
        </View>
      </View>
      <View style={AppStyle.marginTop10}>
        {loadingChart ? (
          <View>
            <ContentLoader name="customChart" height={320} />
          </View>
        ) : chartIndex === 0 ? (
          <CustomChart
            type="range-chart"
            data={dataChart}
            width={AppConstants.graphWidth}
            color={styles.netWorthLineChart.color}
            valueAccessor={item => item.value}
            formatValue={value => UtilLib.formatCurrency(value)}
            diff={0.2}
            scrollToEnd
          />
        ) : (
          <CustomChart
            key="stacked-bar-chart"
            width={util.safePositiveValue(
              _itemWidth * Math.max(dataChart.length, stackedBarChartLength),
            )}
            type="stacked-bar-chart"
            keys={keys}
            colors={colors}
            data={dataChart}
            labelAccessor={item => item.label}
            valueAccessor={item => {
              const stackedBarChartYAccessor =
                typeof item.value === 'object'
                  ? Object.entries(item.value)
                      .map(([key, value]) => (keys.includes(key) ? value : 0))
                      .reduce((a, b) => a + b, 0)
                  : null;
              return stackedBarChartYAccessor;
            }}
            formatLabel={label => {
              // eslint-disable-next-line quotes
              return moment(label).format("MMM'YY");
            }}
            formatValue={value => UtilLib.formatCurrency(value)}
            formatTitle={title => moment(title).format('MMMM YYYY')}
            formatKey={key => {
              switch (key) {
                case 'superannuation':
                  return 'Superannuation';
                case 'savings':
                  return 'Savings';
                case 'personal':
                  return 'Personal Properties';
                case 'investments':
                  return 'Investments';
                case 'liabilities':
                  return 'Liabilities';
                default:
                  return null;
              }
            }}
            multiple={false}
            diff={0.2}
            scrollToEnd
          />
        )}
      </View>
    </View>
  );
};

export default NetWorthChart;
