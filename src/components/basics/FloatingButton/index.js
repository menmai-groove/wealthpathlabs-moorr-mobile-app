import TouchableField from 'components/basics/TouchableField';
import { getMenuBoxHeight } from 'components/layouts/MenuLayout/MenuButton';
import { useThemedStyle } from 'providers';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import themedStyles from './style';

const i18nScope = 'components.floatingButton';

function FloatingButton({ onPress, bottom = 0 }) {
  const styles = useThemedStyle({ ...themedStyles }, i18nScope);
  const insets = useSafeAreaInsets();
  const menuHeight = getMenuBoxHeight(insets);
  const _bottom = bottom || menuHeight;

  return (
    <View style={[styles.btnFloating, { bottom: _bottom }]}>
      <View style={styles.btnPlusWrapper}>
        <TouchableField onPress={onPress} style={styles.icon} activeOpacity={0.9}>
          <Feather name="plus" size={24} color={styles.icon.color} />
        </TouchableField>
      </View>
    </View>
  );
}

export default FloatingButton;
