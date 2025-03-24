import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useDispatch } from 'react-redux';

export const useFade = (duration = 1000, delay = 500) => {
  const fadeAnim = useRef(new Animated.Value(0));
  useEffect(() => {
    const fadeInAndOut = Animated.sequence([
      Animated.timing(fadeAnim.current, {
        toValue: 1,
        delay,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim.current, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]);
    const fadeLoop = Animated.loop(fadeInAndOut);
    fadeLoop.start();
    return () => {
      fadeLoop.stop();
    };
  }, [delay, duration]);
  return fadeAnim.current;
};

export const useDelay = (callback, time) => {
  useEffect(() => {
    setTimeout(callback, time);
  }, []);
};

export const useRingingAnimation = (degree = 10, duration = 100, delay = 1000) => {
  const amin = useRef(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(amin.current, {
          toValue: -1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(amin.current, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(amin.current, {
          toValue: -1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(amin.current, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(amin.current, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, duration]);
  const rotation = amin.current.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${degree}deg`, `${degree}deg`],
  });
  return rotation;
};

export const useDispatchResolve = () => {
  const dispatch = useDispatch();

  return useCallback(
    action => {
      return new Promise((resolve, reject) => {
        const newAction = { ...action, resolver: { resolve, reject } };
        dispatch(newAction);
      });
    },
    [dispatch],
  );
};

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useIsComponentMounted() {
  const isComponentMounted = useRef(false);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  return isComponentMounted;
}

export default {
  useFade,
  useDelay,
  useRingingAnimation,
  useDispatchResolve,
  useIsComponentMounted,
};
