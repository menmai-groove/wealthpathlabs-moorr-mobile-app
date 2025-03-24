import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const Home = ({ active = false, ...props }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={20} height={18.321} {...props}>
    <G data-name="Group 156720">
      <Path
        data-name="Path 77958"
        d="M2.831 8.914v9.407h4.782V12.05h4.7v6.271h4.782V8.914l-7.13-5.969Z"
        fill={active ? '#fff' : '#72228d'}
      />
      <Path
        data-name="Path 77957"
        d="M19.414 9.241a.583.583 0 0 1-.373-.135L9.887 1.529.965 9.1a.586.586 0 1 1-.758-.893L9.878 0l9.91 8.2a.586.586 0 0 1-.374 1.037"
        fill="#66e84b"
      />
    </G>
  </Svg>
);

export default Home;
