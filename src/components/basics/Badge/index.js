import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.badge';

function Badge({ contentStyle, style, count, max, children }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const formatMax = count > max ? `${max}+` : count;

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={[styles.container, contentStyle]}>
      <View>
        {children}

        {!!count && (
          <View
            style={[
              AppStyle.middleContent,
              styles.badge,
              {
                transform: [
                  {
                    translateX: 16 / 2,
                  },
                  {
                    translateY: -16 / 2,
                  },
                ],
              },
            ]}>
            <TextField font="regular" style={styles.textBadge}>
              {formatMax}
            </TextField>
          </View>
        )}
      </View>
    </View>
  );
}

export default forwardRef(Badge);
