import { Platform, StyleSheet } from 'react-native';

export default {
  container: {
    width: '100%',
  },
  flexContainer: {
    flex: 1,
  },
  labelWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  inputWrapper: {
    backgroundColor: 'input.wrapper-background-color',
    borderColor: 'input.wrapper-border-color',
    borderWidth: 'input.wrapper-border-width',
    borderRadius: 'input.wrapper-border-radius',
    flexDirection: 'row',
    height: 48,
  },
  leftComponentWrapper: {
    alignItems: 'center',
    minWidth: 36,
    paddingTop: 12,
    paddingLeft: 12,
    paddingBottom: 12,
  },
  leftComponent: {
    color: 'input.icon-color',
    fontSize: 'input.icon-font-size',
  },
  rightComponentWrapper: {
    alignItems: 'center',
    minWidth: 36,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },
  rightComponent: {
    color: 'input.icon-color',
    fontSize: 'input.icon-font-size',
  },
  errorComponent: {
    color: 'input.icon-error-color',
  },
  justifyContent: {
    justifyContent: 'center',
  },
  areaInputWrapper: {
    backgroundColor: 'input.wrapper-background-color',
    borderColor: 'input.wrapper-border-color',
    borderWidth: 'input.wrapper-border-width',
    borderRadius: 'input.wrapper-border-radius',
    height: 150,
  },
  focusInputWrapper: {
    backgroundColor: 'input.wrapper-focus-background-color',
    borderColor: 'input.wrapper-focus-border-color',
    borderWidth: 'input.wrapper-focus-border-width',
    borderRadius: 'input.wrapper-focus-border-radius',
  },
  errorInputWrapper: {
    backgroundColor: 'input.wrapper-error-background-color',
    borderColor: 'input.wrapper-error-border-color',
    borderWidth: 'input.wrapper-error-border-width',
    borderRadius: 'input.wrapper-error-border-radius',
  },
  readonlyInputWrapper: {
    backgroundColor: 'input.wrapper-readonly-background-color',
    borderColor: 'input.wrapper-readonly-border-color',
    borderWidth: 'input.wrapper-readonly-border-width',
    borderRadius: 'input.wrapper-readonly-border-radius',
    // height: 'auto',
  },
  inputLabel: {
    color: 'input.label-color',
    fontSize: 'input.label-font-size',
    fontFamily: 'input.label-font-family',
    fontWeight: 'input.label-font-weight',
  },
  inputContent: {
    flex: 1,
    color: 'input.text-content-color',
    fontSize: 'input.text-content-font-size',
    fontFamily: 'input.text-content-font-family',
    ...Platform.select({
      ios: {
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 12,
      },
    }),
    ...Platform.select({
      android: {
        lineHeight: 'input.text-content-line-height',
        paddingLeft: 12,
        paddingRight: 12,
      },
    }),
    textAlignVertical: 'center',
  },
  inputErrorContentColor: {
    color: 'input.icon-error-color',
  },
  readonlyInputContent: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    alignSelf: 'center',
    width: '100%',
  },
  errorInputMessage: {
    color: 'input.message-error-color',
    fontSize: 'input.message-error-font-size',
    fontFamily: 'input.message-error-font-family',
    lineHeight: 'input.message-error-line-height',
    marginTop: 5,
  },
  placeholderText: {
    color: 'input.placeholder-text-color',
    fontFamily: 'input.placeholder-text-font-family',
  },
  multilineInputContent: {
    lineHeight: 'input.text-content-line-height',
    textAlignVertical: 'top',
  },
  requiredChar: {
    color: 'palette.color-red-1',
  },
  overlayText: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
};
