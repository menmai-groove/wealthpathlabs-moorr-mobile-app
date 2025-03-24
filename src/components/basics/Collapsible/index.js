import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { UtilLib } from 'libs';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppStyle } from 'theme';

const i18nScope = 'components.collapsible';

function Collapsible({ contentStyle, style, title, defaultCollapse = true, children }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  const [isCollapse, setIsCollapse] = useState(defaultCollapse);
  const rotateAnim = useRef(new Animated.Value(defaultCollapse ? 0 : 1));
  const rotateDeg = rotateAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    UtilLib.handleConfigureNextLayoutAnimation();

    if (isCollapse) {
      setIsCollapse(false);
      Animated.timing(rotateAnim.current, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      setIsCollapse(true);
      Animated.timing(rotateAnim.current, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  useImperativeHandle(ref, () => ({}));

  return (
    <View style={[styles.container, contentStyle]}>
      <TouchableField onPress={toggleExpand}>
        <View style={[AppStyle.padX10, styles.header]}>
          <TextField type="heading-4">{title}</TextField>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <View style={styles.caretContainer}>
              <Animated.View style={{ transform: [{ rotateZ: rotateDeg }, { perspective: 100 }] }}>
                <MaterialIcons name={'arrow-drop-down'} size={24} />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableField>
      <Animated.View
        style={[isCollapse && AppStyle.collapseHeight, { opacity: rotateAnim.current }]}>
        <View style={[AppStyle.pad10]}>{children}</View>
      </Animated.View>
    </View>
  );
}

export default forwardRef(Collapsible);

const themedStyles = {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
    borderWidth: 1,
    borderColor: 'palette.color-grey-6',
    borderRadius: 10,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caretContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'palette.color-white-3',
    borderColor: 'palette.color-grey-6',
    borderWidth: 1,
    borderRadius: 6,
  },
};
