export default {
  container: {
    position: 'relative',
  },
  listContainerAbsolute: {
    left: 0,
    right: 0,
    position: 'absolute',
  },
  listContainer: {
    borderWidth: 0,
    shadowColor: 'palette.color-dynamic-shadow',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollView: {
    backgroundColor: 'palette.color-dynamic-container',
    borderRadius: 4,
    maxHeight: 200,
    width: '100%',
  },
  optionsItem: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    margin: 1,
  },
  optionsItemActive: {
    backgroundColor: 'palette.color-primary-1',
    borderRadius: 4,
  },
  optionsText: {
    color: 'input.text-content-color',
    fontSize: 'input.text-content-font-size',
    fontFamily: 'input.text-content-font-family',
    lineHeight: 'input.text-content-line-height',
  },
  optionsTextActive: {
    color: 'palette.color-white-1',
  },
  textHightlight: {
    color: 'palette.color-primary-2',
  },
};
