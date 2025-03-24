import Collapsible from 'components/basics/Collapsible';
import CustomGauge from 'components/basics/CustomGauge';
import TextField from 'components/basics/TextField';
import WealthChart from 'components/basics/WealthChart';
import { AppConstants } from 'constant';
import { AnalyticsLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { getHistoryWealthSpeedData } from 'store/Wealth/action';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.wealthDashboard';

const GaugeList = ({ data: dataInput, wealthData, closeModal = () => {} }) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatchResolve = useDispatchResolve();
  const foundElement = dataInput?.foundElement;
  const label = dataInput?.label;
  const definition = dataInput?.definition;
  const data = foundElement?.children?.map(item => ({ ...item, ...wealthData[item.key] }));
  const [gaugeType, setGaugeType] = useState(null);
  const [myDefinition, setMyDefinition] = useState({
    label,
    definition,
    key: foundElement?.key ?? dataInput?.key,
  });
  const [loadingChart, setLoadingChart] = useState(false);

  const [dataChart, setDataChart] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(
    AppConstants.dropdownDataFilterChart ? AppConstants.dropdownDataFilterChart[0] : null,
  );
  const dataChartRef = useRef();

  const handleSelectGauge = useCallback(item => {
    setGaugeType(item?.key);
    setMyDefinition({
      label: item?.info?.label,
      definition: item?.definition,
      key: item?.key,
    });
    AnalyticsLib.logEvent(AppConstants.analytics.eventTypes.wealthDashboardShowDetails, {
      gauge: item.key,
      source: 'gauge_details',
    });
  }, []);

  const onChangeFilter = useCallback(
    range => {
      setLoadingChart(true);
      dispatchResolve(getHistoryWealthSpeedData({ key: myDefinition.key, range: range }))
        .then(res => {
          if (myDefinition?.key === AppConstants.wealthKeys.wealthCLOCK) {
            const result = [
              { data: res.actual, svg: { stroke: '#541868' }, id: 'actual' },
              { data: res.projection, svg: { stroke: '#008FEB' }, id: 'projection' },
            ];
            dataChartRef.current = result;
            setDataChart(result);
          } else {
            setDataChart(res);
          }
        })
        .catch(() => setDataChart([]))
        .finally(() => setLoadingChart(false));
    },
    [dispatchResolve, myDefinition],
  );

  useEffect(() => {
    if (myDefinition?.key !== AppConstants.wealthKeys.wealthCLOCK) {
      onChangeFilter(dropdownValue?.value);
    }
  }, [dropdownValue, myDefinition, onChangeFilter]);

  const onClickLegend = id => {
    if (dataChartRef.current) {
      if (id) {
        let _data = dataChartRef.current.filter(x => x.id === id);
        setDataChart(_data);
      } else {
        setDataChart(dataChartRef.current);
      }
    }
  };

  return (
    <View style={styles.centerView}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.modalContainer]}>
        <ScrollView style={[styles.modalScrollView]} contentContainerStyle={AppStyle.padBottom30}>
          {myDefinition?.key !== AppConstants.wealthKeys.wealthCLOCK ? (
            <View style={[styles.wrapperChart, AppStyle.marginX15, AppStyle.marginTop20]}>
              <WealthChart
                // chartLabel={
                //   myDefinition?.key === AppConstants.wealthKeys.wealthCLOCK
                //     ? t('components.wealthCLOCKChart.netWORTH')
                //     : myDefinition?.label + ' (p/hr)'
                // }
                title={myDefinition?.label}
                style={{
                  container: {
                    height: myDefinition?.key === AppConstants.wealthKeys.wealthCLOCK ? 420 : 380,
                  },
                }}
                data={dataChart}
                onChangeFilter={_ => {
                  setDropdownValue(_);
                  AnalyticsLib.logEvent(
                    AppConstants.analytics.eventTypes.wealthDashboardChangeChartRange,
                    {
                      gauge: myDefinition?.key,
                      chart: AppConstants.analytics.params.chartType.speedGauge,
                      range: _?.value,
                    },
                  );
                }}
                dropdownFilterData={AppConstants.dropdownDataFilterChart}
                dropdownValue={dropdownValue}
                loading={loadingChart}
                type={myDefinition.key}
                onClickLegend={_ => {
                  onClickLegend(_);
                }}
              />
            </View>
          ) : (
            <View style={AppStyle.marginTop10} />
          )}
          <View style={[AppStyle.marginY10, AppStyle.padX15]}>
            <Collapsible title={myDefinition?.label} defaultCollapse={false}>
              <TextField>{myDefinition?.definition}</TextField>
            </Collapsible>
          </View>
          <View style={[AppStyle.marginY10, AppStyle.padX15]}>
            {data?.length > 0 && (
              <View style={[styles.gaugeContainer]}>
                <FlatList
                  data={data}
                  contentContainerStyle={[AppStyle.pad10, AppStyle.padRight25]}
                  renderItem={({ item }) => {
                    const size = item?.secondary ? 120 : 170;
                    const isSelected = gaugeType === item?.key;
                    return (
                      <View>
                        {item?.secondary && (
                          <View style={[AppStyle.justifyContent]}>
                            <TextField type="captain">{item?.info?.label}</TextField>
                          </View>
                        )}
                        <View style={[AppStyle.marginTop10]}>
                          <CustomGauge
                            level={item?.secondary ? 3 : 2}
                            content={{
                              latest: item?.latest,
                              previous: item?.previous,
                              money: item?.money,
                              // money: 10000000,
                              percent: item?.percent,
                              title: item?.info?.label,
                            }}
                            trademark={item?.info?.trademark}
                            selected={isSelected}
                            onSelect={() => handleSelectGauge(item)}
                            style={{ progress: { color: item?.info?.color } }}
                            size={size}
                            strokeWidth={item?.secondary ? 10 : 20}
                            type={item?.key}
                          />
                        </View>
                      </View>
                    );
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={[AppStyle.marginRight20]} />}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default GaugeList;
