import * as shape from 'd3-shape';
import PropTypes from 'prop-types';

import Chart from '../PureChart';

class AreaChart extends Chart {
  createPaths({ data, x, y }) {
    const { curve, start } = this.props;

    const area = shape
      .area()
      .x(d => {
        let newD = d.newX ?? x(d.x);
        return newD;
      })
      .y0(y(start))
      .y1(d => d.newY ?? y(d.y))
      .defined(item => typeof item.y === 'number')
      .curve(curve)(data);

    const line = shape
      .line()
      .x(d => {
        let newD = d.newX ?? x(d.x);
        return newD;
      })
      .y(d => d.newY ?? y(d.y))
      .defined(item => typeof item.y === 'number')
      .curve(curve)(data);

    return {
      path: area,
      area,
      line,
    };
  }
}

AreaChart.propTypes = {
  ...Chart.propTypes,
  start: PropTypes.number,
};

AreaChart.defaultProps = {
  ...Chart.defaultProps,
  start: 0,
};

export default AreaChart;
