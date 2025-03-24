import Clipboard from '@react-native-clipboard/clipboard';
import { omit, pick } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Pressable, StyleSheet, TextInput, View } from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';

const textStyleProps = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'includeFontPadding',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textAlignVertical',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'verticalAlign',
  'writingDirection',
];
const styles = StyleSheet.create({
  pressableButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  digitView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hideTextInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
const OTPInputField = ({
  style,
  code,
  onCodeChanged,
  maxLength,
  autoFocusOnLoad,
  codeInputFieldStyle,
  codeInputHighlightStyle,
  duration = 450,
  onErrorFilled,
}) => {
  const codeDigitsArray = new Array(maxLength).fill(0);
  const timerRef = useRef(null);
  const textInputRef = useRef(null);
  const [inputContainerIsFocused, setInputContainerIsFocused] = useState(false);
  const appState = useRef(AppState.currentState);
  const refs = useRef(codeDigitsArray.map(() => new Animated.Value(0))).current;
  const handleOnPress = useCallback(() => {
    setInputContainerIsFocused(true);
    textInputRef?.current?.focus();
  }, []);
  const handleOnBlur = useCallback(() => {
    setInputContainerIsFocused(false);
  }, []);
  const fetchCopiedText = useCallback(async () => {
    timerRef.current = _BackgroundTimer.setTimeout(async () => {
      const text = await Clipboard.getString();
      const regexp = new RegExp(`^\\d{${maxLength}}$`);
      if (text.length > 0) {
        if (!regexp.test(text)) {
          typeof onErrorFilled === 'function' && onErrorFilled('invalid-code');
          return;
        }
        typeof onCodeChanged === 'function' && onCodeChanged(text);
      }
    }, 500);
  }, [onCodeChanged, maxLength, onErrorFilled]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // console.log('App has come to the foreground!');
        fetchCopiedText();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
      _BackgroundTimer.clearTimeout(timerRef.current);
    };
  }, [fetchCopiedText]);
  useEffect(() => {
    refs.map((ref, ri) => {
      const isCurrentDigit = ri === code.length;
      if (isCurrentDigit) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(ref, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(ref, {
              toValue: 0,
              duration,
              useNativeDriver: false,
            }),
          ]),
        ).start();
      } else {
        ref.setValue(1);
      }
    });
  }, [code, refs, duration]);
  return (
    <View style={style}>
      <Pressable style={styles.pressableButton} onPress={handleOnPress}>
        {codeDigitsArray.map((_value, index) => {
          const emptyInputCharacter = ' ';
          const digit = code[index] ?? emptyInputCharacter;
          const isCurrentDigit = index === code.length;
          const isLastDigit = index === maxLength - 1;
          const isCodeFull = code.length === maxLength;
          const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull);
          const isFocused = inputContainerIsFocused && isDigitFocused;
          return (
            <View
              key={`digit-${index}`}
              style={[
                omit(codeInputFieldStyle, textStyleProps),
                isFocused && omit(codeInputHighlightStyle, textStyleProps),
                styles.digitView,
              ]}>
              <Animated.Text
                style={[
                  pick(codeInputFieldStyle, textStyleProps),
                  isFocused && pick(codeInputHighlightStyle, textStyleProps),
                  {
                    // Bind opacity to animated value
                    opacity: refs[index],
                  },
                ]}>
                {isCurrentDigit ? '│' : digit}
              </Animated.Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={textInputRef}
        style={styles.hideTextInput}
        value={code}
        onChangeText={onCodeChanged}
        onBlur={handleOnBlur}
        maxLength={maxLength}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimeCode"
        autoFocus={autoFocusOnLoad}
      />
    </View>
  );
};

export default OTPInputField;
