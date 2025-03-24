import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';

import themedStyles from './style';

const i18nScope = 'components.customTab';

function CustomTab(
  {
    style = {},
    data = [],
    value,
    onSelect = () => {},
    containerStyle = {},
    tabStyle = {},
    activeTabStyle = {},
    fontStyle = {},
    activeFontStyle = {},
  },
  ref,
) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const offsetX = useRef(new Animated.Value(value));
  const tabWidth = useRef([]);
  const [refreshId, setRefresh] = useState(0);
  const [widthTab, setWidthTab] = useState(0);

  useImperativeHandle(ref, () => ({}));

  const translateXInterpolate = offsetX.current.interpolate({
    inputRange: [0, data.length],
    outputRange: [0, widthTab * data.length],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(offsetX.current, {
      toValue: value,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const onLayoutWrapper = useCallback(
    ({ nativeEvent }) => {
      const { width } = nativeEvent.layout;
      if (tabWidth.current?.length === data.length) {
        const maxWidth = Math.max(...tabWidth.current);
        const { paddingHorizontal = 0 } = { ...styles.tab, ...tabStyle };
        const { padding = 0 } = { ...styles.container, ...containerStyle };
        const minWidth = Math.min(
          width / data.length - padding * 2,
          maxWidth + paddingHorizontal * 2,
        );
        setWidthTab(minWidth);
        tabWidth.current = [];
      }
    },
    [containerStyle, data, styles, tabStyle],
  );

  const onLayoutTab = useCallback(
    ({ nativeEvent }) => {
      const { width } = nativeEvent.layout;
      if (tabWidth.current?.length < data.length) {
        tabWidth.current?.push(width);
        if (tabWidth.current?.length === data.length) {
          setRefresh(Date.now());
        }
      }
    },
    [data],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.wrapper}
      onLayout={data.length > 0 && !widthTab && onLayoutWrapper}
      key={`group-tab-${refreshId}`}>
      <View style={[styles.container, containerStyle]}>
        <Animated.View
          style={[
            styles.activeTab,
            activeTabStyle,
            widthTab && { width: widthTab },
            { transform: [{ translateX: translateXInterpolate }] },
          ]}
        />
        {data.map((item, index) => {
          const selected = value === index;
          return (
            <View
              key={`tab-${index}`}
              onLayout={!widthTab && !refreshId && onLayoutTab}
              style={[styles.tab, tabStyle, widthTab && { width: widthTab }]}>
              <TouchableField
                style={styles.touchView}
                onPress={() => onSelect(index)}
                disabled={selected}>
                <TextField
                  style={[
                    styles.labelText,
                    fontStyle,
                    selected && styles.activeLabelText,
                    selected && activeFontStyle,
                  ]}
                  font={selected ? 'medium' : 'regular'}
                  numberOfLines={2}>
                  {item.label}
                </TextField>
              </TouchableField>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default forwardRef(CustomTab);
