export default {
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 160,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    paddingBottom: 10,
  },
  bodyContainer: {
    minHeight: 360,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  cancelContainer: { marginRight: 10 },
};
