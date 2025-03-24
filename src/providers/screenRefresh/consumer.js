import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION = 600;

function useOnScreenRefresh() {
  const [refreshId, setRefreshId] = useState();
  const flag = useRef(false);
  const timeout = useRef();

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        flag.current = true;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      flag.current = false;
      return () => {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          if (!flag.current) {
            flag.current = true;
            setRefreshId(Date.now());
          }
        }, DURATION);
      };
    }, []),
  );

  return { screenRefreshId: refreshId };
}

export { useOnScreenRefresh };
