import React, { memo } from 'react';
import moment from 'moment';
import isEqual from 'react-fast-compare';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { formatCurrency, hexToRGBA } from 'libs/util';
import { useThemedStyle } from 'providers';
import { View, ViewStyle, TextStyle, ImageStyle, Image } from 'react-native';
import { AppStyle } from 'theme';
import { useTranslation } from 'react-i18next';
import AchieveSignatureIcon from 'assets/svgs/achieveSignatureIcon';
import { AppConstants } from 'constant';
import FastImage from 'react-native-fast-image';
import CustomImage from 'components/basics/CustomImage';
import Condition from 'components/basics/Condition';
import { isEmpty } from 'lodash';
import { DEFAULT_COLOR } from 'screens/AddPersonalGoal/constants';

const i18nScope = 'screens.personalGoal.verticalTimeline';

export type IGoalCardItemProps = {
  _id: string;
  colour: string;
  photo: string;
  photoUrl: string;
  icon: string;
  description: string;
  value: number;
  isAchieved: boolean;
  dueDate: string;
};

export const GoalCard = memo(
  function GoalCard({
    item,
    onPress,
  }: {
    item: IGoalCardItemProps;
    onPress?: (item) => () => void;
  }) {
    const { t } = useTranslation(AppConstants.defaultLanguageNamespace, { keyPrefix: i18nScope });
    const styles = useThemedStyle(themedStyle, i18nScope);
    const colour = (item.isAchieved && styles.disabled.color) || item.colour || DEFAULT_COLOR;
    const opacity = item.isAchieved ? 0.7 : 1;
    const backgroundColor = hexToRGBA(colour, 0.1);
    const iconBackgroundColor =
      moment(item.dueDate).get('year') < new Date().getFullYear()
        ? styles.disabled.color
        : styles.achieveIcon.color;

    const renderHeader = () => {
      if (!isEmpty(item.icon)) {
        let icon = AppConstants.listIconGoal.find(ic => ic.uuidFileName === item.icon);
        if (icon) {
          return (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: icon.source }}
                style={styles.icon}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          );
        }
      }
      if (isEmpty(item.icon) && item.photoUrl) {
        return (
          <View style={styles.imageWrapper}>
            <CustomImage source={{ uri: item.photoUrl }} style={styles.image} />
          </View>
        );
      }
      return <View />;
    };

    return (
      <TouchableField onPress={onPress(item)} activeOpacity={0.8} style={styles.itemWrapper}>
        <View style={[styles.item, { backgroundColor, borderLeftColor: colour, opacity }]}>
          {renderHeader()}
          <View
            style={[
              AppStyle.flex1,
              AppStyle.justifyContent,
              AppStyle.marginX15,
              AppStyle.marginY10,
            ]}>
            <TextField
              type="paragraph-2"
              numberOfLines={2}
              font="medium"
              style={AppStyle.padBottom3}>
              {item.description}
            </TextField>
            {!!item.value && (
              <TextField type="captain">
                {t('valueDescription', { value: formatCurrency(item.value) })}
              </TextField>
            )}
          </View>
        </View>
        {item.isAchieved && (
          <View style={styles.rightImage}>
            <AchieveSignatureIcon color={iconBackgroundColor} />
          </View>
        )}
      </TouchableField>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);

type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };

const themedStyle: NamedStyles = {
  disabled: {
    color: 'palette.color-grey-8',
  },
  achieveIcon: {
    color: 'palette.color-green-2',
  },
  imageWrapper: {
    borderRadius: 99,
    width: 40,
    height: 40,
    margin: 15,
    marginRight: 0,
    backgroundColor: 'palette.color-white-1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: 20,
    height: 20,
  },
  image: {
    borderRadius: 99,
    width: 40,
    height: 40,
  },
  statusBox: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  statusText: {
    color: 'palette.color-green-1',
  },
  bottomLine: {
    backgroundColor: 'palette.color-dynamic-line',
    height: 2,
    width: '100%',
    marginTop: 20,
  },
  floatingBtn: {
    position: 'absolute',
  },
  indicatorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    color: 'palette.color-primary-1',
  },
  //
  item: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  itemWrapper: {
    marginLeft: 50,
    marginRight: 15,
    marginVertical: 5,
  },

  rightImage: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    top: 0,
    right: 12,
    marginRight: 15,
  },
  achieve: {
    height: 48,
    width: 48,
  },
};
