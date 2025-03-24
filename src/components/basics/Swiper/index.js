import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.swiper';
const bulletWidth = 8;

function Swiper({ style, views, onChangePage, initialIndex = 0 }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentSize, setContentSize] = useState(null);
  const currentPage = useRef(0);
  const scrollViewRef = useRef(null);

  useImperativeHandle(ref, () => ({}));

  const onLayout = useCallback(({ nativeEvent }) => {
    const { width: layoutWidth, height: layoutHeight } = nativeEvent.layout;
    setContentSize({
      width: layoutWidth,
      height: layoutHeight,
    });
  }, []);

  const currentWidth = useMemo(() => contentSize?.width || 0, [contentSize]);

  useEffect(() => {
    scrollViewRef?.current.scrollTo({ x: initialIndex * currentWidth, y: 0, animated: false });
  }, [currentWidth, initialIndex]);

  const renderBullet = useCallback(() => {
    if (currentWidth === 0) {
      return null;
    }
    return (
      <View style={AppStyle.rowFlex}>
        {views.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * currentWidth, i * currentWidth, (i + 1) * currentWidth],
            outputRange: [0.2, 1, 0.2],
            extrapolate: 'clamp',
          });
          const width = scrollX.interpolate({
            inputRange: [(i - 1) * currentWidth, i * currentWidth, (i + 1) * currentWidth],
            outputRange: [bulletWidth, 20, bulletWidth],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`bullet-${i}`}
              style={[
                styles.bullet,
                {
                  width,
                  height: bulletWidth,
                  borderRadius: bulletWidth / 2,
                  opacity,
                  marginRight: bulletWidth,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }, [currentWidth, scrollX, styles, views]);

  if (views.length === 0) {
    return null;
  }

  const handleScroll = event => {
    const positionX = event.nativeEvent.contentOffset.x;
    if (Math.round(positionX / currentWidth) !== currentPage.current) {
      let page = Math.max(Math.round(positionX / currentWidth), 0);
      currentPage.current = page;
      typeof onChangePage === 'function' && onChangePage(page);
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onLayout={!contentSize && onLayout}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          { useNativeDriver: false, listener: event => handleScroll(event) },
        )}
        scrollEventThrottle={200}
        snapToInterval={currentWidth}
        decelerationRate="fast"
        nestedScrollEnabled>
        {views.length > 0 &&
          views.map((view, vi) => {
            return (
              <View
                style={[
                  styles.slideContainer,
                  {
                    width: currentWidth,
                  },
                ]}
                key={`view-${vi}`}>
                {typeof view === 'object' ? view.view : null}
              </View>
            );
          })}
      </ScrollView>
      <View
        style={[
          AppStyle.rowFlex,
          AppStyle.alignContent,
          AppStyle.spaceBetweenContent,
          styles.bulletContainer,
        ]}>
        {renderBullet()}
      </View>
    </View>
  );
}

export default forwardRef(Swiper);
