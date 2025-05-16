/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import CheckBox from 'components/basics/CheckBox';
import * as d3Shape from 'd3-shape';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
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

const fruitsData = [
  { label: 'Apple', value: 40 },
  { label: 'Banana', value: 30 },
  { label: 'Orange', value: 20 },
  { label: 'Grape', value: 10 },
  { label: 'Pineapple', value: 25 },
  { label: 'Mango', value: 35 },
  { label: 'Strawberry', value: 15 },
  { label: 'Blueberry', value: 20 },
];

function PieChart({ singleTooltip = true }) {
  const [selectedItems, setSelectedItems] = useState(fruitsData.map((_, idx) => idx));
  const [showDropdown, setShowDropdown] = useState(false);
  const [tooltips, setTooltips] = useState([]); // [{idx, x, y}]

  // Filtered data based on selected items
  const data = useMemo(
    () =>
      fruitsData
        .filter((_, idx) => selectedItems.includes(idx))
        .map((d, i) => ({
          ...d,
          color: defaultColors[i % defaultColors.length],
        })),
    [selectedItems],
  );

  // Tính tổng giá trị của các mục được chọn
  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

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

  const toggleItemSelection = idx => {
    setSelectedItems(prev =>
      prev.includes(idx) ? prev.filter(item => item !== idx) : [...prev, idx],
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === fruitsData.length) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(fruitsData.map((_, idx) => idx)); // Select all
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
      {/* Tổng giá trị */}
      <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Total: {totalValue}
      </Text>

      {/* Filter Dropdown */}
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
        <Text style={{ flex: 1 }}>All</Text>
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
              width: 200,
            }}>
            <TouchableOpacity
              style={{
                padding: 14,
                backgroundColor: selectedItems.length === fruitsData.length ? '#e0e0e0' : '#fff',
              }}
              onPress={toggleSelectAll}>
              <Text>
                {selectedItems.length === fruitsData.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <FlatList
              data={fruitsData}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item, index }) => (
                <CheckBox
                  label={item.label}
                  value={selectedItems.includes(index)}
                  onChange={() => toggleItemSelection(index)}
                  containerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                  }}
                />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Pie Chart */}
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
            <Text style={{ color: '#fff', fontSize: 14 }}>
              {data[idx].value} ({((data[idx].value / totalValue) * 100).toFixed(1)}%)
            </Text>
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
