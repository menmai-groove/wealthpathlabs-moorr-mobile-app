import Condition from 'components/basics/Condition';
import { cloneDeep, first, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import FormDetail from 'screens/OnBoardingInterview/components/FormDetail';
import FormNumberOfItem from 'screens/OnBoardingInterview/components/FormNumberOfItem';
import { selectOwners } from 'store/Auth/selector';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.assetStoryTelling.bankAccounts';

function BankAccounts(props) {
  const { t, onCancel, onSubmit, data: dataSaved } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);

  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const ownership = useSelector(selectOwners);
  const askingName = useSelector(selectAskingNameData);

  const data = useMemo(() => {
    const formatFormJson = require('assets/forms/layouts/onboarding-asset-bank-account.json');
    let layout = { layout: [] };
    let formLayout = formatFormJson.layout[1];
    for (let index = 0; index < numberOfAccounts; index++) {
      let obj = cloneDeep(formLayout);
      obj.id = `bank${index}`;
      obj.label = t('forms.bank.label', { number: index + 1 });
      obj.style = styles.group;
      obj.fields.map(x => {
        x.id = `${obj.id}-${x.id}`;
        x.value = (dataSaved ?? {})[x.id] ?? '';
        if (x.id === `${obj.id}-ownership`) {
          const cloneOwner = cloneDeep(ownership);
          if (cloneOwner.length > 0) {
            cloneOwner[0].label = askingName?.name;
            cloneOwner[0].display = askingName?.name;
          }
          x.options = cloneOwner;
          x.value = (dataSaved ?? {})[x.id] ?? first(cloneOwner);
        }
        return x;
      });
      layout.layout.push(obj);
    }
    layout.layout.unshift(formatFormJson.layout[0]);

    return { layout };
  }, [numberOfAccounts, t, styles.group, dataSaved, ownership, askingName]);

  return (
    <View style={styles.container}>
      <Condition display={numberOfAccounts === 0}>
        <FormNumberOfItem
          defaultValue={dataSaved?.numberOfAccounts}
          onCancel={onCancel}
          onSubmit={number => {
            if (toNumber(number) === 0) {
              onSubmit({ numberOfAccounts: number });
            } else {
              setNumberOfAccounts(number);
            }
          }}
          i18nScope={i18nScope}
        />
      </Condition>
      <Condition display={numberOfAccounts > 0}>
        <FormDetail
          onCancel={onCancel}
          formFormat={data.layout}
          condition={data.conditionLogics}
          onSubmit={formData => onSubmit({ ...formData, numberOfAccounts })}
          i18nScope={i18nScope}
        />
      </Condition>
    </View>
  );
}

export default compose(withTranslation())(BankAccounts);
