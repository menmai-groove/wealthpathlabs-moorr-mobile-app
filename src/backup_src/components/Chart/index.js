import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers/';
import React from 'react';
import { View } from 'react-native';
import { Circle, G, Rect, Text as RNSVGTEXT } from 'react-native-svg';
import { BarChart, Grid, LineChart, PieChart, XAxis, YAxis } from 'react-native-svg-charts';

import themedStyles from './style';

const i18nScope = 'components.chart';

function Chart({
  selectedData,
  data = [],
  onSelect = () => {},
  explanatory = [],
  type = 'bar',
  label = '',
  centerLabel = '',
  ...rest
}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const isBar = type === 'bar';
  const isLine = type === 'line';
  const isPie = type === 'pie';

  const CUT_OFF = 20;
  const Labels = ({ x, y, bandwidth, labels }) =>
    labels.map((item, index) => {
      const value = item.value ?? item;
      if (value === 0) {
        return null;
      }
      if (selectedData.index === index) {
        return (
          <RNSVGTEXT
            key={index}
            x={x(index) + bandwidth / 2}
            y={value < CUT_OFF ? y(value) - 10 : y(value) + 15}
            fontSize={14}
            fill={value >= CUT_OFF ? 'white' : 'black'}
            alignmentBaseline={'middle'}
            textAnchor={'middle'}>
            {value}
          </RNSVGTEXT>
        );
      }

      return null;
    });

  const Tooltip = ({ x, y, tooltips }) =>
    tooltips.map((item, index) => {
      const value = item.value ?? item;
      if (value === 0) {
        return null;
      }
      return (
        <G x={x(index) - 75 / 2} key={'tooltip' + index} onPress={() => onSelect(value, index)}>
          {selectedData?.index === index && (
            <G y={50}>
              <Rect height={40} width={75} stroke={'grey'} fill={'white'} ry={10} rx={10} />
              <RNSVGTEXT
                x={75 / 2}
                dy={20}
                alignmentBaseline={'middle'}
                textAnchor={'middle'}
                stroke={styles.primary.color}>
                {`${data[index]}ºC`}
              </RNSVGTEXT>
            </G>
          )}
          <G x={75 / 2}>
            {/* <Line y1={50 + 40} y2={y(data[5])} stroke={'grey'} strokeWidth={2} /> */}
            <Circle
              cy={y(data[index])}
              r={6}
              stroke={styles.primary.color}
              strokeWidth={2}
              fill={'white'}
            />
          </G>
        </G>
      );
    });

  const PieLabels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { pieCentroid, data: d } = slice;
      const value = d.value;
      if (value === 0) {
        return null;
      }
      if (selectedData.index === index) {
        return (
          <RNSVGTEXT
            key={index}
            x={pieCentroid[0]}
            y={pieCentroid[1]}
            fill={'black'}
            textAnchor={'middle'}
            alignmentBaseline={'middle'}
            fontSize={20}
            stroke={'black'}
            strokeWidth={0.2}>
            {value}
          </RNSVGTEXT>
        );
      }

      return null;
    });
  };

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartRow}>
        {!isPie && (
          <YAxis
            style={styles.labelLeft}
            data={data}
            yAccessor={({ item }) => item.value ?? item}
            contentInset={{ top: 20, bottom: 20 + 20 }}
            numberOfTicks={data.length}
            svg={{
              fill: 'grey',
              fontSize: 10,
            }}
            formatLabel={value => `${value}ºC`}
          />
        )}
        <View style={styles.chartColumn}>
          {isBar && (
            <BarChart
              style={styles.barChart}
              data={data}
              yAccessor={({ item }) => item.value ?? item}
              contentInset={{ top: 20, bottom: 20 }}
              numberOfTicks={data.length}
              svg={{ fill: styles.primary.color + '50' }}
              // spacing={0.2}
              gridMin={0}
              gridMax={25}
              // animate={true}
              // spacingInner={0.5}
              {...rest}>
              <Grid />
              <Labels labels={data} />
            </BarChart>
          )}
          {isLine && (
            <LineChart
              style={styles.lineChart}
              data={data}
              yAccessor={({ item }) => item.value ?? item}
              contentInset={{ top: 20, bottom: 20 }}
              numberOfTicks={data.length}
              svg={{
                stroke: styles.primary.color,
                strokeWidth: 2,
              }}
              {...rest}>
              <Grid />
              <Tooltip tooltips={data} />
            </LineChart>
          )}
          {isPie && (
            <View style={styles.pieChart}>
              <View style={styles.centerLabelContainer}>
                <TextField>{centerLabel}</TextField>
              </View>
              <PieChart
                style={styles.pieChart}
                valueAccessor={({ item }) => item.value}
                data={data}
                spacing={0}
                outerRadius={'80%'}
                innerRadius={'45%'}
                {...rest}>
                <PieLabels slices={data} />
              </PieChart>
            </View>
          )}
          {!isPie && (
            <XAxis
              style={styles.labelBottom}
              data={data}
              // xAccessor={({ item }) => item.value ?? item}
              contentInset={{ left: 20, right: 20 }}
              numberOfTicks={data.length}
              svg={{
                fill: 'grey',
                fontSize: 10,
              }}
              formatLabel={value => `T${value}`}
            />
          )}
        </View>
        {!isPie && (
          <YAxis
            style={styles.labelRight}
            data={data}
            yAccessor={({ item }) => item.value ?? item}
            contentInset={{ top: 20, bottom: 20 + 20 }}
            numberOfTicks={data.length}
            svg={{
              fill: 'grey',
              fontSize: 10,
            }}
          />
        )}
      </View>
      {explanatory.length > 0 && (
        <View style={styles.explanatoryContainer}>
          {explanatory.map((item, index) => (
            <View key={`explanatory-${index}`} style={styles.explanatoryItem}>
              <View
                style={[
                  styles.thumbnail,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              />
              <TextField style={styles.explanatoryText}>{item.label}</TextField>
            </View>
          ))}
        </View>
      )}
      <View style={styles.titleContainer}>
        <TextField style={styles.titleText}>{label}</TextField>
      </View>
    </View>
  );
}

export default Chart;
