/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, View } from 'react-native';

import PieChart from './PieChart';

const data = [
  { label: 'A', value: 40, color: '#FF6384' },
  { label: 'B', value: 30, color: '#36A2EB' },
  { label: 'C', value: 20, color: '#FFCE56' },
  { label: 'D', value: 10, color: '#4BC0C0' },
];

const Example = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Example</Text>
      <PieChart singleTooltip={true} />
    </View>
  );
};

export default Example;
