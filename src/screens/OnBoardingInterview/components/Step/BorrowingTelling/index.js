import LiabilityIcon from 'assets/svgs/onboardingInterview/liabilityIcon';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { GlobalLib } from 'libs';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import Option from 'screens/OnBoardingInterview/components/Option';
import Question from 'screens/OnBoardingInterview/components/Question';
import Liabilities from 'screens/OnBoardingInterview/components/Step/BorrowingTelling/Liabilities';
import { updateDataLiability } from 'store/OnBoardingInterview/action';
import { selectAskingNameData, selectBorrowings } from 'store/OnBoardingInterview/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoardingInterview.borrowingTelling';

function BorrowingTelling(props) {
  useOnBackButtonPress(props.onBack);
  const { t, onPress: handleNextStep } = props;
  const styles = useThemedStyle(themedStyles, i18nScope);
  const dispatch = useDispatch();

  const askingName = useSelector(selectAskingNameData);
  const borrowingsData = useSelector(selectBorrowings);

  const submitLiabilities = liabilities => {
    GlobalLib.CustomModal.get().hide();
    dispatch(updateDataLiability({ liabilities }));
    handleNextStep();
  };

  const handleOpenModalLiabilities = () => {
    GlobalLib.CustomModal.get().show({
      type: 'absolute',
      body: (
        <Liabilities
          onCancel={() => GlobalLib.CustomModal.get().hide()}
          data={borrowingsData.liabilities}
          onSubmit={submitLiabilities}
        />
      ),
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        nestedScrollEnabled
        style={AppStyle.flex1}
        contentContainerStyle={AppStyle.padBottom40}
        showsVerticalScrollIndicator={false}>
        <Question emotion="blink" content={t(`${i18nScope}.content`, { name: askingName?.name })} />
        <Option
          type={borrowingsData.liabilities != null ? 'complete' : 'enable'}
          text={t(`${i18nScope}.option`)}
          onPress={handleOpenModalLiabilities}
          renderIcon={() => <LiabilityIcon />}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export default compose(withTranslation())(BorrowingTelling);
