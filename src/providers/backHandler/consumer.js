import { useIsFocused } from '@react-navigation/native';
import i18n from 'bootstrap/i18n';
import { AppConfigs } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import React, { Component, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import RNExitApp from 'react-native-exit-app';

class BackHandlerConsumer extends Component {
  componentDidMount = () => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.backButtonHandler);
    }
  };

  componentWillUnmount = () => {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.backButtonHandler);
    }
  };

  backButtonHandler = () => {
    const { isFocused } = this.props;
    if (!isFocused) {
      return false;
    }

    const menuModal = GlobalLib?.MenuModal?.get();
    if (menuModal?.isOpened()) {
      menuModal?.hide();
      return true;
    }

    const optiModal = GlobalLib?.OptiModal?.get();
    if (optiModal?.isOpened()) {
      optiModal?.hide();
      return true;
    }

    NavigationServiceLib.pop();
    return true;
  };

  render() {
    return React.cloneElement(this.props.children, {
      hardwareBackPress: this.backButtonHandler,
    });
  }
}

class ExitAppHandlerConsumer extends BackHandlerConsumer {
  backButtonHandler = () => {
    const { isFocused } = this.props;
    if (!isFocused) {
      return false;
    }

    const menuModal = GlobalLib?.MenuModal?.get();
    if (menuModal?.isOpened()) {
      menuModal?.hide();
      return true;
    }

    const optiModal = GlobalLib?.OptiModal?.get();
    if (optiModal?.isOpened()) {
      optiModal?.hide();
      return true;
    }

    const secondPressTime = Date.now();
    if (
      this.timesOfBackPress &&
      secondPressTime - this.timesOfBackPress < AppConfigs.iddleTimeBackPressExitApp
    ) {
      RNExitApp.exitApp();
    } else {
      GlobalLib.Toast.get().toastWarning(i18n.t('warningMsg.doublePressExit'));
    }
    this.timesOfBackPress = secondPressTime;
    return true;
  };
}

function withBackHandler(Node) {
  return props => (
    <BackHandlerConsumer>
      <Node {...props} />
    </BackHandlerConsumer>
  );
}

function withExitAppHandler(Node) {
  return props => (
    <ExitAppHandlerConsumer>
      <Node {...props} />
    </ExitAppHandlerConsumer>
  );
}

function useOnBackScreenHandler() {
  const isFocused = useIsFocused();

  useEffect(() => {
    const backButtonHandler = () => {
      if (!isFocused) {
        return false;
      }

      const menuModal = GlobalLib?.MenuModal?.get();
      if (menuModal?.isOpened()) {
        menuModal?.hide();
        return true;
      }

      const optiModal = GlobalLib?.OptiModal?.get();
      if (optiModal?.isOpened()) {
        optiModal?.hide();
        return true;
      }

      NavigationServiceLib.pop();
      return true;
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
    }
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      }
    };
  }, [isFocused]);
}

function useOnExitAppHandler() {
  const timesOfBackPress = useRef();
  const isFocused = useIsFocused();

  useEffect(() => {
    const backButtonHandler = () => {
      if (!isFocused) {
        return false;
      }

      const menuModal = GlobalLib?.MenuModal?.get();
      if (menuModal?.isOpened()) {
        menuModal?.hide();
        return true;
      }

      const secondPressTime = Date.now();
      if (
        timesOfBackPress.current &&
        secondPressTime - timesOfBackPress.current < AppConfigs.iddleTimeBackPressExitApp
      ) {
        RNExitApp.exitApp();
      } else {
        GlobalLib.Toast.get().toastWarning(i18n.t('warningMsg.doublePressExit'));
      }
      timesOfBackPress.current = secondPressTime;
      return true;
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
    }
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      }
    };
  }, [isFocused]);
}

function useOnBackButtonPress(callback) {
  const isFocused = useIsFocused();

  useEffect(() => {
    const backButtonHandler = () => {
      if (!isFocused) {
        return false;
      }

      const menuModal = GlobalLib?.MenuModal?.get();
      if (menuModal?.isOpened()) {
        menuModal?.hide();
        return true;
      }

      const optiModal = GlobalLib?.OptiModal?.get();
      if (optiModal?.isOpened()) {
        optiModal?.hide();
        return true;
      }

      const customModal = GlobalLib?.CustomModal?.get();
      if (customModal?.isOpened()) {
        customModal?.hide();
        return true;
      }

      typeof callback === 'function' && callback();
      return true;
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
    }
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      }
    };
  }, [callback, isFocused]);
}

export { BackHandlerConsumer, withBackHandler, useOnBackScreenHandler };
export { ExitAppHandlerConsumer, withExitAppHandler, useOnExitAppHandler };
export { useOnBackButtonPress };
