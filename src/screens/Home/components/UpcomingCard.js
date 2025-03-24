import CustomCard from 'components/basics/CustomCard';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants } from 'constant';
import { formatCurrency, hexToRGBA } from 'libs/util';
import { isEmpty, isNil } from 'lodash';
import moment from 'moment';
import { useThemedStyle } from 'providers';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { DEFAULT_COLOR } from 'screens/AddPersonalGoal/constants';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.home';

const UpcomingCard = props => {
  const { data, onPress } = props;

  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles);

  const colour = data.colour || DEFAULT_COLOR;
  const opacity = 1;
  const backgroundColor = hexToRGBA(colour, 0.1);

  const renderWithOnlyContent = useCallback(
    () => (
      <View
        style={[
          styles.itemGoal,
          AppStyle.rowFlex,
          AppStyle.alignContent,
          { backgroundColor, borderLeftColor: colour, opacity },
        ]}>
        <View style={[AppStyle.flex1, AppStyle.marginY15, AppStyle.marginLeft10]}>
          <TextField type="heading-3" numberOfLines={1}>
            {data.description}
          </TextField>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.padRight10]}>
            <TextField type="heading-4" font="regular" numberOfLines={1} style={AppStyle.flex1}>
              {moment(data.date).format('Do MMMM YYYY')}
            </TextField>
            {!isNil(data.value) && data.value !== 0 && (
              <TextField
                type="heading-4"
                font="regular"
                style={[AppStyle.flex1, AppStyle.textRight]}>
                {t(`${i18nScope}.valueDescription`, {
                  value: formatCurrency(data.value),
                })}
              </TextField>
            )}
          </View>
        </View>
      </View>
    ),
    [colour, backgroundColor, data, styles, t],
  );
  const renderWithIcon = useCallback(() => {
    let icon = AppConstants.listIconGoal.find(ic => ic.uuidFileName === data.icon);
    if (isEmpty(icon)) {
      return <View />;
    }
    return (
      <View
        style={[
          styles.itemGoal,
          AppStyle.rowFlex,
          AppStyle.alignContent,
          { backgroundColor, borderLeftColor: colour, opacity },
        ]}>
        <View style={styles.iconGoalWrapper}>
          <Image
            key={'icon'}
            source={{ uri: icon.source }}
            style={[styles.iconGoal]}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={[AppStyle.flex1, AppStyle.marginLeft10]}>
          <TextField type="heading-3" numberOfLines={1}>
            {data.description}
          </TextField>
          <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.padRight10]}>
            <TextField type="heading-4" font="regular" numberOfLines={1} style={AppStyle.flex1}>
              {moment(data.date).format('Do MMMM YYYY')}
            </TextField>
            {!isNil(data.value) && data.value !== 0 && (
              <TextField
                type="heading-4"
                font="regular"
                style={[AppStyle.flex1, AppStyle.textRight]}>
                {t(`${i18nScope}.valueDescription`, {
                  value: formatCurrency(data.value),
                })}
              </TextField>
            )}
          </View>
        </View>
      </View>
    );
  }, [backgroundColor, colour, data, styles, t]);
  const renderWithImage = useCallback(
    () => (
      <View style={[styles.itemGoal, styles.heightItemGoal, { borderLeftColor: colour, opacity }]}>
        <View style={[AppStyle.flex1, AppStyle.flexEndContent]}>
          <FastImage
            key={'image'}
            source={{ uri: data.photoUrl, priority: FastImage.priority.high }}
            style={styles.imageBackgroundGoal}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.containerGoal}>
            <TextField type="heading-3" numberOfLines={1}>
              {data.description}
            </TextField>
            <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
              <TextField type="heading-4" font="regular" numberOfLines={1} style={AppStyle.flex1}>
                {moment(data.date).format('Do MMMM YYYY')}
              </TextField>
              {!isNil(data.value) && data.value !== 0 && (
                <TextField
                  type="heading-4"
                  font="regular"
                  style={[AppStyle.flex1, AppStyle.textRight]}>
                  {t(`${i18nScope}.valueDescription`, {
                    value: formatCurrency(data.value),
                  })}
                </TextField>
              )}
            </View>
          </View>
        </View>
      </View>
    ),
    [colour, data, styles, t],
  );

  return (
    <CustomCard
      containerStyle={[]}
      contentStyle={[AppStyle.columnFlex]}
      title={() => (
        <View style={[AppStyle.alignContent, AppStyle.rowFlex]}>
          <FastImage
            style={styles.imageHeaderGoal}
            source={require('assets/images/home/aim.png')}
          />
          <TextField
            type="heading-3"
            numberOfLines={1}
            style={[AppStyle.flex1, AppStyle.textAlign]}>
            {t(`${i18nScope}.upcomingGoals`)}
          </TextField>
          <View style={styles.imageHeaderGoal} />
        </View>
      )}
      description={() => {
        if (!isEmpty(data.icon)) {
          return renderWithIcon();
        }
        if (!isEmpty(data.photoUrl)) {
          return renderWithImage();
        }
        return renderWithOnlyContent();
      }}
      renderFooter={() => (
        <View style={[AppStyle.flex1, AppStyle.alignEnd]}>
          <TouchableField onPress={onPress}>
            <View style={[AppStyle.rowFlex, styles.seeDetailsContainer]}>
              <TextField type="captain" style={[styles.seeDetailsText]}>
                {t(`${i18nScope}.seeMore`)}
              </TextField>
              <IonIcon
                style={AppStyle.marginLeft5}
                name="arrow-forward-circle"
                size={14}
                color={styles.seeDetailsIcon.color}
              />
            </View>
          </TouchableField>
        </View>
      )}
    />
  );
};

export default UpcomingCard;
