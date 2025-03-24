import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { get, isEmpty, isNil, omitBy, sortBy } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppStyle } from 'theme';
import { SubmitDataHoldingCostType, IHoldingCost } from 'screens/Expense/types';
import { AppConstants, AppScreenID } from 'constant';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { CardItemWithArchiveIcon, CardItemWithTrashIcon } from 'components/basics/CardItem';
import { ArchiveModalContent } from 'screens/FinancialDashboard/components';
import {
  archiveFinancialCardItem,
  deleteFinancialCardItem,
  getLatestAsAt,
} from 'store/FinancialDashboard/action';
import { useDispatchResolve } from 'libs/hooks';
import i18n from 'bootstrap/i18n';
import * as financialDashboardActions from 'store/FinancialDashboard/action';

import { CardItem } from './CardItem';
import themedStyles from './style';

const i18nScope = 'components.breakdownCard';
const i18nScopeFinancial = 'screens.financialDashboard';

function BreakdownCard(
  { error, field, value = [], disabled, swipeDisabled, assetFormRef }: IHoldingCost,
  ref: any,
) {
  const type = get(field, 'related.type') || '';
  const typeValue = get(field, 'related.typeValue') || '';
  const assetId = get(field, 'related.assetId') || '';
  const asset = get(field, 'related.asset') || '';
  const assetType = get(asset, 'type') || '';
  const { t } = useTranslation('translation');
  const styles = useThemedStyle(themedStyles);

  const [isShowArchivedList, setIsShowArchivedList] = useState(false);
  const dispatchResolve = useDispatchResolve();

  const activeItems = useMemo(() => {
    return value.filter(x => !x.isArchived);
  }, [value]);

  const archivedItems = useMemo(() => {
    return value.filter(x => x.isArchived);
  }, [value]);

  const onSubmitUpdateForm = useCallback(
    submitData => {
      const updatedData = value?.map(valueItem => ({
        ...valueItem,
        ...(valueItem._id === submitData._id
          ? {
              ...submitData,
              amount: (submitData?.essentialAmount ?? 0) + (submitData?.discretionaryAmount ?? 0),
              id: [submitData?._id],
            }
          : {}),
      }));
      assetFormRef?.setFormValue('expensesBreakdownCard', sortBy(updatedData, ['name']));
    },
    [assetFormRef, value],
  );

  const onSubmitAddForm = useCallback(
    (submitData: any) => {
      const formatSubmitData = omitBy(submitData, isNil);
      const newValue = {
        _id: submitData?._id,
        ...formatSubmitData,
        assetId,
        amount: (submitData?.essentialAmount ?? 0) + (submitData?.discretionaryAmount ?? 0),
        cardType: 'expense',
        id: [submitData?._id],
      };
      const updatedData = value.concat(omitBy(newValue, isNil));
      assetFormRef?.setFormValue('expensesBreakdownCard', sortBy(updatedData, ['name']));
    },
    [assetFormRef, assetId, value],
  );

  const handleAdd = useCallback(
    cardType => {
      switch (cardType) {
        case 'income':
          const assetDetail = assetFormRef?.getFormValue();
          NavigationServiceLib.navigate(AppScreenID.Income, {
            income: {
              _id: AppConstants.newObjectIDForTypes.Income,
              type: typeValue,
              moneySmarts: 'Primary Account',
              id: [AppConstants.newObjectIDForTypes.Income],
              cardType: 'income',
              assetId: asset._id,
              typeValue: typeValue,
            },
            asset: { ...asset, ...assetDetail },
            formRef: assetFormRef,
          });
          break;
        case 'expenses':
          NavigationServiceLib.navigate(AppScreenID.EditExpense, {
            item: {
              assetId,
              _id: AppConstants.newObjectID,
            },
            assetFormRef,
            onSubmitForm: onSubmitAddForm,
          });
          break;
        default:
          break;
      }
    },
    [assetFormRef, asset, assetId, onSubmitAddForm, typeValue],
  );

  const handleDetail = useCallback(
    _item => {
      switch (_item.cardType) {
        case 'borrowings':
          NavigationServiceLib.navigate(AppScreenID.Borrowing, {
            borrowing: _item,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'income':
          const assetDetail = assetFormRef?.getFormValue();
          _item.typeValue = _item.type;
          NavigationServiceLib.navigate(AppScreenID.Income, {
            income: _item,
            asset: { ...asset, ...assetDetail },
            formRef: assetFormRef,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'assets':
          NavigationServiceLib.navigate(AppScreenID.EditAsset, {
            item: _item,
            onPressArchive,
            onPressDelete,
          });
          break;
        case 'expense':
          NavigationServiceLib.navigate(AppScreenID.EditExpense, {
            item: _item,
            assetFormRef,
            onSubmitForm: onSubmitUpdateForm,
            onPressArchive,
            onPressDelete,
          });
          break;
        default:
          break;
      }
    },
    [asset, assetFormRef, onSubmitUpdateForm],
  );

  const onPressDelete = useCallback(
    (itemValue, callback = () => {}) => {
      const hasNoDirectLinks =
        itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;

      const isPropertyInvestmentCard =
        itemValue?.type === AppConstants.AssetType.Property ||
        itemValue?.type === AppConstants.AssetType.Investments;

      const cardName =
        isPropertyInvestmentCard && !hasNoDirectLinks
          ? `${itemValue?.name} ${AppConstants.cardCategory.Asset}`
          : itemValue?.name;
      const title = i18n.t(`${i18nScopeFinancial}.modalDeleteTitle`, { cardName });
      const content = i18n.t(`${i18nScopeFinancial}.modalDeleteContent`);
      const content2 = hasNoDirectLinks
        ? null
        : i18n.t(`${i18nScopeFinancial}.modalDeleteContent2`);
      const dateLabelText = i18n.t(`${i18nScopeFinancial}.archiveDateLabelText`);
      const submitText = i18n.t(`${i18nScopeFinancial}.delete`);
      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            hideLinkedCards
            title={title}
            content={content}
            content2={content2}
            card={itemValue}
            onCancel={GlobalLib.CustomModal.get().hide}
            onSubmit={() => {
              const payload = {
                item: itemValue,
              };
              dispatchResolve(deleteFinancialCardItem(payload)).then(() => {
                const updatedData = value?.filter(valueItem => valueItem._id !== itemValue._id);
                assetFormRef?.setFormValue(
                  itemValue.cardType === 'expense'
                    ? 'expensesBreakdownCard'
                    : 'incomeBreakdownCard',
                  updatedData,
                );
                callback();
              });
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            type="delete"
            hideAsAt
            submitText={submitText}
          />
        ),
      });
    },
    [assetFormRef, dispatchResolve, value],
  );

  const onPressArchive = useCallback(
    async (itemValue, callback = () => {}) => {
      const latestAsAt = await dispatchResolve(getLatestAsAt({ cardId: itemValue?.id?.[0] }));
      const title = i18n.t(`${i18nScopeFinancial}.archiveTitle`);
      const content = i18n.t(`${i18nScopeFinancial}.archiveContent`);
      const content2 = i18n.t(`${i18nScopeFinancial}.archiveContent2`);
      const content4 = '';
      const latestAsAtError = i18n.t(`${i18nScopeFinancial}.archiveLatestAsAtError`);
      const dateLabelText = i18n.t(`${i18nScopeFinancial}.archiveDateLabelText`);
      const submitText = i18n.t(`${i18nScopeFinancial}.archive`);

      GlobalLib.CustomModal.get().show({
        onBackdropPress: GlobalLib.CustomModal.get().hide,
        onRequestClose: GlobalLib.CustomModal.get().hide,
        body: (
          <ArchiveModalContent
            hideLinkedCards
            title={title}
            content={content}
            content2={content2}
            content4={content4}
            latestAsAt={latestAsAt}
            latestAsAtError={latestAsAtError}
            card={itemValue}
            onCancel={GlobalLib.CustomModal.get().hide}
            onSubmit={({ asAt }) => {
              const payload = {
                item: itemValue,
                asAt,
              };
              dispatchResolve(archiveFinancialCardItem(payload)).then(() => {
                const updatedData = value?.map(valueItem => ({
                  ...valueItem,
                  ...(valueItem._id === itemValue._id
                    ? {
                        ...itemValue,
                        isArchived: true,
                        archivedDate: asAt,
                      }
                    : {}),
                }));

                assetFormRef?.setFormValue(
                  itemValue.cardType === 'expense'
                    ? 'expensesBreakdownCard'
                    : 'incomeBreakdownCard',
                  updatedData,
                );
                callback();
              });
              GlobalLib.CustomModal.get().hide();
            }}
            dateLabelText={dateLabelText}
            submitText={submitText}
          />
        ),
      });
    },
    [assetFormRef, dispatchResolve, value],
  );

  const handleDelete = useCallback(
    item => {
      const card = value?.find(valueItem => valueItem._id === item._id);
      if (card) {
        card.isArchived ? onPressDelete(card) : onPressArchive(card);
      }
    },
    [onPressArchive, onPressDelete, value],
  );

  const renderItem = useCallback(
    (item: SubmitDataHoldingCostType) => {
      const isNew = String(item?._id).includes(AppConstants.newObjectIDForTypes.Expense);
      const CardContainer = item?.isArchived ? CardItemWithTrashIcon : CardItemWithArchiveIcon;
      return (
        <CardContainer
          key={item._id}
          onDelete={() => handleDelete(item)}
          overshootRight={false}
          containerStyle={[AppStyle.marginY5]}
          swipeDisabled={swipeDisabled || disabled}>
          <CardItem
            data={{
              ...item,
              cardType: type === 'expenses' ? 'expense' : type,
              name: isNew ? item?.holdingCostName : item?.name,
            }}
            onPressItem={handleDetail}
            disabled={disabled}
            type={type}
          />
        </CardContainer>
      );
    },
    [swipeDisabled, handleDetail, disabled, type, handleDelete],
  );

  const renderArchivedList = () => {
    return (
      <View style={AppStyle.marginTop10}>
        <TouchableField
          style={styles.archivedButton}
          onPress={() => setIsShowArchivedList(!isShowArchivedList)}>
          <FontAwesomeIcon
            name={isShowArchivedList ? 'angle-double-up' : 'angle-double-down'}
            size={16}
            color={styles.archivedText.color}
          />
          <TextField style={AppStyle.marginLeft5}>{t(`${i18nScope}.archivedCards`)}</TextField>
        </TouchableField>
        {isShowArchivedList && archivedItems?.map(renderItem)}
      </View>
    );
  };

  return (
    <View ref={ref}>
      {activeItems?.map(renderItem)}
      <View style={disabled && styles.disabledContainer}>
        <TouchableField
          style={!isEmpty(error) ? styles.buttonAddError : styles.buttonAdd}
          onPress={() => handleAdd(type)}
          disabled={disabled}>
          <View style={styles.buttonAddIcon}>
            <Feather name="plus" size={22} color={styles.buttonAddIcon.color} />
          </View>
          <TextField type="heading-4" style={[styles.textContent, AppStyle.marginLeft15]}>
            {type === 'expenses' &&
              (assetType === AppConstants.AssetType.Property
                ? t(`${i18nScope}.addPropertyExpenses`)
                : t(`${i18nScope}.addInvestmentExpenses`))}
            {type === 'income' &&
              (assetType === AppConstants.AssetType.Property
                ? t(`${i18nScope}.addPropertyIncome`)
                : t(`${i18nScope}.addInvestmentIncome`))}
          </TextField>
        </TouchableField>
      </View>
      {!isEmpty(error) && (
        <TextField style={[styles.errorInputMessage, AppStyle.marginTop5]}>
          {error?.message}
        </TextField>
      )}
      {renderArchivedList()}
    </View>
  );
}

export default forwardRef(BreakdownCard);
