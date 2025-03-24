import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { Image, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.tileCard';

function TileCard({ contentStyle, style, title, value, icon, iconBackgroundColor }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={[styles.container, contentStyle, AppStyle.padBottom10]}>
      <View style={AppStyle.flex1}>
        <TextField style={styles.labelText} numberOfLines={1}>
          {title}
        </TextField>
        <TextField style={styles.valueText} numberOfLines={1}>
          {value}
        </TextField>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
    </View>
  );
}

export default forwardRef(TileCard);
