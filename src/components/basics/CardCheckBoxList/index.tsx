import React from 'react';
import { View } from 'react-native';
import { formatCurrency, mergeArrayObjectIntoObject } from 'libs/util';
import { AppStyle } from 'theme';
import { useThemedStyle } from 'providers';
import { useTranslation } from 'react-i18next';

import TouchableField from '../TouchableField';
import TextField from '../TextField';
import CheckBox from '../CheckBox';

import themedStyles from './styles';

type ICard = {
  id: string;
  name: string;
  amount: number;
  color: string;
};

const i18nScope = 'components.cardCheckBoxList';

const CardCheckBoxList = ({
  style,
  cards,
  value: checked,
  onChange,
  readonly = false,
  type = 'archive',
}: {
  style?: any;
  cards: ICard[];
  value?: string[];
  onChange?: (value: string[]) => void;
  readonly?: boolean;
  type?: 'archive' | 'delete';
}) => {
  const isArchive = type === 'archive';
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const { t } = useTranslation();

  const handleCheckAllChange = (value: boolean) => {
    if (onChange === undefined) {
      return;
    }
    onChange(value ? cards.map(card => card.id) : []);
  };

  const handleCardChange = (value: boolean, c: ICard) => {
    if (onChange === undefined || checked === undefined) {
      return;
    }
    onChange(value ? checked?.concat(c.id) : checked.filter(item => item !== c.id));
  };

  return (
    <View>
      <View style={styles.checkAllContainer}>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <TextField type="heading-3">{t(`${i18nScope}.cardCheckBoxTitle`)}</TextField>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <TextField type="paragraph-2" font="light">
              {isArchive ? t(`${i18nScope}.archive`) : t(`${i18nScope}.toBeDeleted`)}
            </TextField>
            {!readonly ? (
              <View style={[AppStyle.marginLeft10]}>
                <CheckBox
                  style={styles.customCheckBox}
                  value={checked?.length === cards?.length}
                  onChange={handleCheckAllChange}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.divider} />
      </View>
      <View
      // style={{
      //   height: (CARD_ITEM_MIN_HEIGHT + 12) * 2.5,
      // }}
      >
        {cards?.length > 0 ? (
          cards.map((card, ci) => (
            <View key={`card-check-box-${ci}`} style={AppStyle.marginY5}>
              <TouchableField style={[AppStyle.rowFlex, styles.cardItem]} disabled={readonly}>
                <View
                  style={[
                    styles.leftLine,
                    {
                      backgroundColor: card.color,
                    },
                  ]}
                />
                <View style={[AppStyle.rowFlex, AppStyle.flex1, AppStyle.padRight20, styles.body]}>
                  <View style={AppStyle.flex1}>
                    {card?.name ? <TextField type="paragraph-2">{card.name}</TextField> : null}
                  </View>
                  <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
                    {
                      <TextField type="paragraph-2">
                        {card?.amount
                          ? formatCurrency(card.amount, '$', {
                              decimal: 2,
                            })
                          : formatCurrency(0)}
                      </TextField>
                    }
                    {!readonly ? (
                      <View style={AppStyle.marginLeft10}>
                        <CheckBox
                          style={styles.customCheckBox}
                          value={checked?.includes(card.id)}
                          onChange={value => handleCardChange(value, card)}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableField>
            </View>
          ))
        ) : (
          <View style={[AppStyle.alignContent, AppStyle.marginY5]}>
            <TextField type="paragraph-2">{t(`${i18nScope}.noLinkedCards`)}</TextField>
          </View>
        )}
      </View>
    </View>
  );
};

export default CardCheckBoxList;
