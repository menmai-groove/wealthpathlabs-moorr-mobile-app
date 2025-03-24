import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { formatCurrency } from 'libs/util';
import { debounce } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';
import { AppStyle } from 'theme';

// NOTE: sample
// const balances = [
//   { name: 'Bank Account 1', amount: 500000 },
//   { name: 'Bank Account 2', amount: 500 },
//   { name: 'Bank Account 3', amount: 36000 },
// ];

export const CARD_ITEM_MIN_HEIGHT = 50;
const INPUT_AMOUNT_WIDTH = 110;

const Balance = ({ totalText, type, value = [], onChange, styles, onPress }) => {
  const { t } = useTranslation();
  const total = value.reduce((prev, curr) => Number(prev) + Number(curr?.amount ?? 0), 0);
  const isAccount = type === 'account';
  const isCreditCard = type === 'creditCard';
  const validateNumber = isCreditCard ? 10000000 : 100000000;
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
      {value.length > 0
        ? value.map((balance, bi) => {
            const isDivider = bi !== 0;
            return (
              <View key={['balance', balance?._id, bi].join('-')} style={AppStyle.columnFlex}>
                {isDivider ? <View style={AppStyle.marginTop10} /> : null}
                <View style={AppStyle.rowFlex}>
                  <Pressable style={AppStyle.flex1} onPress={() => onPressDebounce(balance)}>
                    <View
                      style={[
                        styles?.balanceCard,
                        {
                          borderColor: color,
                          minHeight: CARD_ITEM_MIN_HEIGHT,
                        },
                      ]}>
                      <View
                        style={[
                          styles?.balanceBorder,
                          {
                            backgroundColor: color,
                          },
                        ]}
                      />
                      <View
                        style={[
                          AppStyle.rowFlex,
                          AppStyle.flex1,
                          AppStyle.alignContent,
                          AppStyle.padX10,
                        ]}>
                        <Image source={icon} style={styles?.balanceIcon} resizeMode="contain" />
                        <View style={AppStyle.marginRight10} />
                        <TextField style={AppStyle.flex1} numberOfLines={2} type="captain">
                          {balance.name}
                        </TextField>
                      </View>
                    </View>
                  </Pressable>
                  <View style={AppStyle.marginRight10} />
                  <View style={{ width: INPUT_AMOUNT_WIDTH }}>
                    <InputField
                      // LeftComponent={() => <TextField style={styles?.leftIcon}>{'$'}</TextField>}
                      isCurrency
                      isNumericInput
                      value={balance.amount}
                      onChangeText={text => {
                        const newBalances = value.map(balanceItem =>
                          balanceItem._id === balance._id
                            ? {
                                ...balance,
                                amount: text,
                              }
                            : balanceItem,
                        );
                        typeof onChange === 'function' ? onChange(newBalances) : undefined;
                      }}
                      style={{ inputContentCustom: { textAlign: 'right' } }}
                    />
                  </View>
                </View>
              </View>
            );
          })
        : null}
      <View style={AppStyle.marginTop10} />
      <View style={[AppStyle.rowFlex, AppStyle.justifyContent]}>
        <View style={AppStyle.flex1}>
          {totalText ? (
            <TextField numberOfLines={1} font="semi-bold" type="heading-3">
              {totalText}
            </TextField>
          ) : null}
        </View>
        <View style={AppStyle.marginRight10} />
        {total >= 0 ? (
          <TextField numberOfLines={1} font="semi-bold" type="heading-3">
            {formatCurrency(total, '$', {
              decimal: 2,
            })}
          </TextField>
        ) : null}
      </View>
      <TextField style={[styles?.errorInputMessage, AppStyle.textRight]}>
        {total > validateNumber
          ? t('forms.validation.rangeRequired', { min: 0, max: validateNumber })
          : ''}
      </TextField>
    </View>
  );
};

export default Balance;
