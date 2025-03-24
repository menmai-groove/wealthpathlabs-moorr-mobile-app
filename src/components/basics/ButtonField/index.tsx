import Color from 'color';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { debounce, isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';

import React, { forwardRef, useCallback } from 'react';
import { Pressable, View, PressableProps } from 'react-native';

import themedStyles from './style';

interface IButtonField extends PressableProps {
  activeOpacity?: number;
  textStyle?: object;
  text: string;
  icon?: any;
  leftIcon?: any;
  debounceDuration?: number;
  type?:
    | 'primary'
    | 'secondary'
    | 'disabled'
    | 'medium-secondary'
    | 'medium-disabled'
    | 'medium-primary'
    | 'medium-text';
  customHandleColor?: any;
}

function ButtonField(props: IButtonField, ref: any) {
  const {
    activeOpacity = 0.25,
    onPress = () => {},
    style,
    textStyle,
    text,
    type = 'primary',
    icon,
    leftIcon,
    debounceDuration = 500,
    customHandleColor,
    ...restProps
  } = props;
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const convertedTextStyle = mergeArrayObjectIntoObject(textStyle);
  let btnContainer;
  let btnText;
  switch (type) {
    case 'secondary': {
      btnContainer = themedStyles.btnSecondary.container;
      btnText = themedStyles.btnSecondary.text;
      break;
    }
    case 'disabled': {
      btnContainer = themedStyles.btnDisable.container;
      btnText = themedStyles.btnDisable.text;
      break;
    }
    case 'medium-secondary': {
      btnContainer = themedStyles.btnMediumSecondary.container;
      btnText = themedStyles.btnMediumSecondary.text;
      break;
    }
    case 'medium-disabled': {
      btnContainer = themedStyles.btnMediumDisable.container;
      btnText = themedStyles.btnMediumDisable.text;
      break;
    }
    case 'medium-primary': {
      btnContainer = themedStyles.btnMediumPrimary.container;
      btnText = themedStyles.btnMediumPrimary.text;
      break;
    }
    case 'medium-text': {
      btnContainer = themedStyles.btnMediumText.container;
      btnText = themedStyles.btnMediumText.text;
      break;
    }
    default: {
      btnContainer = themedStyles.btnPrimary.container;
      btnText = themedStyles.btnPrimary.text;
      break;
    }
  }
  const styles = useThemedStyle(
    {
      container: {
        ...themedStyles.container,
        ...btnContainer,
        ...convertedStyle,
      },
      text: {
        ...themedStyles.text,
        ...btnText,
        ...convertedTextStyle,
      },
    },
    'components.buttonField',
  );

  const handleColor = useCallback(() => {
    if (typeof customHandleColor === 'function') {
      return customHandleColor();
    }
    if (type === 'secondary' || type === 'medium-secondary') {
      return {
        backgroundColor: Color(styles.container.backgroundColor).lighten(2.5).hex(),
      };
    }
    return {
      backgroundColor: Color(styles.container.backgroundColor).darken(activeOpacity).hex(),
    };
  }, [activeOpacity, styles, type, customHandleColor]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        {...restProps}
        ref={ref}
        style={({ pressed }) => [styles.container, pressed && handleColor()]}
        onPress={debounce(onPress, debounceDuration, { leading: true, trailing: false })}
        disabled={type === 'disabled' || type === 'medium-disabled'}>
        {leftIcon}
        {!isEmpty(text) && (
          <TextField italic style={styles.text}>
            {text}
          </TextField>
        )}
        {icon}
      </Pressable>
    </View>
  );
}

export default forwardRef(ButtonField);
