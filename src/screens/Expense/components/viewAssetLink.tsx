import React, { forwardRef, useCallback } from 'react';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationServiceLib } from 'libs';
import screenID from 'constant/screenID';

function ViewAssetLink({ field, value: assetId }, ref) {
  const { label, assetType, assetName } = field;
  const styles = useThemedStyle(themedStyles);

  const onPress = useCallback(() => {
    if (assetId) {
      NavigationServiceLib.pop();
      NavigationServiceLib.navigate(screenID.EditAsset, {
        item: {
          id: [assetId],
          typeValue: assetType,
          name: assetName,
        },
      });
    }
  }, [assetId, assetName, assetType]);

  return (
    <TouchableOpacity ref={ref} onPress={onPress} style={styles.container}>
      <TextField style={[styles.text]}>
        {label} <FontAwesome5 name="chevron-circle-right" size={12} />
      </TextField>
    </TouchableOpacity>
  );
}
export default forwardRef(ViewAssetLink);

const themedStyles = {
  container: { alignItems: 'flex-end' },
  text: {
    color: 'palette.color-blue-3',
  },
  disabledContainer: {
    opacity: 0.5,
  },
};
