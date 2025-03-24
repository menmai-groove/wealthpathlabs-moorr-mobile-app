import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import ContentLoader from 'components/layouts/ContentLoader';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { formatCurrency } from 'libs/util';
import { useThemedStyle } from 'providers';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GroupingAndItemsEnums } from 'screens/ExpenseDashboard';
import { ArchiveModalContent } from 'screens/FinancialDashboard/components';
import * as financialDashboardActions from 'store/FinancialDashboard/action';
import { AppStyle } from 'theme';

export function BreakdownItem({ defaultCollapse = true, item, type, onExpand = () => {} }) {
  const styles = useThemedStyle(themedStyles);
  const [isCollapse, setIsCollapse] = useState(defaultCollapse);
  const [loading, setLoading] = useState(false);
  const rotateAnim = useRef(new Animated.Value(defaultCollapse ? 0 : 1));
  const rotateDeg = rotateAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const { t } = useTranslation();
  const dispatchResolve = useDispatchResolve();
  const i18nScopeCard = 'screens.financialDashboard';

  const toggleExpand = async () => {
    // UtilLib.handleConfigureNextLayoutAnimation();
    try {
      if (isCollapse) {
        setIsCollapse(false);
        setLoading(true);
        Animated.timing(rotateAnim.current, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
        await onExpand();
        setLoading(false);
      } else {
        setIsCollapse(true);
        Animated.timing(rotateAnim.current, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const onPressDelete = (itemValue, callback = () => {}) => {
    const hasNoDirectLinks =
      itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;

    const isPropertyInvestmentCard =
      itemValue?.type === AppConstants.AssetType.Property ||
      itemValue?.type === AppConstants.AssetType.Investments;

    const cardName =
      isPropertyInvestmentCard && !hasNoDirectLinks
        ? `${itemValue?.name} ${AppConstants.cardCategory.Asset}`
        : itemValue?.name;
    const title = t(`${i18nScopeCard}.modalDeleteTitle`, { cardName });
    const content = t(`${i18nScopeCard}.modalDeleteContent`);
    const content2 = hasNoDirectLinks ? null : t(`${i18nScopeCard}.modalDeleteContent2`);
    const dateLabelText = t(`${i18nScopeCard}.archiveDateLabelText`);
    const submitText = t(`${i18nScopeCard}.delete`);
    GlobalLib.CustomModal.get().show({
      onBackdropPress: GlobalLib.CustomModal.get().hide,
      onRequestClose: GlobalLib.CustomModal.get().hide,
      body: (
        <ArchiveModalContent
          hideLinkedCards
          title={title}
          content={content}
          content2={content2}
          card={itemValue}
          onCancel={GlobalLib.CustomModal.get().hide}
          onSubmit={() => {
            const payload = {
              item: itemValue,
            };
            dispatchResolve(financialDashboardActions.deleteFinancialCardItem(payload)).then(() => {
              callback();
            });
            GlobalLib.CustomModal.get().hide();
          }}
          dateLabelText={dateLabelText}
          type="delete"
          hideAsAt
          submitText={submitText}
        />
      ),
    });
  };

  const onPressArchive = async (itemValue, callback = () => {}) => {
    const latestAsAt = await dispatchResolve(
      financialDashboardActions.getLatestAsAt({ cardId: itemValue?.id?.[0] }),
    );
    const hasNoDirectLinks =
      itemValue?.linkedIncomeExpenses == null || itemValue?.linkedIncomeExpenses?.length === 0;
    const title = t(`${i18nScopeCard}.archiveTitle`);
    const content = t(`${i18nScopeCard}.archiveContent`);
    const content2 = t(`${i18nScopeCard}.archiveContent2`);
    const content4 = !hasNoDirectLinks ? t(`${i18nScopeCard}.archiveContent4`) : '';
    const latestAsAtError = t(`${i18nScopeCard}.archiveLatestAsAtError`);
    const dateLabelText = t(`${i18nScopeCard}.archiveDateLabelText`);
    const submitText = t(`${i18nScopeCard}.archive`);

    GlobalLib.CustomModal.get().show({
      onBackdropPress: GlobalLib.CustomModal.get().hide,
      onRequestClose: GlobalLib.CustomModal.get().hide,
      body: (
        <ArchiveModalContent
          hideLinkedCards
          title={title}
          content={content}
          content2={content2}
          content4={content4}
          latestAsAt={latestAsAt}
          latestAsAtError={latestAsAtError}
          card={itemValue}
          onCancel={GlobalLib.CustomModal.get().hide}
          onSubmit={({ asAt }) => {
            const payload = {
              item: itemValue,
              asAt,
            };
            dispatchResolve(financialDashboardActions.archiveFinancialCardItem(payload)).then(
              () => {
                GlobalLib.CustomModal.get().hide();
                callback();
              },
            );
            GlobalLib.CustomModal.get().hide();
          }}
          dateLabelText={dateLabelText}
          submitText={submitText}
        />
      ),
    });
  };

  return (
    <View style={styles.container}>
      <TouchableField onPress={toggleExpand}>
        <View style={[styles.header]}>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <LinearGradient style={styles.bulletin} colors={item.color} useAngle angle={0} />
            <TextField
              type="paragraph-1"
              font={type === GroupingAndItemsEnums[0] ? 'bold' : 'regular'}
              style={[AppStyle.flex1, styles.title]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.label}
            </TextField>
            <TextField
              type="paragraph-1"
              font={type === GroupingAndItemsEnums[0] ? 'medium' : 'semi-bold'}
              style={styles.textBlack}>
              {formatCurrency(item.value, '$', { decimal: 2 })}
            </TextField>
            <View style={styles.caretContainer}>
              <Animated.View style={{ transform: [{ rotateZ: rotateDeg }, { perspective: 100 }] }}>
                <MaterialIcons name={'keyboard-arrow-down'} size={20} />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableField>
      <Animated.View
        style={[
          AppStyle.padTop10,
          AppStyle.flex1,
          isCollapse && AppStyle.collapseHeight,
          { opacity: rotateAnim.current },
        ]}>
        {loading ? (
          <ContentLoader name="expense_dashboard_breakdown_items" />
        ) : (
          <View style={[]}>
            {(item.items || []).map((expenseItem, index) => {
              return (
                <TouchableField
                  key={`${expenseItem.name}-${index}`}
                  onPress={() => {
                    NavigationServiceLib.navigate(AppScreenID.EditExpense, {
                      item: { ...expenseItem, id: [expenseItem._id] },
                      onPressArchive,
                      onPressDelete,
                    });
                  }}>
                  <View style={[styles.breakdownItem]}>
                    <TextField
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[AppStyle.flex1, AppStyle.padRight20]}>
                      {expenseItem.name || ' '}
                    </TextField>
                    <TextField style={[AppStyle.flex0]}>
                      {formatCurrency(expenseItem.amount, '$', { decimal: 2 })}
                    </TextField>
                  </View>
                </TouchableField>
              );
            })}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const themedStyles = {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: 'palette.color-grey-6',
    paddingBottom: 15,
  },
  caretContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletin: {
    height: 20,
    width: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'palette.color-grey-6',
  },
  topLine: {
    borderTopWidth: 1,
    borderTopColor: 'palette.color-grey-6',
  },
  seeDetails: {
    color: 'palette.color-blue-2',
  },
  title: {
    paddingRight: 15,
  },
  textBlack: {
    color: 'palette.color-black-1',
  },
  breakdownItem: {
    paddingRight: 34,
    paddingLeft: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
};
