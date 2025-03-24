import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Pressable, Platform, Modal } from 'react-native';
import TouchableField from 'components/basics/TouchableField';
import TextField from 'components/basics/TextField';
import TrashIcon from 'assets/svgs/trashIcon';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { GlobalLib } from 'libs';
import { Image as ImageCropPickerProps } from 'react-native-image-crop-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import AIcon from 'react-native-vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//
import { useTranslation } from 'react-i18next';
import { useThemedStyle } from 'providers';
import { isEmpty, isFunction } from 'lodash';
import { AppConstants } from 'constant';
import { AppStyle, AppSize } from 'theme';

import { SelectedImageOrIconItem, NamedStyles, IconData, SELECTED_ITEM_TYPE } from '../constants';

import { IconPicker } from './IconPicker';

const i18nScope = 'screens.personalGoal.addPersonalGoal';
interface IPhotoIconPicker {
  style?: object;
  onChange?: (e: SelectedImageOrIconItem) => void;
  imageInfo: SelectedImageOrIconItem;
}

const isIOS = Platform.OS === 'ios';
const getPathFile = (path = '') => (isIOS && path ? 'file://' : '') + path;

export function PhotoIconPicker({ style, imageInfo, onChange }: IPhotoIconPicker) {
  const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
  const insets = useSafeAreaInsets();
  // const
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);
  const { isPhotoFromServer, isPhotoFromPicker } = useMemo(
    () => ({
      isPhotoFromServer: Boolean(
        imageInfo?.data.uri && imageInfo.data.type === SELECTED_ITEM_TYPE[0],
      ),
      isPhotoFromPicker: Boolean(imageInfo?.type === SELECTED_ITEM_TYPE[0] && imageInfo.data?.path),
    }),
    [imageInfo],
  );
  const photoUri = isPhotoFromServer ? imageInfo?.data.uri : getPathFile(imageInfo?.data.path);
  const iconUri = useMemo(() => {
    let icon = AppConstants.listIconGoal.find(
      ic => ic.uuidFileName === imageInfo?.data?.uuidFileName,
    );
    return icon?.source;
  }, [imageInfo]);

  const [aspectRatio, setAspectRatio] = useState(1);
  const [imageViewVisible, setImageViewVisible] = useState(false);

  useEffect(() => {
    if (imageInfo) {
      isFunction(onChange) && onChange(imageInfo);
    }
  }, [imageInfo, onChange]);

  function onTakePhoto() {
    GlobalLib.ImageCropPicker.get().launchCamera({
      onConfirm: (images: ImageCropPickerProps[]) => {
        onChange({
          type: SELECTED_ITEM_TYPE[0],
          data: images[0],
        });
      },
    });
  }
  function onSelectPhoto() {
    GlobalLib.ImageCropPicker.get().launchSelectImagesPicker({
      onConfirm: (images: ImageCropPickerProps[]) => {
        isFunction(onChange) &&
          onChange({
            type: SELECTED_ITEM_TYPE[0],
            data: images[0],
          });
      },
    });
  }
  function onSelectAnIcon() {
    GlobalLib.CustomModal.get().show({
      onBackButtonPress: () => GlobalLib.CustomModal.get().hide(),
      body: (
        <IconPicker
          onChange={(asset: IconData) => {
            isFunction(onChange) && onChange({ type: SELECTED_ITEM_TYPE[1], data: asset });
          }}
        />
      ),
    });
  }

  return (
    <View>
      <View style={AppStyle.marginTop20}>
        <TextField type="heading-4">{t('addPhotoIcon')}</TextField>
        {!imageInfo ? (
          <View style={styles.buttons}>
            <TouchableField style={styles.card} onPress={onTakePhoto}>
              <Image source={require('assets/images/common/camera.png')} style={styles.image} />
              <TextField type="captain">{t('takePhoto')}</TextField>
            </TouchableField>
            <TouchableField style={styles.card} onPress={onSelectPhoto}>
              <Image source={require('assets/images/common/picture.png')} style={styles.image} />
              <TextField type="captain">{t('selectPhoto')}</TextField>
            </TouchableField>
            <TouchableField style={styles.card} onPress={onSelectAnIcon}>
              <Image source={require('assets/images/common/home.png')} style={styles.image} />
              <TextField type="captain">{t('selectIcon')}</TextField>
            </TouchableField>
          </View>
        ) : (
          <View style={[AppStyle.selfAlignCenter, AppStyle.marginY20]}>
            <Pressable
              onPress={() => setImageViewVisible(true)}
              style={[styles.selectedImage, styles.photoBg, AppStyle.alignContent]}>
              {(isPhotoFromServer || isPhotoFromPicker) && photoUri && (
                <Image
                  onLoad={e => {
                    setAspectRatio(e.nativeEvent.source.width / e.nativeEvent.source.height);
                  }}
                  source={{ uri: photoUri }}
                  style={[styles.photo, { aspectRatio }]}
                  resizeMode="contain"
                />
              )}

              {!isEmpty(iconUri) && (
                <View style={[styles.wrapperIcon, AppStyle.middleContent]}>
                  <Image
                    source={{ uri: iconUri }}
                    style={styles.selectIcon}
                    resizeMode={'contain'}
                  />
                </View>
              )}
            </Pressable>
            {/* delete button */}
            <TouchableField style={styles.btnDeleteWrapper} onPress={() => onChange(null)}>
              <View style={styles.btnDelete}>
                <TrashIcon />
              </View>
            </TouchableField>
          </View>
        )}
      </View>
      <Modal
        visible={imageViewVisible}
        transparent={true}
        statusBarTranslucent
        style={styles.modal}>
        <ImageViewer
          renderHeader={() => {
            return (
              <TouchableField
                style={[styles.closeButton, { top: insets.top + 15 }]}
                onPress={() => setImageViewVisible(false)}>
                <AIcon name={'close'} size={28} color={'white'} />
              </TouchableField>
            );
          }}
          renderIndicator={() => null}
          imageUrls={[{ url: photoUri || iconUri }]}
          onSwipeDown={() => setImageViewVisible(false)}
          enableSwipeDown
          backgroundColor={'rgba(0,0,0,0.9)'}
        />
      </Modal>
    </View>
  );
}

const themedStyles: NamedStyles = {
  card: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    paddingBottom: 15,
    borderStyle: 'dashed',
    borderColor: 'palette.color-line-3',
    borderRadius: 10,
  },
  buttons: mergeArrayObjectIntoObject([
    AppStyle.padY20,
    AppStyle.rowFlex,
    AppStyle.spaceBetweenContent,
  ]),
  image: {
    height: 24,
    width: 28,
    marginVertical: 20,
    marginHorizontal: 35,
  },
  photo: {
    width: 225,
    maxWidth: 225,
    maxHeight: 225,
  },
  selectedImage: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'palette.color-white-4',
  },
  wrapperIcon: {
    width: 225,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'palette.color-white-4',
  },
  photoBg: {
    backgroundColor: 'palette.color-grey-8',
  },
  selectIcon: {
    width: 60,
    height: 60,
  },
  btnDelete: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'palette.color-red-2',
    borderRadius: 99,
  },
  btnDeleteWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF80',
    borderRadius: 99,
  },
  previewImage: {
    width: AppSize.screen.width,
    maxWidth: AppSize.screen.width,
    maxHeight: AppSize.screen.height,
  },
  previewIcon: {
    width: 200,
    height: 200,
  },
  backdropModal: {
    backgroundColor: 'black',
    opacity: 0.85,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 2,
  },
};
