import CustomCard from 'components/basics/CustomCard';
import CustomTab from 'components/basics/CustomTab';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { UtilLib } from 'libs';
import _ from 'lodash';
import { useThemedStyle } from 'providers';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import AIcon from 'react-native-vector-icons/AntDesign';
import { AppStyle } from 'theme';

import themedStyles from '../styles';

const i18nScope = 'screens.moneySmartsDashboard';

export function ModalCardItem({ title = '', backgroundColor = '', imageSources = [], value = 0 }) {
  const styles = useThemedStyle(themedStyles, i18nScope);

  return (
    <CustomCard
      containerStyle={[
        AppStyle.margin0,
        {
          backgroundColor,
        },
      ]}
      title={() => (
        <View style={[AppStyle.rowFlex, AppStyle.alignContent, AppStyle.spaceBetweenContent]}>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <TextField style={styles.whiteColor}>{title}</TextField>
            {!_.isEmpty(imageSources, [0]) && (
              <FastImage
                style={[AppStyle.marginLeft5, styles.image]}
                source={_.get(imageSources, [0])}
              />
            )}
          </View>
          {!_.isEmpty(imageSources, [1]) && (
            <FastImage
              style={[AppStyle.marginLeft5, styles.image2]}
              source={_.get(imageSources, [1])}
            />
          )}
        </View>
      )}
      description={() => (
        <TextField style={[AppStyle.marginTop5, styles.whiteColor]} type="heading-2">
          {UtilLib.formatCurrency(value, '$')}
        </TextField>
      )}
    />
  );
}

export default function ModalBody({
  isMoneyIn = false,
  frequency = 'monthly',
  moneyInBreakdown,
  moneyOutBreakdown,
  ownershipOptions,
  closeModal = () => {},
}) {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [tabIndex, setTabIndex] = useState(0);
  const myPartnerIsEmpty = moneyInBreakdown.length <= 1;

  const renderList = useCallback(
    (dataInput = []) => {
      const length = dataInput.length;
      if (length === 0) {
        return null;
      }

      return dataInput.map((item, i) => {
        const isLast = i === length - 1;
        const Divider = () => !isLast && <View style={styles.divider} />;
        return (
          <View key={`row-${i}`}>
            <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.flex1]}>
              <TextField type="paragraph-2" numberOfLines={3} style={[AppStyle.flex3]}>
                {item.key}
              </TextField>
              <TextField
                type="paragraph-1"
                style={[AppStyle.flex2, AppStyle.padLeft10, AppStyle.textRight]}
                numberOfLines={3}>
                {UtilLib.formatBracketsCurrency(item.total)}
              </TextField>
            </View>
            <Divider />
          </View>
        );
      });
    },
    [styles],
  );

  const renderMoneyIn = useCallback(
    ({ value = 0, list = [] }) => {
      return (
        <View>
          {!myPartnerIsEmpty && (
            <View style={AppStyle.marginTop20}>
              <CustomTab
                data={ownershipOptions}
                value={tabIndex}
                onSelect={index => {
                  setTabIndex(index);
                }}
                containerStyle={styles.containerTabStyle}
                fontStyle={styles.fontTabStyle}
                activeTabStyle={styles.activeTabStyle}
                activeFontStyle={styles.activeFontStyle}
              />
            </View>
          )}
          <View style={AppStyle.marginTop20}>
            <ModalCardItem
              title={t(`${i18nScope}.moneyIn`)}
              backgroundColor={styles.moneyInContainer.backgroundColor}
              imageSources={[
                require('assets/images/moneySmartsDashboard/white-arrow-up.png'),
                require('assets/images/moneySmartsDashboard/white-inc.png'),
              ]}
              value={value}
            />
          </View>
          <View style={AppStyle.marginTop20}>
            <ScrollView style={styles.moneyInListContainer} showsVerticalScrollIndicator={false}>
              {renderList(list)}
            </ScrollView>
          </View>
        </View>
      );
    },
    [t, ownershipOptions, tabIndex, myPartnerIsEmpty, renderList, styles],
  );

  const renderMoneyOut = useCallback(
    ({ value = 0, list = [] }) => {
      return (
        <View>
          <View style={AppStyle.marginTop20}>
            <ModalCardItem
              title={t(`${i18nScope}.moneyOut`)}
              backgroundColor={styles.moneyOutContainer.backgroundColor}
              imageSources={[
                require('assets/images/moneySmartsDashboard/white-arrow-down.png'),
                require('assets/images/moneySmartsDashboard/white-dec.png'),
              ]}
              value={value}
            />
          </View>
          <View style={AppStyle.marginTop20}>
            <ScrollView style={styles.moneyInListContainer} showsVerticalScrollIndicator={false}>
              {renderList(list)}
            </ScrollView>
          </View>
        </View>
      );
    },
    [renderList, t, styles],
  );

  return (
    <View style={styles.modalContainer}>
      <View style={AppStyle.alignEnd}>
        <TouchableField onPress={closeModal}>
          <AIcon name={'close'} size={24} color={styles.closeIcon.color} />
        </TouchableField>
      </View>
      <View style={AppStyle.alignContent}>
        <TextField type="heading-2">{t(`${i18nScope}.snapshot`)}</TextField>
      </View>
      {isMoneyIn
        ? renderMoneyIn({
            value: _.get(moneyInBreakdown, [tabIndex, frequency, 'total']),
            list: _.get(moneyInBreakdown, [tabIndex, frequency, 'groups']),
          })
        : renderMoneyOut({
            value: _.get(moneyOutBreakdown, [frequency, 'total']),
            list: _.get(moneyOutBreakdown, [frequency, 'groups']),
          })}
    </View>
  );
}
