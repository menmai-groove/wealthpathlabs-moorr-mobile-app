import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function AssetStoryIcon(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={18.321}
      viewBox="0 0 20 18.321"
      {...props}>
      <G data-name="Group 156720">
        <Path
          data-name="Path 77958"
          d="M72.485 81.349v9.407h4.782v-6.271h4.7v6.271h4.782v-9.407l-7.13-5.969z"
          transform="translate(-69.654 -72.435)"
          fill="#72228d"
        />
        <Path
          data-name="Path 77957"
          d="M19.414 9.241a.583.583 0 01-.373-.135L9.887 1.529.965 9.1a.586.586 0 11-.758-.893L9.878 0l9.91 8.2a.586.586 0 01-.374 1.037"
          fill="#66e84b"
        />
      </G>
    </Svg>
  );
}

export default AssetStoryIcon;
