import util from 'libs/util';
import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export function Loader() {
  const { width: widthScreen, height: heightScreen } = useWindowDimensions();
  const headHeight = 50;
  return (
    <ScrollView>
      <ContentLoader
        speed={2}
        width={util.safePositiveValue(widthScreen)}
        height={heightScreen}
        viewBox={`0 0 ${widthScreen} ${heightScreen}`}
        backgroundColor="#b5b5b5"
        foregroundColor="#cccccc">
        <Rect x="20" y="15" width="75" height="32" rx={'15'} ry={'15'} />
        <Rect x="105" y="15" width="75" height="32" rx={'15'} ry={'15'} />
        <Rect x="190" y="15" width="75" height="32" rx={'15'} ry={'15'} />
        <Rect x="275" y="15" width="75" height="32" rx={'15'} ry={'15'} />
        <Rect x="360" y="15" width="75" height="32" rx={'15'} ry={'15'} />

        <Rect x="15" y={headHeight + 15} width="50" height="30" rx="5" ry="5" />
        <Rect
          x="65"
          y={headHeight + 28}
          width={util.safePositiveValue(widthScreen - 65)}
          height="1"
        />
        <Rect
          x="50"
          y={headHeight + 60}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
        <Rect
          x="50"
          y={headHeight + 150}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
        <Rect x="15" y={headHeight + 235} width="50" height="30" rx="5" ry="5" />
        <Rect
          x="65"
          y={headHeight + 248}
          width={util.safePositiveValue(widthScreen - 65)}
          height="1"
        />
        <Rect
          x="50"
          y={headHeight + 280}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
        <Rect
          x="50"
          y={headHeight + 370}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
        <Rect x="15" y={headHeight + 455} width="50" height="30" rx="5" ry="5" />
        <Rect
          x="65"
          y={headHeight + 468}
          width={util.safePositiveValue(widthScreen - 65)}
          height="1"
        />
        <Rect
          x="50"
          y={headHeight + 500}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
        <Rect
          x="50"
          y={headHeight + 590}
          rx="10"
          ry="10"
          width={util.safePositiveValue(widthScreen - 65)}
          height="70"
        />
      </ContentLoader>
    </ScrollView>
  );
}
