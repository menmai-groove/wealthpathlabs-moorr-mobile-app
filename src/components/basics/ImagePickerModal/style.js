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
    backgroundColor: '#00000090',
  },
  actionSheetView: {
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#D8D8D8',
  },
  firstAction: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  nearLastAction: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  lastAction: {
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 20,
  },
  actionSheetText: {
    fontSize: 18,
    color: '#0078ff',
  },
  destructiveActionText: {
    color: '#fe5f59',
  },
  lastActionText: {
    fontWeight: 'bold',
  },
};
