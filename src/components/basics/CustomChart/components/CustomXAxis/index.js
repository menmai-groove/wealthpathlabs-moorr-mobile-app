import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Text as SVGText, TSpan } from 'react-native-svg';
import { AppStyle } from 'theme';

export const CustomXAxis = (props = {}) => {
  const {
    styles,
    style = {},
    scale = d3Scale.scaleLinear,
    data,
    xAccessor = ({ index }) => index,
    formatLabel = value => value,
    numberOfTicks,
    svg = {},
    activeSvg,
    children,
    min,
    max,
    selectedIndexes,
    contentInset = {},
  } = props;
  const { left = 0, right = 0 } = contentInset;
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const _onLayout = useCallback(
    event => {
      const {
        nativeEvent: {
          layout: { width: layoutWidth, height: layoutHeight },
        },
      } = event;

      if (layoutWidth !== width) {
        setWidth(layoutWidth);
        setHeight(layoutHeight);
      }
    },
    [width],
  );

  const _getX = domain => {
    const {
      scale: scaleInput,
      spacingInner = 0.05,
      spacingOuter = 0.05,
      // contentInset: { left = 0, right = 0 },
    } = props;

    const x = scaleInput()
      .domain(domain)
      .range([left, width - right]);

    if (scaleInput === d3Scale.scaleBand) {
      x.paddingInner([spacingInner]).paddingOuter([spacingOuter]);

      //add half a bar to center label
      return value => x(value) + x.bandwidth() / 2;
    }

    return x;
  };

  const values = data.map((item, index) => xAccessor({ item, index }));
  const extent = d3Array.extent(values);
  const domain = scale === d3Scale.scaleBand ? values : [min || extent[0], max || extent[1]];

  const x = _getX(domain);
  const ticks = numberOfTicks ? x.ticks(numberOfTicks) : values;

  const extraProps = {
    x,
    ticks,
    width,
    height,
    formatLabel,
  };

  if (data.length === 0) {
    return <View style={style} />;
  }

  return (
    <View style={style}>
      <View style={AppStyle.flexGrow1} onLayout={_onLayout}>
        {/*invisible text to allow for parent resizing*/}
        <Text
          style={[
            styles?.customXAxisText,
            {
              fontSize: svg.fontSize,
              fontFamily: svg.fontFamily,
              fontWeight: svg.fontWeight,
            },
          ]}>
          {typeof formatLabel === 'function' && formatLabel(ticks[0], 0)}
        </Text>
        {height > 0 && width > 0 && (
          <Svg
            style={[
              styles?.customXAxisSvg,
              {
                height,
                width,
              },
            ]}>
            <G>
              {React.Children.map(children, child => {
                return React.cloneElement(child, extraProps);
              })}
              {
                // don't render labels if width isn't measured yet,
                // causes rendering issues
                width > 0 &&
                  ticks.map((value, index) => {
                    const { svg: valueSvg = {}, x: newX } = data[index] || {};
                    const isSelected = selectedIndexes?.includes(index);
                    let positionX = newX ?? x(value);

                    let text =
                      (typeof formatLabel === 'function' && formatLabel(value, index)) || '';
                    const arrText = text.split('<br/>');

                    return (
                      <SVGText
                        textAnchor={'middle'}
                        originX={positionX}
                        alignmentBaseline={'hanging'}
                        {...valueSvg}
                        {...svg}
                        {...(isSelected ? activeSvg : {})}
                        key={index}
                        x={positionX}>
                        {arrText?.length > 0
                          ? arrText.map((txt, idx) => (
                              <TSpan key={idx} x={positionX} y={idx * 15}>
                                {txt || ''}
                              </TSpan>
                            ))
                          : text}
                      </SVGText>
                    );
                  })
              }
            </G>
          </Svg>
        )}
      </View>
    </View>
  );
};

CustomXAxis.defaultProps = {
  spacingInner: 0.05,
  spacingOuter: 0.05,
  contentInset: {},
  svg: {},
  xAccessor: ({ index }) => index,
  scale: d3Scale.scaleLinear,
  formatLabel: value => value,
};
