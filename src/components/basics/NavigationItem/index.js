import ArrowRight from 'assets/svgs/menu/arrowRight';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.navigationItem';

function NavigationItem({ style, onPress, children }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={[styles.jarsItem, AppStyle.shadow, AppStyle.rowFlex]}>
      <View style={[AppStyle.flex1, styles.borderItemJars, AppStyle.pad15]}>
        <TouchableField
          onPress={() => (typeof onPress === 'function' ? onPress() : null)}
          activeOpacity={1}>
          {children}
        </TouchableField>
      </View>
      <View style={styles.arrowRight}>
        <ArrowRight />
      </View>
    </View>
  );
}

export default forwardRef(NavigationItem);
