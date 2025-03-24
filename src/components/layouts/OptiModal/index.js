import i18n from 'bootstrap/i18n';
import ButtonField from 'components/basics/ButtonField';
import Loading from 'components/basics/Loading';
import TextField from 'components/basics/TextField';
import Header from 'components/layouts/Header';
import { AppConfigs } from 'constant';
import { isEmpty } from 'lodash';
import { useThemedStyle } from 'providers';
import { useOpti } from 'providers/opti/consumer';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'screens.optiModal';

const DURATION = AppConfigs.menuAnimationDuration;

const initialState = {
  title: '',
  body: null,
  description: null,
  onBackdropPress: () => {},
  onBackButtonPress: () => {},
  onModalHide: () => {},
  onRequestClose: () => {},
  onPressButton: () => {},
  buttonText: i18n.t(`${i18nScope}.ok`),

  renderImage: () => {},
  renderDescription: () => {},
  hideCloseButton: null,
};

function OptiModal(_, ref) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { setOptiOpened } = useOpti();
  const { height: heightScreen } = useWindowDimensions();
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const translateYAnim = useRef(new Animated.Value(heightScreen));
  const isOpened = useRef(false);
  const [states, setStates] = useState(initialState);

  useEffect(() => {
    translateYAnim.current.setValue(heightScreen);
  }, [heightScreen]);

  const show = useCallback(
    params => {
      isOpened.current = true;
      setOptiOpened(isOpened.current);
      Animated.timing(translateYAnim.current, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();

      setStates(prevState => ({
        ...prevState,
        ...params,
      }));
    },
    [setOptiOpened],
  );

  const hide = useCallback(() => {
    Animated.timing(translateYAnim.current, {
      toValue: heightScreen,
      duration: DURATION,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(({ finished }) => {
      if (finished) {
        isOpened.current = false;
        setOptiOpened(isOpened.current);
        setStates(initialState);
      }
    });
  }, [heightScreen, setOptiOpened]);

  const setLoading = useCallback(loading => {
    setStates(prevState => ({
      ...prevState,
      loading,
    }));
  }, []);

  useEffect(() => {
    if (closeModalsRefreshId) {
      hide();
    }
  }, [closeModalsRefreshId, hide]);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      show,
      hide,
      isOpened: () => isOpened.current,
      setLoading,
    }),
    [show, hide, setLoading],
  );

  const renderDefaultBody = useCallback(
    () => (
      <View style={[AppStyle.flex1, AppStyle.middleContent, styles.modalContainer]}>
        <View style={[AppStyle.flexEndContent]}>
          {typeof states.renderImage === 'function' && states.renderImage()}
          <View style={styles.titleContainer}>
            <TextField style={AppStyle.textCenter} type="heading-2">
              {states.title}
            </TextField>
          </View>
        </View>
        <View style={AppStyle.marginTop10}>
          {typeof states.renderDescription === 'function' ? (
            states.renderDescription()
          ) : (
            <TextField style={AppStyle.textCenter} type="paragraph-2">
              {states.description}
            </TextField>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <ButtonField text={states.buttonText} onPress={states.onPressButton} />
        </View>
      </View>
    ),
    [states, styles],
  );

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        AppStyle.flex1,
        {
          transform: [
            {
              translateY: translateYAnim.current,
            },
          ],
        },
      ]}>
      {!states.hideCloseButton && (
        <Header type="back" background={false} onBackHeader={states.onRequestClose} />
      )}
      {!isEmpty(states.body) && states.body}
      {isEmpty(states.body) && renderDefaultBody()}
      {states.loading && <Loading visible />}
    </Animated.View>
  );
}

export default forwardRef(OptiModal);
