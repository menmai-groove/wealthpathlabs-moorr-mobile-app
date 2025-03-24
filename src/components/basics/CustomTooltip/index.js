import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Platform, StatusBar, useWindowDimensions, View } from 'react-native';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import Tooltip from 'react-native-walkthrough-tooltip';

import themedStyles from './style';

function CustomTooltip(props, ref) {
  const {
    content,
    placement = 'auto',
    tooltipStyle,
    hideArrow,
    label,
    renderLabel,
    displayInsets = {},
    ...rest
  } = props;
  const styles = useThemedStyle(themedStyles, 'components.tooltip');
  const viewRef = useRef();
  const [currentPlacement, setPlacement] = useState();
  const [isVisible, setVisible] = useState(false);
  const { width: widthScreen, height: heightScreen } = useWindowDimensions();

  // const [contentWidth, setContentWidth] = useState(0);

  const onLayout = useCallback(() => {
    viewRef.current.measure((_x, _y, _width, _height, pageX, pageY) => {
      if (currentPlacement !== undefined) {
        return;
      }
      // setContentWidth(_width);
      const centerXScreen = widthScreen / 2;
      const centerYScreen = heightScreen / 2;
      let newPlacement = 'top';
      const dividedX = pageX / centerXScreen;
      const dividedY = pageY / centerYScreen;
      if (dividedX < 1 && dividedY < 1) {
        if (dividedX < dividedY) {
          // newPlacement = 'left';
          newPlacement = 'right';
        } else {
          // newPlacement = 'top';
          newPlacement = 'bottom';
        }
      }
      if (dividedX > 1 && dividedY < 1) {
        if (2 - dividedX < dividedY) {
          // newPlacement = 'right';
          newPlacement = 'left';
        } else {
          // newPlacement = 'top';
          newPlacement = 'bottom';
        }
      }
      if (dividedX < 1 && dividedY > 1) {
        if (dividedX < 2 - dividedY) {
          // newPlacement = 'left';
          newPlacement = 'right';
        } else {
          // newPlacement = 'bottom';
          newPlacement = 'top';
        }
      }
      if (dividedX > 1 && dividedY > 1) {
        if (2 - dividedX < 2 - dividedY) {
          // newPlacement = 'right';
          newPlacement = 'left';
        } else {
          // newPlacement = 'bottom';
          newPlacement = 'top';
        }
      }
      setPlacement(newPlacement);
    });
  }, [heightScreen, widthScreen]);

  const renderTooltip = useCallback(() => {
    if (typeof renderLabel === 'function') {
      return renderLabel();
    }
    return (
      <TouchableField style={styles.labelContainer} onPress={() => setVisible(!isVisible)}>
        <FAIcon name={'info-circle'} style={[styles.icon, isVisible && styles.activeIcon]} />
        {typeof label === 'string' && label?.length > 0 && (
          <TextField type="paragraph-2" style={[styles.label, isVisible && styles.activeLabel]}>
            {label}
          </TextField>
        )}
      </TouchableField>
    );
  }, [isVisible, label, renderLabel, styles]);

  useImperativeHandle(
    ref,
    () => ({
      show: () => {
        setVisible(true);
      },
      hide: () => {
        setVisible(false);
      },
    }),
    [],
  );

  return (
    <View style={[styles.tooltipContainer]} ref={viewRef} onLayout={onLayout}>
      <Tooltip
        contentStyle={[styles.androidTooltip]}
        isVisible={isVisible}
        content={currentPlacement ? <View style={styles.contentContainer}>{content}</View> : null}
        backgroundColor="transparent"
        arrowStyle={hideArrow && styles.noArrow}
        onClose={() => setVisible(false)}
        placement={placement === 'auto' ? currentPlacement : placement}
        tooltipStyle={[styles.tooltipStyle, styles.iosTooltip, tooltipStyle]}
        displayInsets={displayInsets}
        // modalComponent={modalProps => <Modal statusBarTranslucent {...modalProps} />}
        topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
        {...rest}>
        {renderTooltip()}
      </Tooltip>
    </View>
  );
}

export default React.forwardRef(CustomTooltip);
