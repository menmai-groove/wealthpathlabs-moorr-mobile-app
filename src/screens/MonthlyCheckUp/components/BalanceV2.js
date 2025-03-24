import RadioButtonGroup from 'components/basics/RadioButtonGroup';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { formatCurrency } from 'libs/util';
import { debounce } from 'lodash';
import { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { AppStyle } from 'theme';

// NOTE: sample
// const balances = [
//   { name: 'Bank Account 1', amount: 500000 },
//   { name: 'Bank Account 2', amount: 500 },
//   { name: 'Bank Account 3', amount: 36000 },
// ];

export const CARD_ITEM_MIN_HEIGHT = 50;
export const RADIO_GROUP_WIDTH = 150;

const Balance = ({
  type,
  value: selectedValue,
  onChange,
  styles,
  header,
  footerText,
  onFooterPress,
  onPress,
}) => {
  const isAccount = type === 'account';
  const isCreditCard = type === 'creditCard';
  const icon = isAccount
    ? require('assets/images/common/bank.png')
    : isCreditCard
    ? require('assets/images/common/borrowings.png')
    : null;
  const color = isAccount ? '#008FEB' : isCreditCard ? '#E34242' : null;
  const onPressDebounce = useMemo(() => {
    return debounce(balance => {
      if (typeof onPress === 'function') {
        onPress(balance);
      }
    }, 200);
  }, [onPress]);
  return (
    <View>
      <View>{header ?? null}</View>
      <View style={AppStyle.marginTop10} />
      {selectedValue.length > 0
        ? selectedValue.map((balance, bi) => {
            const isDivider = bi !== 0;
            return (
              <View key={['balance', balance?._id, bi].join('-')} style={AppStyle.columnFlex}>
                {isDivider ? <View style={AppStyle.marginTop10} /> : null}
                <View style={AppStyle.rowFlex}>
                  <View
                    style={[
                      styles.balanceCard,
                      {
                        borderColor: color,
                        minHeight: CARD_ITEM_MIN_HEIGHT,
                      },
                    ]}>
                    <View
                      style={[
                        styles.balanceBorder,
                        {
                          backgroundColor: color,
                        },
                      ]}
                    />
                    <Pressable style={AppStyle.flex1} onPress={() => onPressDebounce(balance)}>
                      <View
                        style={[
                          AppStyle.rowFlex,
                          AppStyle.flex1,
                          AppStyle.alignContent,
                          AppStyle.padX10,
                        ]}>
                        <Image source={icon} style={styles.balanceIcon} resizeMode="contain" />
                        <View style={AppStyle.marginRight10} />
                        <View style={AppStyle.flex1}>
                          <TextField numberOfLines={1} type="captain">
                            {balance.name}
                          </TextField>
                          <TextField numberOfLines={1} type="captain">
                            {formatCurrency(balance.amount ?? 0, '$', { decimal: 2 })}
                          </TextField>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                  <View style={AppStyle.marginRight10} />
                  <View style={{ width: RADIO_GROUP_WIDTH }}>
                    <RadioButtonGroup
                      style={[
                        AppStyle.flex1,
                        AppStyle.margin5,
                        AppStyle.rowFlex,
                        AppStyle.spaceEvenlyContent,
                      ]}
                      options={[
                        { display: 'Yes', value: true },
                        { display: 'No', value: false },
                      ]}
                      selectedValue={balance?.isTrackedInMoneySmarts}
                      onSelect={({ value }) => {
                        const newValue = selectedValue?.map(valueItem => ({
                          ...valueItem,
                          ...(valueItem?._id === balance?._id
                            ? {
                                isTrackedInMoneySmarts: value,
                              }
                            : {}),
                        }));
                        onChange(newValue);
                      }}
                      radioStyle={[AppStyle.alignContent, AppStyle.justifyContent]}
                      noMarginBottom
                    />
                  </View>
                </View>
              </View>
            );
          })
        : null}
      <View style={AppStyle.marginTop10} />
      <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
        <View style={AppStyle.flex1}>
          <TouchableField onPress={onFooterPress}>
            <TextField type="text-label" style={styles.linkText} font="medium">
              {footerText ?? ''}
            </TextField>
          </TouchableField>
        </View>
        <View style={AppStyle.flex1} />
      </View>
    </View>
  );
};

export default Balance;
