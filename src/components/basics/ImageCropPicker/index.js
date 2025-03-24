/**
 *
 * ImagePickerModal
 *
 */

import { GlobalLib, PermissionLib } from 'libs';
import { first, isFunction, last, merge } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import { clean, openCamera, openPicker } from 'react-native-image-crop-picker';

const DEFAULT_OPTIONS = {
  image: {
    cropping: true,
    includeBase64: false,
    includeExif: false,
    freeStyleCropEnabled: true,
    cropperCircleOverlay: false,
    mediaType: 'photo',
    forceJpg: true,
  },
  multiple: {
    multiple: true,
  },
  camera: {
    includeBase64: false,
    cropping: true,
    freeStyleCropEnabled: true,
    useFrontCamera: false,
    mediaType: 'photo',
    forceJpg: true,
  },
};

const transformImages = (images = []) => {
  const image = first(images);
  const path = image?.path || '';
  const fileName = first(last(path.split('/')).split('.')) + '.jpg';
  return images.map(i => ({ ...i, uuidFileName: fileName }));
};

const ImageCropPicker = (props, ref) => {
  /**
   * @return list selected images
   */
  const launchSelectImagesPicker = useCallback(async ({ multiple, option, onConfirm }) => {
    const grant = await PermissionLib.requestStoragePermission(true);
    if (!grant) {
      return [];
    }
    const configs = multiple ? DEFAULT_OPTIONS.multiple : merge(option, DEFAULT_OPTIONS.image);
    openPicker(configs)
      .then(images => {
        const result = multiple ? images : [images];
        isFunction(onConfirm) && onConfirm(transformImages(result));
      })
      .catch(error => {
        if (error.message) {
          GlobalLib.Toast.get().toastWarning(error.message);
        }
      });
  }, []);

  /**
   * @returns only image
   */
  const launchCamera = useCallback(async ({ option, onConfirm = () => {} }) => {
    const grant = await PermissionLib.requestCameraPermission(true);
    if (!grant) {
      return [];
    }
    const config = merge(option, DEFAULT_OPTIONS.camera);
    openCamera(config)
      .then(image => {
        const result = [image];
        isFunction(onConfirm) && onConfirm(transformImages(result));
      })
      .catch(error => {
        if (error.message) {
          GlobalLib.Toast.get().toastWarning(error.message);
        }
      });
  }, []);

  /**
   * Customize the instance value that is exposed to parent components when using `ref`
   */
  useImperativeHandle(
    ref,
    () => ({
      launchCamera,
      launchSelectImagesPicker,
    }),
    [launchSelectImagesPicker, launchCamera],
  );

  useEffect(() => {
    return () => {
      clean();
    };
  }, []);

  return null;
};
export default React.forwardRef(ImageCropPicker);
