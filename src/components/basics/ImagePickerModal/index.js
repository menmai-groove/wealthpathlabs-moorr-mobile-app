/**
 *
 * ImagePickerModal
 *
 */

import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { GlobalLib, PermissionLib } from 'libs';
import { isFunction } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';

import themedStyles from './style';

const actions = [
  {
    title: 'Take Image',
    type: 'capture',
    options: {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false,
    },
    visible: true,
  },
  {
    title: 'Select Image',
    type: 'library',
    options: {
      maxHeight: 200,
      maxWidth: 200,
      selectionLimit: 0,
      mediaType: 'photo',
      includeBase64: false,
    },
    visible: true,
  },
  {
    title: 'Take Video',
    type: 'capture',
    options: {
      saveToPhotos: true,
      mediaType: 'video',
    },
    visible: false,
  },
  {
    title: 'Select Video',
    type: 'library',
    options: {
      selectionLimit: 0,
      mediaType: 'video',
    },
    visible: false,
  },
  {
    title: 'Select Image or Video\n(mixed)',
    type: 'library',
    options: {
      selectionLimit: 0,
      mediaType: 'mixed',
    },
    visible: true,
  },
];

const options = actions
  .filter(a => a.visible)
  .map(a => a.title)
  .concat('Cancel');

const initialState = {
  title: '',
  message: '',
  destructiveButtonIndex: 0,
  style: {
    container: undefined,
    title: undefined,
    content: undefined,
    topComponent: undefined,
    buttonYesContainer: undefined,
    buttonNoContainer: undefined,
    buttonYesText: undefined,
    buttonNoText: undefined,
  },
  onSetResponse: () => {},
  onCancel: () => {},
};

const ImagePickerModal = (props, ref) => {
  const styles = useThemedStyle(themedStyles, 'components.imagePickerModal');
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);
  const [visibility, setVisibility] = useState(false);
  const [states, setStates] = useState(initialState);

  /**
   *
   * @param {Function} params.onSetResponse Callback invoked when set response manually
   */
  const show = params => {
    setVisibility(true);
    setStates(prevState => ({
      ...prevState,
      ...params,
    }));
  };

  const hide = () => {
    setVisibility(false);
    setStates(initialState);
  };

  useEffect(() => {
    if (closeModalsRefreshId) {
      hide();
    }
  }, [closeModalsRefreshId]);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      show,
    }),
    [],
  );

  const onCancel = () => {
    return new Promise((res, rej) => {
      try {
        hide();
        isFunction(states.onCancel) && states.onCancel();
        res(true);
      } catch (error) {
        rej(error);
      }
    });
  };

  const onButtonPress = useCallback(
    (type, opts) => {
      if (type === 'capture') {
        const listPermissions = [];
        listPermissions.push(PermissionLib.requestCameraPermissionAlways());
        Promise.all(listPermissions).finally(() => {
          launchCamera(opts, response => {
            if (!response.didCancel) {
              if (response.error) {
                GlobalLib.Toast.get().toastWarning(response.error);
              } else {
                isFunction(states.onSetResponse) && states.onSetResponse(response);
              }
            }
          });
        });
      } else {
        const listPermissions = [];
        listPermissions.push(PermissionLib.requestStoragePermissionAlways());
        Promise.all(listPermissions).finally(() => {
          launchImageLibrary(options, response => {
            if (!response.didCancel) {
              if (response.error) {
                GlobalLib.Toast.get().toastWarning(response.error);
              } else {
                isFunction(states.onSetResponse) && states.onSetResponse(response);
              }
            }
          });
        });
      }
    },
    [states],
  );

  return (
    <Modal
      visible={visibility}
      onBackdropPress={onCancel}
      onRequestClose={onCancel}
      animationType="fade"
      transparent={true}
      useNativeDriver={true} // try adding This line
    >
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isNearLast = index === options.length - 2;
            const isLast = index === options.length - 1;
            const isDestructive = index === states.destructiveButtonIndex;
            return (
              <TouchableField
                key={index}
                style={[
                  styles.actionSheetView,
                  isFirst && styles.firstAction,
                  isNearLast && styles.nearLastAction,
                  isLast && styles.lastAction,
                ]}
                onPress={async () => {
                  await onCancel();
                  if (!isLast) {
                    const { type, options: opts } = actions.filter(a => a.visible)[index];
                    setTimeout(() => {
                      onButtonPress(type, opts);
                    }, 200);
                  }
                }}>
                <TextField
                  style={[
                    styles.actionSheetText,
                    isDestructive && styles.destructiveActionText,
                    isLast && styles.lastActionText,
                  ]}
                  numberOfLines={1}>
                  {option}
                </TextField>
              </TouchableField>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default forwardRef(ImagePickerModal);
