import { G, Text } from 'react-native-svg';

const Labels = ({ slices }) => {
  const total = slices.reduce((sum, d) => sum + d.data.value, 0);

  return slices.map((slice, index) => {
    const { pieCentroid, data: _data } = slice;

    return (
      <G key={index}>
        <Text
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={12}>
          {((_data.value / total) * 100).toFixed(0)}%
        </Text>
      </G>
    );
  });
};

export default Labels;
