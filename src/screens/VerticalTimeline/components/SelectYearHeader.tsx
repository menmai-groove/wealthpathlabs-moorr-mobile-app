import React, { useCallback, useEffect, useMemo, memo, useRef } from 'react';
import { View, useWindowDimensions, ViewStyle, FlatList, TouchableOpacity } from 'react-native';
import { max } from 'lodash';
import isEqual from 'react-fast-compare';
import { useThemedStyle } from 'providers';
import TextField from 'components/basics/TextField';
import { AppStyle } from 'theme';

type YearOptionProps = {
  display: string;
  value: number;
};
interface ISelectYearItem {
  onPressItem: (i: number) => void;
  index: number;
  style: ViewStyle;
  text: string;
  selected: boolean;
}

const SelectYearItem = memo(
  function SelectYearItem({ onPressItem, index, style, text, selected }: ISelectYearItem) {
    const styles = useThemedStyle(themedStyles);
    return (
      <TouchableOpacity
        onPress={() => onPressItem(index)}
        style={[style, selected ? styles.btnPrimary : styles.btnText]}>
        <TextField type="heading-4" style={selected && styles.selectedBtnText}>
          {text}
        </TextField>
      </TouchableOpacity>
    );
  },
  (prev, next) => isEqual(prev, next),
);
interface ISelectYearHeader {
  currentIndex: number;
  onPressItem: (i: number) => void;
  options: YearOptionProps[];
  onDidMount?: () => void;
}
export function SelectYearHeader({
  currentIndex = 0,
  onPressItem,
  options = [],
}: ISelectYearHeader) {
  const calendarRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();
  const styles = useThemedStyle(themedStyles);
  const itemHeight = 36;

  const itemWidth = useMemo(() => windowWidth / 5, [windowWidth]);
  const snapToOffsets = useMemo(
    () => options.map((_, index) => index * itemWidth),
    [itemWidth, options],
  );

  useEffect(() => {
    if (currentIndex >= 0 && calendarRef.current) {
      const offset = itemWidth * max([currentIndex - 2, 0]);
      setTimeout(() => {
        calendarRef.current?.scrollToOffset({ animated: true, offset });
      });
    }
  }, [currentIndex, itemWidth]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const isSelected = currentIndex === index;
      return (
        <SelectYearItem
          index={index}
          selected={isSelected}
          onPressItem={onPressItem}
          text={item.display}
          style={{ minWidth: itemWidth, height: itemHeight }}
        />
      );
    },
    [currentIndex, itemWidth, onPressItem],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      index,
      length: itemWidth,
      offset: itemWidth * index,
    }),
    [itemWidth],
  );
  const keyExtractor = useCallback(item => item.display, []);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        contentContainerStyle={[AppStyle.padY10, AppStyle.padX15]}
        ref={calendarRef}
        keyExtractor={keyExtractor}
        data={options}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        windowSize={5}
        initialNumToRender={5}
        pagingEnabled
        snapToOffsets={snapToOffsets}
      />
    </View>
  );
}

const themedStyles = {
  container: {
    height: 56,
  } as ViewStyle,
  btnPrimary: {
    backgroundColor: '#541868',
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: 'center',
  } as ViewStyle,
  selectedBtnText: {
    color: 'white',
  },
  btnText: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: 'center',
  } as ViewStyle,
};
