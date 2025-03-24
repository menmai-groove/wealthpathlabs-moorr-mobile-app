import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppStyle } from 'theme';

function TransactionCard({
  _id,
  name,
  date,
  dateFormat,
  amount,
  amountFormat,
  onDeleteTransaction,
  onPressTransaction,
  styles,
  periodId,
}) {
  return (
    <View style={styles.itemContainer}>
      <CardItemWithTrashIcon
        onDelete={() => onDeleteTransaction(_id)}
        containerStyle={styles.cartItemContainer}>
        <TouchableField
          style={styles.cardContainer}
          onPress={() => onPressTransaction(_id, name, amount, date, periodId)}
          activeOpacity={1}>
          <View style={styles.cartTitleContainer}>
            <View style={AppStyle.flex1}>
              <TextField font="medium" style={styles.cartTitle} numberOfLines={2}>
                {name}
              </TextField>
            </View>
            <TextField font="medium" style={styles.cartTitle}>
              {amountFormat}
            </TextField>
          </View>
          <View style={styles.cartFooterContainer}>
            <FontAwesome
              name="calendar-o"
              size={13}
              color={styles.cartFooterText.color}
              style={styles.cartCalendarIcon}
            />
            <TextField type="captain">{dateFormat}</TextField>
          </View>
        </TouchableField>
      </CardItemWithTrashIcon>
    </View>
  );
}

TransactionCard.propTypes = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.string,
  date: PropTypes.string,
  amount: PropTypes.number,
};

TransactionCard.defaultProps = {
  name: '',
  date: '',
  amount: 0,
};

export default memo(TransactionCard);
