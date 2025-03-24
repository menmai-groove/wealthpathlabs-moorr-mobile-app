import Condition from 'components/basics/Condition';
import { UtilLib } from 'libs';
import { cloneDeep, isEmpty, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import FormDetail from 'screens/OnBoardingInterview/components/FormDetail';
import FormNumberOfItem from 'screens/OnBoardingInterview/components/FormNumberOfItem';
import { handleDataSaved } from 'screens/OnBoardingInterview/handleData';
import {
  selectActiveBankAccount,
  selectFrequency,
  selectLoanType,
  selectOwnersWithOthers,
  selectUser,
} from 'store/Auth/selector';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.borrowingTelling.liabilities';

function Liabilities(props) {
  const { t, onCancel, onSubmit, data: dataSaved } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [numberOfLiabilities, setNumberOfLiabilities] = useState(0);

  const user = useSelector(selectUser);

  const ownership = useSelector(selectOwnersWithOthers);
  const askingName = useSelector(selectAskingNameData);
  const loanType = useSelector(selectLoanType);
  const frequency = useSelector(selectFrequency);
  const bankAccounts = useSelector(selectActiveBankAccount);

  const hasPartner = user.partner?._id;

  const data = useMemo(() => {
    const clJson = require('assets/forms/conditionLogics/cl-borrowing-liability.json');
    const formatFormJson = require('assets/forms/layouts/onboading-borrowing-liability.json');
    let formLayout = formatFormJson.layout[0];
    let layout = { layout: [] };
    let conditionLogics = { logics: [] };

    for (let index = 0; index < numberOfLiabilities; index++) {
      let obj = cloneDeep(formLayout);
      obj.fields = obj.fields.filter(x => (!hasPartner ? x.id !== 'ownershipSplitPerson2' : true));
      obj.id = `liability${index}`;
      obj.label = t(
        numberOfLiabilities > 1 && index === numberOfLiabilities - 1
          ? 'forms.borrowing.msgOpti2'
          : 'forms.borrowing.msgOpti1',
        { text: UtilLib.formatOrdinalNumber(index + 1) },
      );
      obj.fields.map(x => {
        if (x.id === 'loanType') {
          x.options = loanType;
        }
        if (x.id === 'ownership') {
          const cloneOwner = cloneDeep(ownership);
          if (cloneOwner.length > 0) {
            cloneOwner[0].display = askingName?.name;
          }
          x.options = cloneOwner;
        }
        if (x.id === 'frequency') {
          x.options = frequency;
          if (!isEmpty(x.value)) {
            x.value = frequency.find(type => type.value === x.value?.value);
          }
        }
        if (x.id === 'offsetAccount') {
          x.options = [...bankAccounts].map((bank, idx) => ({
            ...bank,
            display: t(`${i18nScope}.displayNameBankAccount`, {
              number: idx + 1,
            }),
            value: bank,
          }));
        }
        if (x.id === 'interestRate') {
          x.loanTypeId = `${obj.id}-${x.loanTypeId}`;
        }
        x.id = `${obj.id}-${x.id}`;
        x.value = (dataSaved ?? {})[x.id] ?? x.value ?? '';
        if (x.id === `${obj.id}-ownershipSplitPerson1`) {
          if (ownership.length >= 2) {
            x.placeholder = x.label = t(x.label).replace('###', askingName?.name);
            x.value =
              (dataSaved ?? {})[x.id] ?? ownership[2]?.owners[0]?.percentage?.toString() ?? '';
          }
        }
        if (x.id === `${obj.id}-ownershipSplitPerson2`) {
          if (ownership.length >= 2) {
            x.placeholder = x.label = t(x.label).replace('###', ownership[1]?.label);
            x.value =
              (dataSaved ?? {})[x.id] ?? ownership[2]?.owners[1]?.percentage?.toString() ?? '';
          }
        }
        return x;
      });

      let conditionLogic = cloneDeep(clJson);
      conditionLogic.logics.forEach(logic => {
        logic.field = `${obj.id}-${logic.field}`;
        if (logic.fields) {
          logic.fields = logic.fields.map(field => `${obj.id}-${field}`);
        }
        logic?.condition?.condition?.forEach(condition => {
          if (condition.field) {
            condition.field = `${obj.id}-${condition.field}`;
          }
        });
        handleDataSaved(obj, logic);
        conditionLogics?.logics?.push(logic);
      });

      layout.layout.push(obj);
    }
    return { layout, conditionLogics };
  }, [
    numberOfLiabilities,
    t,
    dataSaved,
    loanType,
    ownership,
    askingName.name,
    frequency,
    bankAccounts,
    hasPartner,
  ]);

  function onSubmitForm(formData) {
    for (let index = 0; index < numberOfLiabilities; index++) {
      // Update Ownership percentage
      const formOwners = formData[`liability${index}-ownership`]?.owners;
      const formSplit1Name = `liability${index}-ownershipSplitPerson1`;
      const formSplit2Name = `liability${index}-ownershipSplitPerson2`;
      if (formOwners?.length > 1) {
        formOwners[0].percentage = toNumber(formData[formSplit1Name]);
        formOwners[1].percentage = toNumber(formData[formSplit2Name]);
      }
    }
    onSubmit({ ...formData, numberOfLiabilities });
  }

  return (
    <View style={styles.container}>
      <Condition display={numberOfLiabilities === 0}>
        <FormNumberOfItem
          defaultValue={dataSaved?.numberOfLiabilities}
          onCancel={onCancel}
          onSubmit={number => {
            if (toNumber(number) === 0) {
              onSubmit({ numberOfLiabilities: number });
            } else {
              setNumberOfLiabilities(number);
            }
          }}
          i18nScope={i18nScope}
        />
      </Condition>
      <Condition display={numberOfLiabilities > 0}>
        <FormDetail
          onCancel={onCancel}
          formFormat={data.layout}
          condition={data.conditionLogics}
          onSubmit={formData => onSubmitForm(formData)}
          i18nScope={i18nScope}
        />
      </Condition>
    </View>
  );
}

export default compose(withTranslation())(Liabilities);
