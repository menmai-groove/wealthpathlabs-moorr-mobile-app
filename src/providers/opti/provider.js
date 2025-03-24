import React, { useCallback, useMemo, useState } from 'react';

import Context from './context';

function OptiProvider({ children }) {
  const [optiOpened, setStateOptiOpened] = useState(false);

  const setOptiOpened = useCallback(opened => {
    setStateOptiOpened(opened);
  }, []);

  const newContext = useMemo(() => {
    return {
      optiOpened,
      setOptiOpened,
    };
  }, [optiOpened, setOptiOpened]);

  return <Context.Provider value={newContext}>{children}</Context.Provider>;
}

export default OptiProvider;
