import { MarkdownIt, stringToTokens, tokensToAST } from '@flowchase/react-native-markdown-display';
import CustomMarkdown from 'components/basics/CustomMarkdown';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import { isEmpty } from 'lodash';
import { useThemedStyle, withBackHandler } from 'providers';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const markdownItInstance = MarkdownIt({ typographer: true });
const i18nScope = 'screens.signUpPageInfo';

function SignUpPageInfo() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const scrollRef = useRef();
  const insets = useSafeAreaInsets();

  const mdContent = useMemo(
    () => tokensToAST(stringToTokens(t(`${i18nScope}.info`), markdownItInstance)),
    [t],
  );

  return (
    <View style={styles.container}>
      <Header type="back" withLogo />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[AppStyle.padX20, insets.bottom && { paddingBottom: insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <View style={AppStyle.flex1}>
          {!isEmpty(mdContent) && (
            <CustomMarkdown style={styles.markdownStyle}>{mdContent}</CustomMarkdown>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

SignUpPageInfo.propTypes = {};
SignUpPageInfo.defaultProps = {};

export default compose(withBackHandler)(SignUpPageInfo);
