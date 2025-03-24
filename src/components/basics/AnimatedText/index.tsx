import { useThemedStyle } from 'providers';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Text, TextProps, View } from 'react-native';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { AppStyle } from 'theme';

import themedStyles from './style';

const isIOS = Platform.OS === 'ios';

function getTextType(type: string) {
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

function getFontStyle(fontStyle: string, italic: boolean) {
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

function getContentStyle(font: string, type: string, italic: boolean, style: any) {
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
  children?: React.ReactNode;
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
  autoplay?: boolean;
  duration?: number;
  wordAnimation?: boolean;
  onAnimated?: Function;
}

function AnimatedText(props: ITextField) {
  const {
    children,
    italic,
    font,
    type = 'paragraph-2',
    style,
    autoplay = true,
    duration = 100,
    wordAnimation = true,
    onAnimated = () => {},
    ...restProps
  } = props;

  const styles = useThemedStyle(
    {
      content: getContentStyle(font, type, italic, style),
    },
    'components.textField',
  );

  const textArray =
    typeof children === 'string' && wordAnimation
      ? children
          .trim()
          .replace(/\n/g, ' \n ')
          .split(' ')
          .filter(t => t !== '')
      : [children];
  const textsRef = useRef(Array.from({ length: textArray.length }, () => new Animated.Value(0)));

  useEffect(() => {
    const animatedTests = textArray.map((_, i) =>
      Animated.timing(textsRef.current[i], {
        toValue: 1,
        duration,
        useNativeDriver: isIOS ? false : true,
      }),
    );
    if (autoplay) {
      Animated.stagger(duration, animatedTests).start(({ finished }) => {
        if (finished) {
          typeof onAnimated === 'function' && onAnimated();
        }
      });
    }
  }, [autoplay, duration, onAnimated, textArray]);

  if (!children && !textArray.length) {
    return null;
  }

  if (isIOS) {
    return (
      <Text {...restProps} style={styles.content}>
        {textArray.map((textItem, index) => (
          <Animated.Text
            key={`textItem-ios-${index}`}
            style={{
              opacity: textsRef.current[index],
            }}>
            {textItem}
            {index < textArray.length && textItem !== '\n' && ' '}
          </Animated.Text>
        ))}
      </Text>
    );
  }

  return (
    <View style={[AppStyle.rowFlex, AppStyle.flexWrap]}>
      {textArray.map((textItem, index) => (
        <Animated.Text
          {...restProps}
          key={`textItem-android-${index}`}
          style={[
            styles.content,
            // eslint-disable-next-line react-native/no-inline-styles
            textItem === '\n' && { width: '100%', height: 8 },
            {
              opacity: textsRef.current[index],
            },
          ]}>
          {textItem}
          {index < textArray.length && textItem !== '\n' && ' '}
        </Animated.Text>
      ))}
    </View>
  );
}

export default AnimatedText;
