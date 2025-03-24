import { debounce } from 'lodash';
import React, { forwardRef } from 'react';
import { Path } from 'react-native-svg';

const Slice = forwardRef(({ index, onSelect = () => {}, ...rest }, ref) => {
  return (
    <Path
      ref={ref}
      onPress={debounce(() => onSelect(index), 250, { leading: true, trailing: false })}
      {...rest}
    />
  );
});

export default Slice;
