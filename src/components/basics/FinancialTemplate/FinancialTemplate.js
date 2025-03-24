import { useRoute } from '@react-navigation/core';
import i18n from 'bootstrap/i18n';
import CustomChart from 'components/basics/CustomChart';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import ContentLoader from 'components/layouts/ContentLoader';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve, useIsComponentMounted } from 'libs/hooks';
import util from 'libs/util';
import { debounce, findLast, last, round } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, View } from 'react-native';
import { useClickOutside } from 'react-native-click-outside';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
// import EntypoIcon from 'react-native-vector-icons/Entypo';
import WriteReview from 'screens/AppReview/Components/WriteReview';
import { ArchiveModalContent, FinancialCardItem } from 'screens/FinancialDashboard/components';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { submitFeedbackSuggestion } from 'store/Home/action';
import { AppStyle } from 'theme';

import themedStyles from './style';

const Summary = ({ styles, content }) => {
  return (
    <View>
      <TextField type="paragraph-2" numberOfLines={1}>
        {i18n.t(`${i18nScope}.summary`)}
      </TextField>
      <View style={[styles.summaryContainer, AppStyle.marginTop5, AppStyle.pad10]}>
        <TextField type="paragraph-2">{content}</TextField>
      </View>
    </View>
  );
};

const Cards = ({ styles, data, extra }) => {
  const i18nScopeCard = 'screens.financialDashboard';
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();
  if (data.length > 0) {
    const onPressDelete = (itemValue, callback = () => {}) => {
      const hasNoDirectLinks =
        itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;

      const isPropertyInvestmentCard =
        itemValue?.type === AppConstants.AssetType.Property ||
        itemValue?.type === AppConstants.AssetType.Investments;

      const cardName =
        isPropertyInvestmentCard && !hasNoDirectLinks
          ? `${itemValue?.name} ${AppConstants.cardCategory.Asset}`
          : itemValue?.name;
      const title = t(`${i18nScopeCard}.modalDeleteTitle`, { cardName });
      const content = t(`${i18nScopeCard}.modalDeleteContent`);
      const content2 = hasNoDirectLinks ? null : t(`${i18nScopeCard}.modalDeleteContent2`);
      const dateLabelText = t(`${i18nScopeCard}.archiveDateLabelText`);
      const submitText = t(`${i18nScopeCard}.delete`);
      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            title={title}
            content={content}
            content2={content2}
            card={itemValue}
            onCancel={GlobalLib.CustomModal.get().hide}
            onSubmit={() => {
              // const _type = itemValue.cardType === 'expense' ? 'expenses' : itemValue.cardType;
              // dispatchResolve(
              //   financialDashboardActions.deleteFinancialCardItem({ type: _type, item: itemValue }),
              // );
              const payload = {
                item: itemValue,
              };
              dispatchResolve(financialDashboardActions.deleteFinancialCardItem(payload)).then(
                () => {
                  callback();
                },
              );
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            type="delete"
            hideAsAt
            submitText={submitText}
          />
        ),
      });
    };

    const onPressArchive = async (itemValue, callback = () => {}) => {
      const latestAsAt = await dispatchResolve(
        financialDashboardActions.getLatestAsAt({ cardId: itemValue?.id?.[0] }),
      );
      // const hasAssetId = itemValue?.assetId;
      const hasNoDirectLinks =
        itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;
      const title = t(`${i18nScopeCard}.archiveTitle`);
      const content = t(`${i18nScopeCard}.archiveContent`);
      const content2 = t(`${i18nScopeCard}.archiveContent2`);
      const content4 = !hasNoDirectLinks ? t(`${i18nScopeCard}.archiveContent4`) : '';
      const latestAsAtError = t(`${i18nScopeCard}.archiveLatestAsAtError`);
      const dateLabelText = t(`${i18nScopeCard}.archiveDateLabelText`);
      const submitText = t(`${i18nScopeCard}.archive`);

      // if (hasAssetId) {
      //   GlobalLib.Toast.get().toastWarning(t(`${i18nScope}.archiveWarningArchiveSubCard`));
      //   return;
      // }

      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            title={title}
            content={content}
            content2={content2}
            content4={content4}
            latestAsAt={latestAsAt}
            latestAsAtError={latestAsAtError}
            card={itemValue}
            onCancel={GlobalLib.CustomModal.get().hide}
            onSubmit={({ asAt }) => {
              const payload = {
                item: itemValue,
                asAt,
              };
              dispatchResolve(financialDashboardActions.archiveFinancialCardItem(payload)).then(
                () => {
                  GlobalLib.CustomModal.get().hide();
                  callback();
                },
              );
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            submitText={submitText}
          />
        ),
      });
    };

    const onPress = itemValue => {
      switch (itemValue.cardType) {
        case 'borrowings':
          NavigationServiceLib.navigate(AppScreenID.Borrowing, {
            borrowing: itemValue,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'income':
          NavigationServiceLib.navigate(AppScreenID.Income, {
            income: itemValue,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'assets':
          NavigationServiceLib.navigate(AppScreenID.EditAsset, {
            item: itemValue,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'expense':
          NavigationServiceLib.navigate(AppScreenID.EditExpense, {
            item: itemValue,
            onPressArchive,
            onPressDelete,
          });
          break;
        default:
          break;
      }
    };
    return (
      <View>
        {data.map(section => {
          return (
            <View key={section.id}>
              <View style={[AppStyle.padX15, AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
                <TextField>{section.title}</TextField>
                {extra ? extra : null}
              </View>
              <View>
                {section?.list?.length > 0 ? (
                  section?.list?.map((item, ii) => (
                    <FinancialCardItem
                      key={`card-${section.id}-${ii}`}
                      data={item}
                      style={styles.cardContainer}
                      onPressDelete={() => {}}
                      onPressArchive={() => {}}
                      onPress={onPress}
                      disabledSwipe={true}
                    />
                  ))
                ) : (
                  <View style={AppStyle.pad10}>
                    <NoDataAvailable
                      type="none"
                      title={t('screens.financialDashboard.emptyCardTitle')}
                      description={''}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
  return <View />;
};

const Feedback = ({ styles }) => {
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();
  const route = useRoute();
  const screenName = route.name;
  const location = screenName;

  const onPressBack = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
  }, []);

  const onPressSubmit = useCallback(
    reviewInput => {
      dispatchResolve(submitFeedbackSuggestion({ review: reviewInput, location })).then(() => {
        GlobalLib.Toast.get().toastSuccess(t('screens.cashPosition.feedbackSuccess'));
        onPressBack();
      });
    },
    [dispatchResolve, onPressBack, t],
  );

  const handlePressFeedback = useCallback(() => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <View>
          <KeyboardAwareScrollView
            style={styles.feedbackContainer}
            showsVerticalScrollIndicator={false}>
            <WriteReview
              onPressSubmit={onPressSubmit}
              onPressBack={onPressBack}
              subtitle={t('screens.cashPosition.feedbackSubtitle')}
            />
          </KeyboardAwareScrollView>
        </View>
      ),
      onBackdropPress: () => {
        Keyboard.dismiss();
        GlobalLib.CustomModal.get().hide();
      },
      onRequestClose: () => {
        Keyboard.dismiss();
        GlobalLib.CustomModal.get().hide();
      },
    });
  }, [onPressBack, onPressSubmit, styles, t]);

  return (
    <View style={[AppStyle.padX15, AppStyle.alignContent]}>
      <TextField type="paragraph-2">{i18n.t(`${i18nScope}.feedbackTitle`)}</TextField>
      <Pressable onPress={handlePressFeedback}>
        <TextField style={styles.linkText} type="paragraph-2">
          {i18n.t(`${i18nScope}.feedbackShareTitle`)}
        </TextField>
      </Pressable>
    </View>
  );
};

const i18nScope = 'screens.cashPosition';

export const Y_AXIS_WIDTH = 70;

const FinancialTemplate = ({
  graphTitle,
  timeList,
  onTimeSelect,
  color,
  timeIndex = 3,
  data,
  // onPressOption,
  summaryContent,
  cardList,
  hideCardList,
  totalValue = 0,
  fetching = false,
  onPressViewAll,
  type,
}) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(timeIndex);
  const [viewAll, setViewAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tooltipSelected, setTooltipSelected] = useState(null);

  const archivedListPosition = useRef(null);
  const [changeInValue, setChangeInValue] = useState(0);
  const [changeInValueVisible, setChangeInValueVisible] = useState(false);
  const [changeInValuePercent, setChangeInValuePercent] = useState('0%');
  const [reference, setReference] = useState('');
  const [graphWidth, setGraphWidth] = useState(AppConstants.graphWidth);
  const [rangeChartData, setRangeChartData] = useState([]);
  const [viewportWidth, setViewportWidth] = useState(null);
  const customChartRef = useRef(null);
  const ref = useClickOutside(() => {
    customChartRef.current?.clearTooltip();
  });
  const outsideId = 'click-outside-id';
  const isComponentMounted = useIsComponentMounted();

  const originalData = data?.originalData;

  const chartFilter = AppConstants.listFilterChart.find((_, idx) => idx === timeIndex) ?? {};

  const isDebtPositionChart = type === 'DebtPosition';
  const changeInValueColor =
    changeInValue >= 0
      ? isDebtPositionChart
        ? styles.downColor.color
        : styles.upColor.color
      : isDebtPositionChart
      ? styles.upColor.color
      : styles.downColor.color;

  useEffect(() => {
    setLoading(true);
    let timeout;
    timeout = setTimeout(() => {
      const chartData = UtilLib.getChartGraph(viewportWidth, chartFilter.value, originalData);
      if (chartData) {
        setRangeChartData(chartData?.rangeChartNetworthData || []);
        setGraphWidth(chartData?.graphWidth);
      }
      setLoading(false);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [originalData, viewportWidth, chartFilter]);

  const _onLayout = ({ nativeEvent }) => {
    // if (archivedListPosition.current == null) {
    const { y } = nativeEvent.layout;
    archivedListPosition.current = y;
    // }
  };

  const handlePressTime = useCallback(
    index => {
      setLoading(true);
      setSelectedTimeIndex(index);

      let timeout;
      timeout = setTimeout(() => {
        typeof onTimeSelect === 'function' ? onTimeSelect(index) : undefined;
        setLoading(false);
        clearTimeout(timeout);
      }, 1000);
    },
    [onTimeSelect],
  );

  const handleViewAll = useCallback(() => {
    setViewAll(true);
    if (archivedListPosition.current && typeof onPressViewAll === 'function') {
      onPressViewAll(archivedListPosition.current);
    }
  }, [onPressViewAll]);

  const handleHide = useCallback(() => setViewAll(false), []);

  const onGetChangeValue = useCallback(
    (_viewPortFirstPoint, viewPortLastPoint) => {
      let viewPortFirstPoint = _viewPortFirstPoint;
      const rangeChartNetworthData = rangeChartData;
      if (rangeChartNetworthData && isComponentMounted.current) {
        const listPoint = rangeChartNetworthData.filter(x => x.type === 'point');

        let firstPoint = findLast(listPoint, point => point.x <= viewPortFirstPoint);
        if (firstPoint == null) {
          firstPoint = listPoint.find(point => point.x >= viewPortFirstPoint);
        }
        let lastPoint = findLast(
          listPoint,
          point => point.x <= viewPortLastPoint && point.x > viewPortFirstPoint,
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

        const listInterval = rangeChartNetworthData.filter(x => x.type === 'interval');
        const viewPortFirstPointRound = round(viewPortFirstPoint, 6);
        const viewPortLastPointRound = round(viewPortLastPoint, 6);
        const firstPointInterval = listInterval.find(
          point => round(point.x, 6) >= viewPortFirstPointRound,
        );
        let lastPointInterval = findLast(
          listInterval,
          point => round(point.x, 6) <= viewPortLastPointRound,
        );
        const lastDate = last(listPoint);

        if (
          viewPortLastPointRound >= round(lastPointInterval.x, 6) &&
          round(lastDate.x, 6) <= viewPortLastPointRound
        ) {
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
      }
    },
    [isComponentMounted, rangeChartData],
  );

  return (
    <Fragment>
      <View style={[AppStyle.marginTop10]}>
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
              <ContentLoader name="customChart" height={300 + 20} />
            ) : (
              <CustomChart
                ref={customChartRef}
                loading={loading || fetching}
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
              />
            )}
          </View>
          <View style={[AppStyle.marginTop5, AppStyle.alignEnd, AppStyle.padX15]}>
            <Pressable
              style={[
                styles.referenceButton,
                AppStyle.flex1,
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
                    <TextField type="captain">{i18n.t(`${i18nScope}.change`)} </TextField>
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
          <View style={[AppStyle.marginTop10, AppStyle.padX15]}>
            <Summary {...{ styles, content: summaryContent }} />
          </View>
        </View>
      </View>

      <View style={AppStyle.marginTop10}>
        <Cards
          {...{
            styles,
            data: cardList,
            extra: !viewAll ? (
              <Pressable onPress={handleViewAll}>
                <TextField style={styles.linkText} type="paragraph-2">
                  {i18n.t(`${i18nScope}.viewAll`)}
                </TextField>
              </Pressable>
            ) : null,
          }}
        />
      </View>
      <View onLayout={_onLayout} />
      {viewAll ? (
        <View style={AppStyle.marginTop10}>
          <Cards
            {...{
              styles,
              data: [
                { id: 'archived', title: i18n.t(`${i18nScope}.archived`), list: hideCardList },
              ],
              extra: (
                <Pressable onPress={handleHide}>
                  <TextField style={styles.linkText} type="paragraph-2">
                    {i18n.t(`${i18nScope}.hide`)}
                  </TextField>
                </Pressable>
              ),
            }}
          />
        </View>
      ) : null}

      <View style={AppStyle.marginTop10}>
        <Feedback {...{ styles }} />
      </View>
    </Fragment>
  );
};

export default FinancialTemplate;
