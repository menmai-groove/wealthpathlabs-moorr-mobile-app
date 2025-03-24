/**
 *
 */
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, FlatList, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import EnIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import { AppStyle } from 'theme';

import themedStyles from './style';

const MAXIMUM_MESSAGES = 10;
const DURATION = 400;
const TIMEOUT = 4000;
const TOAST_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

const initialState = {
  messages: [],
};

const Toast = ({ limit = MAXIMUM_MESSAGES, componentStyle, style }, ref) => {
  const messages = useRef([]);
  const insets = useSafeAreaInsets();
  const [states, setStates] = useState(initialState);

  const convertedStyle = mergeArrayObjectIntoObject(componentStyle);
  const themeStyles = useThemedStyle({ ...themedStyles, ...convertedStyle }, 'components.toast');

  useEffect(
    () => () => {
      messages.current?.forEach(item => clearTimeout(item.timeout));
    },
    [],
  );

  /**
   * Remove a toast message from the messages list shown in app by ID
   * @param {uuid} messageID
   */
  const remove = useCallback((messageID, duration) => {
    let index = messages.current.findIndex(item => item.ID === messageID);
    if (index >= 0 && index < messages.current.length) {
      Animated.timing(messages.current[index].fadeAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => {
        index = messages.current.findIndex(item => item.ID === messageID);
        messages.current.splice(index, 1);
        setStates({ messages: [...messages.current] });
      });
    }
  }, []);

  /**
   * Add a toast message to the messages list shown in app
   * by passing message content and type of toast
   * @param {String} message: Message content
   * @param {String} type: Type of toast: info | error | success | warning
   */
  const add = useCallback(
    (message, type) => {
      if (!message) {
        return;
      }
      const newItem = {
        ID: uuid.v4(),
        message: message,
        type: type,
        fadeAnim: new Animated.Value(0),
      };
      Animated.timing(newItem.fadeAnim, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }).start();

      const index = messages.current.findIndex(m => m.message === message && m.type === type);

      if (index > -1) {
        messages.current.splice(index, 1);
      }

      newItem.timeout = setTimeout(() => {
        remove(newItem.ID, DURATION);
      }, TIMEOUT);

      messages.current.unshift(newItem);
      messages.current
        .splice(limit, messages.current.length - limit)
        .forEach(item => clearTimeout(item.timeout));
      setStates({ messages: [...messages.current] });
    },
    [limit, remove],
  );

  /**
   * Show Success toast
   * @param {String} message: Message content
   */
  const toastSuccess = useCallback(
    message => {
      add(message, TOAST_TYPES.SUCCESS);
    },
    [add],
  );

  /**
   * Show Info toast
   * @param {String} message: Message content
   */
  const toastInfo = useCallback(
    message => {
      add(message, TOAST_TYPES.INFO);
    },
    [add],
  );

  /**
   * Show Warning toast
   * @param {String} message: Message content
   */
  const toastWarning = useCallback(
    message => {
      add(message, TOAST_TYPES.WARNING);
    },
    [add],
  );

  /**
   * Show Error toast
   * @param {String} message: Message content
   */
  const toastError = useCallback(
    message => {
      add(message, TOAST_TYPES.ERROR);
    },
    [add],
  );

  const onClose = item => {
    clearTimeout(item.timeout);
    remove(item.ID, DURATION);
  };

  useImperativeHandle(
    ref,
    () => ({
      toastSuccess,
      toastInfo,
      toastWarning,
      toastError,
    }),
    [toastError, toastInfo, toastSuccess, toastWarning],
  );

  const getViewStyle = type => {
    let viewStyle;
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        viewStyle = {
          ...themeStyles.messageSuccess,
          backgroundColor: themeStyles.messageSuccess.backgroundColor,
        };
        break;
      case TOAST_TYPES.INFO:
        viewStyle = {
          ...themeStyles.messageInfo,
          backgroundColor: themeStyles.messageInfo.backgroundColor,
        };
        break;
      case TOAST_TYPES.WARNING:
        viewStyle = {
          ...themeStyles.messageWarning,
          backgroundColor: themeStyles.messageWarning.backgroundColor,
        };
        break;
      case TOAST_TYPES.ERROR:
        viewStyle = {
          ...themeStyles.messageError,
          backgroundColor: themeStyles.messageError.backgroundColor,
        };
        break;
    }
    return viewStyle;
  };

  const getTextStyle = type => {
    let textStyle = { ...themeStyles.messageContent };
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        textStyle.color = themeStyles.messageSuccess.color;
        break;
      case TOAST_TYPES.INFO:
        textStyle.color = themeStyles.messageInfo.color;
        break;
      case TOAST_TYPES.WARNING:
        textStyle.color = themeStyles.messageWarning.color;
        break;
      case TOAST_TYPES.ERROR:
        textStyle.color = themeStyles.messageError.color;
        break;
    }
    return textStyle;
  };

  const renderIcon = type => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <View style={themeStyles.messageIconView}>
            <FAIcon name="check-circle" size={23} color={themeStyles.messageSuccess.color} />
          </View>
        );
      case TOAST_TYPES.INFO:
        return (
          <View style={themeStyles.messageIconView}>
            <FA5Icon name="info-circle" size={20} color={themeStyles.messageInfo.color} />
          </View>
        );
      case TOAST_TYPES.WARNING:
        return (
          <View style={themeStyles.messageIconView}>
            <EnIcon name="warning" size={20} color={themeStyles.messageWarning.color} />
          </View>
        );
      case TOAST_TYPES.ERROR:
        return (
          <View style={themeStyles.messageIconView}>
            <EnIcon name="circle-with-cross" size={20} color={themeStyles.messageError.color} />
          </View>
        );
      default:
        return <View />;
    }
  };

  const renderToast = ({ item }) => {
    const { message, type, fadeAnim } = item;

    const handleActivated = itemInput => {
      clearTimeout(itemInput.timeout);
      remove(itemInput.ID, DURATION);
    };

    return (
      <Swipeable
        useNativeAnimations
        rightThreshold={1}
        renderRightActions={() => <View style={AppStyle.flex1} />}
        onActivated={() => handleActivated(item)}>
        <TouchableField
          activeOpacity={1}
          onPress={() => onClose(item)}
          style={themeStyles.messageWrapper}>
          <Animated.View
            style={[themeStyles.messageContainer, getViewStyle(type), { opacity: fadeAnim }]}>
            {renderIcon(type)}
            <View style={themeStyles.flex1}>
              <TextField style={getTextStyle(type)}>{message}</TextField>
            </View>
          </Animated.View>
        </TouchableField>
      </Swipeable>
    );
  };

  if (!states.messages.length) {
    return null;
  }

  return (
    <View
      style={[
        themeStyles.container,
        style,
        {
          top: insets.top,
        },
      ]}>
      <FlatList
        scrollEnabled={false}
        data={states.messages}
        renderItem={renderToast}
        keyExtractor={item => `toast-${item.ID}`}
      />
    </View>
  );
};

export default forwardRef(Toast);
