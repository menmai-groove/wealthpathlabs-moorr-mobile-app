import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function SpendingIcon({ active = false, ...props }) {
  return (
    <Svg
      data-name="Group 156443"
      xmlns="http://www.w3.org/2000/svg"
      width={20.002}
      height={20}
      viewBox="0 0 20.002 20"
      {...props}>
      <G data-name="Group 156440" fill={active ? '#72228d' : '#888'}>
        <Path
          data-name="Path 77960"
          d="M14.8 190.508a1.927 1.927 0 01-1.925-1.929v-.919a1.927 1.927 0 011.925-1.929h3.118v-1.971A1.759 1.759 0 0016.16 182H1.757A1.759 1.759 0 000 183.762v8.717a1.759 1.759 0 001.757 1.76h14.4a1.759 1.759 0 001.757-1.76v-1.971z"
          transform="translate(0 7.762) translate(0 -182.001)"
        />
        <Path
          data-name="Path 77961"
          d="M325.729 286.5h-4.416a.815.815 0 00-.814.816v1.7a.815.815 0 00.814.815h4.416a.815.815 0 00.814-.815v-1.7a.815.815 0 00-.814-.816m-3.229 2.985a1.322 1.322 0 111.319-1.322 1.321 1.321 0 01-1.319 1.322"
          transform="translate(0 7.762) translate(-306.86 -282.045)"
        />
        <Path
          data-name="Path 77962"
          d="M352.862 310.183a.681.681 0 11-.681-.682.682.682 0 01.681.682"
          transform="translate(0 7.762) translate(-336.54 -304.064)"
        />
      </G>
      <G data-name="Group 156441" fill={active ? '#66e84b' : '#c3c3c3'}>
        <Path
          data-name="Path 77959"
          d="M378.714 2.559a.355.355 0 01-.358.172c-.211-.01-.423 0-.653 0a4.507 4.507 0 01-1.492 3.315.845.845 0 01-1.075.05l-.184-.138a.606.606 0 01-.051-.929 2.342 2.342 0 00.527-.7 2.409 2.409 0 00.21-1.6c-.23 0-.463.014-.693-.006a.376.376 0 01-.274-.139.359.359 0 01.057-.3q.735-1.017 1.494-2.017a1.781 1.781 0 01.322-.267l.265.009a3.11 3.11 0 01.369.348c.3.385.585.785.879 1.176.213.283.431.561.647.842l.01.184"
          transform="translate(2.937) translate(-361.648)"
        />
        <Path
          data-name="Path 77963"
          d="M69 43.832h1.745l5.788-3.07.009-1.372a.968.968 0 00-1.6-.737z"
          transform="translate(2.937) translate(-69 -36.774)"
        />
        <Path
          data-name="Path 77964"
          d="M146.5 96.647h7.32V94.61a1.027 1.027 0 00-1.49-.918z"
          transform="translate(2.937) translate(-143.202 -89.59)"
        />
      </G>
    </Svg>
  );
}

export default SpendingIcon;
