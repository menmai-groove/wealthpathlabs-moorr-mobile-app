import React from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useThemedStyle } from 'providers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import TextField from '../TextField';

import themedStyles from './style';

interface AppSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValuesChange?: () => void;
  containerStyle: StyleProp<ViewStyle>;
}

function AppSlider({
  min = 1,
  max = 10,
  step = 1,
  value = 0,
  containerStyle = {},
  ...props
}: AppSliderProps) {
  const styles = useThemedStyle(themedStyles);

  return (
    <View style={[styles.container, containerStyle]}>
      <MultiSlider
        min={min}
        max={max}
        step={step}
        containerStyle={styles.sliderContainer}
        trackStyle={styles.trackStyle}
        customMarker={() => (
          <View style={styles.markerContainerStyle}>
            <View style={styles.markerStyle} />
          </View>
        )}
        selectedStyle={styles.selectedStyle}
        unselectedStyle={styles.unselectedStyle}
        touchDimensions={{
          height: 0,
          width: 0,
          borderRadius: 0,
          slipDisplacement: 0,
        }}
        values={[value]}
        customLabel={sliderPosition => (
          <View
            style={[
              styles.labelContainer,
              {
                left: sliderPosition.oneMarkerLeftPosition - 17,
              },
            ]}>
            <MaterialCommunityIcons
              name="tooltip"
              size={34}
              color="white"
              style={Platform.OS === 'android' ? styles.androidLabelShadow : styles.iosLableShadow}
            />
            <TextField type="heading-2" style={styles.labelText}>
              {value}
            </TextField>
          </View>
        )}
        enableLabel
        {...props}
      />
    </View>
  );
}

export default AppSlider;
