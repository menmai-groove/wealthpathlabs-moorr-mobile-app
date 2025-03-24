/* eslint-disable react-native/no-color-literals */
import _ from 'lodash';
import { StyleSheet } from 'react-native';

import util from './util';

const styleGuide = util.createScaledSheet(
  StyleSheet.create({
    container: {
      flex: 1,
      paddingLeft: 25,
      paddingRight: 25,
    },
    width100: {
      width: '100%',
    },
    width70: {
      width: '70%',
    },
    width50: {
      width: '50%',
    },
    width45: {
      width: '45%',
    },
    width30: {
      width: '30%',
    },
    width25: {
      width: '25%',
    },
    height100: {
      height: '100%',
    },
    flex0: {
      flex: 0,
    },
    flex1: {
      flex: 1,
    },
    flex2: {
      flex: 2,
    },
    flex3: {
      flex: 3,
    },
    flex4: {
      flex: 4,
    },
    flex5: {
      flex: 5,
    },
    flexShrink0: {
      flexShrink: 0,
    },
    flexShrink1: {
      flexShrink: 1,
    },
    flexShrink2: {
      flexShrink: 2,
    },
    flexShrink3: {
      flexShrink: 3,
    },
    flexShrink4: {
      flexShrink: 4,
    },
    flexShrink5: {
      flexShrink: 5,
    },
    flexGrow0: {
      flexGrow: 0,
    },
    flexGrow1: {
      flexGrow: 1,
    },
    flexGrow2: {
      flexGrow: 2,
    },
    flexGrow3: {
      flexGrow: 3,
    },
    flexGrow4: {
      flexGrow: 4,
    },
    flexGrow5: {
      flexGrow: 5,
    },
    flexWrap: {
      flexWrap: 'wrap',
    },
    columnFlex: {
      flexDirection: 'column',
    },
    rowFlex: {
      flexDirection: 'row',
    },
    rowReverseFlex: {
      flexDirection: 'row-reverse',
    },
    flexStartContent: {
      justifyContent: 'flex-start',
    },
    flexEndContent: {
      justifyContent: 'flex-end',
    },
    justifyContent: {
      justifyContent: 'center',
    },
    middleContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    alignStart: {
      alignItems: 'flex-start',
    },
    alignEnd: {
      alignItems: 'flex-end',
    },
    alignContent: {
      alignItems: 'center',
    },
    alignStretch: {
      alignItems: 'stretch',
    },
    selfAlignStretch: {
      alignSelf: 'stretch',
    },
    selfAlignCenter: {
      alignSelf: 'center',
    },
    selfAlignStart: {
      alignSelf: 'flex-start',
    },
    selfAlignEnd: {
      alignSelf: 'flex-end',
    },
    spaceAroundContent: {
      justifyContent: 'space-around',
    },
    spaceBetweenContent: {
      justifyContent: 'space-between',
    },
    spaceEvenlyContent: {
      justifyContent: 'space-evenly',
    },
    textCenter: {
      textAlign: 'center',
    },
    noBackground: {
      backgroundColor: 'transparent',
    },
    pad2: {
      padding: 2,
    },
    pad3: {
      padding: 3,
    },
    pad5: {
      padding: 5,
    },
    pad10: {
      padding: 10,
    },
    pad15: {
      padding: 15,
    },
    pad20: {
      padding: 20,
    },
    pad25: {
      padding: 25,
    },
    pad30: {
      padding: 30,
    },
    pad40: {
      padding: 40,
    },
    padX5: {
      paddingHorizontal: 5,
    },
    padX10: {
      paddingHorizontal: 10,
    },
    padX15: {
      paddingHorizontal: 15,
    },
    padX20: {
      paddingHorizontal: 20,
    },
    padX25: {
      paddingHorizontal: 25,
    },
    padX30: {
      paddingHorizontal: 30,
    },
    padX40: {
      paddingHorizontal: 40,
    },
    padY5: {
      paddingVertical: 5,
    },
    padY10: {
      paddingVertical: 10,
    },
    padY15: {
      paddingVertical: 15,
    },
    padY20: {
      paddingVertical: 20,
    },
    padY25: {
      paddingVertical: 25,
    },
    padY30: {
      paddingVertical: 30,
    },
    padY40: {
      paddingVertical: 40,
    },
    padTop2: {
      paddingTop: 2,
    },
    padTop3: {
      paddingTop: 3,
    },
    padTop5: {
      paddingTop: 5,
    },
    padTop10: {
      paddingTop: 10,
    },
    padTop15: {
      paddingTop: 15,
    },
    padTop20: {
      paddingTop: 20,
    },
    padTop25: {
      paddingTop: 25,
    },
    padTop30: {
      paddingTop: 30,
    },
    padBottom0: {
      paddingBottom: 0,
    },
    padBottom2: {
      paddingBottom: 2,
    },
    padBottom3: {
      paddingBottom: 3,
    },
    padBottom5: {
      paddingBottom: 5,
    },
    padBottom10: {
      paddingBottom: 10,
    },
    padBottom15: {
      paddingBottom: 15,
    },
    padBottom20: {
      paddingBottom: 20,
    },
    padBottom25: {
      paddingBottom: 25,
    },
    padBottom30: {
      paddingBottom: 30,
    },
    padBottom40: {
      paddingBottom: 40,
    },
    padBottom90: {
      paddingBottom: 90,
    },
    padLeft2: {
      paddingLeft: 2,
    },
    padLeft3: {
      paddingLeft: 3,
    },
    padLeft5: {
      paddingLeft: 5,
    },
    padLeft10: {
      paddingLeft: 10,
    },
    padLeft15: {
      paddingLeft: 15,
    },
    padLeft20: {
      paddingLeft: 20,
    },
    padLeft25: {
      paddingLeft: 25,
    },
    padRight2: {
      paddingRight: 2,
    },
    padRight3: {
      paddingRight: 3,
    },
    padRight5: {
      paddingRight: 5,
    },
    padRight10: {
      paddingRight: 10,
    },
    padRight15: {
      paddingRight: 15,
    },
    padRight20: {
      paddingRight: 20,
    },
    padRight25: {
      paddingRight: 25,
    },
    margin0: {
      margin: 0,
    },
    margin2: {
      margin: 2,
    },
    margin3: {
      margin: 3,
    },
    margin5: {
      margin: 5,
    },
    margin10: {
      margin: 10,
    },
    margin15: {
      margin: 15,
    },
    margin20: {
      margin: 20,
    },
    margin30: {
      margin: 30,
    },
    marginX5: {
      marginHorizontal: 5,
    },
    marginX10: {
      marginHorizontal: 10,
    },
    marginX15: {
      marginHorizontal: 15,
    },
    marginX20: {
      marginHorizontal: 20,
    },
    marginX30: {
      marginHorizontal: 30,
    },
    marginY5: {
      marginVertical: 5,
    },
    marginY10: {
      marginVertical: 10,
    },
    marginY15: {
      marginVertical: 15,
    },
    marginY20: {
      marginVertical: 20,
    },
    margin25: {
      margin: 25,
    },
    marginTop2: {
      marginTop: 2,
    },
    marginTop3: {
      marginTop: 3,
    },
    marginTop5: {
      marginTop: 5,
    },
    marginTop8: {
      marginTop: 8,
    },
    marginTop10: {
      marginTop: 10,
    },
    marginTop15: {
      marginTop: 15,
    },
    marginTop20: {
      marginTop: 20,
    },
    marginTop25: {
      marginTop: 25,
    },
    marginTop30: {
      marginTop: 30,
    },
    marginTop35: {
      marginTop: 35,
    },
    marginTop40: {
      marginTop: 40,
    },
    marginBottom0: {
      marginBottom: 0,
    },
    marginBottom2: {
      marginBottom: 2,
    },
    marginBottom3: {
      marginBottom: 3,
    },
    marginBottom5: {
      marginBottom: 5,
    },
    marginBottom10: {
      marginBottom: 10,
    },
    marginBottom15: {
      marginBottom: 15,
    },
    marginBottom20: {
      marginBottom: 20,
    },
    marginBottom25: {
      marginBottom: 25,
    },
    marginBottom30: {
      marginBottom: 30,
    },
    marginBottom35: {
      marginBottom: 35,
    },
    marginBottom40: {
      marginBottom: 40,
    },
    marginLeft2: {
      marginLeft: 2,
    },
    marginLeft3: {
      marginLeft: 3,
    },
    marginLeft5: {
      marginLeft: 5,
    },
    marginLeft10: {
      marginLeft: 10,
    },
    marginLeft15: {
      marginLeft: 15,
    },
    marginLeft20: {
      marginLeft: 20,
    },
    marginLeft25: {
      marginLeft: 25,
    },
    marginLeft30: {
      marginLeft: 30,
    },
    marginLeft50: {
      marginLeft: 50,
    },
    marginRight2: {
      marginRight: 2,
    },
    marginRight3: {
      marginRight: 3,
    },
    marginRight5: {
      marginRight: 5,
    },
    marginRight10: {
      marginRight: 10,
    },
    marginRight15: {
      marginRight: 15,
    },
    marginRight20: {
      marginRight: 20,
    },
    marginRight25: {
      marginRight: 25,
    },
    textUnderline: {
      textDecorationLine: 'underline',
    },
    textAlign: {
      textAlign: 'center',
    },
    textLeft: {
      textAlign: 'left',
    },
    textRight: {
      textAlign: 'right',
    },
    menuPaddingBottom: {
      paddingBottom: 95,
    },
    hide: {
      display: 'none',
    },
    collapseHeight: {
      height: 0,
      overflow: 'hidden',
    },
    shadow: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,

      elevation: 5,
    },
    absolute: {
      position: 'absolute',
    },
    hidden: {
      opacity: 0,
      height: 0,
    },
  }),
);

type StyleName = keyof typeof styleGuide;

const pick = (styleList: StyleName[]) => {
  const pickedStyles = _.pick(styleGuide, styleList);
  return Object.keys(pickedStyles).reduce(
    (result, key) => Object.assign(result, pickedStyles[key]),
    {},
  );
};

export default {
  ...styleGuide,
  pick,
};
