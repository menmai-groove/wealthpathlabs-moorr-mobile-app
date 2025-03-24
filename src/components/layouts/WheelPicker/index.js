import { debounce, range } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.wheelPicker';

const DIRECTIONS = {
  CLOCKWISE: 'CLOCKWISE',
  COUNTERCLOCKWISE: 'COUNTERCLOCKWISE',
};

const CIRCLE_SECTIONS = {
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
};

function WheelPicker({
  style = {},
  visible,
  data = [],
  size = 200,
  itemSize = 50,
  maxToRenderPerBatch = 0,
  renderItem,
  onPress = () => {},
  onCenteredItemRelease = () => {},
}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const DATARef = useRef([]);
  const LENGTHRef = useRef(0);

  DATARef.current = data;
  LENGTHRef.current = data.length;
  const AMOUNT_OF_DATA = maxToRenderPerBatch ?? LENGTHRef.current;
  const GIRTH_ANGLE = 360 / AMOUNT_OF_DATA;

  // 2*π*r / 360
  const STEP_LENGTH_TO_1_ANGLERef = useRef(1);

  const CURRENT_CIRCLE_SECTIONRef = useRef(0);
  const CURRENT_DIRECTIONRef = useRef(null);
  const CURRENT_VECTOR_DIFFERENCE_LENGTHRef = useRef(0);

  const PREVIOUS_POSITIONRef = useRef({
    X: 0,
    Y: 0,
  });
  const XY_AXES_COORDINATESRef = useRef({
    X: 0,
    Y: 0,
    PAGE_Y: 0,
    PAGE_X: 0,
  });
  const ICON_PATH_RADIUSRef = useRef(0);
  const wheelNavigatorRef = useRef();
  const pan = useRef(new Animated.Value(0));

  const [currentIndex, setCurrentIndex] = useState(0);

  const findItemByIndex = useCallback(
    index => DATARef.current[(LENGTHRef.current + (index % LENGTHRef.current)) % LENGTHRef.current],
    [],
  );

  const getRenderedData = useCallback(() => {
    const indexes = range(
      Math.round(currentIndex - parseInt(maxToRenderPerBatch / 2, 10)),
      Math.round(currentIndex + parseInt(maxToRenderPerBatch / 2, 10) + 1),
    );

    const visibleData = indexes.map(i => findItemByIndex(i));

    for (let i = 0; i < parseInt(indexes.length / 2, 10); i++) {
      visibleData.push(visibleData.shift());
    }
    if (currentIndex >= 0) {
      for (let i = 0; i < currentIndex; i++) {
        visibleData.unshift(visibleData.pop());
      }
    } else {
      for (let i = 0; i > currentIndex; i--) {
        visibleData.push(visibleData.shift());
      }
    }
    return visibleData;
  }, [maxToRenderPerBatch, currentIndex, findItemByIndex]);

  const renderedData = getRenderedData();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        resetCurrentValues();
        setPreviousDifferenceLengths(0, 0);
        pan.current.setValue(pan.current._value);
        pan.current.setOffset(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        defineCurrentSection(gestureState.moveX, gestureState.moveY);
        checkPreviousDifferenceLengths(gestureState.dx, gestureState.dy);
        pan.current.setValue(CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current);

        const ithCircleValue = getIthCircleValue(pan.current);
        const index = -ithCircleValue / GIRTH_ANGLE;
        setCurrentIndex(index);

        const foundItem = findItemByIndex(index);
        onCenteredItemRelease(foundItem);
      },
      onPanResponderRelease: () => {
        pan.current.flattenOffset();
        const ithCircleValue = getIthCircleValue(pan.current);
        Animated.spring(pan.current, {
          toValue: ithCircleValue,
          friction: 5,
          tension: 10,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            simplifyOffset(pan.current);
          }
        });

        // const index = -ithCircleValue / GIRTH_ANGLE;
        // const foundItem = findItemByIndex(index);
        // onCenteredItemRelease(foundItem);
      },
    }),
  );

  const resetCurrentValues = useCallback(() => {
    STEP_LENGTH_TO_1_ANGLERef.current = 1;
    CURRENT_CIRCLE_SECTIONRef.current = null;
    CURRENT_DIRECTIONRef.current = null;
    PREVIOUS_POSITIONRef.current.X = 0;
    PREVIOUS_POSITIONRef.current.Y = 0;
  }, []);

  useEffect(() => {
    CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current = 0;
    pan.current.setValue(CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current);
    resetCurrentValues();
  }, [data, resetCurrentValues]);

  const defineCurrentSection = useCallback((x, y) => {
    let yAxis = y < XY_AXES_COORDINATESRef.current.Y ? 'TOP' : 'BOTTOM';
    let xAxis = x < XY_AXES_COORDINATESRef.current.X ? 'LEFT' : 'RIGHT';
    CURRENT_CIRCLE_SECTIONRef.current = CIRCLE_SECTIONS[`${yAxis}_${xAxis}`];
  }, []);

  const setAdditiveMovementLength = useCallback((x, y) => {
    let absoluteHypotenuseLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    if (CURRENT_DIRECTIONRef.current === DIRECTIONS.CLOCKWISE) {
      CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current += absoluteHypotenuseLength;
    }

    if (CURRENT_DIRECTIONRef.current === DIRECTIONS.COUNTERCLOCKWISE) {
      CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current -= absoluteHypotenuseLength;
    }
  }, []);

  const setPreviousDifferenceLengths = useCallback((x, y) => {
    PREVIOUS_POSITIONRef.current = {
      X: x,
      Y: y,
    };
  }, []);

  const checkPreviousDifferenceLengths = useCallback(
    (x, y) => {
      if (CURRENT_CIRCLE_SECTIONRef.current === null) {
        return;
      }

      let differenceX = x - PREVIOUS_POSITIONRef.current.X;
      let differenceY = y - PREVIOUS_POSITIONRef.current.Y;

      let getCurrentDirectionForYForLeftHemisphere = diffY => {
        if (diffY < 0) {
          return DIRECTIONS.CLOCKWISE;
        }
        if (diffY > 0) {
          return DIRECTIONS.COUNTERCLOCKWISE;
        }
      };

      let getCurrentDirectionForXForTopHemisphere = diffX => {
        if (diffX < 0) {
          return DIRECTIONS.COUNTERCLOCKWISE;
        }
        if (diffX > 0) {
          return DIRECTIONS.CLOCKWISE;
        }
      };

      let getCurrentDirectionForYForRightHemisphere = diffY => {
        if (diffY < 0) {
          return DIRECTIONS.COUNTERCLOCKWISE;
        }
        if (diffY > 0) {
          return DIRECTIONS.CLOCKWISE;
        }
      };

      let getCurrentDirectionForXForBottomHemisphere = diffX => {
        if (diffX < 0) {
          return DIRECTIONS.CLOCKWISE;
        }
        if (diffX > 0) {
          return DIRECTIONS.COUNTERCLOCKWISE;
        }
      };

      function getCurrentDirectionForTopLeftQuadrant(diffX, diffY) {
        if (diffX === 0) {
          return getCurrentDirectionForYForLeftHemisphere(diffY);
        }
        return getCurrentDirectionForXForTopHemisphere(diffX);
      }

      function getCurrentDirectionForTopRightQuadrant(diffX, diffY) {
        if (diffX === 0) {
          return getCurrentDirectionForYForRightHemisphere(diffY);
        }
        return getCurrentDirectionForXForTopHemisphere(diffX);
      }

      function getCurrentDirectionForBottomLeftQuadrant(diffX, diffY) {
        if (diffX === 0) {
          return getCurrentDirectionForYForLeftHemisphere(diffY);
        }
        return getCurrentDirectionForXForBottomHemisphere(diffX);
      }

      function getCurrentDirectionForBottomRightQuadrant(diffX, diffY) {
        if (diffX === 0) {
          return getCurrentDirectionForYForRightHemisphere(diffY);
        }
        return getCurrentDirectionForXForBottomHemisphere(diffX);
      }

      switch (CURRENT_CIRCLE_SECTIONRef.current) {
        case CIRCLE_SECTIONS.TOP_LEFT:
          CURRENT_DIRECTIONRef.current = getCurrentDirectionForTopLeftQuadrant(
            differenceX,
            differenceY,
          );
          break;
        case CIRCLE_SECTIONS.TOP_RIGHT:
          CURRENT_DIRECTIONRef.current = getCurrentDirectionForTopRightQuadrant(
            differenceX,
            differenceY,
          );
          break;
        case CIRCLE_SECTIONS.BOTTOM_LEFT:
          CURRENT_DIRECTIONRef.current = getCurrentDirectionForBottomLeftQuadrant(
            differenceX,
            differenceY,
          );
          break;
        case CIRCLE_SECTIONS.BOTTOM_RIGHT:
          CURRENT_DIRECTIONRef.current = getCurrentDirectionForBottomRightQuadrant(
            differenceX,
            differenceY,
          );
          break;
      }

      setAdditiveMovementLength(differenceX, differenceY);
      setPreviousDifferenceLengths(x, y);
    },
    [setAdditiveMovementLength, setPreviousDifferenceLengths],
  );

  const defineAxesCoordinatesOnLayoutDisplacement = useCallback(() => {
    wheelNavigatorRef.current.measure((x, y, width, height, pageX, pageY) => {
      ICON_PATH_RADIUSRef.current = height / 2;
      XY_AXES_COORDINATESRef.current = {
        X: pageX + width / 2,
        Y: pageY + height / 2,
        PAGE_Y: pageY,
        PAGE_X: pageX,
      };
      STEP_LENGTH_TO_1_ANGLERef.current = (2 * Math.PI * ICON_PATH_RADIUSRef.current) / 360;
    });
  }, []);

  const getIthCircleValue = useCallback(
    (deltaAnim, step = 0) => {
      const selectedCircle = Math.round(
        (deltaAnim._value + deltaAnim._offset + step) / GIRTH_ANGLE,
      );
      return selectedCircle * GIRTH_ANGLE;
    },
    [GIRTH_ANGLE],
  );

  const simplifyOffset = useCallback(anim => {
    if (anim._value + anim._offset >= STEP_LENGTH_TO_1_ANGLERef.current) {
      anim.setOffset(anim._offset - STEP_LENGTH_TO_1_ANGLERef.current);
    }
    if (anim._value + anim._offset <= -STEP_LENGTH_TO_1_ANGLERef.current) {
      anim.setOffset(anim._offset + STEP_LENGTH_TO_1_ANGLERef.current);
    }
  }, []);

  const rotateOnInputPixelDistanceMatchingRadianShift = useCallback(() => {
    return [
      {
        transform: [
          {
            rotate: pan.current.interpolate({
              inputRange: [
                -(GIRTH_ANGLE * STEP_LENGTH_TO_1_ANGLERef.current),
                0,
                GIRTH_ANGLE * STEP_LENGTH_TO_1_ANGLERef.current,
              ],
              outputRange: [`-${GIRTH_ANGLE}deg`, '0deg', `${GIRTH_ANGLE}deg`],
            }),
          },
        ],
      },
    ];
  }, [GIRTH_ANGLE]);

  const defineAxesCoordinatesOnLayoutChangeByStylesOrScreenRotation = useCallback(() => {
    defineAxesCoordinatesOnLayoutDisplacement();
  }, [defineAxesCoordinatesOnLayoutDisplacement]);

  const onPressHandler = useCallback(
    (evt, item, index) => {
      let newIndex = index;
      if (index > Math.floor(renderedData.length / 2)) {
        newIndex = index - renderedData.length;
      }
      const newIthCircleValue = getIthCircleValue(pan.current, -newIndex * GIRTH_ANGLE);
      CURRENT_VECTOR_DIFFERENCE_LENGTHRef.current = newIthCircleValue;
      Animated.spring(pan.current, {
        toValue: newIthCircleValue,
        friction: 5,
        tension: 10,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          // simplifyOffset(pan.current)
          const newCurrentIndex = -newIthCircleValue / GIRTH_ANGLE;
          setCurrentIndex(newCurrentIndex);
          onPress(item);
        }
      });
    },
    [GIRTH_ANGLE, getIthCircleValue, onPress, renderedData],
  );

  const renderMenus = useCallback(() => {
    return renderedData.map((item, index) => {
      const foundItem = findItemByIndex(currentIndex);
      const isCenter = item?.id === foundItem?.id;

      return (
        <Animated.View
          key={index}
          style={[
            AppStyle.middleContent,
            {
              transform: [
                {
                  rotate: `${GIRTH_ANGLE * index}deg`,
                },
              ],
            },
          ]}>
          <Pressable
            style={[
              AppStyle.middleContent,
              styles.button,
              {
                top: -size / 2,
              },
            ]}
            onPress={e => onPressHandler(e, item, index)}>
            {typeof renderItem === 'function' ? (
              renderItem({ item, index, isCenter })
            ) : (
              <Animated.View
                style={[
                  AppStyle.middleContent,
                  styles.item,
                  {
                    width: itemSize * 0.8,
                    height: itemSize * 0.8,
                    borderRadius: (itemSize / 2) * 0.8,
                  },
                  isCenter && {
                    width: itemSize,
                    height: itemSize,
                    borderRadius: itemSize / 2,
                  },
                ]}>
                <Text style={styles.labelText}>{item?.label}</Text>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      );
    });
  }, [
    GIRTH_ANGLE,
    currentIndex,
    findItemByIndex,
    itemSize,
    onPressHandler,
    renderItem,
    renderedData,
    size,
    styles,
  ]);

  if (!visible || AMOUNT_OF_DATA === 0) {
    return null;
  }

  return (
    <View style={[style, styles.container, { bottom: -size / 2, borderRadius: size / 2 }]}>
      <View onLayout={debounce(defineAxesCoordinatesOnLayoutChangeByStylesOrScreenRotation, 100)}>
        <View
          style={[
            styles.layout,
            {
              width: size,
              height: size,
            },
          ]}
          ref={wheelNavigatorRef}
          onLayout={defineAxesCoordinatesOnLayoutDisplacement}>
          <Animated.View
            style={rotateOnInputPixelDistanceMatchingRadianShift()}
            {...panResponder.current?.panHandlers}>
            <View
              style={[
                AppStyle.middleContent,
                {
                  width: size,
                  height: size,
                },
              ]}>
              {renderMenus()}
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

WheelPicker.propTypes = {
  maxToRenderPerBatch: function (props, propName, componentName) {
    if (props[propName] % 2 === 0) {
      return new Error(
        'Invalid prop `' +
          propName +
          '` supplied to' +
          ' `' +
          componentName +
          '`. Expected Odd Number, got Even Number. Validation failed.',
      );
    }
    return null;
  },
};

export default WheelPicker;
