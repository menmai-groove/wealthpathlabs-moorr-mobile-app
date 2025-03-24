/* eslint-disable react-native/no-inline-styles */
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import Header from 'components/layouts/Header';
import NoDataAvailable from 'components/layouts/NoDataAvailable';
import { AppScreenID } from 'constant';
import { NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import util, { formatCurrency } from 'libs/util';
import { cloneDeep } from 'lodash';
import { useOnScreenRefresh, useThemedStyle, withBackHandler } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import { Cell, Row, Table, TableWrapper } from 'react-native-reanimated-table';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectFlags } from 'store/Auth/selector';
import { getMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import getModule from 'store/MonthlyCheckUp/module';
import {
  selectCheckUpReportTableData,
  selectCheckUpReportTableDate,
  selectCheckUpReportTableKey,
  selectFetchedDataCheckUp,
} from 'store/MonthlyCheckUp/selector';
import { AppSize, AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.monthlyReportingDashboard';

function MonthlyReportingDashboard() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { screenRefreshId } = useOnScreenRefresh();

  const { width } = useWindowDimensions();

  const fetchedData = useSelector(selectFetchedDataCheckUp);
  const tableData = useSelector(selectCheckUpReportTableData);
  const tableKey = useSelector(selectCheckUpReportTableKey);
  const tableDate = useSelector(selectCheckUpReportTableDate);
  const { checkupAsAt } = useSelector(selectFlags);
  const [refreshing, setRefreshing] = useState(false);
  const dispatchResolve = useDispatchResolve();

  const [isExpanded, setIsExpanded] = useState(false);

  const scrollRef = useRef();
  const scrollToEnd = () => {
    setTimeout(
      () => {
        scrollRef.current.scrollToEnd({ animated: true });
      },
      Platform.OS === 'android' ? 200 : 0, // some android devices cannot scroll right after loaded data
    );
  };

  // Cell width cannot auto scale, so we need to caculate it
  const dynamicCellWidth = useCallback(
    number => {
      let calculateWidth = styles.tableSize.cellWidth * 10;
      if (tableData.length > 0) {
        calculateWidth = `${formatCurrency(number)}`.length * styles.tableSize.cellWidth;
      }
      calculateWidth = calculateWidth > 120 ? calculateWidth : 120; // Add min width = title date width. e.g: Feb 2022
      return calculateWidth;
    },
    [styles, tableData],
  );
  const cellWidthArray = useMemo(() => {
    return tableData.map(item => {
      // Get max length incase other params have width > accumulatedExcessSurplus
      const getMaxItem = Math.max(
        Math.abs(item.accumulatedExcessSurplus ?? 0),
        Math.abs(item.primaryAccountBalance ?? 0),
        Math.abs(item.cashPosition ?? 0),
        Math.abs(item.shiftedMonthlyOut ?? 0),
        checkupAsAt ? 999999999 : 0,
      );
      return dynamicCellWidth(getMaxItem);
    });
  }, [dynamicCellWidth, tableData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatchResolve(getMonthlyCheckUpData(true)).finally(() => {
      setRefreshing(false);
    });
  }, [dispatchResolve]);

  const changeInCashPositionStyle = checkupAsAt
    ? {
        marginBottom: 30,
        borderTopWidth: 1,
        borderBottomWidth: 1,
      }
    : {};
  const cashPositionOpeningStyle = checkupAsAt ? { borderTopWidth: 1 } : {};

  const cellStyle = rowData => {
    if (checkupAsAt) {
      if (
        ['cashPositionOpening', 'cashPositionEnding', 'yearlyRemainingProvisioningTotal'].includes(
          rowData,
        )
      ) {
        return { fontWeight: '500' };
      }

      if (['changeInCashPosition'].includes(rowData)) {
        return { fontWeight: '600' };
      }
    }
    return {};
  };

  const isHidden = key =>
    [
      'accumulatedActualSurplus',
      'monthlyActualSurplus',
      'targetedMonthlySurplus',
      'rollingTargetedSurplus',
      'monthlyExcessSurplus',
      'accumulatedExcessSurplus',
    ].includes(key);

  return (
    <View key={screenRefreshId} style={styles.container}>
      <Header type="full" title={t(`${i18nScope}.headerTitle`)} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={AppStyle.flex1}
        contentContainerStyle={[
          styles.scrollContent,
          AppStyle.flexGrow1,
          AppStyle.menuPaddingBottom,
          AppStyle.marginTop20,
        ]}>
        {!fetchedData && <ContentLoader name="monthlyCheckUpReport" />}
        {fetchedData && !tableDate.length && (
          <NoDataAvailable
            title={t(`${i18nScope}.noCheckupAdded`)}
            description={t(`${i18nScope}.pleaseClickOnTheButton`)}
            type="button"
            buttonText={t(`${i18nScope}.buttonAddNewCheckup`)}
            onPress={() => NavigationServiceLib.navigate(AppScreenID.MonthlyCheckUp)}
          />
        )}
        {fetchedData && tableDate.length > 0 && (
          <>
            {!checkupAsAt && (
              <View style={AppStyle.marginBottom10}>
                <TextField type="heading-3" font="medium">
                  {t(`${i18nScope}.tableTitle`)}
                </TextField>
              </View>
            )}
            <View style={AppStyle.rowFlex}>
              {/* Left Column */}
              <View
                style={{
                  width: styles.tableSize.leftColumnWidth,
                }}>
                {/* Blank Cell */}
                <View style={tableDate.length > 0 && styles.tableFirstRow} />
                {/* Left Container */}
                <View>
                  <Table>
                    {tableKey.map((rowData, index) => {
                      return (
                        <TableWrapper key={index}>
                          <>
                            <Row
                              key={index}
                              data={[t(`${i18nScope}.${rowData}`)]}
                              widthArr={[styles.tableSize.leftColumnWidth]}
                              height={util.safePositiveValue(styles.tableSize.cellHeight)}
                              style={[
                                styles.row,
                                index % 2 && styles.tableContentRow,
                                rowData === 'changeInCashPosition' && changeInCashPositionStyle,
                                (rowData === 'cashPositionOpening' ||
                                  rowData === 'yearlyRemainingProvisioningTotal') &&
                                  cashPositionOpeningStyle,

                                !isExpanded &&
                                  checkupAsAt &&
                                  isHidden(rowData) && {
                                    display: 'none',
                                  },
                                rowData === 'targetedMonthlySurplus' &&
                                  checkupAsAt &&
                                  AppStyle.marginBottom30,
                              ]}
                              textStyle={[styles.tableTextLeft, cellStyle(rowData)]}
                            />
                            {rowData === 'yearlyRemainingProvisioningTotal' && checkupAsAt ? (
                              <TouchableField
                                activeOpacity={1}
                                style={[
                                  styles.expandedButtonView,
                                  {
                                    width: width - 30,
                                  },
                                ]}
                                onPress={() => {
                                  setIsExpanded(!isExpanded);
                                }}>
                                <View style={[styles.expandedButton, AppStyle.justifyContent]}>
                                  <FontAwesomeIcon
                                    name={isExpanded ? 'angle-double-up' : 'angle-double-down'}
                                    size={16}
                                    color={'#888888'}
                                  />
                                  <TextField style={AppStyle.marginLeft5}>
                                    {t(`${i18nScope}.otherDetails`)}
                                  </TextField>
                                </View>
                              </TouchableField>
                            ) : null}
                          </>
                        </TableWrapper>
                      );
                    })}
                  </Table>
                </View>
              </View>
              {/* Right Column */}
              <View style={AppStyle.flex1}>
                <ScrollView
                  ref={scrollRef}
                  scrollEventThrottle={16}
                  onContentSizeChange={scrollToEnd}
                  horizontal={true}
                  bounces={false}
                  showsHorizontalScrollIndicator={false}>
                  <View>
                    <Table>
                      <Row
                        data={tableDate}
                        widthArr={
                          tableData.length === 1
                            ? [AppSize.screen.width - 30 - styles.tableSize.leftColumnWidth]
                            : cellWidthArray
                        }
                        style={tableDate.length > 0 && styles.tableFirstRow2}
                        textStyle={[styles.tableTextTitle, checkupAsAt && AppStyle.textCenter]}
                      />
                    </Table>
                    <View>
                      <Table style={styles.cellContainer}>
                        {tableData.map((rowData, index) => {
                          const newRow = cloneDeep(rowData);
                          delete newRow.__typename;
                          return (
                            <TableWrapper key={index}>
                              {Object.keys(newRow).map((key, cellIndex) => {
                                return (
                                  <View key={cellIndex}>
                                    <Cell
                                      key={cellIndex}
                                      data={formatCurrency(newRow[key])}
                                      height={util.safePositiveValue(styles.tableSize.cellHeight)}
                                      style={[
                                        styles.row,
                                        cellIndex % 2 && styles.tableContentRow2,
                                        cellIndex % 2 &&
                                          index === tableDate.length - 1 &&
                                          styles.tableContentRow2Radius,
                                        key === 'changeInCashPosition' && changeInCashPositionStyle,
                                        (key === 'cashPositionOpening' ||
                                          key === 'yearlyRemainingProvisioningTotal') &&
                                          cashPositionOpeningStyle,
                                        checkupAsAt &&
                                          !isExpanded &&
                                          isHidden(key) && {
                                            display: 'none',
                                          },
                                        key === 'targetedMonthlySurplus' &&
                                          checkupAsAt &&
                                          AppStyle.marginBottom30,
                                      ]}
                                      width={util.safePositiveValue(
                                        tableDate.length === 1
                                          ? AppSize.screen.width -
                                              styles.scrollContent.marginHorizontal * 2 -
                                              styles.tableSize.leftColumnWidth
                                          : cellWidthArray[index],
                                      )}
                                      textStyle={[
                                        styles.tableTextCell,
                                        index === tableDate.length - 1 && styles.tableCellBold,
                                        checkupAsAt && AppStyle.textCenter,
                                        cellStyle(key),
                                      ]}
                                    />
                                    {checkupAsAt && key === 'yearlyRemainingProvisioningTotal' && (
                                      <TouchableField
                                        style={{ height: 74 }}
                                        onPress={() => {
                                          setIsExpanded(!isExpanded);
                                        }}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </TableWrapper>
                          );
                        })}
                      </Table>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

export default compose(
  withBackHandler,
  withDynamicModuleLoader([getModule()]),
)(MonthlyReportingDashboard);
