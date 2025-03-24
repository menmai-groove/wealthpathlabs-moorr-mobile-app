import ButtonField from 'components/basics/ButtonField';
import CustomImage from 'components/basics/CustomImage';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppScreenID } from 'constant';
import { LocalStorageLib, NavigationServiceLib } from 'libs';
import LottieView from 'lottie-react-native';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { Animated, FlatList, Platform, StatusBar, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.onBoarding';
const isIOS = Platform.OS === 'ios';

function OnBoarding({ t }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const insets = useSafeAreaInsets();
  const { teasers = {} } = useSelector(selectAppPreference);
  const { teaser1, teaser2, teaser3, teaser4 } = teasers;
  const scrollViewRef = useRef();
  const lottieRef1 = useRef();
  const lottieRef3 = useRef();
  const lottieRef2 = useRef();
  const lottieRef4 = useRef();
  const scrollX = useRef(new Animated.Value(0.01)).current;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const pageWidth = windowWidth;
  const pageHeight = isIOS ? windowHeight : windowHeight + StatusBar.currentHeight;

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, []);

  const memoizedPages = useMemo(() => {
    return [
      {
        id: 1,
        title: t(`${i18nScope}.title1`),
        subTitle: t(`${i18nScope}.subTitle1`),
        image: {
          source: teaser1?.source,
          aspectRatio: teaser1?.aspectRatio,
          style: styles.image,
          defaultSource: require('assets/images/empty.png'),
        },
        buttonTitle: t(`${i18nScope}.buttonTitle1`),
        backgroundColor: styles.lightPage.backgroundColor,
        color: styles.lightPage.color,
        bulletColor: styles.darkPullet.color,
        opacity: 1,
        isLottie: teaser1?.isLottie,
      },
      {
        id: 2,
        title: t(`${i18nScope}.title2`),
        subTitle: t(`${i18nScope}.subTitle2`),
        image: {
          source: teaser2?.source,
          aspectRatio: teaser2?.aspectRatio,
          style: styles.image,
          defaultSource: require('assets/images/empty.png'),
        },
        buttonTitle: t(`${i18nScope}.buttonTitle2`),
        backgroundColor: styles.lightPage.backgroundColor,
        color: styles.lightPage.color,
        bulletColor: styles.darkPullet.color,
        opacity: 1,
        isLottie: teaser2?.isLottie,
      },
      {
        id: 3,
        title: t(`${i18nScope}.title3`),
        subTitle: t(`${i18nScope}.subTitle3`),
        image: {
          source: teaser3?.source,
          style: styles.image,
          aspectRatio: teaser3?.aspectRatio,
          defaultSource: require('assets/images/empty.png'),
        },
        buttonTitle: t(`${i18nScope}.buttonTitle3`),
        backgroundColor: styles.lightPage.backgroundColor,
        color: styles.lightPage.color,
        bulletColor: styles.darkPullet.color,
        opacity: 1,
        isLottie: teaser3?.isLottie,
      },
      {
        id: 4,
        title: t(`${i18nScope}.title4`),
        subTitle: t(`${i18nScope}.subTitle4`),
        image: {
          source: teaser4?.source,
          style: styles.image,
          aspectRatio: teaser4?.aspectRatio,
          defaultSource: require('assets/images/empty.png'),
        },
        buttonTitle: t(`${i18nScope}.buttonTitle4`),
        backgroundColor: styles.lightPage.backgroundColor,
        color: styles.lightPage.color,
        bulletColor: styles.darkPullet.color,
        opacity: 1,
        isLottie: teaser4?.isLottie,
      },
    ];
  }, [styles, t, teaser1, teaser2, teaser3, teaser4]);

  const redirectSignUpScreen = () => {
    NavigationServiceLib.reset(AppScreenID.SignUp);
    LocalStorageLib.SkipOnBoardingIntroduce.set(true);
  };

  const goNext = index => {
    if (index >= 0 && index <= 3) {
      scrollViewRef.current.scrollToIndex({ index });
    }
  };

  const renderPages = (element, pi) => {
    const backgroundColor = scrollX.interpolate({
      inputRange: memoizedPages.map((_, bpi) => bpi * pageWidth),
      outputRange: memoizedPages.map(page => page.backgroundColor),
      extrapolate: 'clamp',
    });

    const color = scrollX.interpolate({
      inputRange: memoizedPages.map((_, cpi) => cpi * pageWidth),
      outputRange: memoizedPages.map(page => page.color),
      extrapolate: 'clamp',
    });

    const renderContent = () => {
      return (
        <View
          style={[
            AppStyle.flex1,
            insets.top > 0 && { paddingTop: insets.top },
            insets.bottom > 0 && { paddingBottom: insets.bottom },
          ]}>
          <View style={[AppStyle.flex1, AppStyle.flexEndContent]}>
            {element?.image ? (
              element?.isLottie ? (
                <LottieView
                  ref={ref => {
                    if (pi === 0) {
                      lottieRef1.current = ref;
                    }
                    if (pi === 2) {
                      lottieRef3.current = ref;
                    }
                    if (pi === 1) {
                      lottieRef2.current = ref;
                    }
                    if (pi === 3) {
                      lottieRef4.current = ref;
                    }
                  }}
                  resizeMode="contain"
                  style={[element?.image?.style, { aspectRatio: element?.image?.aspectRatio }]}
                  source={element?.image?.source}
                  loop={false}
                />
              ) : (
                <CustomImage
                  resizeMode="contain"
                  source={element?.image?.source}
                  defaultSource={element?.image?.defaultSource}
                  style={[element?.image?.style, { aspectRatio: element?.image?.aspectRatio }]}
                />
              )
            ) : null}
          </View>
          <View>
            <View style={styles.titleContainer}>
              <TextField
                style={styles.titleText}
                type="heading-1"
                animated
                animatedStyle={{ color }}>
                {element?.title}
              </TextField>
            </View>

            <View style={styles.descriptionContainer}>
              <TextField
                style={AppStyle.textCenter}
                type="heading-3"
                animated
                animatedStyle={{ color }}>
                {element?.subTitle}
              </TextField>
            </View>

            <View style={[styles.buttonContainer]}>
              <ButtonField
                type="primary"
                text={element?.buttonTitle}
                onPress={redirectSignUpScreen}
                animated
                animatedStyle={{ color }}
              />
            </View>
          </View>
        </View>
      );
    };

    return (
      <Animated.View
        key={`page-${pi}`}
        style={[
          styles.page,
          {
            width: pageWidth,
            height: pageHeight,
            backgroundColor: backgroundColor,
          },
        ]}>
        {renderContent()}
      </Animated.View>
    );
  };

  const renderBullet = () => {
    return (
      <View style={[AppStyle.middleContent, styles.bulletContainer]}>
        {memoizedPages?.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * pageWidth, i * pageWidth, (i + 1) * pageWidth],
            outputRange: [0.2, 1, 0.2],
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange: memoizedPages.map((page, pi) => pi * pageWidth),
            outputRange: memoizedPages.map(page => page.bulletColor),
            extrapolate: 'clamp',
          });

          return (
            <TouchableField key={`bullet-${i}`} onPress={() => goNext(i)}>
              <Animated.View
                style={[
                  styles.bullet,
                  {
                    opacity,
                    backgroundColor: backgroundColor,
                  },
                ]}
              />
            </TouchableField>
          );
        })}
      </View>
    );
  };

  function onScrollEnd(e) {
    try {
      const contentOffset = e?.nativeEvent?.contentOffset;
      const viewSize = e?.nativeEvent?.layoutMeasurement;

      // Divide the horizontal offset by the width of the view to see which page is visible
      const pageNum = Math.floor(contentOffset.x / viewSize.width);
      switch (pageNum) {
        case 0:
          if (teaser1 && teaser1.isLottie && !teaser1.isPlay) {
            lottieRef1.current.play();
            teaser1.isPlay = true;
          }
          break;
        case 1:
          if (teaser2 && teaser2?.isLottie && !teaser2.isPlay) {
            lottieRef2.current.play();
            teaser2.isPlay = true;
          }
          break;
        case 2:
          if (teaser3 && teaser3?.isLottie && !teaser3.isPlay) {
            lottieRef3.current.play();
            teaser3.isPlay = true;
          }
          break;
        case 3:
          if (teaser4 && teaser4?.isLottie && !teaser4.isPlay) {
            lottieRef4.current.play();
            teaser4.isPlay = true;
          }
          break;
        default:
          break;
      }
    } catch (error) {}
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollViewRef}
        data={memoizedPages}
        style={styles.scrollView}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={200}
        pagingEnabled
        snapToInterval={pageWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
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
          { useNativeDriver: false },
        )}
        renderItem={({ item, index }) => renderPages(item, index)}
      />
      <View style={styles.footer}>{renderBullet()}</View>
    </View>
  );
}

export default compose(withTranslation(), withExitAppHandler)(OnBoarding);
