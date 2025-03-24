import { Platform } from 'react-native';

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
    backgroundColor: 'secondaryInput.wrapper-background-color',
    borderColor: 'secondaryInput.wrapper-border-color',
    borderBottomWidth: 'secondaryInput.wrapper-border-width',
    borderRadius: 'secondaryInput.wrapper-border-radius',
    flexDirection: 'row',
    height: 48,
  },
  leftComponentWrapper: {
    alignItems: 'center',
    minWidth: 36,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
  },
  leftComponent: {
    color: 'secondaryInput.icon-color',
    fontSize: 'secondaryInput.icon-font-size',
  },
  rightComponentWrapper: {
    alignItems: 'center',
    minWidth: 36,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 12,
  },
  rightComponent: {
    color: 'secondaryInput.icon-color',
    fontSize: 'secondaryInput.icon-font-size',
  },
  errorComponent: {
    color: 'secondaryInput.icon-error-color',
  },
  justifyContent: {
    justifyContent: 'center',
  },
  areaInputWrapper: {
    backgroundColor: 'secondaryInput.wrapper-background-color',
    borderColor: 'secondaryInput.wrapper-border-color',
    borderBottomWidth: 'secondaryInput.wrapper-border-width',
    borderRadius: 'secondaryInput.wrapper-border-radius',
    height: 150,
  },
  focusInputWrapper: {
    backgroundColor: 'secondaryInput.wrapper-focus-background-color',
    borderColor: 'secondaryInput.wrapper-focus-border-color',
    borderBottomWidth: 'secondaryInput.wrapper-focus-border-width',
    borderRadius: 'secondaryInput.wrapper-focus-border-radius',
  },
  errorInputWrapper: {
    backgroundColor: 'secondaryInput.wrapper-error-background-color',
    borderColor: 'secondaryInput.wrapper-error-border-color',
    borderBottomWidth: 'secondaryInput.wrapper-error-border-width',
    borderRadius: 'secondaryInput.wrapper-error-border-radius',
  },
  readonlyInputWrapper: {
    backgroundColor: 'secondaryInput.wrapper-readonly-background-color',
    borderColor: 'secondaryInput.wrapper-readonly-border-color',
    borderBottomWidth: 'secondaryInput.wrapper-readonly-border-width',
    borderRadius: 'secondaryInput.wrapper-readonly-border-radius',
  },
  inputLabel: {
    color: 'secondaryInput.label-color',
    fontSize: 'secondaryInput.label-font-size',
    fontFamily: 'secondaryInput.label-font-family',
    fontWeight: 'secondaryInput.label-font-weight',
    lineHeight: 'secondaryInput.text-content-line-height',
  },
  inputFloatingLabel: {
    color: 'secondaryInput.floating-label-color',
    fontSize: 'secondaryInput.floating-label-font-size',
    lineHeight: 'secondaryInput.floating-label-line-height',
    top: -8,
  },
  inputContent: {
    flex: 1,
    color: 'secondaryInput.text-content-color',
    fontSize: 'secondaryInput.text-content-font-size',
    fontFamily: 'secondaryInput.text-content-font-family',
    ...Platform.select({
      ios: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 12,
      },
    }),
    ...Platform.select({
      android: {
        lineHeight: 'secondaryInput.text-content-line-height',
        paddingLeft: 0,
        paddingRight: 12,
      },
    }),
    textAlignVertical: 'center',
  },
  inputErrorContentColor: {
    color: 'secondaryInput.icon-error-color',
  },
  errorInputMessage: {
    color: 'secondaryInput.message-error-color',
    fontSize: 'secondaryInput.message-error-font-size',
    fontFamily: 'secondaryInput.message-error-font-family',
    lineHeight: 'secondaryInput.message-error-line-height',
    marginTop: 5,
  },
  placeholderText: {
    color: 'secondaryInput.placeholder-text-color',
    fontFamily: 'secondaryInput.placeholder-text-font-family',
  },
  requiredChar: {
    color: 'palette.color-red-1',
  },
};
