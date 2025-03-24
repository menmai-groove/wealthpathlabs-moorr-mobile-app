import TextField from 'components/basics/TextField';
import { UtilLib } from 'libs';
import { useThemedStyle } from 'providers/';
import React, { memo, useCallback } from 'react';
import { View, ViewStyle, ImageStyle, Pressable } from 'react-native';
import { AppStyle } from 'theme';
import CalendarIcon from 'assets/svgs/profile/calendar';
import ArrowRightIcon from 'assets/svgs/arrowRightIcon';

interface ICardItem {
  data: any;
  onPressItem: (item: any) => void;
  disabled?: boolean;
  type?: string;
}

export const CardItem = memo(function CardItem({ data, onPressItem, disabled, type }: ICardItem) {
  const { frequency, name, amount = 0 } = data;
  const styles = useThemedStyle(themeStyle);

  const onPress = useCallback(() => {
    onPressItem(data);
  }, [data, onPressItem]);

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}>
      <View
        style={[
          styles.lineLeft,
          type === 'expenses' && styles.expensesLineLeft,
          type === 'income' && styles.incomeLineLeft,
          data.isArchived && styles.archivedBackground,
        ]}
      />
      <View style={styles.centerItem}>
        <View style={AppStyle.rowFlex}>
          <TextField type="heading-4" style={AppStyle.flex1}>
            {name}
          </TextField>
          <TextField type="heading-4">{UtilLib.formatCurrency(amount ?? 0)}</TextField>
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginTop10]}>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <CalendarIcon />
            <TextField style={[AppStyle.marginLeft5, styles.frequencyText]}>{frequency}</TextField>
          </View>
          <View>
            <TextField style={styles.link}>
              {type === 'expenses' ? 'Expense Card' : undefined}
              {type === 'income' ? 'Income Card' : undefined}
            </TextField>
          </View>
        </View>
      </View>
      <View style={styles.arrowRight}>
        <ArrowRightIcon />
      </View>
    </Pressable>
  );
});

const themeStyle = {
  container: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  } as ViewStyle,
  centerItem: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  } as ViewStyle,
  lineLeft: { width: 4 } as ViewStyle,
  expensesLineLeft: { backgroundColor: 'palette.color-orange-1' },
  incomeLineLeft: { backgroundColor: 'palette.color-green-2' },
  arrowRight: {
    backgroundColor: 'palette.color-line-2',
    justifyContent: 'center',
    paddingHorizontal: 5,
  } as ViewStyle,
  iconLeft: { height: 14, width: 14, tintColor: 'palette.color-grey-3' } as ImageStyle,
  disabledContainer: { opacity: 0.5 },
  frequencyText: { color: 'palette.color-grey-3' },
  link: {
    color: 'palette.color-blue-2',
  },
  archivedBackground: {
    backgroundColor: 'palette.color-grey-3',
  },
};
