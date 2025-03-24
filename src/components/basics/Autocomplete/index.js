import InputField from 'components/basics/InputField';
import TextField from 'components/basics/TextField';
import { useThemedStyle } from 'providers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

import themedStyles from './style';

function AutocompleteComponent(props, ref) {
  const styles = useThemedStyle(themedStyles, 'components.autocomplete');
  const {
    data = [],
    error,
    readOnly = false,
    onChangeText,
    onSubmitEditing,
    value,
    onSelectText = () => {},
    placement = 'top',
    key = '',
    type = 'absolute',
    isNetwork,
    LeftComponent,
    RightComponent,
    keepResultsAfterBlur,
    onEndReached = () => {},
    onEndReachedThreshold = 0.25,
    placeholder = '',
    listKey,
    maxLength,
    ...restProps
  } = props;

  const [filterData, setFilterData] = useState([]);
  const [inputHeight, setInputHeight] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const query = useRef();
  const inputRef = useRef();

  useEffect(() => {
    query.current = value;
  }, [value]);

  const handleChangeText = useCallback(
    text => {
      if (!isNetwork) {
        if (text?.trim().length) {
          setFilterData(
            data.filter(item => item.title?.toLowerCase()?.includes(text?.toLowerCase())),
          );
        } else {
          setFilterData([]);
        }
      }

      onChangeText(text);
      query.current = text;
    },
    [data, isNetwork, onChangeText],
  );

  const getKeyExtractor = useCallback(
    (item, index) => key + (item.id?.toString() || index.toString()),
    [key],
  );

  const getHighLightWords = useCallback((text, word) => {
    const textArr = text?.toLowerCase().split(word?.toLowerCase());
    const chunks = [];
    for (let i = 0; i < textArr.length; i++) {
      if (i === 0) {
        chunks.push({
          start: 0,
          end: textArr[i].length,
          text: text.substr(0, textArr[i].length),
          highlight: false,
        });
      } else {
        chunks.push({
          start: chunks[chunks.length - 1].end,
          end: chunks[chunks.length - 1].end + textArr[i].length,
          text: text.substr(chunks[chunks.length - 1].end, textArr[i].length),
          highlight: false,
        });
      }
      if (i < textArr.length - 1) {
        chunks.push({
          start: chunks[chunks.length - 1].end,
          end: chunks[chunks.length - 1].end + word.length,
          text: text.substr(chunks[chunks.length - 1].end, word.length),
          highlight: true,
        });
      }
    }
    return chunks.filter(item => item.text.length);
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const chunks = getHighLightWords(item.title, query.current?.trim());
      const active = chunks.find(x => x.highlight);
      return (
        <TouchableOpacity
          key={`item-${item.id}`}
          style={[styles.optionsItem, active && styles.optionsItemActive]}
          onPress={() => {
            handleChangeText(item.title);
            onSelectText(item);
            inputRef.current?.blur();
            setIsFocus(false);
            !isNetwork && setFilterData([]);
          }}>
          <TextField style={[styles.optionsText, active && styles.optionsTextActive]}>
            {chunks.map((chunk, index) =>
              chunk.highlight ? (
                <TextField key={`chunk-${index}`} font="bold" style={styles.textHightlight}>
                  {chunk.text}
                </TextField>
              ) : (
                chunk.text
              ),
            )}
          </TextField>
        </TouchableOpacity>
      );
    },
    [getHighLightWords, handleChangeText, isNetwork, styles, onSelectText],
  );

  const onInputLayout = useCallback(({ nativeEvent }) => {
    setInputHeight(nativeEvent.layout.height);
  }, []);

  const getPosition = useCallback(() => {
    if (placement === 'bottom') {
      return { top: undefined, bottom: inputHeight };
    }
    return { top: inputHeight, bottom: undefined };
  }, [inputHeight, placement]);

  const onBlur = () => {
    !keepResultsAfterBlur && setIsFocus(false);
  };

  return (
    <View
      {...restProps}
      ref={ref}
      style={styles.container}
      collapsable={false}
      onLayout={onInputLayout}>
      <InputField
        error={error}
        numberOfLines={1}
        readonly={readOnly}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocus(true)}
        onBlur={onBlur}
        LeftComponent={LeftComponent}
        RightComponent={RightComponent}
        ref={inputRef}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {!readOnly && isFocus && (
        <View
          style={[
            styles.listContainer,
            type === 'absolute' && styles.listContainerAbsolute,
            type === 'absolute' && getPosition(),
          ]}>
          <FlatList
            listKey={listKey}
            nestedScrollEnabled
            data={isNetwork ? data : filterData}
            keyExtractor={getKeyExtractor}
            renderItem={renderItem}
            style={styles.scrollView}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
          />
        </View>
      )}
    </View>
  );
}

export default React.forwardRef(AutocompleteComponent);
