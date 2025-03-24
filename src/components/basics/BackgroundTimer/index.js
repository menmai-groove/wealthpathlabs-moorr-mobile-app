import { isFunction } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

function BackgroundTimerBySecond(props) {
  const { useBackgroundTimer = false, onChange } = props;
  const intervalId = useRef(null);
  const originalTime = useRef(null);
  const secondInterval = useRef(0);

  const initInterval = useCallback(() => {
    const currentMoment = moment(moment().format());
    secondInterval.current = currentMoment.unix();
  }, []);

  const setTick = useCallback(
    callback => {
      clearTick();
      if (useBackgroundTimer) {
        intervalId.current = BackgroundTimer.setInterval(() => {
          callback();
        }, 1000);
      } else {
        intervalId.current = setInterval(() => {
          callback();
        }, 1000);
      }
    },

    [useBackgroundTimer],
  );

  const clearTick = useCallback(() => {
    if (intervalId.current) {
      if (useBackgroundTimer) {
        BackgroundTimer.clearInterval(intervalId.current);
      } else {
        clearInterval(intervalId.current);
      }
      intervalId.current = null;
    }
  }, [useBackgroundTimer]);

  const updateTimer = useCallback(() => {
    secondInterval.current = Math.max(0, secondInterval.current + 1);
    onChangeAsync(secondInterval.current);
  }, []);

  const onChangeAsync = useCallback(async interval => {
    if (isFunction(onChange)) {
      onChange(interval);
    }
  }, []);

  React.useEffect(() => {
    const handleAppStateChange = currentAppState => {
      initInterval();
      if (currentAppState === 'active') {
        setTick(updateTimer);
      }
      if (currentAppState === 'background') {
        clearTick();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    setTick(updateTimer);

    return () => {
      clearTick();
      subscription.remove();
    };
  }, [useBackgroundTimer]);

  React.useEffect(() => {
    originalTime.current = moment(moment().format()).toDate();
    initInterval();
  }, []);

  return null;
}

BackgroundTimerBySecond.propTypes = {
  useBackgroundTimer: PropTypes.bool,
  onChange: PropTypes.func,
};

export default BackgroundTimerBySecond;
export { BackgroundTimerBySecond };
