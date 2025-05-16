/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from 'react-native';
import { ColorConsts, PieChartConsts, TooltipConsts } from 'screens/Example/constants';

const styles = StyleSheet.create({
  pieChartContainer: {
    alignItems: 'center',
    width: '100%',
    minHeight: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  pieChart: {
    height: PieChartConsts.HEIGHT,
    width: PieChartConsts.WIDTH,
  },
  tooltipWrapper: {
    position: 'absolute',
    backgroundColor: ColorConsts.LIGHT_GRAY,
    padding: 5,
    borderRadius: 5,
    elevation: 5,
    shadowColor: ColorConsts.BLACK,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    zIndex: 1000,
    width: TooltipConsts.WIDTH,
    height: TooltipConsts.HEIGHT,
  },
  tooltipLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  tooltipValue: {
    fontStyle: 'italic',
    fontSize: 10,
  },
});

export default styles;
