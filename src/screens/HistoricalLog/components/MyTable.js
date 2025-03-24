import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import CustomTooltip from 'components/basics/CustomTooltip';
import TextField from 'components/basics/TextField';
import { AppConstants } from 'constant';
import { formatCurrency } from 'libs/util';
import { get, includes, isArray, uniqBy } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Pressable, ScrollView, View } from 'react-native';
import { Row, Table } from 'react-native-reanimated-table';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RECORD_TYPE } from 'screens/HistoricalLog';
import { selectOwnersWithOthers } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.historicalLog';

const windowWidth = Dimensions.get('window').width;

const ROW_HEIGHT = 50;
const LEFT_WIDTH = 150;
const LEFT_WIDTH_WITH_YEAR = 100;
const WIDTH_ARR_LENGTH_2 = [windowWidth - LEFT_WIDTH - 15 * 2];

const MyTable = ({
  data,
  heading,
  breadcrumb,
  formatDateTimeString,
  onDelete,
  recordType,
  onPress,
  fieldName,
  fields,
  ownershipDetails,
  info,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);
  const isNoData = data?.length === 0;
  const iconRight = get(fields, '0.iconRight');
  const dataType = get(fields, '0.dataType');
  const isPercent = iconRight === 'percent';
  const isBoolean = dataType === 'boolean';
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollViewRef = useRef();
  const swipeRightRef = useRef({});
  const ownershipWithOther = useSelector(selectOwnersWithOthers);
  const ownerships = ownershipWithOther.filter(
    x => x.ownershipType !== AppConstants.ownershipType.Joint,
  );
  const cellWidth = recordType === RECORD_TYPE.DEPRECIATION ? 150 : 130;

  const disableDelete = useMemo(() => {
    if (data) {
      var list = data.filter(x => x.actionType !== 'archive' && x.actionType !== 'restore');
      return list.length === 1 && info.restrictValue != null;
    }
    return false;
  }, [data]);

  const handleItem = (item, raw) => {
    const { actionType } = item;
    if (actionType === 'archive') {
      return ['Archive'];
    }
    if (actionType === 'restore') {
      return ['Restore'];
    }
    return raw;
  };

  const table = useMemo(() => {
    switch (recordType) {
      case RECORD_TYPE.NUMBER:
        if (fields[0].id === 'interestRate' && fields[0].component === 'interestRate') {
          const loanType = info.loanTypeValue;
          const showFullRate =
            loanType?.value === AppConstants.Borrowing.LoanType.Other ||
            includes(loanType?.tags, AppConstants.Borrowing.Mortgage);
          const tableHead = !showFullRate
            ? ['Date', 'Current Interest Rate']
            : ['Date', 'Current Interest Rate', 'Base Rate', 'Discount off Base Rate'];
          return {
            tableHead,
            tableData: data?.map(item => [
              item?.asAt,
              ...handleItem(
                item,
                !showFullRate
                  ? [`${item.numberValue || 0}%`]
                  : Object.values(item.numberValues).map(x => `${x || 0}%`),
              ),
            ]),
          };
        }
        const checkBoolean = isBoolean || fields[0].id === 'isTrackedInMoneySmarts';
        return {
          tableHead: ['Date', fieldName],
          tableData: data?.map(item => [
            item?.asAt,
            ...handleItem(item, [
              checkBoolean
                ? item?.numberValue === 1
                  ? 'Yes'
                  : 'No'
                : isPercent
                ? `${item?.numberValue || 0}%`
                : formatCurrency(item?.numberValue),
            ]),
          ]),
        };
      case RECORD_TYPE.NUMBER_WITH_FREQUENCY:
        let tableHead = ['Date', fieldName, 'Frequency'];
        let tableData = data?.map(item => [
          item?.asAt,
          ...handleItem(item, [formatCurrency(item?.numberValue), item?.frequencyName]),
        ]);
        if (isArray(info.field) && info.field[0] === 'essentialAmount') {
          tableHead = ['Date', 'Budgeted Essential', 'Budgeted Discretionary', 'Frequency'];
          tableData = data?.map(item => [
            item?.asAt,
            ...handleItem(item, [
              ...Object.values(item.numberValues).map(x => formatCurrency(x)),
              item?.frequencyName,
            ]),
          ]);
        }
        return {
          tableHead: tableHead,
          tableData: tableData,
        };
      case RECORD_TYPE.STRING:
        return {
          tableHead: ['Date', fieldName],
          tableData: data?.map(item => [item?.asAt, ...handleItem(item, [item?.stringValue])]),
        };
      case RECORD_TYPE.OWNERSHIP:
        const tableDatas = data?.map(row => {
          const { ownershipId, asAt, actionType } = row;

          const ownershipDetail = ownershipDetails.find(x => x._id === ownershipId);
          let results = [];
          if (ownershipDetail) {
            results = ownerships.map(x => {
              let percentage = 0;
              if (x.ownershipType === AppConstants.ownershipType.Other) {
                percentage =
                  100 -
                  uniqBy(ownershipDetail.owners, 'owner')?.reduce(
                    (total, owner) => total + Number(owner.percentage),
                    0,
                  );
              }
              if (x.ownershipType === AppConstants.ownershipType.Sole) {
                percentage = ownershipDetail.owners.find(o => o.owner === x.value)?.percentage ?? 0;
              }

              return {
                label: x.label,
                percentage: `${percentage.toFixed(2)}%`,
              };
            });
          } else {
            results = ownerships.map((x, idx) => {
              let label = '';
              if (actionType === 'archive') {
                label = 'Archive';
              }
              if (actionType === 'restore') {
                label = 'Restore';
              }
              return {
                label: x.label,
                percentage: idx === 0 ? label : '',
              };
            });
          }
          results.unshift({
            label: 'Date',
            percentage: asAt,
          });
          return results;
        });

        return {
          tableHead:
            tableDatas.length > 0
              ? tableDatas?.[0]?.map(x => x.label)
              : ['Date', ...ownerships.map(x => x.label)],
          tableData: tableDatas.map(x => x.map(o => o.percentage)),
        };
      case RECORD_TYPE.OBJECT_IDS:
        let result = data.map(item => {
          item.values = item.stringValues?.map(value =>
            fields[0]?.options.find(x => x.value === value),
          );
          return item;
        }, []);
        return {
          tableHead: ['Date', fieldName],
          tableData: result?.map(item => {
            return [
              item?.asAt,
              ...handleItem(item, [
                item.values
                  ?.map(x => x?.display?.trim())
                  ?.filter(x => x != null)
                  ?.join(', '),
              ]),
            ];
          }),
          values: result,
        };
      case RECORD_TYPE.DEPRECIATION:
        return {
          tableHead: [
            'Tax Year\nEnding',
            'Total Annual\nDepreciation',
            'Plant & Equipment\n(Div 40)',
            'Capital Works\n(Div 43)',
          ],
          tableData: data?.map(item => [
            item?.asAt,
            ...handleItem(
              item,
              Object.values(item.numberValues).map(x => formatCurrency(x)),
            ),
          ]),
        };
      default:
        return {
          tableHead: [],
          tableData: [],
        };
    }
  }, [
    data,
    fieldName,
    fields,
    info,
    isBoolean,
    isPercent,
    ownershipDetails,
    ownerships,
    recordType,
  ]);

  const column1Head = [[table.tableHead[0]]];
  const column1Data = table.tableData.map(tableItem => [tableItem[0]]);
  const leftData = [].concat(column1Head).concat(column1Data);

  const column2Head = [table.tableHead.map(tableHeadItem => [tableHeadItem])];
  const column2Data = table.tableData;
  const rightData = []
    .concat(column2Head)
    .concat(column2Data)
    .map(rightItem => rightItem.slice(1, rightItem.length));

  const closeSwipeable = useCallback(id => {
    Object.keys(swipeRightRef.current).forEach(key => {
      if (key !== String(id)) {
        swipeRightRef.current[key]?.close();
      }
    });
  }, []);

  const onSwipeableOpen = useCallback(direction => {
    switch (direction) {
      case 'right':
        scrollViewRef.current?.scrollToEnd({ animated: true });
        break;
      default:
        break;
    }
  }, []);

  const renderDate = useCallback(
    (value, disabled) => {
      const image = require('assets/images/common/calendar.png');
      const asAt = value;
      return (
        <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.pad15]}>
          <Image
            source={image}
            style={styles.iconDate}
            tintColor={disabled ? styles.textDisabled.color : undefined}
          />
          <View style={[AppStyle.flex1, styles.open]}>
            <TextField style={[styles.textDateOpen, disabled && styles.textDisabled]}>
              {moment(asAt).format(
                recordType === RECORD_TYPE.DEPRECIATION ? 'YYYY' : formatDateTimeString,
              )}
            </TextField>
          </View>
        </View>
      );
    },
    [formatDateTimeString, recordType, styles],
  );

  const renderRow = useCallback(
    ({ key, rowData, widthArr, isEven, isHead, onPress: onPressInput, disabled }) => {
      return (
        <Pressable key={key} onPress={onPressInput}>
          <Row
            data={rowData}
            widthArr={widthArr}
            height={ROW_HEIGHT}
            style={[
              styles.row,
              !isEven && styles.tableContentRow,
              isHead && styles.tableFirstRow,
              // disabled && styles.disabled,
            ]}
            textStyle={[
              styles.tableTextLeft,
              recordType === RECORD_TYPE.DEPRECIATION && AppStyle.textCenter,
              disabled && styles.textDisabled,
            ]}
            numberOfLines={2}
          />
        </Pressable>
      );
    },
    [recordType, styles],
  );

  const headerLeftWidth =
    recordType === RECORD_TYPE.DEPRECIATION ? LEFT_WIDTH_WITH_YEAR : LEFT_WIDTH;

  const renderLeft = useCallback(() => {
    return (
      <View style={{ width: headerLeftWidth }}>
        <View>
          <Table>
            {leftData.map((rowData, index) => {
              const key = `left-row-${index}`;
              const isHead = index === 0;
              const isEven = index % 2;
              const widthArr = [headerLeftWidth];
              let isRestrictValue = true;
              if (info.restrictValue && !isHead) {
                const _item = data[index - 1];
                isRestrictValue = info.restrictValue.some(x => _item?.stringValue?.includes(x));
              }
              const formatRowData = rowData.map((rowItem, rii) => {
                const isFirst = rii === 0;
                if (isFirst && !isHead) {
                  return renderDate(rowItem, !isRestrictValue);
                }
                return rowItem;
              });

              return renderRow({
                key,
                rowData: isHead ? rowData : formatRowData,
                widthArr,
                isEven,
                isHead,
                onPress: () => {
                  if (isHead || !isRestrictValue) {
                    return;
                  }
                  if (typeof onPress === 'function') {
                    const item = data[index - 1];
                    onPress(item);
                  }
                },
                disabled: !isRestrictValue,
              });
            })}
          </Table>
        </View>
      </View>
    );
  }, [headerLeftWidth, leftData, renderRow, renderDate, onPress, data]);

  const renderRight = useCallback(() => {
    return (
      <View style={AppStyle.flex1}>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          bounces={false}
          showsHorizontalScrollIndicator={false}>
          <View>
            <Table>
              {rightData.map((rowData, index) => {
                const key = `right-row-${index}`;
                const isHead = index === 0;
                const isEven = index % 2;
                const widthArr =
                  table.tableHead.length === 2
                    ? WIDTH_ARR_LENGTH_2
                    : table.tableHead.slice(1, table.tableHead.length).map(() => cellWidth);
                const item = data[index - 1];
                const id = get(item, 'id');
                const actionType = get(item, 'actionType');
                if (isHead) {
                  return renderRow({
                    key,
                    rowData,
                    widthArr,
                    isEven,
                    isHead,
                  });
                }
                let isRestrictValue = true;
                if (info.restrictValue) {
                  isRestrictValue = info.restrictValue.some(x => item.stringValue?.includes(x));
                }
                return (
                  <CardItemWithTrashIcon
                    key={`row-data-${index}`}
                    ref={parentCardRef => {
                      swipeRightRef.current[id] = parentCardRef;
                    }}
                    overshootRight={false}
                    onSwipeableOpen={direction => {
                      closeSwipeable(id);
                      onSwipeableOpen(direction);
                    }}
                    onDelete={() => {
                      if (typeof onDelete === 'function') {
                        onDelete(item);
                        closeSwipeable();
                      }
                    }}
                    swipeDisabled={
                      !isRestrictValue ||
                      actionType === 'archive' ||
                      actionType === 'restore' ||
                      disableDelete
                    }>
                    {renderRow({
                      key,
                      rowData,
                      widthArr,
                      isEven,
                      isHead,
                      onPress: () => {
                        if (isHead || !isRestrictValue) {
                          return;
                        }
                        if (typeof onPress === 'function') {
                          onPress(item);
                        }
                      },
                      disabled: !isRestrictValue,
                    })}
                  </CardItemWithTrashIcon>
                );
              })}
            </Table>
          </View>
        </ScrollView>
      </View>
    );
  }, [
    rightData,
    table.tableHead,
    data,
    renderRow,
    closeSwipeable,
    onSwipeableOpen,
    onDelete,
    onPress,
    cellWidth,
  ]);

  return (
    <View>
      <View style={AppStyle.marginBottom10}>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <TextField type="heading-3" font="medium" style={AppStyle.rowFlex}>
            {heading}
          </TextField>
          {info?.tooltip && (
            <View style={[AppStyle.padLeft5]}>
              <CustomTooltip
                hideArrow
                placement="left"
                content={
                  <TextField
                    style={styles.contentContainer}
                    type="captain"
                    onLayout={event => {
                      if (contentHeight === 0) {
                        setContentHeight(event.nativeEvent.layout.height);
                      }
                    }}>
                    {t(info?.tooltip, info?.tooltip)}
                  </TextField>
                }
                displayInsets={{ top: contentHeight / 2 }}
              />
            </View>
          )}
        </View>
        <TextField type="paragraph-2" style={AppStyle.rowFlex}>
          {breadcrumb}
        </TextField>
      </View>
      <View style={AppStyle.rowFlex}>
        {/* LEFT */}
        {renderLeft()}
        {/* RIGHT */}
        {renderRight()}
      </View>
      {isNoData ? (
        <View style={[styles.row, AppStyle.justifyContent, AppStyle.alignContent]}>
          <TextField>No data</TextField>
        </View>
      ) : null}
    </View>
  );
};

export default MyTable;
