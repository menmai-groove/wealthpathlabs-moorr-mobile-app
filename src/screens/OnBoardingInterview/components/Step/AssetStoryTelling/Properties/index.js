import Condition from 'components/basics/Condition';
import { UtilLib } from 'libs';
import { cloneDeep, toNumber } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import FormDetail from 'screens/OnBoardingInterview/components/FormDetail';
import FormNumberOfItem from 'screens/OnBoardingInterview/components/FormNumberOfItem';
import { handleDataSaved } from 'screens/OnBoardingInterview/handleData';
import { selectOwnersWithOthers, selectPrimaryPurpose, selectUser } from 'store/Auth/selector';
import { selectAskingNameData } from 'store/OnBoardingInterview/selector';

import themedStyles from './style';

const i18nScope = 'screens.onBoardingInterview.assetStoryTelling.properties';

function Properties(props) {
  const { t, onCancel, onSubmit, data: dataSaved } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);

  const [numberOfProperties, setNumberOfProperties] = useState(0);

  const primaryPurpose = useSelector(selectPrimaryPurpose);

  const user = useSelector(selectUser);
  const hasPartner = user.partner?._id;

  const ownership = useSelector(selectOwnersWithOthers);

  const askingName = useSelector(selectAskingNameData);

  const data = useMemo(() => {
    const formatFormJson = require('assets/forms/layouts/onboading-asset-property.json');
    let formLayout = formatFormJson.layout[0];
    const clJson = formatFormJson.conditional;
    let layout = { layout: [] };
    let conditionLogics = { logics: [] };

    for (let index = 0; index < numberOfProperties; index++) {
      let obj = cloneDeep(formLayout);
      obj.fields = obj.fields.filter(x => (!hasPartner ? x.id !== 'ownershipSplitPerson2' : true));
      obj.id = `form${index}`;
      obj.label = t(
        numberOfProperties > 1 && index === numberOfProperties - 1
          ? 'forms.asset.msgOpti2'
          : 'forms.asset.msgOpti1',
        { text: UtilLib.formatOrdinalNumber(index + 1) },
      );
      obj.fields.map(x => {
        if (x.id === 'primaryPurpose') {
          x.options = primaryPurpose;
        }
        if (x.id === 'ownership') {
          const cloneOwner = cloneDeep(ownership);
          if (cloneOwner.length > 0) {
            cloneOwner[0].display = askingName?.name;
          }
          x.options = cloneOwner;
        }
        x.id = `${obj.id}-${x.id}`;
        x.value = (dataSaved ?? {})[x.id] ?? '';
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
      conditionLogic.logics.map(logic => {
        if (logic.field) {
          logic.field = `${obj.id}-${logic.field}`;
        }
        if (logic.fields) {
          logic.fields = logic.fields.map(field => `${obj.id}-${field}`);
        }
        logic.condition.condition.forEach(condition => {
          if (condition.field) {
            condition.field = `${obj.id}-${condition.field}`;
          }
        });
        handleDataSaved(obj, logic);
        conditionLogics.logics.push(logic);
      });

      layout.layout.push(obj);
    }

    return { layout, conditionLogics };
  }, [numberOfProperties, t, hasPartner, dataSaved, primaryPurpose, ownership, askingName.name]);
  function onSubmitForm(formData) {
    for (let index = 0; index < numberOfProperties; index++) {
      // Update Ownership percentage
      const formOwners = formData[`form${index}-ownership`]?.owners;
      const formSplit1Name = `form${index}-ownershipSplitPerson1`;
      const formSplit2Name = `form${index}-ownershipSplitPerson2`;
      if (formOwners?.length > 1) {
        formOwners[0].percentage = toNumber(formData[formSplit1Name]);
        formOwners[1].percentage = toNumber(formData[formSplit2Name]);
      }
    }
    onSubmit({ ...formData, numberOfProperties });
  }

  return (
    <View style={styles.container}>
      <Condition display={numberOfProperties === 0}>
        <FormNumberOfItem
          defaultValue={dataSaved?.numberOfProperties}
          onCancel={onCancel}
          onSubmit={number => {
            if (toNumber(number) === 0) {
              onSubmit({ numberOfProperties: number });
            } else {
              setNumberOfProperties(number);
            }
          }}
          i18nScope={i18nScope}
        />
      </Condition>
      <Condition display={numberOfProperties > 0}>
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

export default compose(withTranslation())(Properties);
