import AnimatedText from 'components/basics/AnimatedText';
import CustomMarkdown from 'components/basics/CustomMarkdown';
import { isEmpty } from 'lodash';
import LottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers/';
import React from 'react';
import { View } from 'react-native';
import { AppStyle } from 'theme';

import themedStyles from './style';

function Question(props) {
  const {
    emotion = 'smile',
    header,
    content = '',
    question = '',
    position = 'left',
    style,
    enabledMarkdown = false,
    children,
  } = props;
  const styles = useThemedStyle(themedStyles);

  switch (position) {
    case 'left':
      styles.box = {
        ...styles.box,
        borderBottomLeftRadius: 4,
      };
      break;
    case 'top':
      styles.image = {
        ...styles.image,
        position: 'absolute',
        left: 0,
        top: 0,
      };
      styles.box = {
        ...styles.box,
        marginTop: 36,
        borderRadius: 20,
        borderTopLeftRadius: 4,
      };
      break;
    case 'top-center':
      styles.container = {
        ...styles.container,
        flexDirection: 'column',
      };
      styles.image = {
        ...styles.image,
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
      };
      styles.box = {
        ...styles.box,
        marginTop: 36,
        borderRadius: 20,
      };
      break;

    default:
      break;
  }

  const renderOpti = emotionInput => {
    switch (emotionInput) {
      case 'excited': {
        return (
          <LottieView
            resizeMode="contain"
            style={styles.excitedOpti}
            source={require('assets/images/optiIcon/excited.json')}
            autoPlay
            loop
          />
        );
      }
      case 'blink': {
        return (
          <LottieView
            resizeMode="contain"
            style={styles.blinkOpti}
            source={require('assets/images/optiIcon/blink.json')}
            autoPlay
            loop
          />
        );
      }
      case 'confused': {
        return (
          <LottieView
            resizeMode="contain"
            style={styles.confusedOpti}
            source={require('assets/images/optiIcon/confused.json')}
            autoPlay
            loop
          />
        );
      }
      case 'smile': {
        return (
          <LottieView
            resizeMode="contain"
            style={styles.smileOpti}
            source={require('assets/images/optiIcon/smile.json')}
            autoPlay
            loop
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[AppStyle.marginRight10]}>{renderOpti(emotion)}</View>
      <View style={[styles.box]}>
        {children || (
          <View>
            {enabledMarkdown ? (
              <View>
                {!isEmpty(header) && (
                  <CustomMarkdown style={styles.markdownStyle}>{header}</CustomMarkdown>
                )}
                {!isEmpty(content) && (
                  <CustomMarkdown style={styles.markdownStyle}>{content}</CustomMarkdown>
                )}
              </View>
            ) : (
              <AnimatedText
                autoplay
                duration={500}
                wordAnimation={false}
                // onAnimated={() => setVisibleQuestion(true)}
              >
                {content || ''}
              </AnimatedText>
            )}
            {!isEmpty(question) && (
              <View style={styles.question}>
                <AnimatedText
                  autoplay
                  // autoplay={visibleQuestion}
                  // duration={500}
                  // wordAnimation={false}
                  font="medium">
                  {question || ''}
                </AnimatedText>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default Question;
