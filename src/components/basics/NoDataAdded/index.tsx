import React from 'react';
import TextField from 'components/basics/TextField';
import ButtonField from 'components/basics/ButtonField';
import FastImage, { Source } from 'react-native-fast-image';
import { View, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useThemedStyle } from 'providers';
import { AppStyle } from 'theme';
import { isEmpty, isNil } from 'lodash';

const i18nScope = 'screens.personalGoal.verticalTimeline';

interface INoDataAdded {
  source: number | Source;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

function NoDataAdded({ source, title, description, buttonText, onButtonPress }: INoDataAdded) {
  const styles = useThemedStyle(themedStyle, i18nScope);

  return (
    <View style={styles.container}>
      {!isNil(source) && <FastImage source={source} style={styles.image} />}
      <View style={[AppStyle.pad40, AppStyle.padBottom0, AppStyle.alignContent]}>
        {!isEmpty(title) && (
          <TextField type="heading-2" style={[AppStyle.textAlign]}>
            {title}
          </TextField>
        )}
        {!isEmpty(description) && (
          <TextField type="paragraph-2" style={[AppStyle.textAlign, AppStyle.marginTop10]}>
            {description}
          </TextField>
        )}
        {!isEmpty(buttonText) && (
          <ButtonField
            onPress={() => {
              typeof onButtonPress === 'function' && onButtonPress();
            }}
            style={[AppStyle.marginTop30, styles.btnAdd]}
            text={buttonText}
          />
        )}
      </View>
    </View>
  );
}

type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };

const themedStyle: NamedStyles = {
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  image: {
    height: 100,
    width: 100,
  },
  btnAdd: {
    minWidth: 200,
  },
};

export default NoDataAdded;
