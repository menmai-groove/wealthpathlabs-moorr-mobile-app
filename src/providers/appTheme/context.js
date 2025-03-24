import React from 'react';
import themeDefault from 'theme/theme.json';

export const theme = {
  ...themeDefault,
};

export default React.createContext(theme);
