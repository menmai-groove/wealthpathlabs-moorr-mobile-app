/**
 *
 * Header
 *
 */

import React from 'react';
import BackIcon from 'assets/svgs/backIcon';
import BellIcon from 'assets/svgs/bellIcon';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { NavigationServiceLib } from 'libs';
import { isFunction } from 'lodash';
import { useThemedStyle } from 'providers';
import { Image, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectTotalBadge } from 'store/Notification/selector';
import { AppStyle } from 'theme';
import { AppScreenID } from 'constant';
import Badge from 'components/basics/Badge';
import { selectAppPreference } from 'store/Root/selector';
import { useRingingAnimation } from 'libs/hooks';

import themedStyles from './style';

const i18nScope = 'components.header';

interface BackHeaderProps {
  onBackHeader?: () => void;
  backIconColor?: string;
}
interface HomeRightHeader {
  iconColor: string;
  onPress?: () => void;
  renderInfoIcon?: () => React.ReactElement | null | undefined;
}
interface HeaderProps {
  type: 'back' | 'auth' | 'notification' | 'none' | 'full';
  title?: string;
  titleBackground?: boolean;
  withLogo?: boolean;
  background?: boolean;
  style?: object;
  onBackHeader?: () => void;
  numberOfLines?: number;
  backIconColor?: string;
  renderInfoIcon?: () => React.ReactElement | null | undefined;
}

const BackHeader = ({ onBackHeader, backIconColor }: BackHeaderProps) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  return (
    <TouchableField
      style={[styles.defaultHeader, AppStyle.flex1]}
      onPress={isFunction(onBackHeader) ? onBackHeader : NavigationServiceLib.pop}>
      <BackIcon color={backIconColor} />
    </TouchableField>
  );
};

const HomeRightHeader = ({ iconColor, onPress = () => {}, renderInfoIcon }: HomeRightHeader) => {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const unreadNotification = useSelector(selectTotalBadge);
  const { maxBadge } = useSelector(selectAppPreference);
  const rotation = useRingingAnimation(15, 100, 5000);

  return (
    <View
      style={[AppStyle.rowFlex, AppStyle.alignContent, AppStyle.flexEndContent, AppStyle.padX20]}>
      {typeof renderInfoIcon === 'function' && renderInfoIcon()}
      <TouchableField onPress={onPress}>
        <Badge contentStyle={[styles.bellContainer]} count={unreadNotification} max={maxBadge}>
          <Animated.View
            style={[
              unreadNotification > 0 && {
                transform: [
                  {
                    rotate: rotation,
                  },
                ],
              },
            ]}>
            <BellIcon color={iconColor} />
          </Animated.View>
        </Badge>
      </TouchableField>
    </View>
  );
};

function Header(props: HeaderProps) {
  const {
    type,
    title,
    titleBackground = true,
    withLogo,
    background = true,
    style,
    onBackHeader,
    numberOfLines = 1,
    backIconColor,
    renderInfoIcon,
  } = props;
  const insets = useSafeAreaInsets();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const backgroundColor = background ? styles.safeView.backgroundColor : 'transparent';
  const titleBackgroundColor = titleBackground ? styles.container.backgroundColor : 'transparent';
  const textColor = titleBackground ? styles.text.color : styles.whiteText.color;
  const iconColor = titleBackground ? styles.bell.color : styles.whiteBell.color;

  return (
    <View style={[AppStyle.rowFlex, styles.safeView, { backgroundColor, paddingTop: insets.top }]}>
      <View
        style={[
          AppStyle.flex1,
          AppStyle.rowFlex,
          AppStyle.alignContent,
          styles.container,
          {
            backgroundColor: titleBackgroundColor,
          },
          style,
        ]}>
        <View style={styles.leftComponent}>
          {['back', 'full'].includes(type) && (
            <BackHeader onBackHeader={onBackHeader} backIconColor={backIconColor} />
          )}
        </View>

        <View style={[AppStyle.flex1, AppStyle.alignContent]}>
          {['back', 'auth', 'none', 'full'].includes(type) &&
            (withLogo ? (
              <Image source={require('assets/images/secondary-logo-2.png')} style={styles.logo} />
            ) : (
              <TextField
                type="heading-2"
                font="semi-bold"
                style={[
                  styles.text,
                  {
                    color: textColor,
                  },
                ]}
                numberOfLines={numberOfLines}>
                {title}
              </TextField>
            ))}
        </View>

        <View style={styles.rightComponent}>
          {['auth', 'full', 'notification'].includes(type) && (
            <HomeRightHeader
              iconColor={iconColor}
              onPress={() => NavigationServiceLib.navigate(AppScreenID.Notification)}
              renderInfoIcon={renderInfoIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default Header;
