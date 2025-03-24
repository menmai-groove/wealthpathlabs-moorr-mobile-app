/**
 *
 * ContentLoader
 *
 */

import React from 'react';
import RNContentLoader, { Rect } from 'react-content-loader/native';
import { Circle } from 'react-native-svg';
import { AppSize } from 'theme';

const backgroundColor = '#b5b5b5';
const foregroundColor = '#cccccc';

const Components = ({ name, width, height, ...extantProps }) => {
  const _height = height || '100%';
  const _width = width || '100%';
  switch (name) {
    case 'image':
      return (
        <RNContentLoader
          speed={1}
          width={_width}
          height={_height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Rect x="0" y="0" width="100%" height="100%" />
        </RNContentLoader>
      );
    case 'moneySMARTBreakdownCard': {
      return (
        <RNContentLoader
          speed={1}
          width={_width}
          height={_height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Rect rx="3" ry="3" x="0" y="0" width="25%" height="10" />
          <Rect rx="3" ry="3" x="75%" y="0" width="25%" height="10" />
          <Rect rx="3" ry="3" x="0" y="40" width="65%" height="10" />
          <Rect rx="3" ry="3" x="75%" y="40" width="25%" height="10" />
          <Rect rx="3" ry="3" x="0" y="70" width="65%" height="10" />
          <Rect rx="3" ry="3" x="75%" y="70" width="25%" height="10" />
          <Rect rx="3" ry="3" x="0" y="100" width="65%" height="10" />
          <Rect rx="3" ry="3" x="75%" y="100" width="25%" height="10" />
          <Rect rx="3" ry="3" x="0" y="130" width="65%" height="10" />
          <Rect rx="3" ry="3" x="75%" y="130" width="25%" height="10" />
        </RNContentLoader>
      );
    }
    case 'pieChart': {
      const r = height ? height * 0.5 : 0;
      return (
        <RNContentLoader
          speed={1}
          width={height}
          height={height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Rect x={r * 0.5} y={r * 0.5} width={r} height={r} rx={r} ry={r} />
        </RNContentLoader>
      );
    }
    case 'customChart': {
      const Value = ({ x = '0', value = 0 }) => (
        <Rect x={x} y={`${84 - value}%`} rx="3" ry="3" width="10%" height={`${value}%`} />
      );
      return (
        <RNContentLoader
          speed={1}
          width={_width}
          height={_height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Rect x="0" y="10%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="20%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="30%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="40%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="50%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="60%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="70%" rx="3" ry="3" width="20%" height="10" />
          <Rect x="0" y="80%" rx="3" ry="3" width="20%" height="10" />

          <Rect x="25%" y="90%" rx="3" ry="3" width="10%" height="10" />
          <Rect x="37.5%" y="90%" rx="3" ry="3" width="10%" height="10" />
          <Rect x="50%" y="90%" rx="3" ry="3" width="10%" height="10" />
          <Rect x="62.5%" y="90%" rx="3" ry="3" width="10%" height="10" />
          <Rect x="75%" y="90%" rx="3" ry="3" width="10%" height="10" />
          <Rect x="87.5%" y="90%" rx="3" ry="3" width="10%" height="10" />

          <Value x="25%" value={10} />
          <Value x="37.4%" value={30} />
          <Value x="50%" value={20} />
          <Value x="62.5%" value={0} />
          <Value x="75%" value={50} />
          <Value x="87.5%" value={40} />
        </RNContentLoader>
      );
    }
    case 'customChart2': {
      const Value = ({ x = '0', value = 0 }) => (
        <Rect x={x} y={`${84 - value}%`} rx="3" ry="3" width="30" height={`${value}%`} />
      );
      return (
        <RNContentLoader
          speed={1}
          width={_width}
          height={_height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Rect x="40" y="10" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="50" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="90" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="130" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="170" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="210" rx="3" ry="3" width="30" height="10" />
          <Rect x="40" y="250" rx="3" ry="3" width="30" height="10" />

          <Rect x="80" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="120" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="160" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="200" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="240" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="280" y="260" rx="3" ry="3" width="30" height="10" />
          <Rect x="320" y="260" rx="3" ry="3" width="30" height="10" />

          <Value x="80" value={10} />
          <Value x="120" value={30} />
          <Value x="200" value={20} />
          <Value x="280" value={50} />
          <Value x="320" value={40} />
        </RNContentLoader>
      );
    }
    case 'monthlyCheckUp': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="10%" y="0" width="25%" height="10" />
          <Rect rx="3" ry="3" x="45%" y="0" width="20%" height="10" />
          <Rect rx="3" ry="3" x="70%" y="0" width="20%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="40" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="80" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="120" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="160" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="200" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="240" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="280" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="320" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="360" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="400" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="440" width="80%" height="10" />
        </RNContentLoader>
      );
    }
    case 'monthlyCheckUpReport': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="15" y="39" rx="6" ry="6" width="150" height="25" />
          <Rect x="15" y="100" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="100" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="150" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="150" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="200" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="200" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="250" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="250" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="300" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="300" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="350" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="350" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="400" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="400" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="450" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="450" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="500" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="500" rx="6" ry="6" width="20%" height="20" />
          <Rect x="15" y="550" rx="6" ry="6" width="60%" height="20" />
          <Rect x="75%" y="550" rx="6" ry="6" width="20%" height="20" />
        </RNContentLoader>
      );
    }
    case 'provisionJar': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          {/* Center the circle */}
          <Rect
            x={`${50 - (90 / AppSize.screen.width) * 100}%`}
            y="60"
            width="180"
            height="180"
            rx="90"
            ry="90"
          />
          <Rect x="20" y="300" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="360" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="420" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="480" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="540" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="600" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="660" width="90%" height="15" rx="6" ry="6" />
          <Rect x="20" y="720" width="90%" height="15" rx="6" ry="6" />
        </RNContentLoader>
      );
    }
    case 'monthlyCheckUpPreviusHeader': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={26}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="10%" y="6" width="80%" height="10" />
        </RNContentLoader>
      );
    }
    case 'monthlyCheckUpPrevius': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="10%" y="0" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="40" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="80" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="120" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="160" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="200" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="240" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="280" width="80%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="320" width="65%" height="10" />
          <Rect rx="3" ry="3" x="10%" y="360" width="65%" height="10" />
        </RNContentLoader>
      );
    }
    case 'notification': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="25" y="25" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="25" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="75" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="105" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="105" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="155" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="185" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="185" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="235" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="265" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="265" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="315" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="345" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="345" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="395" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="425" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="425" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="475" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="505" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="505" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="555" rx="6" ry="6" width="40%" height="20" />
          <Rect x="25" y="585" rx="25" ry="25" width="50" height="50" />
          <Rect x="90" y="585" rx="6" ry="6" width="65%" height="40" />
          <Rect x="90" y="635" rx="6" ry="6" width="40%" height="20" />
        </RNContentLoader>
      );
    }
    case 'borrowing_detail':
    case 'income_detail':
    case 'asset_detail': {
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="15" y="15" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="45" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="95" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="125" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="175" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="205" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="255" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="285" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="335" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="365" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="425" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="455" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="505" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="535" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="585" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="615" rx="6" ry="6" width="90%" height="40" />
          <Rect x="15" y="665" rx="6" ry="6" width="40%" height="20" />
          <Rect x="15" y="695" rx="6" ry="6" width="90%" height="40" />
        </RNContentLoader>
      );
    }
    case 'gauge': {
      const r = height ? height * 0.5 : 0;
      const x = r - r * 0.6;
      const ratio = height / 300;
      return (
        <RNContentLoader
          speed={1}
          width={height}
          height={height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          {...extantProps}>
          <Circle cx={r} cy={r} r={r * 0.9} />
          <Circle cx={r} cy={r} r={r * 0.75} />
          <Rect x={x} y={r - 10 * ratio} rx="2" ry="2" width="60%" height={30 * ratio} />
          <Rect x={r - r * 0.4} y={r - 60 * ratio} width="40%" height={30 * ratio} />
          <Rect x={r + r * 0.2} y={r + 35 * ratio} width="20%" height={16 * ratio} />
          {/* <Rect x={r * 0.5} y={r * 0.5} width={r} height={r} rx={r} ry={r} /> */}
        </RNContentLoader>
      );
    }
    case 'expense_dashboard_breakdown':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="0" y="0" rx="6" ry="6" width={'100%'} height="40" />
          <Rect x="0" y="50" rx="6" ry="6" width={'100%'} height="1" />
          <Rect x="0" y="60" rx="6" ry="6" width={'100%'} height="40" />
          <Rect x="0" y="110" rx="6" ry="6" width={'100%'} height="1" />
          <Rect x="0" y="120" rx="6" ry="6" width={'100%'} height="40" />
          <Rect x="0" y="170" rx="6" ry="6" width={'100%'} height="1" />
          <Rect x="0" y="180" rx="6" ry="6" width={'100%'} height="40" />
          <Rect x="0" y="230" rx="6" ry="6" width={'100%'} height="1" />
        </RNContentLoader>
      );
    case 'expense_dashboard_breakdown_items':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={120}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="0" y="0" rx="6" ry="6" width={'100%'} height="30" />
          <Rect x="0" y="40" rx="6" ry="6" width={'100%'} height="30" />
          <Rect x="0" y="80" rx="6" ry="6" width={'100%'} height="30" />
        </RNContentLoader>
      );
    case 'expense_dashboard_tab':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={95}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect x="50%" y="0" rx="6" ry="6" width={'50%'} height="30" />
          <Rect x="20%" y="40" rx="6" ry="6" width={'60%'} height="30" />
        </RNContentLoader>
      );
    case 'historical_log':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="0%" y="0" width="100%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="20" width="100%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="40" width="100%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="60" width="50%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="80" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="110" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="140" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="170" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="200" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="230" width="100%" height="20" />
          <Rect rx="3" ry="3" x="0%" y="260" width="100%" height="20" />
        </RNContentLoader>
      );
    case 'balance_form_loading':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="0%" y="0" width="50%" height="30" />
          <Rect rx="3" ry="3" x="0%" y="40" width="100%" height="10" />

          <Rect rx="3" ry="3" x="0%" y="60" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="60" width="50%" height="40" />
          <Rect rx="3" ry="3" x="0%" y="110" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="110" width="50%" height="40" />

          <Rect rx="3" ry="3" x="0%" y="180" width="100%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="200" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="200" width="50%" height="40" />
          <Rect rx="3" ry="3" x="0%" y="250" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="250" width="50%" height="40" />
          <Rect rx="3" ry="3" x="0%" y="330" width="100%" height="20" />
        </RNContentLoader>
      );
    case 'balance_form_2_loading':
      return (
        <RNContentLoader
          speed={1}
          width={'100%'}
          height={'100%'}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}>
          <Rect rx="3" ry="3" x="0%" y="10" width="48%" height="10" />
          <Rect rx="3" ry="3" x="52%" y="0" width="48%" height="30" />

          <Rect rx="3" ry="3" x="0%" y="50" width="48%" height="10" />
          <Rect rx="3" ry="3" x="52%" y="50" width="48%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="70" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="70" width="48%" height="40" />

          <Rect rx="3" ry="3" x="0%" y="130" width="48%" height="10" />
          <Rect rx="3" ry="3" x="52%" y="130" width="48%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="150" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="150" width="48%" height="40" />

          <Rect rx="3" ry="3" x="0%" y="210" width="48%" height="10" />
          <Rect rx="3" ry="3" x="52%" y="210" width="48%" height="10" />
          <Rect rx="3" ry="3" x="0%" y="230" width="48%" height="40" />
          <Rect rx="3" ry="3" x="52%" y="230" width="48%" height="40" />
        </RNContentLoader>
      );
    default:
      return null;
  }
};

function ContentLoader(props) {
  return <Components {...props} />;
}

export default ContentLoader;
