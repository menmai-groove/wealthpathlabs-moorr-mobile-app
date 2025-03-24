import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Image, Pressable } from 'react-native';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { CardItemWithArchiveIcon, CardItemWithTrashIcon } from 'components/basics/CardItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//
import { AppStyle } from 'theme';
import { useThemedStyle } from 'providers';
import { formatCurrency } from 'libs/util';

import Condition from 'components/basics/Condition';
import { IFinancialHistory } from 'store/FinancialDashboard/types';
import { useTranslation } from 'react-i18next';
import { get } from 'lodash';
import { UtilLib } from 'libs';

import themedStyles from '../styles';

interface IFinancialCardItem {
  data: IFinancialHistory;
  index: number;
  onPress?: (itemValue: any) => void;
  onPressDelete?: (itemValue: any) => void;
  onSwipeOpenBegan?: (itemValue: any) => void;
  onPressArchive?: (itemValue: any) => void;
  parentId?: string;
  style?: any;
  disabledSwipe?: boolean;
}

const i18nScope = 'screens.financialDashboard';

function FinancialCardItemComponent(
  {
    data,
    onPress,
    onPressDelete,
    onSwipeOpenBegan,
    onPressArchive,
    parentId,
    style,
    disabledSwipe = false,
  }: IFinancialCardItem,
  ref: any,
) {
  const {
    cardType,
    amount,
    frequency,
    repaymentFrequency,
    currentRepayments,
    totalAssetIncome,
    jar,
    name,
    type,
    disabledDelete,
    isArchived,
    cards,
  } = data;
  const id = [get(data, 'id.0'), ...(parentId ? [parentId] : [])].join('-');
  const isGroup = cards?.length > 0;
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanse = useCallback(() => {
    UtilLib.handleConfigureNextLayoutAnimation();
    setExpanded(prevState => !prevState);
  }, []);

  const iconSource = useMemo(() => {
    switch (cardType) {
      case 'income':
        return require('assets/images/common/jar-money.png');
      case 'assets':
        return require('assets/images/common/home.png');
      case 'expense':
        return require('assets/images/common/wallet.png');
      case 'borrowings':
        return require('assets/images/common/borrowings.png');
      default:
        return require('assets/images/common/jar-money.png');
    }
  }, [cardType]);

  const backgroundColor = useMemo(() => {
    if (isArchived) {
      return styles.addArchivedButton.backgroundColor;
    }
    switch (cardType) {
      case 'income':
        return styles.addIncomeButton.backgroundColor;
      case 'assets':
        return styles.addAssetButton.backgroundColor;
      case 'expense':
        return styles.addExpenseButton.backgroundColor;
      case 'borrowings':
        return styles.addBorrowingButton.backgroundColor;
      default:
        return styles.addIncomeButton.backgroundColor;
    }
  }, [cardType, isArchived, styles]);

  const renderChildren = () => {
    return (
      <TouchableField
        onPress={() =>
          isGroup ? toggleExpanse() : typeof onPress === 'function' ? onPress(data) : undefined
        }
        style={[
          styles.cardItem.container,
          expanded && styles.childrenContainer,
          expanded && {
            borderColor: backgroundColor,
          },
          style && style,
        ]}>
        <View style={[styles.cardItem.leftLine, { backgroundColor }]} />
        <View style={styles.cardItem.body}>
          <View style={[AppStyle.alignContent, AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
            <View>
              <Image source={iconSource} style={styles.cardItem.icon} resizeMode="contain" />
            </View>
            <View style={[AppStyle.rowFlex, AppStyle.flexEndContent, AppStyle.flex1]}>
              <View style={[styles.cardItem.label, { backgroundColor }]}>
                <TextField type="paragraph-2" style={styles.cardItem.labelText}>
                  {type}
                </TextField>
              </View>

              {isGroup ? (
                <View style={AppStyle.marginLeft10}>
                  <Pressable onPress={toggleExpanse}>
                    <MaterialCommunityIcons
                      name={expanded ? 'arrow-collapse' : 'arrow-expand'}
                      size={24}
                      color={backgroundColor}
                    />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
          <View style={AppStyle.pick(['rowFlex', 'spaceBetweenContent', 'padTop15'])}>
            <View style={AppStyle.flex1}>
              <TextField type="heading-4">{name}</TextField>
            </View>
            <View>
              <TextField type="heading-4">{formatCurrency(amount ?? 0)}</TextField>
            </View>
          </View>
          <Condition display={!!currentRepayments}>
            <View style={AppStyle.pick(['rowFlex', 'spaceBetweenContent', 'padTop10'])}>
              <View style={AppStyle.flex1}>
                <TextField type="paragraph-2">{t(`${i18nScope}.currentRepayments`)}</TextField>
              </View>
              <View>
                <TextField type="paragraph-2">{formatCurrency(currentRepayments)}</TextField>
              </View>
            </View>
          </Condition>
          <Condition display={!!totalAssetIncome}>
            <View style={AppStyle.pick(['rowFlex', 'spaceBetweenContent', 'padTop10'])}>
              <View style={AppStyle.flex1}>
                <TextField type="paragraph-2">{t(`${i18nScope}.totalAssetIncome`)}</TextField>
              </View>
              <View>
                <TextField type="paragraph-2">{formatCurrency(totalAssetIncome)}</TextField>
              </View>
            </View>
          </Condition>
          <Condition
            display={!!jar || !!(cardType === 'borrowings' ? repaymentFrequency : frequency)}>
            <View style={AppStyle.pick(['rowFlex', 'spaceBetweenContent', 'padTop10'])}>
              <View style={AppStyle.flex1}>
                {!isGroup ? (
                  <TextField type="captain" style={styles.cardItem.typeCard}>
                    {jar}
                  </TextField>
                ) : null}
              </View>
              <View>
                <TextField type="captain" style={styles.cardItem.captionText}>
                  {cardType === 'borrowings' ? repaymentFrequency : frequency}
                </TextField>
              </View>
            </View>
          </Condition>
        </View>
      </TouchableField>
    );
  };

  const renderExpanse = () => {
    return expanded ? (
      <View>
        {cards?.length
          ? cards.map((card: any, ci: number) => {
              return (
                <FinancialCardItem
                  key={`children-card-${ci}`}
                  data={card}
                  onPressDelete={() => {
                    if (typeof onPressDelete !== 'function') {
                      return;
                    }
                    onPressDelete(card);
                  }}
                  onPressArchive={() => {
                    if (typeof onPressArchive !== 'function') {
                      return;
                    }
                    onPressArchive(card);
                  }}
                  onSwipeOpenBegan={() => {
                    if (typeof onSwipeOpenBegan !== 'function') {
                      return;
                    }
                    onSwipeOpenBegan({ ...card, parentId: id });
                  }}
                  onPress={() => {
                    if (typeof onPress !== 'function') {
                      return;
                    }
                    onPress(card);
                  }}
                  ref={ref}
                  index={ci}
                  parentId={id}
                />
              );
            })
          : null}
      </View>
    ) : null;
  };

  if (!isArchived) {
    return (
      <View
        style={[
          AppStyle.padX15,
          expanded && styles.expanseContainer,
          expanded && {
            backgroundColor: `${backgroundColor}30`,
          },
          parentId && styles.childrenExpanseContainer,
        ]}>
        <CardItemWithArchiveIcon
          onDelete={() => onPressArchive(data)}
          containerStyle={AppStyle.marginY5}
          ref={parentCardRef => {
            if (!ref) {
              return;
            }
            ref[id] = parentCardRef;
          }}
          onSwipeOpenBegan={() =>
            typeof onSwipeOpenBegan === 'function' && onSwipeOpenBegan({ ...data })
          }
          enabled={!isGroup && !disabledSwipe}
          trashIconContainerStyle={AppStyle.marginLeft10}>
          {renderChildren()}
        </CardItemWithArchiveIcon>
        {renderExpanse()}
      </View>
    );
  }

  return (
    <View
      style={[
        AppStyle.padX15,
        expanded && styles.expanseContainer,
        expanded && {
          backgroundColor: `${backgroundColor}30`,
        },
        parentId && styles.childrenExpanseContainer,
      ]}>
      <CardItemWithTrashIcon
        onDelete={() => onPressDelete(data)}
        containerStyle={AppStyle.marginY5}
        disabled={isGroup || disabledDelete}
        swipeDisabled={isGroup || disabledDelete}
        enabled={!disabledSwipe}
        ref={parentCardRef => {
          if (!ref) {
            return;
          }
          ref[id] = parentCardRef;
        }}
        onSwipeOpenBegan={() =>
          typeof onSwipeOpenBegan === 'function' && onSwipeOpenBegan({ ...data })
        }
        trashIconContainerStyle={AppStyle.marginLeft10}>
        {renderChildren()}
      </CardItemWithTrashIcon>
      {renderExpanse()}
    </View>
  );
}
export const FinancialCardItem = forwardRef(FinancialCardItemComponent);
