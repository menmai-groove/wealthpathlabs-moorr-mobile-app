import React, { forwardRef, useEffect } from 'react';
import { Platform, View } from 'react-native';
import {
  KeyboardAwareFlatList as FlatList,
  KeyboardAwareScrollView as ScrollView,
  KeyboardAwareSectionList as SectionList,
} from 'react-native-keyboard-aware-scroll-view';
import KeyboardManager from 'react-native-keyboard-manager';

const KeyboardAwareScrollView = forwardRef((props, ref) => {
  return (
    <ScrollView
      enableAutomaticScroll={false}
      enableResetScrollToCoords={false}
      ref={ref}
      {...props}>
      {props.children}
    </ScrollView>
  );
});

const KeyboardAwareFlatList = forwardRef((props, ref) => {
  return (
    <FlatList
      enableAutomaticScroll={false}
      enableResetScrollToCoords={false}
      ref={ref}
      {...props}
    />
  );
});

const KeyboardAwareSectionList = forwardRef((props, ref) => {
  return (
    <SectionList
      enableAutomaticScroll={false}
      enableResetScrollToCoords={false}
      ref={ref}
      {...props}
    />
  );
});

function KeyboardAwareHandler() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
      KeyboardManager.setEnableAutoToolbar(false);
      KeyboardManager.setShouldResignOnTouchOutside(false);
      KeyboardManager.setLayoutIfNeededOnUpdate(false);
    }
  }, []);
  return <View />;
}

export {
  KeyboardAwareScrollView,
  KeyboardAwareFlatList,
  KeyboardAwareSectionList,
  KeyboardAwareHandler,
};
