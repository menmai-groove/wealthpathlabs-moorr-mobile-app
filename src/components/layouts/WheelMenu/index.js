import menuData from 'assets/jsons/navigation-menu.json';
import WheelPicker from 'components/layouts/WheelPicker';
import WheelPickerItem1 from 'components/layouts/WheelPicker/components/WheelPickerItem1';
import WheelPickerItem2 from 'components/layouts/WheelPicker/components/WheelPickerItem2';
import WheelPickerItem3 from 'components/layouts/WheelPicker/components/WheelPickerItem3';
import { useThemedStyle } from 'providers';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { default as FAIcon } from 'react-native-vector-icons/FontAwesome';

import themedStyles from './style';

const i18nScope = 'components.wheelMenu';

function WheelMenu({}) {
  const styles = useThemedStyle(themedStyles, i18nScope);
  const [firstCircleVisible, setFirstCircleVisible] = useState(false);
  const [secondCircleVisible, setSecondCircleVisible] = useState(false);
  const [thirdCircleVisible, setThirdCircleVisible] = useState(false);
  const [item1, setItem1] = useState([]);
  const [item2, setItem2] = useState([]);

  const handleOnPress = ({ level, element }) => {
    const isExisted = element?.children?.length > 0;
    switch (level) {
      case 1:
        setSecondCircleVisible(isExisted);
        isExisted && setItem1(element?.children);
        break;
      case 2:
        setThirdCircleVisible(isExisted);
        isExisted && setItem2(element.children);
        break;
      case 3:
        if (element?.children) {
        }
        break;
    }
  };

  return (
    <View>
      <WheelPicker
        visible={firstCircleVisible && thirdCircleVisible}
        data={item2}
        onPress={() => {}}
        onCenteredItemRelease={element => {
          handleOnPress({
            level: 3,
            element,
          });
        }}
        size={550}
        itemSize={(550 - 350) / 2}
        maxToRenderPerBatch={9}
        renderItem={props => <WheelPickerItem3 {...props} itemSize={(550 - 350) / 2} size={550} />}
      />
      <WheelPicker
        style={styles.wheelPickerContainer}
        visible={firstCircleVisible && secondCircleVisible}
        data={item1}
        onPress={() => {}}
        onCenteredItemRelease={element => {
          handleOnPress({
            level: 2,
            element,
          });
        }}
        size={350}
        itemSize={(350 - 200) / 2}
        maxToRenderPerBatch={5}
        renderItem={props => <WheelPickerItem2 {...props} itemSize={(350 - 200) / 2} size={350} />}
      />
      <WheelPicker
        style={styles.wheelPickerContainer}
        visible={firstCircleVisible}
        data={menuData.data}
        onPress={() => {}}
        onCenteredItemRelease={element => {
          handleOnPress({
            level: 1,
            element,
          });
        }}
        size={200}
        itemSize={(200 - 50) / 2}
        maxToRenderPerBatch={5}
        renderItem={props => <WheelPickerItem1 {...props} itemSize={(200 - 50) / 2} size={200} />}
      />
      <View style={styles.wheelButtonContainer}>
        <Pressable
          style={[
            styles.wheelButton,
            {
              backgroundColor: styles.primary.color,
            },
          ]}
          onPress={() => {
            setFirstCircleVisible(prevState => !prevState);
          }}>
          <FAIcon name="bars" style={styles.backButton} />
        </Pressable>
      </View>
    </View>
  );
}

export default WheelMenu;
