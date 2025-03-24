import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, ViewStyle, TextStyle, ImageStyle, Animated } from 'react-native';
import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { PieChart } from 'components/basics/PieChart';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useThemedStyle } from 'providers';
import { AppStyle } from 'theme';
import { formatCurrency } from 'libs/util';
import { orderBy } from 'lodash';
import { UtilLib } from 'libs';

//
export interface TotalValueType {
  id: string;
  label: string;
  color: string[];
  value: number;
}

export function ListBoxInfo({ item, isLast }) {
  const styles = useThemedStyle(themedStyles);
  return (
    <View style={[AppStyle.rowFlex, AppStyle.padTop15]}>
      <LinearGradient style={styles.bulletin} colors={item.color} useAngle angle={0} />
      <View
        style={[
          AppStyle.flex1,
          AppStyle.padBottom15,
          AppStyle.marginLeft10,
          !isLast && styles.bottomLine,
        ]}>
        <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
          <TextField type="paragraph-2" style={[AppStyle.flex1, AppStyle.padRight10]}>
            {item.label}
          </TextField>
          <TextField type="heading-4" font="semi-bold">
            {formatCurrency(item.value)}
          </TextField>
        </View>
      </View>
    </View>
  );
}

const i18nScope = 'screens.financialDashboard';

interface IOverviewCard {
  key: string;
  defaultCollapse: boolean;
  allLoaded: boolean;
  label: string;
  totalLabel: string;
  description: string;
  total: number;
  data: TotalValueType[];
  breakdownLimit?: number;
  onPressSeeDetails?: () => void;
  showSeeDetails: boolean;
}

export function OverviewCard({
  defaultCollapse = true,
  allLoaded,
  totalLabel,
  description,
  total = 0,
  data = [],
  breakdownLimit = 3,
  onPressSeeDetails,
  showSeeDetails = false,
}: IOverviewCard) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const { t } = useTranslation();
  const listOrderData = useMemo(() => orderBy(data, i => i.value, 'desc'), [data]);
  const [isCollapse, setIsCollapse] = useState(defaultCollapse);
  const rotateAnim = useRef(new Animated.Value(defaultCollapse ? 0 : 1));
  const rotateDeg = rotateAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    UtilLib.handleConfigureNextLayoutAnimation();

    if (isCollapse) {
      setIsCollapse(false);
      Animated.timing(rotateAnim.current, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      setIsCollapse(true);
      Animated.timing(rotateAnim.current, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderListOrderData = useCallback(() => {
    return listOrderData
      ?.slice(0, breakdownLimit)
      .map((item, ii, currentArray) => (
        <ListBoxInfo key={item.id} item={item} isLast={ii === currentArray.length - 1} />
      ));
  }, [breakdownLimit, listOrderData]);

  return (
    <View style={styles.container}>
      <TouchableField onPress={toggleExpand}>
        <View style={[AppStyle.padX20, styles.header]}>
          <TextField type="heading-4">{totalLabel}</TextField>
          <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
            <TextField type="heading-1">{formatCurrency(total)}</TextField>
            <View style={styles.caretContainer}>
              <Animated.View style={{ transform: [{ rotateZ: rotateDeg }, { perspective: 100 }] }}>
                <MaterialIcons name={'arrow-drop-down'} size={24} />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableField>
      <Animated.View
        style={[
          AppStyle.flex1,
          isCollapse && AppStyle.collapseHeight,
          { opacity: rotateAnim.current },
        ]}>
        <View style={AppStyle.pad10}>
          <PieChart
            loading={!allLoaded}
            valueAccessor={item => item.value}
            formatValue={value => UtilLib.formatCurrency(value)}
            data={data}
            height={250}
            // outerRadius={'55%'}
            // activeOuterRadius={'62%'}
            // activeOuterRadius={'55%'}
            // tooltipOuterRadius={'67%'}
          />
        </View>
        {total !== 0 && (
          <View style={AppStyle.padX20}>
            <TextField type="heading-4" font="semi-bold">
              {description}
            </TextField>
            {renderListOrderData()}
            {(listOrderData.length > breakdownLimit || showSeeDetails) && (
              <View style={[AppStyle.alignEnd, styles.topLine]}>
                <TouchableField
                  style={[
                    AppStyle.rowFlex,
                    AppStyle.padY5,
                    AppStyle.marginTop10,
                    AppStyle.middleContent,
                  ]}
                  onPress={onPressSeeDetails}>
                  <TextField type="captain" style={[AppStyle.padRight5, styles.seeDetails]}>
                    {t(`${i18nScope}.seeDetails`)}
                  </TextField>
                  <FontAwesome5 name="chevron-circle-right" size={12} style={styles.seeDetails} />
                </TouchableField>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };
const themedStyles: NamedStyles = {
  container: {
    backgroundColor: 'palette.color-dynamic-container',
    borderWidth: 1,
    borderColor: 'palette.color-grey-6',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caretContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'palette.color-white-3',
    borderColor: 'palette.color-grey-6',
    borderWidth: 1,
    borderRadius: 6,
  },
  bulletin: {
    height: 20,
    width: 20,
    borderRadius: 4,
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
};
