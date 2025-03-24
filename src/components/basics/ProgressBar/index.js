import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.progressBar';

function ProgressBar({ barStyle, progress, children }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={styles.barContainer}>
      <View
        style={[
          styles.barContent,
          barStyle,
          {
            width:
              Math.min(Math.max(parseFloat(Number.isNaN(progress) ? 0 : progress), 0), 1) * 100 +
              '%',
          },
        ]}
      />
      {children}
    </View>
  );
}

export default forwardRef(ProgressBar);
