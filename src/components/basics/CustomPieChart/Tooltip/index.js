/* eslint-disable no-console */
import styles from 'components/basics/CustomPieChart/style';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Text } from 'react-native';
import { MARGIN, MIN_TOOLTIP_HEIGHT, MIN_TOOLTIP_WIDTH } from 'screens/Example/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Tooltip = ({ tooltip, total }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState({});

  useEffect(() => {
    if (!tooltip) {
      setVisible(false);
      return;
    }

    // Temporary position to allow layout measurement
    setPosition({ top: tooltip.y, left: tooltip.x });
    setSize({});
    setVisible(true);

    opacity.setValue(0);
    translateY.setValue(10);
  }, [tooltip]);

  if (!tooltip || !visible) {
    return null;
  }

  const { data, x: rawX, y: rawY, containerHeight } = tooltip;

  const handleLayout = event => {
    const { width, height } = event.nativeEvent.layout;

    let finalX = rawX;
    let finalY = rawY;
    let customSize = {};

    console.log('📌 Tooltip Debug Info:');
    console.log('• Raw Position:', rawX, rawY);
    console.log('• Measured Size:', width, height);
    console.log('• Container Height:', containerHeight);

    // Horizontal adjustment
    if (rawX + width + MARGIN > SCREEN_WIDTH) {
      if (rawX - width - MARGIN > 0) {
        finalX = rawX - width - MARGIN;
        console.log('↔️ Shifted left');
      } else {
        finalX = MARGIN;
        customSize.width = MIN_TOOLTIP_WIDTH;
        console.log('📐 Resized (width)');
      }
    }

    // Vertical adjustment
    if (rawY + height + MARGIN > containerHeight) {
      if (rawY - height - MARGIN > 0) {
        finalY = rawY - height - MARGIN;
        translateY.setValue(-10);
        console.log('⬆️ Shifted above');
      } else {
        finalY = containerHeight - MIN_TOOLTIP_HEIGHT - MARGIN;
        customSize.height = MIN_TOOLTIP_HEIGHT;
        translateY.setValue(0);
        console.log('📐 Resized (height)');
      }
    } else {
      translateY.setValue(10);
      console.log('⬇️ Positioned below');
    }

    console.log('===== END Debug Info =====');

    setPosition({ top: finalY, left: finalX });
    setSize(customSize);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.tooltipWrapper,
        position,
        size,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Text style={styles.tooltipLabel}>{data.label}</Text>
      <Text style={styles.tooltipValue}>Value: {data.value}</Text>
      <Text style={styles.tooltipValue}>Percent: {((data.value / total) * 100).toFixed(0)}%</Text>
      {/* <Text style={styles.tooltipValue}>Description: {data.description}</Text> */}
    </Animated.View>
  );
};

export default Tooltip;
