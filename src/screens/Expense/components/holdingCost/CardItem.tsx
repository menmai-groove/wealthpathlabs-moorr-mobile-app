import TextField from 'components/basics/TextField';
import { UtilLib } from 'libs';
import { useThemedStyle } from 'providers/';
import React, { memo } from 'react';
import { View, Image, ViewStyle, ImageStyle, Pressable } from 'react-native';
import { AppStyle } from 'theme';
import { SubmitDataHoldingCostType } from 'screens/Expense/types';

interface ICardItem {
  data: SubmitDataHoldingCostType;
  onPressItem: (item: SubmitDataHoldingCostType) => void;
  disabled?: boolean;
}

export const CardItem = memo(function CardItem({ data, onPressItem, disabled }: ICardItem) {
  const { holdingCostName, holdingCostLabel, essentialAmount = 0, jar } = data;
  const styles = useThemedStyle(themeStyle);

  const onPress = () => {
    onPressItem(data);
  };

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.lineLeft} />
      <View style={styles.centerItem}>
        <View style={AppStyle.rowFlex}>
          <TextField type="heading-4" style={AppStyle.flex1}>
            {holdingCostLabel || holdingCostName}
          </TextField>
          <TextField type="heading-4">{UtilLib.formatCurrency(essentialAmount)}</TextField>
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
          <Image
            source={require('assets/images/common/jar-money.png')}
            style={styles.iconLeft}
            resizeMode="contain"
          />
          <TextField style={(AppStyle.flex1, AppStyle.marginLeft5)}>{jar}</TextField>
        </View>
      </View>
      <View style={[AppStyle.justifyContent, styles.iconRight]} />
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
    paddingVertical: 20,
    backgroundColor: 'white',
  } as ViewStyle,
  lineLeft: { width: 4, backgroundColor: 'palette.color-orange-1' } as ViewStyle,
  iconRight: { backgroundColor: 'palette.color-line-2', paddingHorizontal: 5 } as ViewStyle,
  iconLeft: { height: 14, width: 14, tintColor: 'palette.color-grey-3' } as ImageStyle,
  disabledContainer: { opacity: 0.5 },
};
