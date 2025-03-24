import Markdown from '@flowchase/react-native-markdown-display';
import TextField from 'components/basics/TextField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React from 'react';

import themedStyles from './style';

const i18nScope = 'components.customMarkdown';

function CustomMarkdown({ style, onLinkPress, children }) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  return (
    <Markdown
      style={styles.markdownStyle}
      rules={{
        strong: node => (
          <TextField style={styles?.markdownStyle?.strong}>{node?.children[0]?.content}</TextField>
        ),
      }}
      onLinkPress={onLinkPress}>
      {children}
    </Markdown>
  );
}

export default CustomMarkdown;
