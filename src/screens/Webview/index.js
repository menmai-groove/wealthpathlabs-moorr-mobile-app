import { useRoute } from '@react-navigation/core';
import Header from 'components/layouts/Header';
import LottieView from 'lottie-react-native';
import { useOnBackScreenHandler, useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { compose } from 'redux';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const i18nScope = 'screens.webview';

function WebviewScreen(props) {
  useOnBackScreenHandler();

  const styles = useThemedStyle(themedStyles, i18nScope);
  const { loadingContainer, wrapper, icon } = styles;

  const route = useRoute();
  const { params } = route;

  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.container]}>
      <Header type="full" title={''} />
      {loading && (
        <View style={loadingContainer}>
          <View style={wrapper}>
            <View style={styles.iconContainer}>
              <LottieView
                resizeMode="contain"
                style={icon}
                source={require('assets/images/m-logo-loading.json')}
                autoPlay
                loop
              />
            </View>
          </View>
        </View>
      )}
      {params?.url ? (
        <WebView
          source={{ uri: params?.url }}
          style={AppStyle.flex1}
          onLoad={() => setLoading(false)}
          bounces={false}
        />
      ) : null}
    </View>
  );
}

export default compose(withTranslation())(WebviewScreen);
