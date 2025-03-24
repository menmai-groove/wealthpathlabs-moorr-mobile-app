import CalendarIcon from 'assets/svgs/profile/calendar';
import Accordion from 'components/basics/Accordion';
import ButtonField from 'components/basics/ButtonField';
import CardCheckBoxList from 'components/basics/CardCheckBoxList';
import CheckBox from 'components/basics/CheckBox';
import CustomChart from 'components/basics/CustomChart';
import CustomGauge from 'components/basics/CustomGauge';
import CustomTab from 'components/basics/CustomTab';
import DropDownForForm from 'components/basics/DropDownForForm';
import DynamicForm from 'components/basics/DynamicForm';
import FinancialCardTopTab from 'components/basics/FinancialCardTopTab';
import InputAddressAutocomplete from 'components/basics/InputAddressAutocomplete';
import InputField from 'components/basics/InputField';
import { KeyboardAwareFlatList } from 'components/basics/KeyboardAware';
import { PieChart } from 'components/basics/PieChart';
import RadioButtonGroup from 'components/basics/RadioButtonGroup';
import Swiper from 'components/basics/Swiper';
import Switch from 'components/basics/Switch';
import TextField from 'components/basics/TextField';
import TileCard from 'components/basics/TileCard';
import Header from 'components/layouts/Header';
import { GlobalLib, UtilLib } from 'libs';
import util, { formatCurrency, formatDateTime } from 'libs/util';
import { clamp, random } from 'lodash';
import moment from 'moment';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Text,
  TouchableHighlight,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppEventsLogger, LoginButton, LoginManager, ShareDialog } from 'react-native-fbsdk-next';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
// import IndustryAutocomplete from 'screens/Income/components/IndustryAutocomplete';
import { selectAppPreference } from 'store/Root/selector';
import { AppStyle } from 'theme';

import themedStyles from './style';

const formatDateString = 'DD MMM YYYY';

const colorBarChartColors = [
  '#955DFC',
  '#FD4D6D',
  '#4AC2FD',
  '#2EDDA8',
  '#FD8659',
  '#47BBD7',
  '#FFA850',
  '#5764FA',
  '#2EDDA8',
];
const colorBarChartData = Array(15)
  .fill()
  .map((item, index) => ({
    label: moment(new Date().toISOString()).add(index, 'months').toISOString(),
    value: random(0, 100000),
    svg: {
      fill: colorBarChartColors[index] ?? colorBarChartColors[6],
    },
  }));

const dropdownList = [{ display: 'Hello' }, { display: 'Viet Nam' }, { display: 'Australia' }];

const myData = {
  annualSurplusCashflow: {
    title: 'Annual Surplus Cashflow',
    value: '$45,000',
    icon: require('assets/images/common/jar-money.png'),
    iconBackgroundColor: '#94E9B880',
  },
  totalLoanToValuationRatio: {
    title: 'Total Loan-to-Valuation Ratio',
    value: '68.75%',
    icon: require('assets/images/common/wallet.png'),
    iconBackgroundColor: '#FFB7B7',
  },
  totalAvailableEquity: {
    title: 'Total Available Equity at 80%',
    value: '$320,000',
    icon: require('assets/images/common/bank.png'),
    iconBackgroundColor: '#8ECCF4',
  },
};

const keys = ['liabilities', 'savings', 'superannuation', 'personal', 'investments'];
const colors = ['#FF6384', '#008FEB', '#39A8EF', '#66E84B', '#27AE60'];

const stackedBarChartData = [...Array(5).keys()].map((_item, index) => ({
  label: moment(new Date().toISOString()).add(index, 'months').toISOString(),
  value: {
    superannuation: random(0, 10000),
    savings: random(0, 10000),
    personal: random(0, 10000),
    investments: random(0, 10000),
    liabilities: random(0, 10000),
  },
}));

const data1 = [...Array(10).keys()].map((_item, index) => ({
  label: moment(new Date().toISOString()).add(index, 'months').toISOString(),
  value: random(0, 100000),
}));
const data2 = [...Array(10).keys()].map((_item, index) => ({
  label: moment(new Date().toISOString()).add(index, 'months').toISOString(),
  value: random(0, 10000),
}));
// const data1 = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80];
// const data2 = [-87, 66, -69, 92, -40, -61, 16, 62, 20, -93, -54, 47, -89, -44, 18];
const data = [
  {
    data: data1,
    svg: { stroke: '#008FEB' },
  },
  {
    data: data2,
    svg: { stroke: '#72228D' },
  },
];

const graphWidth = 600;
const netWorthData = [
  {
    label: '2023-01-18T09:36:43.912Z',
    value: 0,
    generatedDate: '2023-01-18T09:36:43.912Z',
  },
];
const rangeStart = '2022-12-25T05:02:38.065Z';
const rangeEnd = '2023-01-24T05:02:38.066Z';
const rangeChartNetworthData = UtilLib.formatRangeChartData({
  data: netWorthData,
  rangeStart,
  rangeEnd,
});

const CustomPinchGestureV2 = () => {
  const styles = {
    ball: {
      width: 200,
      height: 200,
      borderRadius: 200 / 2,
      backgroundColor: '#72228D',
      alignSelf: 'center',
    },
    ball2: {
      width: 100,
      height: 100,
      borderRadius: 100 / 2,
      backgroundColor: '#DD3E28',
      alignSelf: 'center',
    },
  };
  const minNumber = 1;
  const maxNumber = 2;

  const [scale, setScale] = React.useState(1);

  const onPinchEvent = event => {
    setScale(clamp(event.nativeEvent.scale, minNumber, maxNumber));
  };

  const imageStyle = {
    transform: [
      {
        scaleX: scale,
      },
    ],
  };

  return (
    <PinchGestureHandler onGestureEvent={onPinchEvent}>
      <View>
        <Animated.View style={[styles.ball, imageStyle]} />
        <Animated.View style={[styles.ball2, imageStyle]} />
      </View>
    </PinchGestureHandler>
  );
};

const CustomPinchGesture = () => {
  return null;
  // const styles = {
  //   ball: {
  //     width: 200,
  //     height: 200,
  //     borderRadius: 200 / 2,
  //     backgroundColor: '#72228D',
  //     alignSelf: 'center',
  //   },
  //   ball2: {
  //     width: 100,
  //     height: 100,
  //     borderRadius: 100 / 2,
  //     backgroundColor: '#DD3E28',
  //     alignSelf: 'center',
  //   },
  // };
  // const scale = useSharedValue(1);
  // const savedScale = useSharedValue(1);

  // const minNumber = 1;
  // const maxNumber = 2;

  // const pinchGesture = Gesture.Pinch()
  //   .onUpdate(e => {
  //     let newScaleValue = savedScale.value * e.scale;
  //     // limit newScaleValue min and max
  //     newScaleValue = Math.min(maxNumber, Math.max(minNumber, newScaleValue));
  //     scale.value = newScaleValue;
  //   })
  //   .onEnd(() => {
  //     savedScale.value = scale.value;
  //   });

  // const animatedStyles = useAnimatedStyle(() => ({
  //   transform: [{ scaleX: scale.value }],
  // }));
  // const animatedBall2Styles = useAnimatedStyle(
  //   () => ({
  //     transform: [
  //       {
  //         scaleX: interpolate(scale.value, [minNumber, maxNumber], [1, 2]),
  //       },
  //     ],
  //   }),
  //   [scale],
  // );

  // return (
  //   <GestureDetector gesture={pinchGesture}>
  //     <View>
  //       <Animated.View style={[styles.ball, animatedStyles]} />
  //       <Animated.View style={[styles.ball2, animatedBall2Styles]} />
  //     </View>
  //   </GestureDetector>
  // );
};

const dynamicFormData = {
  layout: [
    {
      id: 'group-1',
      component: '',
      fields: [
        {
          id: 'fieldAsAt',
          component: 'asAt',
          value: '',
          visible: true,
          label: 'forms.fieldAsAt',
          placeholder: '',
          fields: [
            {
              id: 'transactionName',
              component: 'input',
              value: '',
              required: true,
              visible: true,
              label: 'screens.provisionsJar.transactionName',
              dataType: 'string',
              validation: [
                {
                  type: 'required',
                  message: 'screens.provisionsJar.transactionCardNameRequired',
                },
                {
                  type: 'maxChar',
                  number: 100,
                  message: 'screens.provisionsJar.transactionCardNameError',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'group-2',
      label: 'forms.borrowing.details',
      component: 'collapse',
      fields: [
        {
          id: 'groupAsAt',
          component: 'asAt',
          value: new Date(2023, 5, 20),
          visible: true,
          label: 'forms.groupAsAt',
          placeholder: '',
          fields: [
            {
              id: 'essentialAmount',
              component: 'input',
              value: '',
              visible: true,
              required: true,
              dataType: 'number',
              label: 'forms.expense.essential',
              formatData: 'currency',
              keyboardType: 'numeric',
              maxValue: 100000000,
              placeholder: '',
              validation: [
                {
                  type: 'required',
                  message: 'screens.provisionsJar.transactionCardNameRequired',
                },
              ],
            },
            {
              id: 'discretionaryAmount',
              component: 'input',
              value: '',
              visible: true,
              required: false,
              label: 'forms.expense.discretionary',
              dataType: 'number',
              keyboardType: 'numeric',
              formatData: 'currency',
              maxValue: 100000000,
              placeholder: '',
              validation: [],
            },
            {
              id: 'frequency',
              component: 'dropdown',
              value: {
                value: 'Monthly',
              },
              visible: true,
              options: [],
              label: 'forms.expense.frequency',
              __placeholder: 'forms.expense.frequencyPlaceholder',
              dataType: 'string',
            },
          ],
        },
      ],
    },
  ],
  conditional: {},
};

const cards = [
  {
    id: 1,
    name: 'Rent',
    amount: 23532.34,
    color: '#27AE60',
  },
  {
    id: 2,
    name: 'Expense linked with card',
    amount: 1242.33,
    color: '#FFA850',
  },
  {
    id: 3,
    name: 'Expense linked with card',
    amount: 1242.33,
    color: '#FFA850',
  },
  {
    id: 4,
    name: 'Expense linked with card',
    amount: 1242.33,
    color: '#FFA850',
  },
];

function StyleGuide() {
  const styles = useThemedStyle(themedStyles, '');
  const { width: layoutWidth } = useWindowDimensions();
  const [switchValue, setSwitchValue] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [modalType, setModalType] = useState('rad-1');
  const [accordionExpand, setAccordionExpand] = useState(false);
  const { googlePlaceApiKey } = useSelector(selectAppPreference);
  const [dob, setDob] = useState('');
  const [dropdownMultipleValue, setDropdownMultipleValue] = useState([]);
  // const [industryValue, setIndustryValue] = useState(null);
  const [gaugeVisible, setGaugeVisible] = useState(false);
  const [gauge2Visible, setGauge2Visible] = useState(false);
  const [gauge3Visible, setGauge3Visible] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  const [checked, setChecked] = useState([]);

  const _padX = 50;
  const stackedBarChartWidth = layoutWidth - _padX;
  const stackedBarChartLength = 12;
  const _itemWidth = stackedBarChartWidth / stackedBarChartLength;

  // flags.asAtDateVisible

  const toggle = () => {
    setSwitchValue(!switchValue);
  };

  const renderTileCard = useCallback(dataInput => {
    return (
      <TileCard
        title={dataInput.title}
        value={dataInput.value}
        icon={dataInput.icon}
        iconBackgroundColor={dataInput.iconBackgroundColor}
      />
    );
  }, []);

  const formRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const onSubmitForm = useCallback(
    values => {
      // console.log('values---', values);
      // console.log('updatedDates---', JSON.stringify(updatedDates, null, 2));
    },
    // [updatedDates],
    [],
  );
  let scrollRef;
  const scrollToElement = useCallback(
    (element, timeout = 250) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        element && scrollRef?.scrollIntoView(element);
      }, timeout);
    },
    [scrollRef],
  );
  const onErrorForm = useCallback(
    (formErrors, dataFormErrorsCurrent, firstKey) => {
      if (firstKey) {
        scrollToElement(dataFormErrorsCurrent[firstKey]?.componentRef);
      }
    },
    [scrollToElement],
  );

  const SHARE_LINK_CONTENT = {
    contentType: 'link',
    contentUrl: 'https://www.facebook.com/',
  };

  const _reauthorizeDataAccess = async () => {
    try {
      const result = await LoginManager.reauthorizeDataAccess();
      Alert.alert('Reauthorize data access result', JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert('Reauthorize data access fail with error:', error);
    }
  };

  const _shareLinkWithShareDialog = async () => {
    const canShow = await ShareDialog.canShow(SHARE_LINK_CONTENT);
    if (canShow) {
      try {
        const { isCancelled, postId } = await ShareDialog.show(SHARE_LINK_CONTENT);
        if (isCancelled) {
          Alert.alert('Share cancelled');
        } else {
          Alert.alert('Share success with postId: ' + postId);
        }
      } catch (error) {
        Alert.alert('Share fail with error: ' + error);
      }
    }
  };

  const _logFBEvent = async () => {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: 'email',
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Header type="back" title={'StyleGuide2'} />

      <KeyboardAwareFlatList
        data={[]}
        style={AppStyle.flex1}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={[styles.block]}>
              <LoginButton
                testID="facebook-login-1"
                onLoginFinished={(error, dataValue) => {
                  Alert.alert(JSON.stringify(error || dataValue, null, 2));
                }}
              />
              <TouchableHighlight onPress={_shareLinkWithShareDialog}>
                <Text style={styles.buttonText}>Share link with ShareDialog</Text>
              </TouchableHighlight>
              <TouchableHighlight onPress={_reauthorizeDataAccess}>
                <Text style={styles.buttonText}>Reauthorize Data Access</Text>
              </TouchableHighlight>
              <TouchableHighlight onPress={_logFBEvent}>
                <Text style={styles.buttonText}>logEvent</Text>
              </TouchableHighlight>
            </View>

            {/* <View style={[styles.block]}>
              <Balance
                {...{
                  totalText: 'Total Account Balance',
                  type: 'bank',
                  value: bankBalance,
                  onChange: setBankBalance,
                }}
              />
              <View style={AppStyle.marginTop20} />
              <Balance
                {...{
                  totalText: 'Total Credit Card Balance',
                  type: 'credit',
                  value: creditBalance,
                  onChange: setCreditBalance,
                }}
              />
            </View> */}

            <View style={[styles.block]}>
              <FinancialCardTopTab height={40} />
            </View>

            <View style={[styles.block]}>
              <CardCheckBoxList value={checked} onChange={setChecked} cards={cards} />
              <CardCheckBoxList value={checked} onChange={setChecked} cards={cards} readonly />
            </View>

            <View style={[styles.block]}>
              <DynamicForm
                ref={formRef}
                data={dynamicFormData}
                onSubmit={onSubmitForm}
                onError={onErrorForm}
              />
              <View style={AppStyle.marginTop20}>
                <ButtonField
                  type="primary"
                  text="Submit"
                  onPress={() => formRef.current?.submit()}
                />
              </View>
            </View>

            <View style={[styles.block]}>
              <ButtonField
                type="primary"
                text="Show"
                onPress={() => {
                  const campaignModal = GlobalLib.CustomModal.get();
                  campaignModal.show({
                    body: (
                      <View>
                        <TextField>content</TextField>
                        <ButtonField
                          type="primary"
                          text="Hide"
                          onPress={() => {
                            campaignModal.hide();
                          }}
                        />
                      </View>
                    ),
                  });
                }}
              />
            </View>
            <View style={[styles.block]}>
              <TextField>Version 2</TextField>
              <CustomPinchGestureV2 />
            </View>
            <View style={[styles.block]}>
              <CustomPinchGesture />
            </View>

            <View style={[styles.block]}>
              <PieChart
                height={250}
                data={colorBarChartData}
                labelAccessor={item => item.label}
                valueAccessor={item => item.value}
                formatValue={value => UtilLib.formatCurrency(value, '$')}
              />
            </View>

            <View style={[styles.block]}>
              <View style={[AppStyle.flex1, AppStyle.rowFlex, AppStyle.spaceBetweenContent]}>
                <TextField type="heading-1">{'Targeted Expenses'}</TextField>
                <TextField type="heading-1">{UtilLib.formatCurrency(12000)}</TextField>
              </View>
              <CustomChart
                // loading={!allLoaded}
                type="bar-chart"
                data={colorBarChartData}
                // activeColor={styles.activeBarChart.color}
                // color={styles.barChart.color}
                labelAccessor={item => item.label}
                valueAccessor={item => item.value}
                formatValue={value => UtilLib.formatCurrency(value)}
                formatLabel={label => moment(label).format('MMM YY')}
                barWidth={30}
                tooltipType={2}
                multiple={false}
                transparent
                hideLabel
                contentInset={{
                  top: 20,
                  bottom: 20,
                  left: 40,
                  right: 40,
                }}
                barVersion={3}
                pinchNZoom
              />
              <View style={[AppStyle.flex1, AppStyle.flexEndContent, AppStyle.alignEnd]}>
                <View>
                  <CustomTab
                    key={'color-bar-chart-custom-tab'}
                    data={[{ label: 'Monthly' }, { label: 'Annually' }]}
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
              </View>
              <ButtonField
                type="primary"
                text="Show"
                onPress={() => {
                  const campaignModal = GlobalLib.CustomModal.get();
                  campaignModal.show({
                    body: (
                      <View>
                        <TextField>content</TextField>
                        <ButtonField
                          type="primary"
                          text="Hide"
                          onPress={() => {
                            campaignModal.hide();
                          }}
                        />
                      </View>
                    ),
                  });
                }}
              />
            </View>

            <View style={[styles.block]}>
              <CustomChart
                type="range-chart"
                data={rangeChartNetworthData}
                width={graphWidth}
                color={styles.lineChart.color}
                valueAccessor={item => item.value}
                formatValue={value => formatCurrency(value)}
                diff={0.2}
                scrollToEnd
              />
            </View>

            <View style={[styles.block]}>
              <CustomChart
                type="multi-line-chart"
                data={data}
                valueAccessor={item => item.value}
                formatValue={value => formatCurrency(value)}
                labelAccessor={item => item.label}
                formatLabel={label => moment(label).format('MMM')}
                color={styles.lineChart.color}
              />
            </View>

            <View style={[styles.block]}>
              <CustomChart
                width={util.safePositiveValue(
                  _itemWidth * Math.max(stackedBarChartData.length, stackedBarChartLength),
                )}
                type="stacked-bar-chart"
                keys={keys}
                colors={colors}
                data={stackedBarChartData}
                labelAccessor={item => item.label}
                valueAccessor={item => {
                  const stackedBarChartYAccessor =
                    typeof item.value === 'object'
                      ? Object.entries(item.value)
                          .map(([key, value]) => (keys.includes(key) ? value : 0))
                          .reduce((a, b) => a + b, 0)
                      : null;
                  return stackedBarChartYAccessor;
                }}
                formatLabel={label => moment(label).format('MMM')}
                formatValue={value => formatCurrency(value)}
                formatTitle={title => moment(title).format('MMMM YYYY')}
                formatKey={key => {
                  switch (key) {
                    case 'superannuation':
                      return 'Superannuation';
                    case 'savings':
                      return 'Savings';
                    case 'personal':
                      return 'Personal Properties';
                    case 'investments':
                      return 'Investments';
                    case 'liabilities':
                      return 'Liabilities';
                    default:
                      return null;
                  }
                }}
                multiple={false}
              />
            </View>

            <View style={[styles.block, AppStyle.justifyContent, AppStyle.alignContent]}>
              <TextField>{gaugeVisible + ''}</TextField>
              <CustomGauge
                content={{
                  title: 'WealthCLOCK',
                  latest: new Date().toISOString(),
                  previous: new Date().toISOString(),
                  money: 450000.5,
                  percent: '+15.6%',
                }}
                selected={gaugeVisible}
                onSelect={setGaugeVisible}
                trademark={'registered'}
                latestDateFormat={'"DD MMM\'YY HH:mm:ssa"'}
              />
              <TextField>{gauge2Visible + ''}</TextField>
              <CustomGauge
                level={2}
                content={{
                  title: 'WealthSPEED',
                  latest: new Date().toISOString(),
                  previous: new Date().toISOString(),
                  money: 11.07,
                  percent: '+15.6%',
                }}
                selected={gauge2Visible}
                onSelect={setGauge2Visible}
                trademark={'trademark'}
                size={260}
              />
              <TextField>{gauge3Visible + ''}</TextField>
              <CustomGauge
                level={3}
                content={{
                  latest: new Date().toISOString(),
                  previous: new Date().toISOString(),
                  money: 13.25,
                  percent: '+15%',
                }}
                selected={gauge3Visible}
                onSelect={setGauge3Visible}
                size={160}
                strokeWidth={14}
              />
            </View>

            <View style={[styles.block]}>
              <Swiper
                key={'tileCard'}
                views={[
                  {
                    view: (
                      <View style={[styles.chartContainer]}>
                        {renderTileCard(myData.annualSurplusCashflow)}
                      </View>
                    ),
                  },
                  {
                    view: (
                      <View style={[styles.chartContainer]}>
                        {renderTileCard(myData.totalLoanToValuationRatio)}
                      </View>
                    ),
                  },
                  {
                    view: (
                      <View style={[styles.chartContainer]}>
                        {renderTileCard(myData.totalAvailableEquity)}
                      </View>
                    ),
                  },
                ]}
              />
            </View>

            <View style={[styles.block]}>
              <View style={[AppStyle.rowFlex, styles.logoContainer]}>
                <View style={[styles.logoCover, styles.backgroundLogo]}>
                  <Image
                    source={require('assets/images/primary-logo-1.png')}
                    style={styles.primaryLogo}
                  />
                </View>
                <View style={[styles.logoCover, styles.borderLogo]}>
                  <Image
                    source={require('assets/images/primary-logo-2.png')}
                    style={styles.primaryLogo}
                  />
                </View>
              </View>

              <View style={[styles.logoContainer]}>
                <View style={[styles.logoCover, styles.backgroundLogo]}>
                  <Image
                    source={require('assets/images/secondary-logo-1.png')}
                    style={styles.secondaryLogo}
                  />
                </View>
                <View style={[styles.logoCover, styles.borderLogo]}>
                  <Image
                    source={require('assets/images/secondary-logo-2.png')}
                    style={styles.secondaryLogo}
                  />
                </View>
              </View>
              <View style={[styles.logoContainer]}>
                <View style={[styles.logoCover, styles.backgroundLogo]}>
                  <Image
                    source={require('assets/images/tiled-secondary-logo-1.png')}
                    style={styles.secondaryLogo}
                  />
                </View>
                <View style={[styles.logoCover, styles.borderLogo]}>
                  <Image
                    source={require('assets/images/tiled-secondary-logo-2.png')}
                    style={styles.secondaryLogo}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.block]}>
              <TextField type="heading-1">{'Heading 1'}</TextField>
              <TextField type="heading-2">{'Heading 2'}</TextField>
              <TextField type="heading-3">{'Heading 3'}</TextField>
              <TextField type="paragraph-1">{'paragraph 1'}</TextField>
              <TextField type="paragraph-2">{'paragraph 2'}</TextField>
              <TextField type="captain">{'captain'}</TextField>
              <TextField type="text-label">{'text-label'}</TextField>
            </View>

            <View style={[styles.block]}>
              <ButtonField type="primary" text="Primary Large Button" style={AppStyle.margin5} />
              <ButtonField
                type="medium-primary"
                text="Primary Medium Button"
                style={AppStyle.margin5}
              />
              <ButtonField type="secondary" text="Secondary Button" style={AppStyle.margin5} />
              <ButtonField
                type="medium-secondary"
                text="Secondary Medium Button"
                style={AppStyle.margin5}
              />
              <ButtonField type="disabled" text="Disable Button" style={AppStyle.margin5} />
              <ButtonField
                type="medium-disabled"
                text="Disable Medium Button"
                style={AppStyle.margin5}
              />
            </View>

            <View style={[styles.block]}>
              <View style={[AppStyle.rowFlex, AppStyle.spaceBetweenContent, AppStyle.margin5]}>
                <CheckBox label="Uncheck" containerStyle={AppStyle.flex1} />
                <CheckBox label="Checked" value={true} />
                <CheckBox label="Disabled" disabled />
              </View>
            </View>
            <View style={[styles.block]}>
              <RadioButtonGroup
                layout="row"
                style={AppStyle.margin5}
                options={[
                  { display: 'Radio 1', value: 'rad-1' },
                  { display: 'Radio 2', value: 'rad-2' },
                ]}
                selectedValue={modalType}
                onSelect={({ value }) => setModalType(value)}
              />
            </View>

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <Switch style={AppStyle.margin5} value={switchValue} onValueChange={toggle} />
              </View>
            </View>

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <InputField label="Label" />
              </View>
              <View style={[AppStyle.margin5]}>
                <DropDownForForm
                  value={dropdownValue}
                  options={dropdownList}
                  label="Dropdown label"
                  onSelect={index => {
                    setDropdownValue(dropdownList[index]);
                  }}
                />
              </View>
            </View>

            <View style={[styles.block]}>
              <View style={[AppStyle.margin5]}>
                <DropDownForForm
                  value={dropdownMultipleValue}
                  options={dropdownList}
                  label="Dropdown multiple choice"
                  onSelect={value => {
                    setDropdownMultipleValue(value);
                  }}
                  multipleSelect
                />
              </View>
            </View>

            <View style={[styles.block]}>
              <InputAddressAutocomplete type="gnaf" label={'Address Autocomplete with GNAF'} />
            </View>

            <View style={AppStyle.margin15}>
              <InputAddressAutocomplete apiKey={googlePlaceApiKey} label={'Address Autocomplete'} />
            </View>

            {/* <View style={AppStyle.margin15}>
              <IndustryAutocomplete
                value={industryValue}
                onChangeValue={v => setIndustryValue(v)}
              />
            </View> */}

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <Accordion
                  title={'Household Details'}
                  value={accordionExpand}
                  onChange={setAccordionExpand}>
                  <InputField label="Label" />
                </Accordion>
              </View>
            </View>

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <InputField
                  // ref={dobInput}
                  value={dob ? formatDateTime(dob, formatDateString) : ''}
                  // onBlur={onBlur}
                  onChangeText={setDob}
                  // onSubmitEditing={() => emailInput.current.focus()}
                  // error={errors.dob?.message}
                  // label={t(`${i18nScope}.dob`)}
                  label="Date of birth - Select day"
                  // placeholder={t(`${i18nScope}.dobPlaceholder`)}
                  placeholder={formatDateString}
                  // required
                  editable={false}
                  onPress={() => {
                    GlobalLib.CalendarModal.get().show({
                      current: dob || new Date(),
                      onConfirm: date => {
                        setDob(date);
                      },
                    });
                  }}
                  RightComponent={() => <CalendarIcon />}
                />
              </View>
            </View>

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <InputField
                  // ref={dobInput}
                  value={dob ? formatDateTime(dob, formatDateString) : ''}
                  // onBlur={onBlur}
                  onChangeText={setDob}
                  // onSubmitEditing={() => emailInput.current.focus()}
                  // error={errors.dob?.message}
                  // label={t(`${i18nScope}.dob`)}
                  label="Date of birth - Select month"
                  // placeholder={t(`${i18nScope}.dobPlaceholder`)}
                  placeholder={formatDateString}
                  // required
                  editable={false}
                  onPress={() => {
                    GlobalLib.CalendarModal.get().show({
                      type: 1,
                      current: dob || new Date(),
                      onConfirm: date => {
                        setDob(date);
                      },
                    });
                  }}
                  RightComponent={() => <CalendarIcon />}
                />
              </View>
            </View>

            <View style={[styles.block]}>
              <View style={AppStyle.margin5}>
                <InputField
                  // ref={dobInput}
                  value={dob ? formatDateTime(dob, formatDateString) : ''}
                  // onBlur={onBlur}
                  onChangeText={setDob}
                  // onSubmitEditing={() => emailInput.current.focus()}
                  // error={errors.dob?.message}
                  // label={t(`${i18nScope}.dob`)}
                  label="Date of birth - Select year"
                  // placeholder={t(`${i18nScope}.dobPlaceholder`)}
                  placeholder={formatDateString}
                  // required
                  editable={false}
                  onPress={() => {
                    GlobalLib.CalendarModal.get().show({
                      type: 2,
                      current: dob || new Date(),
                      onConfirm: date => {
                        setDob(date);
                      },
                    });
                  }}
                  RightComponent={() => <CalendarIcon />}
                />
              </View>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

StyleGuide.propTypes = {};

export default compose(withExitAppHandler)(StyleGuide);
