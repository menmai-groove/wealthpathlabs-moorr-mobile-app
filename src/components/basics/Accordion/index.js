import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { UtilLib } from 'libs';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.accordion';

function Accordion(
  {
    style,
    title = '',
    value = false,
    onChange = () => {},
    disabled = false,
    leftIcon = undefined,
    rightIcon = undefined,
    children = undefined,
    keepCollapsedContent = false,
    version = 1,
  },
  ref,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const rotateAnim = useRef(new Animated.Value(value ? 0 : 1));
  const rotateDeg = rotateAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    UtilLib.handleConfigureNextLayoutAnimation();
    onChange(!value);
    UtilLib.handleConfigureNextLayoutAnimation();

    if (value) {
      Animated.timing(rotateAnim.current, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(rotateAnim.current, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  useImperativeHandle(ref, () => ({
    toggleExpand,
  }));

  const renderRightIcon = () => {
    return (
      <View style={[styles.rightIcon, value && styles.expandRightIcon]}>
        {typeof rightIcon === 'function' ? (
          rightIcon()
        ) : (
          <FeatherIcon
            name={value ? 'minus' : 'plus'}
            size={22}
            style={[styles.icon, value && styles.expandIcon]}
          />
        )}
      </View>
    );
  };

  if (version === 2) {
    return (
      <View
        style={[styles.containerV2, styles.accordionStyle, value && styles.expandAccordionStyle]}>
        <TouchableField onPress={toggleExpand} disabled={disabled}>
          <View style={[AppStyle.padX20, styles.header]}>
            {typeof title === 'function' ? (
              title({
                value,
              })
            ) : (
              <TextField
                style={[styles.titleText, value && styles.expandTitleTextStyle]}
                type="paragraph-1">
                {title}
              </TextField>
            )}
            <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
              <View style={styles.caretContainer}>
                <Animated.View
                  style={{ transform: [{ rotateZ: rotateDeg }, { perspective: 100 }] }}>
                  <MaterialIcons name={'arrow-drop-down'} size={24} />
                </Animated.View>
              </View>
            </View>
          </View>
        </TouchableField>
        <Animated.View
          style={[
            AppStyle.flex1,
            value && AppStyle.collapseHeight,
            { opacity: rotateAnim.current },
          ]}>
          <View style={AppStyle.marginTop20}>{children}</View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.accordionStyle, value && styles.expandAccordionStyle]}>
      <TouchableField onPress={toggleExpand} disabled={disabled}>
        <View style={styles.row}>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            {typeof leftIcon === 'function' ? leftIcon() : leftIcon}
            <View style={[styles.row, styles.titleStyle]}>
              {typeof title === 'function' ? (
                title({
                  value,
                })
              ) : (
                <TextField
                  style={[styles.titleText, value && styles.expandTitleTextStyle]}
                  type="paragraph-1">
                  {title}
                </TextField>
              )}
            </View>
          </View>
          {!!children && renderRightIcon()}
        </View>
      </TouchableField>
      {!!children && !keepCollapsedContent && value && (
        <View style={styles.children}>{children}</View>
      )}
      {!!children && keepCollapsedContent && (
        <ScrollView
          bounces={false}
          scrollEnabled={false}
          disableScrollViewPanResponder
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={!value && AppStyle.collapseHeight}
          contentContainerStyle={styles.children}>
          {children}
        </ScrollView>
      )}
    </View>
  );
}

export default forwardRef(Accordion);
