import { RangeChartTooltip } from 'components/basics/CustomChart/components/RangeChartTooltip';
import deepmerge from 'deepmerge';
import util from 'libs/util';
import * as React from 'react';

const RangeChartTooltipV2 = props => {
  const {
    value,
    position,
    //
    type,
    width,
    styles,
    valueAccessor,
    tooltipValueAccessor,
    formatValue,
    tooltipFormatValue,
  } = deepmerge(defaultProps, props);
  if (!value || !position) {
    return null;
  }

  return (
    <RangeChartTooltip
      key={value.x}
      type={type}
      width={util.safePositiveValue(width)}
      styles={styles}
      value={valueAccessor(value)}
      tooltipValue={tooltipValueAccessor(value)}
      formatValue={formatValue}
      tooltipFormatValue={tooltipFormatValue}
      newX={position.x}
      newY={position.y}
      border={{
        borderColor: '#fff',
        borderWidth: 1,
      }}
    />
  );
};

export { RangeChartTooltipV2 };

const defaultProps = {
  theme: {
    label: {
      color: 'white',
      fontSize: 12,
      fontWeight: 700,
      textAnchor: 'middle',
      opacity: 1,
      dx: 0,
      dy: 16.5,
    },
    shape: {
      width: 35,
      height: 20,
      dx: 0,
      dy: 20,
      rx: 4,
      color: 'black',
    },
    formatter: v => String(v.y),
  },
};
