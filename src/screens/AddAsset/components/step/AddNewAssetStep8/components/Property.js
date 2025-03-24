import ButtonField from 'components/basics/ButtonField';
import { CardItemWithTrashIcon } from 'components/basics/CardItem';
import DynamicForm from 'components/basics/DynamicForm';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import Constants from 'constant/constants';
import { GlobalLib, UtilLib } from 'libs';
import { formatCurrency } from 'libs/util';
import { cloneDeep, get, isEmpty, omit, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import getModule from 'store/Asset/module';
import { selectAssetOwnership } from 'store/Asset/selector';
import {
  selectFrequency,
  selectLoanType,
  selectOwnersWithOthers,
  selectProviderBorrowing,
  selectRepaymentType,
  selectUser,
} from 'store/Auth/selector';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'forms.asset';

const formatFormJson = require('assets/forms/layouts/property/asset-add-property4.json');
function Property({ setBorrowingCard, borrowingCardInit, onErrorForm }) {
  const { t } = useTranslation();
  const loanTypes = useSelector(selectLoanType);
  const providers = useSelector(selectProviderBorrowing);
  const userOwnerships = useSelector(selectOwnersWithOthers);
  const assetOwnership = useSelector(selectAssetOwnership);
  const frequencyType = useSelector(selectFrequency);
  const repaymentTypes = useSelector(selectRepaymentType);
  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;
  const {
    historicalCapitalGrowthMaxValue,
    historicalCapitalGrowthMaxDisplayValue,
    historicalCapitalGrowthMinValue,
  } = useSelector(selectAppPreference);
  const styles = useThemedStyle(themedStyles);
  const formRef = useRef(null);

  const getClient = useMemo(() => {
    return {
      client1: get(userOwnerships, [0]),
      client2: get(userOwnerships, [1]),
      joint: get(
        userOwnerships.filter(item => item.label === AppConstants.ownershipType.Joint),
        [0],
      ),
    };
  }, [userOwnerships]);

  const [listCards, setListCards] = useState(borrowingCardInit ? borrowingCardInit : []);

  const onSave = useCallback(
    (formInputData, item) => {
      let formData = cloneDeep(formInputData);
      const owners = formData?.borrower?.owners;
      if (owners?.length) {
        if (owners.length === 1) {
          owners[0].percentage = toNumber(formData.ownershipSplitPerson1 ?? 100);
        } else {
          owners[0].percentage = toNumber(formData.ownershipSplitPerson1 ?? 0);
        }
        if (formData.ownershipSplitPerson2) {
          owners[1].percentage = toNumber(formData.ownershipSplitPerson2);
        }
      }
      formData.borrower.ownershipAsAt = formData.borrowerAsAt || null;
      formData.typeAsAt = formData.typeAsAt || null;
      formData.outstandingAsAt = formData.outstandingAsAt || null;
      formData.repaymentTypeAsAt = formData.repaymentTypeAsAt || null;
      formData.repaymentAsAt = formData.repaymentAsAt || null;
      formData.interestRateAsAt = formData.interestRateAsAt || null;

      formData = omit(formData, ['ownershipSplitPerson1', 'ownershipSplitPerson2']);
      delete formData.borrowerAsAt;
      if (item) {
        const newList = listCards.map(card => {
          if (card._id === item._id) {
            card = { ...formData, _id: item._id };
            return card;
          }
          return card;
        });
        setListCards(newList);
        setBorrowingCard(newList);
      } else {
        const newIndex = listCards.length;
        const newList = [
          ...listCards,
          { ...formData, _id: `${Constants.newObjectIDForTypes.Borrowing}${newIndex}` },
        ];
        setListCards(newList);
        setBorrowingCard(newList);
      }
      GlobalLib.CustomModal.get().hide();
    },
    [listCards, setBorrowingCard],
  );

  const handleOpenBorrowingModal = useCallback(
    inputData => {
      const data = () => {
        const { client1, client2, joint } = getClient;
        const jsonObject = cloneDeep(formatFormJson);
        const layout = jsonObject.layout;

        layout.forEach(group => {
          group.fields = group.fields?.filter(x =>
            !hasPartner ? x.id !== 'ownershipSplitPerson2' : true,
          );
          group.fields.forEach(field => {
            if (field?.fields) {
              field.fields = field?.fields.filter(x =>
                !hasPartner ? x.id !== 'ownershipSplitPerson2' : true,
              );
            }
          });
        });

        const owner = UtilLib.getFieldFromFormJSON(layout, 'borrower');
        owner.options = cloneDeep(userOwnerships);
        owner.value = assetOwnership;
        const typeForm = UtilLib.getFieldFromFormJSON(layout, 'type');
        if (loanTypes) {
          typeForm.options = loanTypes;
        }
        const providerForm = UtilLib.getFieldFromFormJSON(layout, 'provider');
        if (providers) {
          providerForm.options = providers;
        }
        const repaymentFreqForm = UtilLib.getFieldFromFormJSON(layout, 'repaymentFreq');
        if (frequencyType) {
          repaymentFreqForm.options = frequencyType;
          if (!isEmpty(repaymentFreqForm.value)) {
            repaymentFreqForm.value = frequencyType.find(
              f => f.value === repaymentFreqForm.value?.value,
            );
          }
        }
        const repaymentTypeForm = UtilLib.getFieldFromFormJSON(layout, 'repaymentType');
        if (repaymentTypes) {
          repaymentTypeForm.options = repaymentTypes;
        }
        const ownershipSplitPerson1 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson1');
        const ownershipSplitPerson2 = UtilLib.getFieldFromFormJSON(layout, 'ownershipSplitPerson2');
        // rewrite client1 value to user name
        if (ownershipSplitPerson1?.labelDynamic?.person) {
          ownershipSplitPerson1.labelDynamic.person = client1.label;
        }
        // rewrite client2 value to partner name
        if (client2) {
          if (ownershipSplitPerson2?.labelDynamic?.person) {
            ownershipSplitPerson2.labelDynamic.person = client2.label;
          }
        }
        ownershipSplitPerson1.value = `${joint?.owners[0]?.percentage ?? ''}`;
        if (ownershipSplitPerson2) {
          ownershipSplitPerson2.value = `${joint?.owners[1]?.percentage ?? ''}`;
        }
        if (inputData) {
          const nameForm = UtilLib.getFieldFromFormJSON(layout, 'name');
          const outstandingForm = UtilLib.getFieldFromFormJSON(layout, 'outstanding');
          const repaymentForm = UtilLib.getFieldFromFormJSON(layout, 'repayment');
          const interestRateForm = UtilLib.getFieldFromFormJSON(layout, 'interestRate');
          owner.value = inputData.borrower;
          typeForm.value = inputData.type;
          providerForm.value = inputData.provider;
          repaymentFreqForm.value = inputData.repaymentFreq;
          repaymentTypeForm.value = inputData.repaymentType;
          nameForm.value = inputData.name;
          outstandingForm.value = inputData.outstanding;
          repaymentForm.value = inputData.repayment;
          interestRateForm.value = inputData.interestRate;
          const owners = inputData.borrower?.owners;
          if (owners?.length) {
            ownershipSplitPerson1.value = `${owners[0]?.percentage ?? ''}`;
            if (ownershipSplitPerson2) {
              ownershipSplitPerson2.value = `${owners[1]?.percentage ?? ''}`;
            }
          }
          const otherBorrowerPercentage = UtilLib.getFieldFromFormJSON(
            layout,
            'otherBorrowerPercentage',
          );
          otherBorrowerPercentage.value = inputData.otherBorrowerPercentage ?? 0;

          const typeAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'typeAsAt');
          typeAsAtForm.lastDate = typeAsAtForm.value = inputData.typeAsAt ?? null;
          const borrowerAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'borrowerAsAt');
          borrowerAsAtForm.lastDate = borrowerAsAtForm.value =
            inputData.borrower?.ownershipAsAt ?? null;
          const outstandingAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'outstandingAsAt');
          outstandingAsAtForm.lastDate = outstandingAsAtForm.value =
            inputData.outstandingAsAt ?? null;
          const repaymentTypeAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'repaymentTypeAsAt');
          repaymentTypeAsAtForm.lastDate = repaymentTypeAsAtForm.value =
            inputData.repaymentTypeAsAt ?? null;
          const repaymentAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'repaymentAsAt');
          repaymentAsAtForm.lastDate = repaymentAsAtForm.value = inputData.repaymentAsAt ?? null;
          const interestRateAsAtForm = UtilLib.getFieldFromFormJSON(layout, 'interestRateAsAt');
          interestRateAsAtForm.lastDate = interestRateAsAtForm.value =
            inputData.interestRateAsAt ?? null;
        }
        UtilLib.handleConditionLogicDynamicForm(jsonObject, formatFormJson.conditional, {
          historicalCapitalGrowthMaxValue,
          historicalCapitalGrowthMinValue,
          historicalCapitalGrowthMaxDisplayValue,
        });
        return jsonObject;
      };

      GlobalLib.CustomModal.get().show({
        type: 'absolute',
        body: (
          <View style={styles.modalContainer}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
              <TextField style={[AppStyle.textCenter, AppStyle.marginBottom20]} type="heading-2">
                {t(`${i18nScope}.addNewBorrowingCard`)}
              </TextField>
              <Question emotion="blink" content={t(`${i18nScope}.optiBorrowCard`)} />
              <DynamicForm
                ref={formRef}
                data={data}
                conditionLogics={formatFormJson.conditional}
                onSubmit={formData => {
                  onSave(formData, inputData);
                }}
                onError={onErrorForm}
              />
              <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.marginY20]}>
                <ButtonField
                  type="secondary"
                  text={t('global.cancel')}
                  onPress={() => GlobalLib.CustomModal.get().hide()}
                />
                <ButtonField
                  type="primary"
                  text={t('global.save')}
                  onPress={() => formRef?.current?.submit()}
                />
              </View>
            </KeyboardAwareScrollView>
          </View>
        ),
      });
    },
    [
      styles,
      t,
      getClient,
      userOwnerships,
      assetOwnership,
      loanTypes,
      providers,
      frequencyType,
      repaymentTypes,
      historicalCapitalGrowthMaxValue,
      historicalCapitalGrowthMinValue,
      historicalCapitalGrowthMaxDisplayValue,
      onSave,
      onErrorForm,
      hasPartner,
    ],
  );

  const onDeleteTransaction = useCallback(
    item => {
      GlobalLib.ConfirmModal.get().show({
        title: t(`${i18nScope}.deleteLoanCardTitle`),
        content: t(`${i18nScope}.deleteLoanCardContent`),
        onConfirm: () => {
          const newList = listCards.filter(card => card._id !== item._id);
          setListCards(newList);
          setBorrowingCard(newList);
        },
      });
    },
    [listCards, t, setBorrowingCard],
  );

  return (
    <View style={styles.borrowingBackground}>
      <TextField type="heading-4" style={styles.borrowingCardTitle}>
        {t(`${i18nScope}.borrowingCards`)}
      </TextField>
      {listCards &&
        listCards.map(item => (
          <View key={item._id} style={AppStyle.marginTop10}>
            <CardItemWithTrashIcon
              onDelete={() => onDeleteTransaction(item)}
              containerStyle={styles.cartItemContainer}>
              <TouchableField
                style={styles.cardContainer}
                onPress={() => handleOpenBorrowingModal(item)}
                activeOpacity={1}>
                <View style={styles.cartTitleContainer}>
                  <Image
                    source={require('assets/images/common/borrowings.png')}
                    resizeMode="contain"
                  />
                  <View style={styles.itemTypeContainer}>
                    <TextField style={styles.itemTypeText} type="captain">
                      {item?.type?.display || ''}
                    </TextField>
                  </View>
                </View>
                <View style={styles.cartTitleContainer}>
                  <TextField style={[AppStyle.flex1, AppStyle.padRight5]} type="heading-4">
                    {item.name}
                  </TextField>
                  <TextField type="heading-4">{formatCurrency(item.outstanding)}</TextField>
                </View>
                <View style={styles.cartTitleContainer}>
                  <TextField type="text-label" style={styles.currentPaymentText}>
                    {t(`${i18nScope}.currentRepayments`)}
                  </TextField>
                  <TextField type="text-label" style={styles.currentPaymentText}>
                    {formatCurrency(item.repayment)}
                  </TextField>
                </View>
                <View style={styles.cartTitleContainer}>
                  <TextField style={styles.loansJar} type="captain">
                    {t('global.jars.Loans Jar')}
                  </TextField>
                  <TextField style={styles.loansFre} type="captain">
                    {item?.repaymentFreq?.display || ''}
                  </TextField>
                </View>
              </TouchableField>
            </CardItemWithTrashIcon>
          </View>
        ))}
      <View style={styles.addNewButton}>
        <TouchableField
          onPress={() => handleOpenBorrowingModal()}
          style={styles.addNewBorrowingContainer}>
          <AntIcon size={36} name="pluscircle" style={styles.plusIcon} />
          <TextField type="heading-4">{t(`${i18nScope}.addNewBorrowingCard`)}</TextField>
        </TouchableField>
      </View>
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(Property);
