import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';

import themedStyles from './style';

function BackgroundLayer({}) {
  const styles = useThemedStyle(themedStyles, 'components.backgroundLayer');
  return <View style={styles.container} />;
}

export default BackgroundLayer;
