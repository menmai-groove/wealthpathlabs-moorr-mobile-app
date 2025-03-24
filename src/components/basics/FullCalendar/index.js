import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AppStyle } from 'theme';

import themedStyles from './style';

export const CALENDAR_TYPES = {
  DAILY: 0,
  MONTHLY: 1,
  YEARLY: 2,
};

const HEADER_HEIGHT = 45;
// const MONTH_HEIGHT = 64;
const ITEM_PER_ROW = 4;

const i18nScope = 'components.fullCalendar';

function FullCalendar(
  {
    current = new Date(),
    onDateChange = () => {},
    type = CALENDAR_TYPES.DAILY,
    height = 300,
    animatedTransition = false,
    minDate,
    maxDate,
  },
  ref,
) {
  const styles = useThemedStyle({ ...themedStyles }, i18nScope);
  const calendarRef = useRef();

  const markedDateStyle = useMemo(
    () => ({
      selected: true,
      selectedColor: styles.primary.color,
      selectedTextColor: '#ffffff',
    }),
    [styles],
  );

  const [markedDates, setMarkedDates] = useState({
    [moment(current).format('YYYY-MM-DD')]: markedDateStyle,
  });
  const opacityRef = useRef(new Animated.Value(0));
  const translateYRef = useRef(new Animated.Value(height));
  const selectedDate = useMemo(() => new Date(current).getDate(), [current]);
  const selectedMonthIndex = useMemo(() => new Date(current).getMonth(), [current]);
  const selectedYear = useMemo(() => new Date(current).getFullYear(), [current]);
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState(CALENDAR_TYPES.DAILY);
  const [calendarValue, setCalendarValue] = useState({
    day: selectedDate,
    month: selectedMonthIndex + 1,
    year: selectedYear,
  });

  useImperativeHandle(ref, () => ({}));

  const getSelectedDayEvents = useCallback(
    dayInput => {
      const { dateString, day, month, year } = dayInput;
      let newMarkedDates = {};
      newMarkedDates[dateString] = markedDateStyle;
      setMarkedDates(newMarkedDates);
      const formatDate = new Date();
      formatDate.setFullYear(year);
      formatDate.setMonth(month - 1);
      formatDate.setDate(day);
      onDateChange(formatDate);
    },
    [markedDateStyle, onDateChange],
  );

  const onDayPress = useCallback(day => getSelectedDayEvents(day), [getSelectedDayEvents]);

  const onMonthChange = useCallback(
    data => {
      if (type !== CALENDAR_TYPES.DAILY) {
        onDayPress(data);
      }
      setCalendarValue(data);
    },
    [onDayPress, type],
  );

  useEffect(() => {
    if (animatedTransition) {
      Animated.parallel([
        Animated.timing(opacityRef.current, {
          toValue: visible ? 1 : 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(translateYRef.current, {
          toValue: visible ? 0 : height,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [animatedTransition, visible, height]);

  useEffect(() => {
    if (type !== CALENDAR_TYPES.DAILY) {
      setVisible(true);
      setLevel(type);
    }
  }, [type]);

  const reset = useCallback(() => {
    setVisible(false);
    setLevel(CALENDAR_TYPES.DAILY);
  }, []);

  const onMonthPress = useCallback(
    month => {
      calendarRef.current.addMonth(month - (calendarValue.month - 1));
      if (type !== CALENDAR_TYPES.MONTHLY) {
        reset();
      }
    },
    [calendarValue, reset, type],
  );

  const getYears = useCallback(() => {
    let yearStart;
    for (let i = calendarValue.year; i > 0; i--) {
      if (i % 12 === 0) {
        yearStart = i;
        break;
      }
    }
    return [...Array(12).keys()].map(i => yearStart + i);
  }, [calendarValue]);

  const renderHeader = useCallback(
    date => {
      const years = getYears();
      const d = new Date(date);
      const year = moment(d).format('YYYY');
      const dateString = moment(d).format('MMMM YYYY');

      return (
        <View style={AppStyle.rowFlex}>
          <TouchableField
            disabled={type === CALENDAR_TYPES.YEARLY}
            onPress={() => {
              setLevel(prevState => {
                if (prevState === CALENDAR_TYPES.YEARLY) {
                  setVisible(false);
                  return type !== CALENDAR_TYPES.DAILY ? type : CALENDAR_TYPES.DAILY;
                }
                setVisible(true);
                return prevState + 1;
              });
            }}>
            <TextField style={styles.primary} type="heading-4">
              {level === 0 && dateString}
              {level === 1 && year}
              {level === 2 && `${years[0]}-${years[11]}`}
            </TextField>
          </TouchableField>
        </View>
      );
    },
    [getYears, type, styles, level],
  );

  const addMonth = useCallback((monthsInput = 1) => calendarRef.current.addMonth(monthsInput), []);
  const subtractMonth = useCallback(
    (monthsInput = 1) => calendarRef.current.addMonth(-monthsInput),
    [],
  );
  const addYear = useCallback(
    (yearsInput = 1) => calendarRef.current.addMonth(yearsInput * 12),
    [],
  );
  const subtractYear = useCallback(
    (yearsInput = 1) => calendarRef.current.addMonth(-yearsInput * 12),
    [],
  );

  const renderMonths = useCallback(() => {
    const months = moment.months();
    return (
      <View style={[AppStyle.rowFlex, styles.monthsContainer]}>
        {months.map((m, index) => {
          const isRowLast = (index + 1) % ITEM_PER_ROW === 0;
          const dividedValue = parseInt(months.length / ITEM_PER_ROW, 10);
          const hasMod = months.length % ITEM_PER_ROW > 0;
          const columnNearLast = hasMod ? dividedValue : dividedValue - 1;
          const isColumnLast = index + 1 > ITEM_PER_ROW * columnNearLast;
          const isSelectedMonthIndex = index + 1 === calendarValue?.month;
          const isSelectedYear = selectedYear === calendarValue?.year;
          const isSelected = isSelectedMonthIndex && isSelectedYear;

          return (
            <TouchableField
              key={`month-${m}`}
              style={[
                {
                  width: `${100 / ITEM_PER_ROW}%`,
                  height: (height - HEADER_HEIGHT) / 3 - 20,
                },
                styles.monthButton,
                isRowLast && styles.borderRight,
                isColumnLast && styles.borderBottom,
              ]}
              onPress={() => onMonthPress(index)}>
              <Text style={[isSelected ? styles.selectedText : styles.text]}>{m}</Text>
            </TouchableField>
          );
        })}
      </View>
    );
  }, [calendarValue, height, onMonthPress, selectedYear, styles]);

  const onYearPress = useCallback(
    year => {
      const subtracted = year - calendarValue.year;
      addYear(subtracted);
      if (type === CALENDAR_TYPES.YEARLY) {
        return;
      }
      setLevel(CALENDAR_TYPES.MONTHLY);
    },
    [addYear, calendarValue, type],
  );

  const renderYears = useCallback(() => {
    const years = getYears();
    return (
      <View style={[AppStyle.rowFlex, styles.monthsContainer]}>
        {years.map((y, index) => {
          const isRowLast = (index + 1) % ITEM_PER_ROW === 0;
          const dividedValue = parseInt(years.length / ITEM_PER_ROW, 10);
          const hasMod = years.length % ITEM_PER_ROW > 0;
          const columnNearLast = hasMod ? dividedValue : dividedValue - 1;
          const isColumnLast = index + 1 > ITEM_PER_ROW * columnNearLast;
          const isSelectedYear = y === calendarValue.year;

          return (
            <TouchableField
              key={`year-${y}`}
              style={[
                {
                  width: `${100 / ITEM_PER_ROW}%`,
                  height: (height - HEADER_HEIGHT) / 3 - 20,
                },
                styles.monthButton,
                isRowLast && styles.borderRight,
                isColumnLast && styles.borderBottom,
              ]}
              onPress={() => onYearPress(y)}>
              <TextField style={[isSelectedYear ? styles.selectedText : styles.text]}>
                {y}
              </TextField>
            </TouchableField>
          );
        })}
      </View>
    );
  }, [height, onYearPress, styles, getYears, calendarValue]);

  return (
    <Fragment>
      <Calendar
        ref={calendarRef}
        current={current}
        markedDates={markedDates}
        monthFormat={'MMMM YYYY'}
        minDate={minDate}
        maxDate={maxDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        theme={{
          // backgroundColor: '#ffffff',
          // calendarBackground: '#ffffff',
          todayTextColor: styles.primary.color,
          // dayTextColor: '#222222',
          // textDisabledColor: '#d9e1e8',
          monthTextColor: styles.primary.color,
          arrowColor: styles.primary.color,
          // textDayFontWeight: '300',
          // textMonthFontWeight: 'bold',
          // textDayHeaderFontWeight: '500',
          // textDayFontSize: 16,
          // textMonthFontSize: 18,
          selectedDayBackgroundColor: styles.primary.color,
          // selectedDayTextColor: 'white',
          // textDayHeaderFontSize: 8,
        }}
        renderHeader={renderHeader}
        // Handler which gets executed when press arrow icon left. It receive a callback can go back month
        onPressArrowLeft={() => {
          if (level === 2) {
            subtractYear(12);
            return;
          }
          if (level === 1) {
            subtractYear();
            return;
          }
          subtractMonth();
        }}
        // Handler which gets executed when press arrow icon right. It receive a callback can go next month
        onPressArrowRight={() => {
          if (level === 2) {
            addYear(12);
            return;
          }
          if (level === 1) {
            addYear();
            return;
          }
          addMonth();
        }}
      />

      {level !== 0 && (
        <Animated.View
          style={[
            styles.monthYearContainer,
            {
              top: HEADER_HEIGHT,
              height: height - HEADER_HEIGHT,
            },
            animatedTransition && {
              opacity: opacityRef.current,
              transform: [
                {
                  translateY: translateYRef.current,
                },
              ],
            },
          ]}>
          {level === 1 && renderMonths()}
          {level === 2 && renderYears()}
        </Animated.View>
      )}
    </Fragment>
  );
}

export default forwardRef(FullCalendar);
