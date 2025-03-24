import DynamicForm from 'components/basics/DynamicForm';
import FooterControl from 'components/basics/FooterControl';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import NextPayDateModal from 'components/basics/NextPayDateModal';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { cloneDeep, get, includes, isDate, isEmpty, isNil, uniq, uniqBy } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { ModalMoveOffsets } from 'screens/Borrowing/components/FormAddDetail/ModalMoveOffsets';
import { RECORD_TYPE, updateTime } from 'screens/HistoricalLog';
import {
  selectFlags,
  selectFrequency,
  selectLoanType,
  selectOffsetAccounts,
  selectOwnersWithOthers,
  selectPrimaryPurposeBorrowing,
  selectProviderBorrowing,
  selectRepaymentAccounts,
  selectRepaymentType,
  selectUser,
} from 'store/Auth/selector';
import { callAPISaveData } from 'store/Borrowing/action';
import {
  selectActiveAssets,
  selectBorrowingDetails,
  selectBorrowingMortgageType,
  selectBorrowingName,
  selectBorrowingOwnership,
  selectBorrowingType,
} from 'store/Borrowing/selector';
import { updateNextPayDateStart } from 'store/FinancialDashboard/action';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.borrowing';

const AnimatedKeyboardAwareFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList);

function FormAddDetail(props) {
  const {
    onCancel,
    borrowing,
    onEdit,
    disabled,
    restoring,
    onSubmit: onSubmitData,
    linkedOffsetsBorrowings = [],
    onScroll = () => {},
    startDate,
  } = props;
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const formRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef();
  const dispatchResolve = useDispatchResolve();
  const [isEdited, setIsEdited] = useState(borrowing ? false : true);

  const owners = useSelector(selectOwnersWithOthers);
  const loanType = useSelector(selectLoanType);
  const primaryPurpose = useSelector(selectPrimaryPurposeBorrowing);
  const provider = useSelector(selectProviderBorrowing);
  const offsetAccounts = useSelector(selectOffsetAccounts);
  const frequency = useSelector(selectFrequency);
  const repaymentType = useSelector(selectRepaymentType);
  const repaymentAccounts = useSelector(selectRepaymentAccounts);
  const mortgageTypeSelected = useSelector(selectBorrowingMortgageType);
  const activeAssets = useSelector(selectActiveAssets);
  const borrowingDetails = useSelector(selectBorrowingDetails);
  const borrowingType = useSelector(selectBorrowingType) || get(borrowingDetails, 'type');
  const borrowingOwnership = useSelector(selectBorrowingOwnership);
  const borrowingCardName = useSelector(selectBorrowingName);
  const flags = useSelector(selectFlags);
  const nextRepaymentDateStartRef = useRef(null);

  const restrictBorrowing = ['Home Loan', 'Investment Loan'];

  useEffect(() => {
    if (restoring) {
      setIsEdited(true);
    }
  }, [restoring]);

  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;

  const terms = Array.from({ length: 30 }, (_, i) => ({ display: i + 1, value: i + 1 }));

  const paymentFrequencyOnChange = useCallback((_field, value) => {
    const { nextRepaymentDate } = borrowingDetails;
    const nextRepaymentDateField = formRef.current?.getFormValue('nextRepaymentDate');
    if (!isDate(nextRepaymentDateField)) {
      return;
    }
    nextRepaymentDateStartRef.current = nextRepaymentDateField ?? nextRepaymentDate;
    GlobalLib.CustomModal.get().show({
      onBackdropPress: () => GlobalLib.CustomModal.get().hide(),
      body: (
        <NextPayDateModal
          date={nextRepaymentDateStartRef.current}
          title={'Does this change your next Repayment Date?'}
          content={
            'You have updated your payment frequency, does this change your next repayment date?'
          }
          dateLabelText={'Next Repayment Date'}
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          onSubmit={data => {
            const _id = get(borrowingDetails, ['_id']);
            const nextPayDateStartValue = get(data, ['date']);
            const frequencyValue = get(value, ['value']);
            const assetsData = {
              cardType: 'borrowings',
              _id,
              nextPayDateStart: nextPayDateStartValue,
              nextPayDateStartField: 'nextRepaymentDateStart',
              frequency: frequencyValue,
              frequencyField: 'repaymentFreq',
            };
            GlobalLib.CustomModal.get().hide();
            dispatchResolve(updateNextPayDateStart(assetsData)).then(response => {
              const _nextRepaymentDate = get(response, 'nextRepaymentDate');
              if (_nextRepaymentDate) {
                formRef.current?.setFormValue(
                  'nextRepaymentDate',
                  moment(_nextRepaymentDate).toDate(),
                );
                nextRepaymentDateStartRef.current = nextPayDateStartValue;
              }
            });
          }}
        />
      ),
    });
  }, []);

  const handledData = useCallback(
    field => {
      switch (field.id) {
        case 'cardName':
          field.value = borrowing ? borrowing?.name || '' : borrowingCardName;
          break;
        case 'outstandingBalance':
          if (borrowing) {
            field.value = borrowing.outstanding?.toString() || '';
          }
          break;
        case 'moneySmartsJar':
          if (borrowing) {
            field.value = borrowing.moneySmartsJar;
          } else {
            field.value = AppConstants.Borrowing.Jar;
          }
          break;
        case 'loanType':
          field.options = loanType;
          if (borrowing) {
            field.value = loanType.find(type => type.value === borrowing.type);
            if (field.value) {
              if (!restrictBorrowing.some(x => field.value?.value?.includes(x))) {
                field.disabled = true;
              } else {
                field.options = loanType.filter(_type =>
                  restrictBorrowing.some(x => _type?.value?.includes(x)),
                );
              }
            }
          } else {
            field.value = loanType.find(
              type => type.value === (mortgageTypeSelected || borrowingType),
            );
          }
          break;
        case 'ownership':
          field.options = owners;
          let ownership = borrowing?.borrower || borrowingOwnership;
          if (ownership) {
            const id = get(ownership, ['owners', 0, 'owner']);
            field.value = owners.find(
              item =>
                get(item, ['owners', 0, 'owner']) === id &&
                item.ownershipType === ownership.ownershipType,
            );
          }

          break;
        case 'ownershipSplitPerson1':
          if (owners.length >= 2) {
            field.placeholder = field.label = t(field.label).replace('###', owners[0]?.label);
          }
          if (borrowing) {
            let ownersJoint = borrowing?.borrower?.owners || [];
            if (ownersJoint) {
              field.value = ownersJoint[0]?.percentage?.toString();
            }
          }
          break;
        case 'ownershipSplitPerson2':
          if (owners.length >= 2) {
            field.placeholder = field.label = t(field.label).replace('###', owners[1]?.label);
          }
          if (borrowing) {
            let ownersJoint = borrowing?.borrower?.owners || [];
            if (ownersJoint) {
              field.value = ownersJoint[1]?.percentage?.toString();
            }
          }
          break;
        case 'otherBorrowerPercentage':
          if (owners.length >= 3) {
            field.placeholder = field.label = t(field.label).replace('###', owners[1]?.label);
          }
          if (borrowing) {
            field.value = (borrowing.otherBorrowerPercentage ?? 0).toString();
          }
          break;
        case 'primaryPurpose':
          field.options = primaryPurpose;
          if (borrowing) {
            field.value =
              primaryPurpose.find(type => type.value === borrowing.primaryPurpose) || null;
          }
          break;
        case 'provider':
          field.options = provider;
          if (borrowing) {
            field.value = field.options.find(type => type.value === borrowing.provider) || null;
          }
          break;
        case 'otherProvider':
          field.value = borrowing ? borrowing.otherProvider || '' : '';
          break;
        case 'accountNumber':
          if (borrowing) {
            field.value = borrowing.accountNumber?.toString() || '';
          }
          break;
        case 'isOffsetAccount':
          field.value = borrowing ? borrowing.isOffset || false : false;
          break;
        case 'offsetAccount':
          // const currentLoanId = borrowingDetails?._id;
          // const newOffsetAccounts = offsetAccounts.filter(o => {
          //   const offsetId = o.id;
          //   const isOffsetLinked = linkedOffsetsBorrowings?.some(bb => {
          //     return bb?._id !== currentLoanId && bb?.offsets?.some(oo => oo?.offset === offsetId);
          //   });
          //   return !isOffsetLinked;
          // });
          field.options = offsetAccounts;

          if (borrowing) {
            let uniqListOffset = uniqBy(borrowing.offsets, 'offset');

            uniqListOffset?.forEach(o => {
              let offset = field.options.find(type => type.value === o.offset);
              if (offset) {
                field.value.push(offset);
              }
            });
          }
          break;
        case 'originalAmount':
          if (borrowing) {
            field.value = borrowing.originalAmount?.toString() || '';
          }
          break;
        case 'loanStartDate':
          field.value = borrowing ? borrowing.startDate : null;
          break;
        case 'term':
          field.options = terms;
          if (borrowing) {
            field.value = field.options.find(type => type.value === borrowing.term) || null;
          }
          break;
        case 'loanExpiryDate':
          field.value = borrowing ? borrowing.expiryDate : null;
          break;
        case 'fixedRateEndDate':
          field.value = borrowing ? borrowing.fixedRateEndDate : null;
          break;
        case 'fixedTerm':
          field.options = terms;
          if (borrowing) {
            field.value = field.options.find(type => type.value === borrowing.fixedTerm) || null;
          }
          break;
        case 'limit':
          if (borrowing) {
            field.value = borrowing.limit?.toString() || '';
          }
          break;
        case 'upfrontFees':
          if (borrowing) {
            field.value = borrowing.upfrontFees?.toString() || '';
          }
          break;
        case 'isLMI':
          if (borrowing) {
            field.value = borrowing.LMIBool || false;
          }
          break;
        case 'LMI':
          if (borrowing) {
            field.value = borrowing.LMI?.toString() || '';
          }
          break;
        case 'properties':
          field.options = activeAssets;
          if (borrowing) {
            uniq([
              ...(borrowing?.properties ?? []),
              ...(borrowing?.investments ?? []),
              ...(borrowing?.vehicles ?? []),
            ]).forEach(id => {
              let property = field.options.find(type => type.value === id);
              if (property) {
                field.value.push(property);
              }
            });
          }
          break;
        case 'securedAgainst':
          field.options = activeAssets;
          if (borrowing) {
            uniq([
              ...(borrowing?.securedAgainstProperties ?? []),
              ...(borrowing?.securedAgainstInvestments ?? []),
              ...(borrowing?.securedAgainstVehicles ?? []),
            ]).forEach(id => {
              let property = field.options.find(type => type.value === id);
              if (property) {
                field.value.push(property);
              }
            });
          }
          break;
        case 'interestRate':
          if (borrowing) {
            const rate = {};
            if (!isNil(borrowing.interestRate)) {
              rate.interestRate = borrowing.interestRate?.toString() || '';
            }
            if (!isNil(borrowing.baseRate)) {
              rate.baseRate = borrowing.baseRate?.toString() || '';
            }
            if (!isNil(borrowing.discountRate)) {
              rate.discountRate = borrowing.discountRate?.toString() || '';
            }
            field.value = rate;
          }
          break;
        case 'baseRate':
          if (borrowing) {
            field.value = borrowing.baseRate?.toString() || '';
          }
          break;
        case 'discountRate':
          if (borrowing) {
            field.value = borrowing.discountRate?.toString() || '';
          }
          break;
        case 'repaymentType':
          field.options = repaymentType;
          if (borrowing) {
            field.value =
              field.options.find(type => type.value === borrowing.repaymentType) || null;
          }
          break;
        case 'interestOnlyExpiryDate':
          if (borrowing) {
            field.value = borrowing.interestOnlyExpiryDate || null;
          }
          break;
        case 'repaymentAmount':
          if (borrowing) {
            field.value = borrowing.repayment?.toString() || '';
          }
          break;
        case 'frequency':
          field.options = frequency;
          if (!isEmpty(field.value)) {
            field.value = frequency.find(type => type.value === field.value?.value);
          }
          if (borrowing) {
            field.value =
              field.options.find(type => type.value === borrowing.repaymentFreq) || null;
            if (flags.nextDates) {
              field.onChange = paymentFrequencyOnChange;
            }
          }
          break;
        case 'paymentAccount':
          field.options = repaymentAccounts;
          if (borrowing) {
            field.value =
              field.options.find(type => type.value === borrowing.paymentAccount) || null;
          }
          break;
        case 'autosweep':
          if (borrowing) {
            field.value = borrowing.isAutoPaymentSweep || false;
          }
          break;
        case 'loanFees':
          if (borrowing) {
            field.value = borrowing.loanFees?.toString() || '';
          }
          break;
        case 'loanFeesFrequency':
          field.options = frequency;
          if (!isEmpty(field.value)) {
            field.value = frequency.find(type => type.value === field.value?.value);
          }
          if (borrowing) {
            field.value =
              field.options.find(type => type.value === borrowing.loanFeesFrequency) || null;
          }
          break;
        case 'paymentAccountOngoingCost':
          field.options = repaymentAccounts;
          if (borrowing) {
            field.value =
              field.options.find(type => type.value === borrowing.ongoingPaymentAccount) || null;
          }
          break;
        case 'note':
          if (borrowing) {
            field.value = borrowing.addlInfo?.toString() || '';
          }
          break;
        case 'borrowerAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.borrower?.ownershipAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'borrower',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.OWNERSHIP,
            };
          } else {
            // field.value = UtilLib.dateUTCAsAt(Date.now());
            field.value = startDate ?? UtilLib.dateUTCAsAt(Date.now());
          }
          break;
        case 'interestRateAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.interestRateAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: ['interestRate', 'baseRate', 'discountRate'],
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER,
              loanTypeValue: loanType.find(type => type.value === borrowing.type),
            };
          }
          break;
        case 'repaymentAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.repaymentAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'repayment',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
            };
          }
          break;
        case 'loanFeesAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.loanFeesAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'loanFees',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER_WITH_FREQUENCY,
            };
          }
          break;
        case 'outstandingAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.outstandingAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'outstanding',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER,
            };
          }
          break;
        case 'repaymentTypeAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.repaymentTypeAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'repaymentType',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.STRING,
            };
          }
          break;
        case 'securedAgainstAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.securedAgainstAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: [
                'securedAgainstVehicles',
                'securedAgainstProperties',
                'securedAgainstInvestments',
              ],
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.OBJECT_IDS,
            };
          }
          break;
        case 'typeAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.typeAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'type',
              fieldName: 'Loan Type',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.STRING,
              restrictValue: restrictBorrowing,
            };
            var _type = loanType.find(type => type.value === borrowing.type);
            if (_type != null && !restrictBorrowing.some(x => _type?.value?.includes(x))) {
              field.disabled = true;
            }
          } else {
            // field.value = UtilLib.dateUTCAsAt(Date.now());
            field.value = startDate ?? UtilLib.dateUTCAsAt(Date.now());
          }
          break;
        case 'limitAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.limitAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'limit',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER,
            };
          }
          break;
        case 'offsetsAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.offsetsAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'offsets',
              fieldId: 'offsetAccount',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.OBJECT_IDS,
            };
          }
          break;
        case 'purposeAsAt':
          if (borrowing) {
            field.lastDate = field.value = borrowing?.purposeAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: ['properties', 'vehicles', 'investments'],
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.OBJECT_IDS,
            };
          }
          break;
        case 'isTrackedInMoneySmartsAsAt':
          // field.value = UtilLib.dateUTCAsAt(Date.now());
          field.value = startDate ?? UtilLib.dateUTCAsAt(Date.now());
          if (borrowing) {
            field.value = borrowing?.isTrackedInMoneySmartsAsAt ?? null;
            const { _id, name } = borrowing;
            field.info = {
              cardId: _id,
              cardName: name,
              field: 'isTrackedInMoneySmarts',
              category: 'Borrowing',
              type: borrowingType,
              recordType: RECORD_TYPE.NUMBER,
            };
          }
          break;
        case 'isTrackedInMoneySmarts':
          field.options = AppConstants.dropdownOptions;
          field.value = includes(mortgageTypeSelected ?? borrowingType, 'Line of Credit')
            ? AppConstants.dropdownOptions[1]
            : AppConstants.dropdownOptions[0];
          if (borrowing) {
            field.value = AppConstants.dropdownOptions.find(
              o => o.value === borrowing.isTrackedInMoneySmarts,
            );
          }
          break;
        case 'nextRepaymentDate':
          if (flags.nextDates) {
            field.visible = true;
            field.value = borrowing?.nextRepaymentDate
              ? moment(borrowing?.nextRepaymentDate).toDate()
              : '';
            field.minDate = UtilLib.dateUTCAsAt(Date.now());
          }
          break;

        default:
          break;
      }
    },
    [
      activeAssets,
      borrowing,
      borrowingCardName,
      borrowingOwnership,
      borrowingType,
      frequency,
      loanType,
      mortgageTypeSelected,
      offsetAccounts,
      owners,
      primaryPurpose,
      provider,
      repaymentAccounts,
      repaymentType,
      t,
      terms,
      borrowingDetails,
      linkedOffsetsBorrowings,
    ],
  );

  const data = useMemo(() => {
    const clJson = require('assets/forms/conditionLogics/cl-borrowing-details.json');
    const formatFormJson = require('assets/forms/layouts/borrowing-details.json');
    let layout = cloneDeep(formatFormJson);
    layout.layout.forEach(group => {
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
    layout.layout.forEach(group => {
      group.fields.forEach(field => {
        if (field.fields) {
          field.fields.forEach(f => handledData(f));
        }
        handledData(field);
      });
      if (group.component === 'collapse' && borrowing) {
        group.collapse = false;
      }
    });
    UtilLib.handleConditionLogicDynamicForm(layout, clJson);
    return { layout, conditionLogics: clJson };
  }, [borrowing, handledData, hasPartner]);

  const onFirstTimeDataChange = useCallback(() => {
    if (!isEdited) {
      setIsEdited(true);
      onEdit();
    }
  }, [isEdited, onEdit]);

  const handleShowModalMoveOffset = (
    offsetsLinkedWithOtherBorrowing,
    result = [],
    onFinish = () => {},
  ) => {
    if (offsetsLinkedWithOtherBorrowing?.length > 0) {
      const offset = offsetsLinkedWithOtherBorrowing[0];
      offsetsLinkedWithOtherBorrowing.shift();
      GlobalLib.CustomModal.get().hide();
      setTimeout(() => {
        GlobalLib.CustomModal.get().show({
          onBackdropPress: GlobalLib.CustomModal.get().hide,
          onRequestClose: GlobalLib.CustomModal.get().hide,
          body: (
            <ModalMoveOffsets
              title={`Warning ${(
                offset?.offsetName ?? ''
              ).trim()} offset already links to another loan.`}
              content={
                'You can not attach an offset to two different loans.\n\nTo attach the offset to this loan, it will need to be removed from'
              }
              content2={'Would you like to move your offset to this card?'}
              onCancel={() => {
                GlobalLib.CustomModal.get().hide();
                result.push({
                  ...offset,
                  update: false,
                });
                handleShowModalMoveOffset(offsetsLinkedWithOtherBorrowing, result, onFinish);
              }}
              onSubmit={_data => {
                GlobalLib.CustomModal.get().hide();
                result.push({
                  ..._data,
                  ...offset,
                  asAt: UtilLib.dateUTCAsAt(moment(_data.asAt).subtract(1, 'day').toDate()),
                  update: true,
                });
                handleShowModalMoveOffset(offsetsLinkedWithOtherBorrowing, result, onFinish);
              }}
              dateLabelText={'Offset Move Date'}
              submitText={'Move Offset'}
              offset={offset}
              date={offset?.asAt}
            />
          ),
        });
      }, 800);
    } else {
      onFinish(result);
    }
  };

  const onSubmit = async (dataForm, callback) => {
    if (typeof onSubmitData === 'function') {
      await onSubmitData();
    }

    const currentLoanId = borrowingDetails?._id;
    const offsetsLinkedWithOtherBorrowing = offsetAccounts
      .map(o => {
        const offsetId = o.id;
        const offsetLinked = linkedOffsetsBorrowings?.find(bb => {
          return bb?._id !== currentLoanId && bb?.offsets?.some(oo => oo?.offset === offsetId);
        });
        if (offsetLinked) {
          return {
            ...offsetLinked,
            offsetName: o.label,
            offsetId: offsetId,
            asAt: UtilLib.dateUTCAsAt(dataForm.offsetsAsAt),
          };
        }
        return null;
      })
      .filter(x => x != null && dataForm.offsetAccount?.some(os => os.id === x.offsetId));

    if (offsetsLinkedWithOtherBorrowing?.length > 0) {
      handleShowModalMoveOffset(offsetsLinkedWithOtherBorrowing, [], result => {
        let borrowingsUpdate = [];
        // remove the offset of previous loan
        if (result) {
          borrowingsUpdate = result.map(_borrowing => {
            const offsets = [];
            (_borrowing.offsets ?? []).forEach(offset => {
              offsets.push({
                _id: offset._id,
                offset: offset.offset,
                _delete: offset.offset === _borrowing.offsetId,
              });
            });

            return {
              ..._borrowing,
              _id: _borrowing._id,
              offsets: offsets.filter(x => x._delete === true),
              offsetsAsAt: UtilLib.dateUTCAsAt(_borrowing.asAt),
            };
          });
        }
        dispatchResolve(callAPISaveData({ ...dataForm, removeOffset: borrowingsUpdate })).then(
          () => {
            if (typeof callback === 'function') {
              updateTime();
              callback();
              return;
            }
            NavigationServiceLib.pop();
          },
        );
        //
      });
      return;
    }
    dispatchResolve(callAPISaveData(dataForm)).then(() => {
      if (typeof callback === 'function') {
        updateTime();
        callback();
        return;
      }
      NavigationServiceLib.pop();
    });
  };

  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        element && scrollRef?.current?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );

  const onErrorForm = useCallback(
    (formErrors, dataFormErrors, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrors[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const onDropdownValueChange = (field, value, callback) => {
    if (field.id === 'loanType') {
      if (includes(value?.value, 'Line of Credit')) {
        formRef?.current?.setFormValue('isTrackedInMoneySmarts', AppConstants.dropdownOptions[1]);
      } else {
        formRef?.current?.setFormValue('isTrackedInMoneySmarts', AppConstants.dropdownOptions[0]);
      }
      callback();
    } else {
      callback();
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedKeyboardAwareFlatList
        ref={scrollRef}
        listKey={'dynamic-form'}
        data={[]}
        showsVerticalScrollIndicator={false}
        style={[AppStyle.flex1, AppStyle.padX25]}
        contentContainerStyle={AppStyle.padBottom90}
        ListHeaderComponent={
          <DynamicForm
            ref={formRef}
            data={data.layout}
            onSubmit={onSubmit}
            onError={onErrorForm}
            conditionLogics={data.conditionLogics}
            onFirstTimeDataChange={onFirstTimeDataChange}
            disabled={disabled}
            onDropdownValueChange={onDropdownValueChange}
          />
        }
        onScroll={onScroll}
      />
      {isEdited && (
        <View style={styles.wrapperControl}>
          <FooterControl
            onCancel={onCancel}
            onSave={() => formRef.current?.submit()}
            isEdited={isEdited}
            textButtonSave={restoring ? t('screens.financialDashboard.restore') : null}
          />
        </View>
      )}
    </View>
  );
}

export default compose(withTranslation())(FormAddDetail);
