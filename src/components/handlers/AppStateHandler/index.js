import React, { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateAppState } from 'store/Root/action';

function AppStateHandler() {
  const appState = useRef(AppState.currentState);
  const dispatch = useDispatch();

  useEffect(() => {
    const listener = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      listener.remove();
    };
  }, []);

  const _handleAppStateChange = nextAppState => {
    if (nextAppState !== 'inactive' && appState.current !== nextAppState) {
      appState.current = nextAppState;
      dispatch(updateAppState(nextAppState));
    }
  };

  return <View />;
}

export default AppStateHandler;
