import { useThemedStyle } from 'providers';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import BalanceFormV2 from 'screens/MonthlyCheckUp/components/BalanceFormV2';

import themedStyles from '../styles';

const i18nScope = 'screens.monthlyCheckUp';

const SetUpMoneySMARTSTracking = ({ onSubmit, onCancel, startDate, onStartDateChange }) => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);

  const formRef = useRef(null);

  const header = t([i18nScope, 'setUpMoneySMARTSTrackingHeader'].join('.'));
  const description = t([i18nScope, 'setUpMoneySMARTSTrackingDescription'].join('.'));
  const content = t([i18nScope, 'setUpMoneySMARTSTrackingContent'].join('.'));

  return (
    <View>
      <BalanceFormV2
        header={header}
        content={content}
        description={description}
        t={t}
        ref={formRef}
        onSubmit={onSubmit}
        styles={styles}
        defaultValue={startDate ? { checkupDate: startDate } : undefined}
        onCancel={onCancel}
        onStartDateChange={onStartDateChange}
      />
    </View>
  );
};

export default SetUpMoneySMARTSTracking;
