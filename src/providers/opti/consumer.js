import React, { useContext, useMemo } from 'react';

import Context from './context';

function OptiContextConsumer({ children }) {
  return (
    <Context.Consumer>
      {menu => {
        return React.cloneElement(children, {
          menu: menu,
        });
      }}
    </Context.Consumer>
  );
}

function withOpti(Node) {
  return props => (
    <OptiContextConsumer>
      <Node {...props} />
    </OptiContextConsumer>
  );
}

function useOpti() {
  const menu = useContext(Context);
  const memoizedOpti = useMemo(() => menu, [menu]);
  return memoizedOpti;
}

export { withOpti, useOpti };
