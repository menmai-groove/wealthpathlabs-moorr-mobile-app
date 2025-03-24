import LottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.loading';

function LoadingSpinner({ visible: defaultVisible = false }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [visible, setVisible] = useState(defaultVisible);
  const countRef = useRef(0);

  const show = () => {
    setVisible(true);
    countRef.current += 1;
  };

  const hide = () => {
    countRef.current -= 1;
    if (countRef.current <= 0) {
      setVisible(false);
      countRef.current = 0;
    }
  };

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  const { container, wrapper, icon } = styles;

  return visible ? (
    <View style={container}>
      <View style={wrapper}>
        <View style={styles.iconContainer}>
          <LottieView
            resizeMode="contain"
            style={icon}
            source={require('assets/images/m-logo-loading.json')}
            autoPlay
            loop
          />
        </View>
      </View>
    </View>
  ) : null;
}

export default forwardRef(LoadingSpinner);
