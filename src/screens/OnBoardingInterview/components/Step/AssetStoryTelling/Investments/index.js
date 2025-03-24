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
import { handleDataSaved } from 'screens/OnBoardingInterview/handleData';
import { selectOwnersWithOthers, selectUser } from 'store/Auth/selector';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.assetStoryTelling.investments';

function Investments(props) {
  const { t, onCancel, onSubmit, data: dataSaved } = props;
  const styles = useThemedStyle(themedStyles);

  const ownership = useSelector(selectOwnersWithOthers);
  const askingName = useSelector(selectAskingNameData);

  const [numberOfInvestments, setNumberOfInvestments] = useState(0);

  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;

  const data = useMemo(() => {
    const clJson = require('assets/forms/conditionLogics/cl-asset-investment.json');
    const formatFormJson = require('assets/forms/layouts/onboading-asset-investment.json');
    let formLayout = formatFormJson.layout[1];
    let layout = { layout: [] };
    let conditionLogics = { logics: [] };

    for (let index = 0; index < numberOfInvestments; index++) {
      let obj = cloneDeep(formLayout);
      obj.fields = obj.fields.filter(x => (!hasPartner ? x.id !== 'ownershipSplitPerson2' : true));
      obj.id = `investment${index}`;
      obj.label = t('forms.onboarding-investment.label', { number: index + 1 });
      obj.style = styles.group;
      obj.fields.map(field => {
        field.id = `${obj.id}-${field.id}`;
        field.value = (dataSaved ?? {})[field.id] ?? field.value ?? '';
        if (field.id === `${obj.id}-ownership`) {
          const cloneOwner = cloneDeep(ownership);
          if (cloneOwner.length > 0) {
            cloneOwner[0].label = askingName?.name;
            cloneOwner[0].display = askingName?.name;
          }
          field.options = cloneOwner;
          field.value = (dataSaved ?? {})[field.id] ?? first(cloneOwner);
        }
        if (field.id === `${obj.id}-ownershipSplitPerson1`) {
          if (ownership.length >= 2) {
            field.placeholder = field.label = t(field.label).replace('###', askingName?.name);
            field.value =
              (dataSaved ?? {})[field.id] ?? ownership[2]?.owners[0]?.percentage?.toString() ?? '';
          }
        }
        if (field.id === `${obj.id}-ownershipSplitPerson2`) {
          if (ownership.length >= 2) {
            field.placeholder = field.label = t(field.label).replace('###', ownership[1]?.label);
            field.value =
              (dataSaved ?? {})[field.id] ?? ownership[2]?.owners[1]?.percentage?.toString() ?? '';
          }
        }
        return field;
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
    layout.layout.unshift(formatFormJson.layout[0]);

    return { layout, conditionLogics };
  }, [numberOfInvestments, t, styles, hasPartner, dataSaved, ownership, askingName]);

  return (
    <View style={styles.container}>
      <Condition display={numberOfInvestments === 0}>
        <FormNumberOfItem
          defaultValue={dataSaved?.numberOfInvestments}
          onCancel={onCancel}
          onSubmit={number => {
            if (toNumber(number) === 0) {
              onSubmit({ numberOfInvestments: number });
            } else {
              setNumberOfInvestments(number);
            }
          }}
          i18nScope={i18nScope}
        />
      </Condition>
      <Condition display={numberOfInvestments > 0}>
        <FormDetail
          onCancel={onCancel}
          formFormat={data.layout}
          condition={data.conditionLogics}
          onSubmit={formData => onSubmit({ ...formData, numberOfInvestments })}
          i18nScope={i18nScope}
        />
      </Condition>
    </View>
  );
}

export default compose(withTranslation())(Investments);
