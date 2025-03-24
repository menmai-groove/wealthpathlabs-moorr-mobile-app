import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers/index';
import React from 'react';
import { Animated, Text, TextProps } from 'react-native';

import themedStyles from './style';

function getTextType(type) {
  switch (type) {
    case 'heading-1':
      return themedStyles.typography.heading1;
    case 'heading-2':
      return themedStyles.typography.heading2;
    case 'heading-3':
      return themedStyles.typography.heading3;
    case 'heading-4':
      return themedStyles.typography.heading4;
    case 'paragraph-1':
      return themedStyles.typography.paragraph1;
    case 'paragraph-2':
      return themedStyles.typography.paragraph2;
    case 'captain':
      return themedStyles.typography.captain;
    case 'text-label':
      return themedStyles.typography.textLabel;
    default:
      return themedStyles.typography.paragraph2;
  }
}

function getFontStyle(fontStyle, italic) {
  let fontFamily;
  switch (fontStyle) {
    case 'bold':
      fontFamily = 'textBold';
      break;
    case 'semi-bold':
      fontFamily = 'textSemiBold';
      break;
    case 'medium':
      fontFamily = 'textMedium';
      break;
    case 'regular':
      fontFamily = 'textRegular';
      break;
    case 'light':
      fontFamily = 'textLight';
      break;
    case 'thin':
      fontFamily = 'textThin';
      break;
    default:
      fontFamily = 'textRegular';
      break;
  }
  if (italic) {
    fontFamily = fontFamily + 'Italic';
  }
  return themedStyles.typography[fontFamily];
}

function getContentStyle(font, type, italic, style) {
  const typeStyle = getTextType(type);
  const fontStyle = font ? getFontStyle(font, italic) : {};
  const convertedStyle = mergeArrayObjectIntoObject(style);
  return {
    ...typeStyle,
    ...fontStyle,
    ...convertedStyle,
  };
}

interface ITextField extends TextProps {
  children?: any;
  italic?: boolean;
  font?: 'bold' | 'semi-bold' | 'medium' | 'regular' | 'light' | 'thin';
  type?:
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'heading-4'
    | 'paragraph-1'
    | 'paragraph-2'
    | 'captain'
    | 'text-label';
  animated?: boolean;
  animatedStyle?: object;
}

function TextField(props: ITextField) {
  const {
    children,
    italic,
    font,
    type = 'paragraph-2',
    style,
    animated = false,
    animatedStyle = {},
    ...restProps
  } = props;

  const styles = useThemedStyle(
    {
      content: getContentStyle(font, type, italic, style),
    },
    'components.textField',
  );

  if (!children) {
    return null;
  }

  if (animated) {
    return (
      <Animated.Text {...restProps} style={[styles.content, animatedStyle]}>
        {children}
      </Animated.Text>
    );
  }

  return (
    <Text {...restProps} style={styles.content}>
      {children}
    </Text>
  );
}

export default TextField;
