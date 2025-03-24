import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AppStyle } from 'theme';

import themedStyles from './style';

const TYPE = {
  MONTH: 'MONTH',
  YEAR: 'YEAR',
};

const HEADER_HEIGHT = 45;
const MONTH_HEIGHT = 64;
const ITEM_PER_ROW = 4;

function CustomCalendar({ current = new Date(), onDateChange = () => {}, height = 300 }, ref) {
  const styles = useThemedStyle({ ...themedStyles }, 'components.customCalendar');
  const calendarRef = useRef();

  const markedDateStyle = {
    selected: true,
    selectedColor: styles.primary.color,
    selectedTextColor: '#ffffff',
  };

  const formattedDate = moment(current).format('YYYY-MM-DD');
  const [markedDates, setMarkedDates] = useState({
    [formattedDate]: markedDateStyle,
  });
  const opacityRef = useRef(new Animated.Value(0));
  const translateYRef = useRef(new Animated.Value(500));
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date(current).getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date(current).getFullYear());
  const [visible, setVisible] = useState(0);
  const [type, setType] = useState(TYPE.MONTH);

  useImperativeHandle(ref, () => ({}));

  const getSelectedDayEvents = useCallback(
    date => {
      let newMarkedDates = {};
      newMarkedDates[date] = markedDateStyle;
      setMarkedDates(newMarkedDates);
      onDateChange(new Date(date));
    },
    [markedDateStyle, onDateChange],
  );

  const onDayPress = useCallback(
    day => {
      // console.log("day", day.dateString)
      getSelectedDayEvents(day.dateString);
    },
    [getSelectedDayEvents],
  );

  const onMonthChange = useCallback(
    month => {
      // console.log("month", month)
      let monthIndex = month.month - 1;
      let year = month.year;
      // if (type === TYPE.YEAR && month.year > selectedMonthIndex) {
      //   year += 1;
      // }
      // if (type === TYPE.YEAR && month.month < selectedMonthIndex) {
      //   year -= 1;
      // }
      setSelectedMonthIndex(monthIndex);
      setSelectedYear(year);
      onDayPress(month);
    },
    [onDayPress],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityRef.current, {
        toValue: visible,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(translateYRef.current, {
        toValue: visible === 1 ? 0 : 500,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [visible]);

  const toggleMonthYear = useCallback(
    typeInput => {
      setVisible(prevState => {
        setType(typeInput);
        if (prevState === 1) {
          if (type !== typeInput) {
            return prevState;
          }
          return 0;
        }
        return 1;
      });
    },
    [type],
  );

  const onMonthPress = useCallback(
    month => {
      calendarRef.current.addMonth(month - selectedMonthIndex);
      setVisible(false);
    },
    [selectedMonthIndex],
  );

  const renderHeader = useCallback(
    date => {
      const d = new Date(date);
      const month = moment(d).format('MMMM');
      const year = moment(d).format('YYYY');
      return (
        <View style={AppStyle.rowFlex}>
          <Pressable onPress={() => toggleMonthYear(TYPE.MONTH)}>
            <Text style={styles.primary}>{month}</Text>
          </Pressable>
          <Text style={styles.primary}> </Text>
          <Pressable onPress={() => toggleMonthYear(TYPE.YEAR)}>
            <Text style={styles.primary}>{year}</Text>
          </Pressable>
        </View>
      );
    },
    [styles.primary, toggleMonthYear],
  );

  const months = moment.months();

  const renderMonths = () => (
    <View style={[AppStyle.rowFlex, styles.monthsContainer]}>
      {months.map((m, index) => {
        const isRowLast = (index + 1) % ITEM_PER_ROW === 0;
        const dividedValue = parseInt(months.length / ITEM_PER_ROW, 10);
        const hasMod = months.length % ITEM_PER_ROW > 0;
        const columnNearLast = hasMod ? dividedValue : dividedValue - 1;
        const isColumnLast = index + 1 > ITEM_PER_ROW * columnNearLast;
        const isSelectedMonthIndex = index === selectedMonthIndex;

        return (
          <Pressable
            key={`month-${m}`}
            style={[
              {
                width: `${100 / ITEM_PER_ROW}%`,
                height: MONTH_HEIGHT,
              },
              styles.monthButton,
              isRowLast && styles.borderRight,
              isColumnLast && styles.borderBottom,
            ]}
            onPress={() => onMonthPress(index)}>
            <Text style={[isSelectedMonthIndex ? styles.selectedText : styles.text]}>{m}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const onYearPress = useCallback(
    year => {
      const subtracted = year - selectedYear;
      calendarRef.current.addMonth(subtracted * 12);
      setVisible(false);
    },
    [selectedYear],
  );

  let yearStart;
  for (let i = selectedYear; i > 0; i--) {
    if (i % 12 === 0) {
      yearStart = i;
      break;
    }
  }
  const years = [...Array(12).keys()].map(i => yearStart + i);

  const renderYears = () => (
    <View style={[AppStyle.rowFlex, styles.monthsContainer]}>
      {years.map((y, index) => {
        const isRowLast = (index + 1) % ITEM_PER_ROW === 0;
        const dividedValue = parseInt(years.length / ITEM_PER_ROW, 10);
        const hasMod = years.length % ITEM_PER_ROW > 0;
        const columnNearLast = hasMod ? dividedValue : dividedValue - 1;
        const isColumnLast = index + 1 > ITEM_PER_ROW * columnNearLast;
        const isSelectedYear = y === selectedYear;

        return (
          <Pressable
            key={`year-${y}`}
            style={[
              {
                width: `${100 / ITEM_PER_ROW}%`,
                height: MONTH_HEIGHT,
              },
              styles.monthButton,
              isRowLast && styles.borderRight,
              isColumnLast && styles.borderBottom,
            ]}
            onPress={() => onYearPress(y)}>
            <Text style={[isSelectedYear ? styles.selectedText : styles.text]}>{y}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Fragment>
      <Calendar
        ref={calendarRef}
        current={current}
        markedDates={markedDates}
        monthFormat={'MMMM YYYY'}
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
        renderHeader={props => renderHeader(props)}
      />

      <Animated.View
        style={[
          AppStyle.flex1,
          {
            top: HEADER_HEIGHT,
            height: height - HEADER_HEIGHT,
            opacity: opacityRef.current,
            transform: [
              {
                translateY: translateYRef.current,
              },
            ],
          },
          styles.monthYearContainer,
        ]}>
        {type === TYPE.MONTH ? renderMonths() : renderYears()}
      </Animated.View>
    </Fragment>
  );
}

export default forwardRef(CustomCalendar);
