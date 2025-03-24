import DefaultSource from 'assets/images/empty.png';
import Condition from 'components/basics/Condition';
import ContentLoader from 'components/layouts/ContentLoader';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated } from 'react-native';
import FastImage from 'react-native-fast-image';

import themedStyles from './style';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const i18nScope = 'components.customImage';

const DURATION = 1000;

function CustomImage({ source, defaultSource = DefaultSource, style, ...rest }, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [visibleLoading, setVisibleLoading] = useState(true);
  const [visibleDefault, setVisibleDefault] = useState(true);
  const [visibleImage, setVisibleImage] = useState(true);
  const defaultImageAnim = useRef(new Animated.Value(1)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({}));

  const onLoadEnd = useCallback(() => {
    Animated.parallel([
      Animated.timing(defaultImageAnim, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setVisibleLoading(false);
      }
    });
  }, [defaultImageAnim, imageAnim]);

  const onImageError = useCallback(() => {
    setVisibleImage(false);
    onLoadEnd();
  }, [onLoadEnd]);

  const onImageLoad = useCallback(() => {
    setVisibleDefault(false);
    onLoadEnd();
  }, [onLoadEnd]);

  return (
    <Fragment>
      <Condition display={visibleImage}>
        <AnimatedFastImage
          source={source}
          style={[
            {
              opacity: imageAnim,
            },
            style,
          ]}
          onLoad={onImageLoad}
          onError={onImageError}
          {...rest}
        />
      </Condition>

      <Condition display={visibleDefault}>
        <AnimatedFastImage
          source={defaultSource}
          style={[
            styles.imageOverlay,
            {
              opacity: imageAnim,
            },
            style,
          ]}
          {...rest}
        />
      </Condition>

      <Condition display={visibleLoading}>
        <Animated.View
          style={[
            styles.imageOverlay,
            {
              opacity: defaultImageAnim,
            },
            style,
          ]}>
          <ContentLoader name="image" {...rest} />
        </Animated.View>
      </Condition>
    </Fragment>
  );
}

export default forwardRef(CustomImage);
