import React, { Component, useContext, useMemo } from 'react';
import { AppUtil } from 'theme/index';

import Context from './context';

export const useThemedStyle = (styles, customMapping = null) => {
  const theme = useContext(Context);
  const themedStyle = useMemo(() => {
    return AppUtil.createScaledSheet(styles, theme, customMapping);
  }, [customMapping, styles, theme]);
  return themedStyle;
};

function ThemeContextConsumer({ children }) {
  return (
    <Context.Consumer>
      {theme => {
        return React.cloneElement(children, {
          useThemedStyle: React.memo((styles, customMapping = null) =>
            AppUtil.createScaledSheet(styles, theme, customMapping),
          ),
        });
      }}
    </Context.Consumer>
  );
}

export const withTheme = Node => {
  class WithThemeComponent extends Component {
    render = () => (
      <ThemeContextConsumer>
        <Node {...this.props} />
      </ThemeContextConsumer>
    );
  }
  return WithThemeComponent;
};
