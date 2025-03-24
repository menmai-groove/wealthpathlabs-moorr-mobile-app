export default {
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 3,
    backgroundColor: 'palette.color-violet-1',
    borderRadius: 20,
  },
  tab: {
    minWidth: 96,
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderRadius: 16,
    backgroundColor: 'palette.color-green-1',
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
  },
  touchView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    color: 'palette.color-white-1',
  },
  activeLabelText: {},
};
