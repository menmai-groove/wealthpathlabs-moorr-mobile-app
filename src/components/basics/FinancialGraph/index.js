import { useFocusEffect } from '@react-navigation/core';
import CustomChart from 'components/basics/CustomChart';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants } from 'constant';
import { UtilLib } from 'libs';
import { useDispatchResolve, useIsComponentMounted } from 'libs/hooks';
import util from 'libs/util';
import { debounce, findLast, first, last } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { withTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { getHistoricalValues, setChartTime } from 'store/InsightsTabContent/action';
import getModule from 'store/InsightsTabContent/module';
import {
  selectChartTime,
  selectFetching,
  selectHistoricalValues,
  selectHistoricalValuesTotalValue,
} from 'store/InsightsTabContent/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const Y_AXIS_WIDTH = 70;
const outsideId = 'click-outside-id';

const i18nScope = 'components.avatar';

function FinancialGraph({ cardId, graphTitle, timeList = [], type, getOffsetBenefit }, ref) {
  const styles = useThemedStyle({ ...themedStyles }, i18nScope);
  const isComponentMounted = useIsComponentMounted();
  const dispatchResolve = useDispatchResolve();
  const chartData = useSelector(selectHistoricalValues);
  const originalData = chartData;
  const chartTime = useSelector(selectChartTime);
  const timeIndex = AppConstants.listFilterChart.findIndex(x => x.value === chartTime);
  const totalValue = useSelector(selectHistoricalValuesTotalValue);
  const fetching = useSelector(selectFetching);

  const [tooltipSelected, setTooltipSelected] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(null);
  const [changeInValue, setChangeInValue] = useState(0);
  const [changeInValueVisible, setChangeInValueVisible] = useState(false);
  const [changeInValuePercent, setChangeInValuePercent] = useState('0%');
  const [reference, setReference] = useState('');
  const [graphWidth, setGraphWidth] = useState(AppConstants.graphWidth);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(timeIndex);
  const [loading, setLoading] = useState(true);
  const [rangeChartData, setRangeChartData] = useState([]);

  const formattedChartDataRef = useRef(null);
  const intervalDayByDayRef = useRef([]);

  const chartFilter = AppConstants.listFilterChart.find((_, idx) => idx === timeIndex) ?? {};

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

  const changeInValueColor = useMemo(
    () =>
      changeInValue >= 0
        ? type === AppConstants.cardCategory.Borrowing
          ? styles.downColor.color
          : styles.upColor.color
        : type === AppConstants.cardCategory.Borrowing
        ? styles.upColor.color
        : styles.downColor.color,
    [changeInValue],
  );

  const getListIntervalDayByDay = () => {
    if (formattedChartDataRef.current) {
      const { maxX, minX } = formattedChartDataRef.current;
      const rangeStart = minX;
      const rangeEnd = maxX;
      let _intervalData = [];
      let deltaInterval = 0;
      let daysDiff = moment(rangeEnd).diff(moment(rangeStart), 'days');
      if (chartFilter.value !== 'ALL') {
        const filterValues = ['M', '3M', '6M', 'Y', '2Y'];
        const rangeValues = [30, 90, 183, 365, 365 * 2];
        const index = filterValues.indexOf(chartFilter.value);
        const totalDay = rangeValues[index];
        deltaInterval = viewportWidth / totalDay;

        const formatIntervalLabel = (chartFilterValueProp, dayProp) => {
          let label;
          switch (chartFilterValueProp) {
            case '2Y':
            case 'Y': {
              let newMonth = dayProp;
              const newMonthIndex = newMonth.month();
              const isJanOrDec = newMonthIndex === 0 || newMonthIndex === 11;
              label = [
                newMonth.format('MMM')?.[0],
                ...(isJanOrDec ? [newMonth.format('YY')] : []),
              ].join('');
              break;
            }
            case '6M':
            case '3M':
            case 'M': {
              label = dayProp.format('D MMM');
              break;
            }

            default:
              break;
          }
          return label;
        };

        _intervalData = [...Array(daysDiff).keys()].map(dayIndex => {
          let newDay = moment(rangeStart).add(dayIndex, 'days');

          return {
            type: 'interval',
            label: formatIntervalLabel(chartFilter.value, newDay),
            x: deltaInterval * dayIndex,
            value: 0,
            date: newDay.toDate(),
          };
        });
      }
      intervalDayByDayRef.current = _intervalData;
    }
  };

  const onGetChangeValue = useCallback(
    (_viewPortFirstPoint, viewPortLastPoint) => {
      let viewPortFirstPoint = _viewPortFirstPoint;
      const rangeChartNetworthData = rangeChartData;
      if (rangeChartNetworthData && isComponentMounted.current) {
        const listPoint = rangeChartNetworthData.filter(x => x.type === 'point');
        const listInterval =
          chartFilter.value !== 'ALL'
            ? intervalDayByDayRef.current
            : rangeChartNetworthData.filter(x => x.type === 'interval');
        const viewPortFirstPointRound = viewPortFirstPoint;
        const viewPortLastPointRound = viewPortLastPoint;

        let firstPointInterval = findLast(
          listInterval,
          point => point.x <= viewPortFirstPointRound,
        );

        let lastPointInterval = findLast(listInterval, point => point.x <= viewPortLastPointRound);
        const firstDate = first(listPoint);
        const lastDate = last(listPoint);

        if (
          viewPortFirstPointRound <= firstPointInterval.x &&
          firstDate.x >= viewPortFirstPointRound
        ) {
          firstPointInterval = firstDate;
        }
        if (viewPortLastPointRound >= lastPointInterval.x && lastDate.x <= viewPortLastPointRound) {
          lastPointInterval = lastDate;
        }

        if (moment(firstPointInterval.date).unix() > moment(lastPointInterval.date).unix()) {
          setChangeInValueVisible(false);
          setReference('');
        } else {
          setChangeInValueVisible(true);
          const _changeInValueLabel = `${moment(firstPointInterval.date).format(
            'D MMM YY',
          )} - ${moment(lastPointInterval.date).format('D MMM YY')}`;
          setReference(_changeInValueLabel);
        }

        let firstPoint = findLast(listPoint, point => point.x <= firstPointInterval.x);
        if (firstPoint == null) {
          firstPoint = listPoint.find(point => point.x >= firstPointInterval.x);
        }
        let lastPoint = findLast(
          listPoint,
          point => point.x <= lastPointInterval.x && point.x > firstPointInterval.x,
        );

        // Calculate change in value if there are at least 2 data points in the range
        if (firstPoint && lastPoint) {
          if (firstPoint.x === lastPoint.x) {
            setChangeInValueVisible(false);
          } else {
            setChangeInValueVisible(true);
            const _changeInValue = lastPoint.value - firstPoint.value;
            setChangeInValue(_changeInValue);
            if (firstPoint.value !== 0) {
              setChangeInValuePercent(
                Math.abs((_changeInValue / firstPoint.value) * 100).toFixed(2) + '%',
              );
            } else {
              setChangeInValuePercent('0%');
            }
          }
        } else {
          setChangeInValueVisible(false);
        }
      }
    },
    [isComponentMounted, rangeChartData],
  );

  const handlePressTime = useCallback(index => {
    setLoading(true);
    setSelectedTimeIndex(index);
    let timeout;
    timeout = setTimeout(() => {
      const timeIndexInput = index;
      const foundTime = AppConstants.listFilterChart.find((_, idx) => idx === timeIndexInput);
      dispatchResolve(setChartTime(foundTime.value));
      setLoading(false);
      clearTimeout(timeout);
    }, 1000);
  }, []);

  useEffect(() => {
    let timeout;
    setLoading(true);
    timeout = setTimeout(() => {
      const formattedChartData = UtilLib.getChartGraphV2(
        viewportWidth,
        chartFilter.value,
        originalData,
      );
      if (formattedChartData) {
        setRangeChartData(formattedChartData?.rangeChartNetworthData || []);
        setGraphWidth(formattedChartData?.graphWidth);
        formattedChartDataRef.current = formattedChartData;
        getListIntervalDayByDay();
      }
      setLoading(false);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [originalData, viewportWidth, chartFilter]);

  const reload = useCallback(() => {
    if (cardId) {
      dispatchResolve(getHistoricalValues({ cardId, getOffsetBenefit, type }));
    }
  }, [cardId]);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {};
    }, [reload]),
  );

  useImperativeHandle(ref, () => ({}));

  return (
    <View>
      <View style={AppStyle.padX15}>
        <TextField type="paragraph-2" numberOfLines={1}>
          {graphTitle}
        </TextField>
        <View style={[AppStyle.rowFlex, AppStyle.alignEnd]}>
          <TextField style={styles.chartTitle} type="heading-4" numberOfLines={1}>
            {UtilLib.formatCurrency(tooltipSelected ? tooltipSelected.value : totalValue, '$', {
              decimal: 2,
            })}
          </TextField>
          {tooltipSelected ? (
            <TextField
              type="text-label"
              numberOfLines={1}
              style={[AppStyle.marginLeft10, AppStyle.marginBottom5, AppStyle.flex1]}>
              {moment(tooltipSelected.date).format('DD MMMM YYYY')}
            </TextField>
          ) : null}
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          {timeList?.length > 0
            ? timeList?.map((item, ii) => (
                <Pressable
                  key={`time-${item.value}-${ii}`}
                  style={[
                    styles.timeButton,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      backgroundColor: color + (selectedTimeIndex === ii ? '' : '70'),
                      opacity: loading || fetching ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    handlePressTime(ii);
                  }}
                  disabled={loading || fetching}>
                  <TextField style={styles.labelButtonText} type="paragraph-2">
                    {item?.label}
                  </TextField>
                </Pressable>
              ))
            : null}
        </View>
      </View>
      <View nativeID={outsideId} ref={ref} style={AppStyle.marginTop5}>
        {loading || fetching ? (
          <ContentLoader name="customChart" height={320} />
        ) : (
          <CustomChart
            // ref={customChartRef}
            loading={loading || fetching}
            type="range-chart"
            data={rangeChartData}
            width={UtilLib.safePositiveValue(graphWidth)}
            color={color}
            valueAccessor={item => item?.value}
            formatValue={value => UtilLib.formatCurrency(value)}
            tooltipValueAccessor={item => item?.date}
            tooltipFormatValue={value => moment(value).format('D MMM')}
            diff={0.2}
            multiple={false}
            onTooltipSelected={indexes => {
              if (indexes.length > 0) {
                let points = rangeChartData.filter(item => item?.type === 'point');
                const point = points[indexes[0]];
                setTooltipSelected({ value: point.value, date: point.date });
              } else {
                setTooltipSelected(null);
              }
            }}
            onScroll={debounce(event => {
              const width = event.layoutWidth - Y_AXIS_WIDTH;
              if (viewportWidth == null) {
                setViewportWidth(width);
              }
            }, 300)}
            onChangeViewport={({ x: { min, max } }) => {
              if (min != null && max != null) {
                onGetChangeValue(min, max);
              }
            }}
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
            loadingHide
          />
        )}
      </View>
      <View style={[AppStyle.marginTop5, AppStyle.alignEnd, AppStyle.padX15]}>
        <Pressable
          style={[
            styles.referenceButton,
            AppStyle.justifyContent,
            AppStyle.alignContent,
            AppStyle.padX10,
            {
              backgroundColor: color,
            },
          ]}>
          <TextField style={styles.referenceButtonText} type="paragraph-2">
            {reference}
          </TextField>
        </Pressable>
        <View style={styles.minHeightChangeValue}>
          {changeInValueVisible ? (
            <View style={[AppStyle.marginTop5, AppStyle.rowFlex]}>
              <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                <TextField type="captain">Change </TextField>
                <AntDesignIcon
                  name={changeInValue >= 0 ? 'caretup' : 'caretdown'}
                  color={changeInValueColor}
                  size={8}
                />
                <TextField
                  style={[
                    changeInValue >= 0 ? styles.upColor : styles.downColor,
                    { color: changeInValueColor },
                  ]}>
                  {' '}
                  {UtilLib.formatCurrency(changeInValue)}({changeInValuePercent})
                </TextField>
              </View>
            </View>
          ) : null}
        </View>

        {/* <Pressable onPress={typeof onPressOption === 'function' ? onPressOption : undefined}>
          <View style={AppStyle.marginTop5}>
            <EntypoIcon name="dots-three-horizontal" size={16} color={color} />
          </View>
        </Pressable> */}
      </View>
    </View>
  );
}

export default compose(
  withDynamicModuleLoader(getModule()),
  withTranslation(),
)(forwardRef(FinancialGraph));
