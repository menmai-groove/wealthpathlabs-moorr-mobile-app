import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

function useKeyboardState(defaultValue = false) {
  const [visible, setVisible] = useState(defaultValue);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showKeyboard = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setVisible(true);
        setKeyboardHeight(e.endCoordinates?.height || 0);
      },
    );
    const hideKeyboard = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setVisible(false);
        setKeyboardHeight(0);
      },
    );

    // cleanup function
    return () => {
      showKeyboard.remove();
      hideKeyboard.remove();
    };
  }, []);

  return { visible, keyboardHeight };
}

export { useKeyboardState };
