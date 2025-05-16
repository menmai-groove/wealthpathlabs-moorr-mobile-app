import CustomPieChart from 'components/basics/CustomPieChart';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FRUITS_DATA } from 'screens/Example/data';

const Example = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fruits Pie Chart</Text>
      <CustomPieChart chartData={FRUITS_DATA} />
    </View>
  );
};

export default Example;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
