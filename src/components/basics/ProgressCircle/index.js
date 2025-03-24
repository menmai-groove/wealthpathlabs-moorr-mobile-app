// // https://wattenberger.com/blog/gauge
// import React, { useState } from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import Svg, {
//   Circle,
//   Defs,
//   G,
//   LinearGradient as SvgLinearGradient,
//   Path,
//   Stop,
//   Text as SvgText,
// } from 'react-native-svg';
// import LinearGradient from 'react-native-linear-gradient';
// import * as shape from 'd3-shape';
// const d3 = { shape };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   graphWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export const ProgressCircle = ({
//   style,
//   size = 200,
//   width = 200,
//   height = 200,
//   outerRadius = size / 2,
//   // activeOuterRadius = size / 2,
//   // tooltipOuterRadius = size / 2,
//   innerRadius = 0,
//   cornerRadius = 45,

//   progress = 0,
//   progressColor = 'rgb(134, 65, 244)',
//   backgroundColor = '#f2f2f8',

//   startAngle = 0,
//   endAngle = 2 * Math.PI,
//   strokeWidth = 0,
//   children,
//   onSelect = () => { },
// }) => {
//   const radius = size / 2;

//   const newOuterRadius =
//     typeof outerRadius === 'string'
//       ? (radius * parseFloat(outerRadius)) / 100
//       : outerRadius;
//   // const newActiveOuterRadius =
//   //   typeof activeOuterRadius === 'string'
//   //     ? radius * parseFloat(activeOuterRadius) / 100
//   //     : activeOuterRadius;
//   // const newTooltipOuterRadius =
//   //   typeof tooltipOuterRadius === 'string'
//   //     ? radius * parseFloat(tooltipOuterRadius) / 100
//   //     : tooltipOuterRadius;
//   const newInnerRadius =
//     typeof innerRadius === 'string'
//       ? (radius * parseFloat(innerRadius)) / 100
//       : innerRadius;

//   const data = [
//     {
//       key: 'rest',
//       value: 1 - progress,
//       color: backgroundColor,
//     },
//     {
//       key: 'progress',
//       value: progress,
//       color: progressColor,
//     },
//   ];

//   const pieSlices = d3.shape
//     .pie()
//     .value(d => d.value)
//     .sort(a => (a.key === 'rest' ? 1 : -1))
//     .startAngle(startAngle)
//     .endAngle(endAngle)(data);

//   const arcs = pieSlices.map((slice, index) => ({
//     ...data[index],
//     ...slice,
//     path: d3.shape
//       .arc()
//       .outerRadius(newOuterRadius) // Radius of the pie
//       .innerRadius(newInnerRadius) // Inner radius: to create a donut or pie
//       .startAngle(index === 0 ? startAngle : slice.startAngle)
//       .endAngle(index === 0 ? endAngle : slice.endAngle)
//       .cornerRadius(cornerRadius)(),
//     tooltipPath: d3.shape
//       .arc()
//       .outerRadius(newOuterRadius) // Radius of the pie
//       .innerRadius(newInnerRadius) // Inner radius: to create a donut or pie
//       // .startAngle(index === 0 ? startAngle : slice.startAngle)
//       // .endAngle(index === 0 ? endAngle : slice.endAngle)
//       .startAngle(index === 0 ? -Math.PI / 2 : Math.PI / 2)
//       .endAngle(index === 0 ? -Math.PI / 2 : Math.PI / 2)
//       .cornerRadius(cornerRadius)
//       .centroid(),
//   }));

//   const renderRight = (text, direction) => {
//     const [width, setWidth] = useState(0);
//     const [height, setHeight] = useState(0);
//     return (
//       <View
//         style={[
//           {
//             position: 'absolute',
//           },
//           direction === 'left'
//             ? {
//               left: -width / 2,
//             }
//             : {
//               right: -width / 2,
//             },
//         ]}
//         onLayout={e => {
//           const textLayout = e.nativeEvent.layout;
//           const { height, width } = textLayout;
//           setWidth(width);
//           setHeight(height);
//         }}>
//         <Text
//           style={{
//             fontSize: 12,
//             color: '#222222',
//             textAlign: 'center',
//           }}>
//           {text}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.graphWrapper}>
//         <Svg
//           style={style}
//           width={width}
//           height={height / 2}
//           viewBox={`${-width / 2} ${-height / 2} ${width} ${height / 2}`}>
//           <Defs>
//             {data.map((item, index) => {
//               return (
//                 <SvgLinearGradient key={index} id={`gradient-${index}`}>
//                   {item.color.length > 0 &&
//                     item.color.map((color, index) => {
//                       return (
//                         <Stop
//                           key={`stop-path-${index}`}
//                           offset={index / (item.color.length - 1)}
//                           stopColor={color}
//                         />
//                       );
//                     })}
//                 </SvgLinearGradient>
//               );
//             })}
//           </Defs>
//           <G>
//             {arcs.map((shape, index) => {
//               return (
//                 <Path
//                   key={index}
//                   fill={`url(#gradient-${index})`}
//                   d={shape.path}
//                 // animate={animate}
//                 // animationDuration={animateDuration}
//                 />
//               );
//             })}
//           </G>
//         </Svg>
//         <View
//           style={{
//             position: 'absolute',
//             bottom: 0,
//           }}>
//           <LinearGradient
//             colors={['#f8f6fb', '#fff']}
//             style={{
//               justifyContent: 'center',
//               alignItems: 'center',
//               width: 170,
//               height: 170 / 2,
//               borderTopStartRadius: 170 / 2,
//               borderTopEndRadius: 170 / 2,
//               borderWidth: 1,
//               borderColor: '#f8f6fb',
//               backgroundColor: '#f8f6fb',
//             }}>
//             <Text style={{ fontSize: 12, color: '#222222' }}>
//               Current Surplus
//             </Text>
//             <Text
//               style={{
//                 fontSize: 18,
//                 color: '#222222',
//                 fontWeight: '600',
//                 marginTop: 5,
//               }}>
//               $20,000
//             </Text>
//           </LinearGradient>
//         </View>

//       </View>
//       <View
//         style={{
//           marginTop: 11,
//           height: 20,
//           width
//         }}>
//         <View style={{ position: 'absolute', left: 0 }}>
//           {renderRight('$0', 'left')}
//         </View>
//         <View style={{ position: 'absolute', right: 0 }}>
//           {renderRight('$300,000', 'right')}
//         </View>
//       </View>
//     </View>
//   );
// };
