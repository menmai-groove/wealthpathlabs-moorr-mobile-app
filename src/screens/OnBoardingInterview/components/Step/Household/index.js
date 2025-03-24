import { AppConstants } from 'constant';
import { GlobalLib } from 'libs';
import { isNil } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import Question from 'screens/OnBoardingInterview/components/Question';
import SelectHousehold from 'screens/OnBoardingInterview/components/SelectHousehold';
import { selectAskingNameData, selectHouseholdData } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.household';

function Household(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles);

  const askingName = useSelector(selectAskingNameData);
  const householdData = useSelector(selectHouseholdData);

  const selectHousehold = useCallback(
    type => {
      if (isNil(householdData?.type) || householdData?.type === type) {
        handleNextStep({ type });
      } else {
        GlobalLib.ConfirmModal.get().show({
          title: t(`${i18nScope}.confirmationPopup`),
          content: t(`${i18nScope}.areYouSureChangeHousehold`),
          onConfirm: () => {
            handleNextStep({ type });
          },
        });
      }
    },
    [handleNextStep, householdData, t],
  );

  const renderHousehold = ({ item, index }) => {
    return (
      <SelectHousehold
        key={'household-' + item}
        onPress={() => selectHousehold(AppConstants.householdType[item])}
        type={AppConstants.householdType[item]}
        text={t(`${i18nScope}.${item}`)}
        style={index % 2 === 0 && AppStyle.marginRight15}
        selected={householdData?.type === AppConstants.householdType[item]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        bounces={false}
        data={Object.keys(AppConstants.householdType)}
        contentContainerStyle={[AppStyle.padX30, AppStyle.padBottom40]}
        keyExtractor={item => item.toString()}
        renderItem={renderHousehold}
        numColumns={2}
        ListHeaderComponent={
          <Question
            emotion="blink"
            content={t(`${i18nScope}.question`, { name: askingName?.name })}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

export default compose(withTranslation())(Household);
