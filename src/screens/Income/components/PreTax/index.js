import ArrowRight from 'assets/svgs/menu/arrowRight';
import CalendarIcon from 'assets/svgs/profile/calendar';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { UtilLib } from 'libs';
import { useThemedStyle } from 'providers/';
import React from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themeStyle from './style';

function PreTaxItem({ data, handleOpenModal }) {
  const { name, amount, frequency } = data;
  const styles = useThemedStyle(themeStyle);
  return (
    <TouchableField style={[AppStyle.rowFlex, styles.container]} onPress={handleOpenModal}>
      <View style={styles.lineLeft} />
      <View style={[AppStyle.flex1, AppStyle.pad15, styles.centerItem]}>
        <View style={[AppStyle.rowFlex]}>
          <TextField type="heading-4" style={AppStyle.flex1}>
            {name}
          </TextField>
          <TextField type="heading-4">{UtilLib.formatCurrency(amount)}</TextField>
        </View>
        <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
          <CalendarIcon />
          <TextField style={(AppStyle.flex1, AppStyle.marginLeft10)}>{frequency}</TextField>
        </View>
      </View>
      <View style={[AppStyle.justifyContent, styles.iconRight]}>
        <ArrowRight />
      </View>
    </TouchableField>
  );
}

export default PreTaxItem;
