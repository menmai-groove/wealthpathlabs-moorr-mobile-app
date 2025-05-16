/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const ModeToggle = ({ mode, onChange }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Text style={{ fontWeight: 'bold' }}>Tooltip Mode:</Text>
      <TouchableOpacity onPress={() => onChange('single')}>
        <Text>{mode === 'single' ? '🔘' : '⚪'} Single</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChange('multi')}>
        <Text>{mode === 'multi' ? '🔘' : '⚪'} Multi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModeToggle;
