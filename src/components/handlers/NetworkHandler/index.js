import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import axios from 'axios';
import Condition from 'components/basics/Condition';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, AppState, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import ErrorNetwork from 'screens/ErrorNetwork';
import {
  closeAllModals,
  internetReconnected,
  openUpdateAppModal,
  updateAppRemoteConfigStatus,
  updateConnection,
  updateWithoutInternet,
} from 'store/Root/action';
import { selectAppConnection, selectWithoutInternet } from 'store/Root/selector';

import themedStyles from './styles';

function NetworkHandler() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);
  const previousInternetConnected = useRef(true);
  const fadeAnim = useRef(new Animated.Value(0));
  const heightAnim = useRef(new Animated.Value(0));
  const colorAnim = useRef(new Animated.Value(1));
  const appState = useRef(AppState.currentState);

  const dispatch = useDispatch();
  const appConnection = useSelector(selectAppConnection);
  const withoutInternet = useSelector(selectWithoutInternet);
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [statusNetwork, setStatusNetwork] = useState('');

  const animate = useCallback((opacity, callback) => {
    Animated.timing(fadeAnim.current, {
      duration: 200,
      toValue: opacity,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && typeof callback === 'function') {
        callback();
      }
    });
  }, []);

  useEffect(() => {
    const online = netInfo.isConnected && netInfo.isInternetReachable;
    if (online !== previousInternetConnected.current) {
      previousInternetConnected.current = online;
      dispatch(updateConnection(online));
      if (!online) {
        axios.CancelToken.source().cancel('disconnected_network');
        dispatch(openUpdateAppModal(false));
        !withoutInternet && dispatch(closeAllModals());
      } else {
        dispatch(internetReconnected());
      }
    }
  }, [dispatch, netInfo, withoutInternet]);

  useEffect(() => {
    if (withoutInternet) {
      setVisible(false);
    } else {
      if (appConnection === false) {
        Keyboard.dismiss();
        setVisible(true);
        animate(1);
      } else {
        animate(0, () => setVisible(false));
      }
    }
  }, [appConnection, animate, dispatch, withoutInternet]);

  const onPress = () => {
    dispatch(updateWithoutInternet(true));
    dispatch(updateAppRemoteConfigStatus(true));
    setVisible(false);
  };

  useEffect(() => {
    if (!withoutInternet) {
      return;
    }
    if (netInfo.isInternetReachable) {
      setStatusNetwork(t('screens.errorNetwork.connected'));
      Animated.parallel([
        Animated.timing(colorAnim.current, {
          duration: 200,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim.current, {
          duration: 500,
          toValue: 0,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (netInfo.isConnected) {
      setStatusNetwork(t('screens.errorNetwork.connecting'));
      Animated.parallel([
        Animated.timing(colorAnim.current, {
          duration: 200,
          toValue: 0,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim.current, {
          duration: 500,
          toValue: 36 + insets.bottom / 2,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      setStatusNetwork(t('screens.errorNetwork.disconnected'));
      Animated.parallel([
        Animated.timing(colorAnim.current, {
          duration: 200,
          toValue: -1,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim.current, {
          duration: 500,
          toValue: 36 + insets.bottom / 2,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [t, insets, withoutInternet, netInfo]);

  const _handleAppStateChange = async nextAppState => {
    if (nextAppState !== 'inactive' && appState.current !== nextAppState) {
      if (appState.current === 'background' && nextAppState === 'active') {
        const netState = await NetInfo.fetch();
        const online = netState.isConnected && netState.isInternetReachable;
        if (!appConnection && online) {
          previousInternetConnected.current = online;
          dispatch(updateConnection(online));
        }
      }
      appState.current = nextAppState;
    }
  };

  useEffect(() => {
    const listener = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      listener.remove();
    };
  }, []);

  if (visible && !withoutInternet) {
    return (
      <Condition display={visible}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim.current,
            },
          ]}>
          <ErrorNetwork onPress={onPress} />
        </Animated.View>
      </Condition>
    );
  }

  const textColor = colorAnim.current.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [styles.text.color, styles.textConnecting.color, styles.textConnected.color],
    extrapolate: 'clamp',
  });
  const backgroundColor = colorAnim.current.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [
      styles.boxPosition.backgroundColor,
      styles.boxConnecting.backgroundColor,
      styles.boxConnected.backgroundColor,
    ],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View
      style={[
        styles.boxPosition,
        { height: heightAnim.current, backgroundColor: backgroundColor },
      ]}>
      <Animated.View
        style={[styles.boxMessage, insets.bottom > 0 && { paddingBottom: insets.bottom / 2 }]}>
        {!netInfo.isInternetReachable && !netInfo.isConnected && (
          <Ionicons name="warning" size={18} color={styles.text.color} />
        )}
        <TextField animated animatedStyle={{ color: textColor }} style={styles.text}>
          {statusNetwork}
        </TextField>
      </Animated.View>
    </Animated.View>
  );
}

export default NetworkHandler;
