import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.customCard';

function CustomCard(
  {
    style,
    containerStyle,
    contentStyle,
    imageStyle,
    footerStyle,
    id,
    title,
    description,
    source,
    renderFooter,
    onPress,
  },
  ref,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={[styles.cardContainer, AppStyle.shadow, containerStyle && containerStyle]}>
      <TouchableField onPress={() => onPress(id)} disabled={typeof onPress === 'undefined'}>
        <View style={[]}>
          <View
            style={[
              AppStyle.rowFlex,
              AppStyle.spaceBetweenContent,
              styles.contentStyle,
              contentStyle,
            ]}>
            <View style={[AppStyle.flex1]}>
              {typeof title === 'function' ? (
                title()
              ) : (
                <TextField type="paragraph-3" numberOfLines={1}>
                  {title}
                </TextField>
              )}
              {typeof description === 'function' ? (
                description()
              ) : (
                <TextField style={AppStyle.marginTop10} type="heading-2" numberOfLines={1}>
                  {description}
                </TextField>
              )}
            </View>
            {source && (
              <FastImage style={[styles.image, imageStyle && imageStyle]} source={source} />
            )}
          </View>
          {typeof renderFooter === 'function' && (
            <View style={[AppStyle.marginTop10, footerStyle]}>{renderFooter()}</View>
          )}
        </View>
      </TouchableField>
    </View>
  );
}

export default forwardRef(CustomCard);
