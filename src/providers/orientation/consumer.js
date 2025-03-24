import React, { useContext, useMemo } from 'react';

import Context from './context';

function OrientationContextConsumer({ children }) {
  return (
    <Context.Consumer>
      {orientation => {
        return React.cloneElement(children, {
          orientation: orientation,
        });
      }}
    </Context.Consumer>
  );
}

function withOrientation(Node) {
  return props => (
    <OrientationContextConsumer>
      <Node {...props} />
    </OrientationContextConsumer>
  );
}

function useOrientation() {
  const orientation = useContext(Context);
  const memoizedOrientation = useMemo(() => orientation, [orientation]);
  return memoizedOrientation;
}

export { withOrientation, useOrientation };
