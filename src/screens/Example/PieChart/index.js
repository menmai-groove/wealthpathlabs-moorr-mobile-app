/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import * as d3Shape from 'd3-shape';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const defaultColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#8BC34A',
  '#E91E63',
];

const sampleDataSets = [
  [
    { label: 'Apple', value: 40 },
    { label: 'Banana', value: 30 },
    { label: 'Orange', value: 20 },
    { label: 'Grape', value: 10 },
  ],
  [
    { label: 'Red', value: 25 },
    { label: 'Blue', value: 25 },
    { label: 'Green', value: 25 },
    { label: 'Yellow', value: 25 },
  ],
];

const filterOptions = [
  { label: 'Fruits', value: 0 },
  { label: 'Colors', value: 1 },
];

function PieChart({ singleTooltip = true }) {
  const [filter, setFilter] = useState(0);
  const [tooltips, setTooltips] = useState([]); // [{idx, x, y}]
  const [showDropdown, setShowDropdown] = useState(false);

  const data = useMemo(
    () =>
      sampleDataSets[filter].map((d, i) => ({
        ...d,
        color: defaultColors[i % defaultColors.length],
      })),
    [filter],
  );

  const chartSize = Math.min(screenWidth - 32, 320);
  const outerRadius = chartSize / 2 - 10;
  const innerRadius = outerRadius / 2;

  const arcs = useMemo(() => {
    const pieGen = d3Shape
      .pie()
      .value(d => d.value)
      .sort(null);
    return pieGen(data);
  }, [data]);

  const arcGen = useMemo(
    () => d3Shape.arc().outerRadius(outerRadius).innerRadius(innerRadius),
    [outerRadius, innerRadius],
  );

  const handleSectionPress = (idx, arc) => {
    const [cx, cy] = arcGen.centroid(arc);
    const absX = cx + chartSize / 2;
    const absY = cy + chartSize / 2;

    let posX = absX,
      posY = absY;
    const tooltipWidth = 120,
      tooltipHeight = 60,
      padding = 8;
    if (absX + tooltipWidth / 2 > chartSize) {
      posX = chartSize - tooltipWidth / 2 - padding;
    }
    if (absX - tooltipWidth / 2 < 0) {
      posX = tooltipWidth / 2 + padding;
    }
    if (absY + tooltipHeight > chartSize) {
      posY = chartSize - tooltipHeight - padding;
    }
    if (absY < 0) {
      posY = padding;
    }

    if (singleTooltip) {
      setTooltips(prev =>
        prev.length === 1 && prev[0].idx === idx ? [] : [{ idx, x: posX, y: posY }],
      );
    } else {
      setTooltips(prev => {
        const exists = prev.find(t => t.idx === idx);
        if (exists) {
          return prev.filter(t => t.idx !== idx);
        }
        return [...prev, { idx, x: posX, y: posY }];
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
      <TouchableOpacity
        style={{
          margin: 16,
          padding: 12,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: '#ccc',
          flexDirection: 'row',
          alignItems: 'center',
          width: 160,
        }}
        onPress={() => setShowDropdown(true)}>
        <Text style={{ flex: 1 }}>{filterOptions[filter].label}</Text>
        <Text style={{ fontSize: 18 }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDropdown(false)}>
          <View
            style={{
              position: 'absolute',
              top: 60,
              left: 16,
              backgroundColor: '#fff',
              borderRadius: 8,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              width: 160,
            }}>
            {filterOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={{ padding: 14 }}
                onPress={() => {
                  setFilter(opt.value);
                  setShowDropdown(false);
                  setTooltips([]);
                }}>
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 24, flex: 1 }}>
        <Svg width={chartSize} height={chartSize}>
          <G x={chartSize / 2} y={chartSize / 2}>
            {arcs.map((arc, idx) => (
              <Path
                key={idx}
                d={arcGen(arc)}
                fill={data[idx].color}
                stroke="#fff"
                strokeWidth={2}
                onPress={() => handleSectionPress(idx, arc)}
              />
            ))}
          </G>
        </Svg>
        {tooltips.map(({ idx, x, y }) => (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - 60,
              width: 120,
              minHeight: 60,
              backgroundColor: '#222',
              borderRadius: 8,
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              elevation: 10,
            }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {data[idx].label}
            </Text>
            <Text style={{ color: '#fff', fontSize: 14 }}>{data[idx].value}</Text>
            <TouchableOpacity
              style={{ position: 'absolute', top: 4, right: 8 }}
              onPress={() => setTooltips(tl => tl.filter(t => t.idx !== idx))}>
              <Text style={{ color: '#fff', fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

export default PieChart;
