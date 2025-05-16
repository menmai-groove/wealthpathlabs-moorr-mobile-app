/* eslint-disable react-native/no-inline-styles */
import FilterDropdown from 'components/basics/CustomPieChart/FilterDropdown';
import ModeToggle from 'components/basics/CustomPieChart/ModeToggle';
import styles from 'components/basics/CustomPieChart/style';
import Tooltip from 'components/basics/CustomPieChart/Tooltip';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { PieChartConsts } from 'screens/Example/constants';

const CustomPieChart = ({ chartData }) => {
  const [selectedLabels, setSelectedLabels] = useState(chartData.map(d => d.label));
  const [filteredData, setFilteredData] = useState(chartData);
  const [tooltipMode, setTooltipMode] = useState('single');
  const [tooltips, setTooltips] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const filtered = chartData.filter(d => selectedLabels.includes(d.label));
    setFilteredData(filtered);
  }, [selectedLabels, chartData]);

  useEffect(() => {
    setTooltips([]);
  }, [selectedLabels, tooltipMode]);

  const total = filteredData.reduce((sum, acc) => sum + acc.value, 0);

  const pieChartData = filteredData.map(data => ({
    ...data,
    svg: {
      fill: data.color,
      onPress: event => {
        const absX = Number(event?.nativeEvent?.pageX ?? 0);
        const absY = Number(event?.nativeEvent?.pageY ?? 0);

        containerRef?.current?.measure((_fx, _fy, _width, height, px, py) => {
          const relativeX = absX - px;
          const relativeY = absY - py;

          const newTooltip = {
            x: relativeX,
            y: relativeY,
            data,
            containerHeight: height,
          };

          if (!isNaN(relativeX) && !isNaN(relativeY)) {
            if (tooltipMode === 'single') {
              setTooltips([newTooltip]);
            } else {
              setTooltips(prev => {
                const exists = prev.some(t => t.data.label === newTooltip.data.label);

                if (exists) {
                  // If already exists → remove it (hide tooltip)
                  return prev.filter(t => t.data.label !== newTooltip.data.label);
                } else {
                  // Else → add it
                  return [...prev, newTooltip];
                }
              });
            }
          }
        });
      },
    },
  }));

  return (
    <View style={styles.pieChartContainer} ref={containerRef}>
      <View style={{ flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <FilterDropdown
          options={chartData}
          selected={selectedLabels}
          onChange={setSelectedLabels}
        />
        <ModeToggle mode={tooltipMode} onChange={setTooltipMode} />
        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
          {total > 0 ? `Total: ${total}` : 'No data available. Please select at least one item.'}
        </Text>
      </View>

      <PieChart
        style={styles.pieChart}
        data={pieChartData}
        valueAccessor={({ item }) => item.value}
        innerRadius={PieChartConsts.INNER_RADIUS}
        outerRadius={PieChartConsts.OUTER_RADIUS}
        padAngle={PieChartConsts.PAD_ANGLE}
      />

      {tooltips.map((tt, idx) => (
        <Tooltip key={idx} tooltip={tt} total={total} />
      ))}
    </View>
  );
};

export default CustomPieChart;
