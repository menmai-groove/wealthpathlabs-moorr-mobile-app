import util from 'libs/util';
import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const Money = ({ active = false, width = 18, height = 18, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={util.safePositiveValue(width)}
    height={util.safePositiveValue(height)}
    viewBox="0 0 18 18"
    {...props}>
    <G data-name="Group 157171">
      <Path
        data-name="Path 78632"
        d="M18 9.767c-.111.555-.186 1.12-.338 1.663a9 9 0 1 1 .251-3.658c.027.175.058.349.088.524Z"
        fill={active ? '#72228d' : '#72228d'}
      />
      <Path
        data-name="Path 78633"
        d="M9.882 4.25V3.227a.979.979 0 0 0-1.946-.2 1.02 1.02 0 0 0 0 .2v1.092a2.929 2.929 0 0 0 .988 5.686.935.935 0 0 1 .881.6.9.9 0 0 1-.183 1.025.852.852 0 0 1-1.031.25 3.7 3.7 0 0 1-.913-.644 1 1 0 0 0-1.42-.125h-.006a.979.979 0 0 0-.083 1.382.878.878 0 0 0 .06.062 4.129 4.129 0 0 0 1.7 1.174v1.145a.973.973 0 0 0 1.945.014 5.941 5.941 0 0 0 0-.747.489.489 0 0 1 .333-.559 2.912 2.912 0 0 0 .32-5.03 2.992 2.992 0 0 0-1.62-.5.942.942 0 0 1-.905-.621.967.967 0 0 1 1.245-1.252 2.8 2.8 0 0 1 .685.42 1 1 0 0 0 1.409-.008l.016-.017a.956.956 0 0 0-.04-1.351.967.967 0 0 0-.1-.081c-.4-.322-.855-.572-1.336-.888"
        fill="#66e84b"
      />
    </G>
  </Svg>
);

export default Money;
