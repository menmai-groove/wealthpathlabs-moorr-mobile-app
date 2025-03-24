import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConfigs } from 'constant';
import { UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import CardItemCheckUp from 'screens/MonthlyCheckUp/components/CardItemCheckUp';
import { selectFlags } from 'store/Auth/selector';
import { getPreviusMonthlyCheckUpData } from 'store/MonthlyCheckUp/action';
import { selectOpenedCheckup, selectPreviousCheckUps } from 'store/MonthlyCheckUp/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.monthlyCheckUp';

const PreviusCheckUp = ({
  formatDateTimeString,
  handleEditCheckUp = () => {},
  defaultPage = 0,
  onPageChange = () => {},
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();
  const dispatchResolve = useDispatchResolve();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const { total, page, limit } = useSelector(selectPreviousCheckUps);

  const currentCheckup = useSelector(selectOpenedCheckup);
  const { checkUpFlow } = useSelector(selectFlags);

  useEffect(() => {
    if (defaultPage > 0) {
      dispatchResolve(getPreviusMonthlyCheckUpData({ page: defaultPage }))
        .then(res => {
          if (res) {
            setData(res);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      dispatch(getPreviusMonthlyCheckUpData({ page: 1 }));
      if (currentCheckup) {
        setData(currentCheckup);
        setLoading(false);
      }
    }
  }, [currentCheckup, dispatch]);

  const handlePrevius = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    setLoading(true);
    loadingRef.current = true;
    let prevPage = data?._id === currentCheckup?._id ? 1 : page + 1;
    dispatchResolve(getPreviusMonthlyCheckUpData({ page: prevPage }))
      .then(res => {
        if (res) {
          onPageChange(prevPage);
          setData(res);
        }
      })
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [currentCheckup, data, dispatchResolve, page]);

  const handleNext = useCallback(() => {
    if (page === 1 && data?._id !== currentCheckup?._id) {
      onPageChange(0);
      setData(currentCheckup);
    } else {
      const nextPage = page - 1;
      setLoading(true);
      dispatchResolve(getPreviusMonthlyCheckUpData({ page: nextPage }))
        .then(res => {
          if (res) {
            onPageChange(nextPage);
            setData(res);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [currentCheckup, data, dispatchResolve, page]);

  const previusIconActive = useMemo(() => {
    return (data?._id === currentCheckup?._id && total > 0) || page * limit < total;
  }, [currentCheckup, data, limit, page, total]);

  const nextIconActive = useMemo(() => {
    return page >= 1 && data?._id !== currentCheckup?._id;
  }, [currentCheckup, data, page]);

  const renderTimeHeader = useMemo(() => {
    if (data) {
      const { startDate } = data;
      const endDate = moment(startDate)
        .add(AppConfigs.circleMonthCheckUp - 1, 'months')
        .subtract(1, 'day');
      return (
        moment(startDate).format(formatDateTimeString) +
        ` ${t(`${i18nScope}.to`)} ` +
        moment(endDate).format(formatDateTimeString)
      );
    }
    return '';
  }, [data, formatDateTimeString, t]);

  const checkups = useMemo(() => {
    if (checkUpFlow) {
      let list =
        data?.balancesAsAt?.totalCheckupsBalances?.filter(
          x => x.checkupDate <= UtilLib.dateUTCAsAt(Date.now()).toISOString(),
        ) ?? [];
      return list;
    } else {
      return data?.balances;
    }
  }, [data]);

  return (
    <View style={styles.containerModalPrevius}>
      {loading ? (
        <View style={[AppStyle.marginTop20]}>
          <ContentLoader name="monthlyCheckUpPreviusHeader" />
        </View>
      ) : (
        <TextField type="heading-2" style={[AppStyle.textCenter, AppStyle.marginTop20]}>
          {renderTimeHeader}
        </TextField>
      )}
      <View
        style={[
          AppStyle.rowFlex,
          AppStyle.marginBottom10,
          AppStyle.marginTop30,
          AppStyle.padRight15,
          AppStyle.marginX15,
        ]}>
        <TouchableField
          style={[styles.iconArrowContainer, previusIconActive && styles.activeIconBackground]}
          disabled={!previusIconActive}
          onPress={handlePrevius}>
          <AntIcon
            name="arrowleft"
            style={[styles.iconArrow, previusIconActive && styles.activeIconArrow]}
          />
        </TouchableField>
        <View style={AppStyle.flex1} />
        <TextField type="captain" style={styles.widthColumn}>
          {t(`${i18nScope}.primaryAccountHeader`)}
        </TextField>
        <View style={styles.cardItemSpace} />
        <TextField type="captain" style={[styles.widthColumn, AppStyle.padRight10]}>
          {t(`${i18nScope}.creditAccountHeader`)}
        </TextField>
        <TouchableField
          style={[
            styles.iconArrowContainer,
            styles.iconRight,
            nextIconActive && styles.activeIconBackground,
          ]}
          disabled={!nextIconActive}
          onPress={handleNext}>
          <AntIcon
            name="arrowright"
            style={[styles.iconArrow, nextIconActive && styles.activeIconArrow]}
          />
        </TouchableField>
      </View>
      {loading ? (
        <View style={[AppStyle.flex1, AppStyle.marginTop20]}>
          <ContentLoader name="monthlyCheckUpPrevius" />
        </View>
      ) : (
        <FlatList
          bounces={false}
          data={checkups || []}
          showsVerticalScrollIndicator={false}
          style={AppStyle.flex1}
          renderItem={({ item, index }) => (
            <CardItemCheckUp
              startDate={moment(data?.startDate).add(index, 'months')}
              item={item}
              formatDateTimeString={formatDateTimeString}
              onPress={(itemCheckUp, startDate, isFirstItem, balanceAsAt) => {
                if (checkUpFlow) {
                  handleEditCheckUp(
                    {
                      ...itemCheckUp,
                      checkupDate: data?.balancesAsAt?.totalCheckupsBalances[index]?.checkupDate,
                    },
                    startDate,
                    isFirstItem,
                    balanceAsAt,
                    data,
                  );
                }
              }}
              hideIconCalendar={true}
              disable={data?._id !== currentCheckup?._id}
              disabledDelete={true}
              balanceAsAt={data?.balancesAsAt?.checkupBalances?.[index]}
            />
          )}
          ItemSeparatorComponent={() => <View style={AppStyle.marginTop10} />}
        />
      )}
    </View>
  );
};

export default PreviusCheckUp;
