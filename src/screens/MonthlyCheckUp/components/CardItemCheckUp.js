import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { formatCurrency } from 'libs/util';
import { get, toNumber } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectFlags } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.monthlyCheckUp';
const CardItemCheckUp = ({
  item,
  formatDateTimeString,
  startDate,
  onPress,
  hideIconCalendar,
  disable,
  disabledDelete,
  onDelete,
  isFirstItem,
  onPressStartDate,
  balanceAsAt,
  swipeDisabled = false,
  readonly,
}) => {
  const { checkUpFlow } = useSelector(selectFlags);
  const insets = useSafeAreaInsets();
  const styles = useThemedStyle(
    {
      ...themedStyles,
      floatingButton: {
        ...themedStyles.floatingButton,
        bottom: themedStyles.floatingButton.bottom + insets.bottom,
      },
    },
    i18nScope,
  );
  let image = require('assets/images/common/calendar.png');
  let boxStyle = styles.open;
  let textStyle = styles.textDateOpen;
  if (isFirstItem) {
    image = require('assets/images/common/calendarChecked.png');
    boxStyle = styles.done;
    textStyle = styles.textDateDone;
  }
  if (disable) {
    boxStyle = styles.disable;
    textStyle = styles.textDateDisable;
  }

  const Box = props => (
    <CardItemWithTrashIcon
      disabled={disabledDelete}
      onDelete={onDelete}
      overshootRight={false}
      {...props}
    />
  );

  return (
    <Box swipeDisabled={swipeDisabled}>
      <TouchableField
        style={styles.row}
        onPress={() => onPress(item, startDate, isFirstItem, balanceAsAt)}
        disabled={readonly}>
        <TouchableField
          style={AppStyle.flex1}
          disabled={!isFirstItem || !checkUpFlow}
          onPress={() => {
            if (isFirstItem) {
              onPressStartDate(startDate);
            }
          }}>
          <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.alignStart]}>
            {!hideIconCalendar && <Image source={image} style={styles.iconDate} />}
            <View style={boxStyle}>
              <TextField style={textStyle}>
                {moment(startDate).format(formatDateTimeString)}
              </TextField>
            </View>
          </View>
        </TouchableField>
        <View style={styles.cardItemSpace} />
        <View>
          <TextField type="paragraph-1" style={styles.currency}>
            {get(item, ['primary']) == null
              ? '  '
              : formatCurrency(toNumber(get(item, ['primary'])))}
          </TextField>
        </View>
        <View style={styles.cardItemSpace} />
        <View>
          <TextField type="paragraph-1" style={styles.currency}>
            {get(item, ['credit']) == null ? '  ' : formatCurrency(toNumber(get(item, ['credit'])))}
          </TextField>
        </View>
      </TouchableField>
    </Box>
  );
};

export default React.memo(CardItemCheckUp);
