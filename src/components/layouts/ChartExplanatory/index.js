import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import Header from 'components/layouts/Header';
import { useThemedStyle } from 'providers/';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectCloseModalsRefreshId } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const i18nScope = 'components.chartExplanatory';

function ChartExplanatory({ values = [], explanatorySize = 3 }) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState(false);
  const closeModalsRefreshId = useSelector(selectCloseModalsRefreshId);

  useEffect(() => {
    if (closeModalsRefreshId) {
      closeModal();
    }
  }, [closeModalsRefreshId]);

  const openModal = () => setVisibility(true);

  const closeModal = () => setVisibility(false);

  return (
    <Fragment>
      <View style={AppStyle.alignStart}>
        <TextField>{t(`${i18nScope}.incomeBreakdown`)}</TextField>
      </View>
      <View style={[AppStyle.middleContent, AppStyle.flex2]}>
        {values.length > 0 &&
          values.slice(0, explanatorySize).map((value, index) => {
            return (
              <View key={`explanatory-${index}`} style={styles.explanatoryColumn}>
                <View
                  style={[
                    styles.square,
                    {
                      backgroundColor: value.color,
                    },
                  ]}
                />
                <View style={[AppStyle.flex1, AppStyle.alignEnd, styles.labelColumn]}>
                  <TextField numberOfLines={1}>{value.label}</TextField>
                  <TextField style={styles.valueText}>${value.value}</TextField>
                </View>
              </View>
            );
          })}
      </View>

      <View style={AppStyle.alignEnd}>
        <TouchableField style={styles.footerButton} onPress={openModal}>
          <TextField>{t(`${i18nScope}.seeDetails`)}</TextField>
          <MaterialIcons name="keyboard-arrow-right" size={24} />
        </TouchableField>
      </View>

      <Modal
        containerStyle={styles.modalContainer}
        visible={visibility}
        onBackdropPress={closeModal}
        onRequestClose={closeModal}
        animationType="slide">
        <View style={AppStyle.flex1}>
          <Header type="back" title={t(`${i18nScope}.incomeBreakdown`)} onBackHeader={closeModal} />
          <KeyboardAwareScrollView style={AppStyle.flex1}>
            <View style={AppStyle.flex1}>
              <View style={styles.incomeBreakBody}>
                {values.length > 0 &&
                  values.map((value, index) => {
                    return (
                      <View key={`explanatory-${index}`} style={styles.explanatoryRow}>
                        <View
                          style={[
                            styles.square,
                            {
                              backgroundColor: value.color,
                            },
                          ]}
                        />
                        <View style={styles.valueColumn}>
                          <TextField>{value.label}</TextField>
                          <TextField style={styles.valueText}>${value.value}</TextField>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </Fragment>
  );
}

export default ChartExplanatory;
