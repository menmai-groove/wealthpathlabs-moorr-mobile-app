import React, { useContext, useMemo } from 'react';

import Context from './context';

function MenuContextConsumer({ children }) {
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

function withMenu(Node) {
  return props => (
    <MenuContextConsumer>
      <Node {...props} />
    </MenuContextConsumer>
  );
}

function useMenu() {
  const menu = useContext(Context);
  const memoizedMenu = useMemo(() => menu, [menu]);
  return memoizedMenu;
}

export { withMenu, useMenu };
