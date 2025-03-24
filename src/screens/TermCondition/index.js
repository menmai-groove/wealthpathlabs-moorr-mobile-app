import { MarkdownIt, stringToTokens, tokensToAST } from '@flowchase/react-native-markdown-display';
import { useRoute } from '@react-navigation/native';
import defaultMarkdown from 'assets/jsons/term-condition';
import ButtonField from 'components/basics/ButtonField';
import CustomMarkdown from 'components/basics/CustomMarkdown';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import Header from 'components/layouts/Header';
import { AppScreenID } from 'constant';
import { NavigationServiceLib, UtilLib } from 'libs';
import { isEmpty } from 'lodash';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateTermCondition, updateTermConditionContent } from 'store/Auth/action';
import { selectTermConditionContent } from 'store/Auth/selector';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const markdownItInstance = MarkdownIt({ typographer: true });
const i18nScope = 'screens.termCondition';

function TermConditionScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const termCondition = useSelector(selectTermConditionContent);
  const insets = useSafeAreaInsets();

  const [markdownContent, setContent] = useState('');
  const scrollRef = useRef();
  const dispatch = useDispatch();
  const route = useRoute();

  const onLinkPress = useCallback(url => {
    if (url) {
      UtilLib.openInAppBrowserLink(url);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    const content = termCondition?.content || defaultMarkdown?.content;
    if (content) {
      const mdContent = tokensToAST(stringToTokens(content, markdownItInstance));
      setContent(mdContent);
    }
  }, [termCondition]);

  const onSubmit = useCallback(() => {
    if (typeof route?.params?.onSubmit === 'function') {
      route.params.onSubmit({ termCondition: true });
      return;
    }
    if (typeof route?.params?.authorized) {
      dispatch(updateTermConditionContent(null));
      dispatch(updateTermCondition());
      NavigationServiceLib.pop();
      return;
    }
  }, [dispatch, route]);

  const onBackHeader = useCallback(() => {
    if (typeof route?.params?.onHeaderBack === 'function') {
      route.params.onHeaderBack();
      return;
    }
    if (typeof route?.params?.authorized) {
      dispatch(updateTermConditionContent(null));
      NavigationServiceLib.pop(AppScreenID.Entry);
      return;
    }
  }, [dispatch, route]);

  useOnBackButtonPress(onBackHeader);

  return (
    <View style={styles.container}>
      <Header onBackHeader={onBackHeader} type="back" title={t(`${i18nScope}.title`)} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={AppStyle.flex1}
        showsVerticalScrollIndicator={false}>
        <View style={[AppStyle.flex1, styles.markdownContainer]}>
          {!isEmpty(markdownContent) && (
            <CustomMarkdown style={styles.markdownStyle} onLinkPress={onLinkPress}>
              {markdownContent}
            </CustomMarkdown>
          )}
        </View>
      </KeyboardAwareScrollView>
      <View style={AppStyle.alignContent}>
        <LinearGradient
          style={[styles.fadeBottomView]}
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.8)']}
          pointerEvents={'none'}
        />
        <View
          style={[
            styles.buttonContainer,
            insets.bottom > 0 && { paddingBottom: insets.bottom / 2 },
          ]}>
          <ButtonField text={t(`${i18nScope}.accept`)} onPress={onSubmit} />
        </View>
      </View>
    </View>
  );
}

export default TermConditionScreen;
