import TouchableField from 'components/basics/TouchableField';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View, StyleProp, ViewStyle } from 'react-native';
import Swipeable, { SwipeableProps } from 'react-native-gesture-handler/Swipeable';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

import themedStyles from './style';

const i18nScope = 'components.cardItem';

const CardItemWithEditDelete = ({
  children,
  containerStyle = {},
  onUpdate = () => {},
  onDelete = () => {},
}) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-200, 0],
      outputRange: [1, 0],
    });
    return (
      <View style={styles.actionRow}>
        <TouchableField style={styles.updateContainer} onPress={onUpdate}>
          <Animated.Text
            style={[
              styles.text,
              {
                transform: [
                  {
                    scale,
                  },
                ],
              },
            ]}>
            {t(`${i18nScope}.update`) as string}
          </Animated.Text>
        </TouchableField>
        <TouchableField style={styles.deleteContainer} onPress={onDelete}>
          <Animated.Text
            style={[
              styles.text,
              {
                transform: [
                  {
                    scale,
                  },
                ],
              },
            ]}>
            {t(`${i18nScope}.delete`) as string}
          </Animated.Text>
        </TouchableField>
      </View>
    );
  };
  return (
    <Swipeable
      friction={1.6}
      useNativeAnimations
      containerStyle={containerStyle}
      shouldCancelWhenOutside
      renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};

interface ICardItemWithTrashIcon extends SwipeableProps {
  children: React.ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  trashIconContainerStyle?: StyleProp<ViewStyle>;
  onDelete?: () => void;
  onSwipeOpenBegan?: () => void;
  swipeDisabled?: boolean;
}

export const CardItemWithTrashIcon = forwardRef(
  (
    {
      children,
      disabled = false,
      containerStyle = {},
      trashIconContainerStyle = {},
      onDelete = () => {},
      onSwipeOpenBegan = () => {},
      swipeDisabled,
      ...rest
    }: ICardItemWithTrashIcon,
    ref?: React.LegacyRef<Swipeable>,
  ) => {
    const styles = useThemedStyle(themedStyles);
    const renderRightActions = useCallback(
      (progress, dragX) => {
        const translateX = dragX.interpolate({
          inputRange: [-40, 0],
          outputRange: [0, -40],
          extrapolateLeft: 'clamp',
        });
        return (
          <Animated.View style={[trashIconContainerStyle, { transform: [{ translateX }] }]}>
            <TouchableField
              style={[styles.deleteTrashTouchableField, disabled && styles.disabledDelete]}
              disabled={disabled}
              onPress={onDelete}>
              <View style={[styles.deleteTrashIconContainer, disabled && styles.disabledDelete]}>
                <FontAwesome5Icon
                  name="trash-alt"
                  size={styles.deleteTrashIcon.size}
                  color={styles.deleteTrashIcon.color}
                />
              </View>
            </TouchableField>
          </Animated.View>
        );
      },
      [onDelete, styles, disabled, trashIconContainerStyle],
    );

    return (
      <Swipeable
        ref={ref}
        friction={1.6}
        useNativeAnimations
        containerStyle={containerStyle}
        renderRightActions={renderRightActions}
        shouldCancelWhenOutside
        onBegan={onSwipeOpenBegan}
        enableTrackpadTwoFingerGesture
        enabled={!swipeDisabled}
        {...rest}>
        {children}
      </Swipeable>
    );
  },
);

export const CardItemWithArchiveIcon = forwardRef(
  (
    {
      children,
      disabled = false,
      containerStyle = {},
      trashIconContainerStyle = {},
      onDelete = () => {},
      onSwipeOpenBegan = () => {},
      swipeDisabled,
      ...rest
    }: ICardItemWithTrashIcon,
    ref?: React.LegacyRef<Swipeable>,
  ) => {
    const styles = useThemedStyle(themedStyles);
    const renderRightActions = useCallback(
      (progress, dragX) => {
        const translateX = dragX.interpolate({
          inputRange: [-40, 0],
          outputRange: [0, -40],
          extrapolateLeft: 'clamp',
        });
        return (
          <Animated.View style={[trashIconContainerStyle, { transform: [{ translateX }] }]}>
            <TouchableField
              style={[styles.archiveTouchableField, disabled && styles.disabledDelete]}
              disabled={disabled}
              onPress={onDelete}>
              <View style={[styles.archiveIconContainer, disabled && styles.disabledDelete]}>
                <FontAwesome5Icon
                  name="archive"
                  size={styles.deleteTrashIcon.size}
                  color={styles.deleteTrashIcon.color}
                />
              </View>
            </TouchableField>
          </Animated.View>
        );
      },
      [onDelete, styles, disabled, trashIconContainerStyle],
    );

    return (
      <Swipeable
        ref={ref}
        friction={1.6}
        useNativeAnimations
        containerStyle={containerStyle}
        renderRightActions={renderRightActions}
        shouldCancelWhenOutside
        onBegan={onSwipeOpenBegan}
        enableTrackpadTwoFingerGesture
        enabled={!swipeDisabled}
        {...rest}>
        {children}
      </Swipeable>
    );
  },
);

export default CardItemWithEditDelete;
