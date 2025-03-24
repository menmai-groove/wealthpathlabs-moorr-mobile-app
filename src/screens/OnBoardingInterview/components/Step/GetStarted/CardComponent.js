import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React from 'react';
import { Image, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './styles';

function CardComponent(props) {
  const {
    style,
    title = '',
    description = '',
    image,
    ltr = true,
    titleStyle = {},
    descriptionStyle = {},
  } = props;
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({
    ...themedStyles,
    cardItem: {
      ...themedStyles.cardItem,
      paddingLeft: ltr ? 12 : 20,
      paddingRight: ltr ? 20 : 12,
    },
    textDescCardItem: {
      ...themedStyles.textDescCardItem,
      textAlign: ltr ? 'right' : 'left',
    },
    ...convertedStyle,
  });

  return (
    <View style={[styles.cardItem, ltr ? AppStyle.rowReverseFlex : AppStyle.rowFlex]}>
      <View style={AppStyle.flex1}>
        <TextField
          type="heading-3"
          font="semi-bold"
          style={[ltr ? AppStyle.textRight : AppStyle.textLeft, titleStyle]}>
          {title}
        </TextField>
        <TextField style={[styles.textDescCardItem, descriptionStyle]}>{description}</TextField>
      </View>
      <View style={styles.separator} />
      {typeof image === 'function' ? (
        image()
      ) : image === null ? null : (
        <Image source={image} style={styles.imageCardItem} />
      )}
    </View>
  );
}

export default CardComponent;
