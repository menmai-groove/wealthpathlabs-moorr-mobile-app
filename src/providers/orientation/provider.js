import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import Context, { orientation } from './context';

function OrientationProvider({ children }) {
  const [isLandscape, setLandscape] = useState(orientation.isLandscape);
  const isLandscapeRef = useRef(orientation.isLandscape);
  const windowRef = useRef({
    height: orientation.screenHeight,
    width: orientation.screenWidth,
  });
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    isLandscapeRef.current = width > height;
    if (isLandscape !== isLandscapeRef.current) {
      windowRef.current = { width, height };
      setLandscape(isLandscapeRef.current);
    }
  }, [height, width, isLandscape]);

  const newContext = {
    mode: isLandscape ? 'landscape' : 'portrait',
    isLandscape: isLandscape,
    screenHeight: windowRef.current.height,
    screenWidth: windowRef.current.width,
  };

  return <Context.Provider value={newContext}>{children}</Context.Provider>;
}

export default OrientationProvider;
