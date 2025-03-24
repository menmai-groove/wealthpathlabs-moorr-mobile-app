export default {
  container: {
    padding: 20,
    opacity: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  modal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  backdropModal: {
    backgroundColor: 'black',
    opacity: 0.5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingHorizontal: 15,
    width: '100%',
  },
  noInsets: {
    marginTop: 30,
    marginBottom: 30,
  },
};
