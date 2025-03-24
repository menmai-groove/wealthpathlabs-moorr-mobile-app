export default {
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
  },
  circle: {
    width: 'radioButton.circle-size',
    height: 'radioButton.circle-size',
    borderRadius: 9,
    borderColor: 'radioButton.circle-color',
    borderWidth: 'radioButton.circle-border-width',
  },
  activeCircle: {
    borderColor: 'radioButton.circle-active-color',
    borderWidth: 'radioButton.circle-active-border-width',
  },
  errorCircle: {
    borderColor: 'radioButton.circle-error-color',
  },
  disabledCircle: {
    // borderColor: 'radioButton.circle-disable-color',
    // backgroundColor: 'radioButton.circle-disable-color',
    opacity: 0.5,
  },
  radioLabel: {
    marginLeft: 10,
    borderColor: 'radioButton.label-color',
    textAlignVertical: 'center',
  },
  activeRadioLabel: {
    color: 'radioButton.label-active-color',
  },
  errorRadioLabel: {
    color: 'radioButton.label-error-color',
  },
  disabledRadioLabel: {
    color: 'radioButton.label-disable-color',
  },
};
