export default {
  flex1: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    position: 'absolute',
    marginHorizontal: 15,
    zIndex: 1000,
  },
  messageWrapper: {
    flexDirection: 'row',
    padding: 5,
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: 'palette.color-dynamic-container',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { height: 1, width: 0 },
    elevation: 3,
    shadowColor: 'palette.color-dynamic-shadow',
    overflow: 'visible',
    flex: 1,
    flexDirection: 'row',
  },
  messageSuccess: {
    backgroundColor: 'palette.color-toast-success',
    color: 'palette.color-toast-text-success',
  },
  messageInfo: {
    backgroundColor: 'palette.color-toast-info',
    color: 'palette.color-toast-text-info',
  },
  messageWarning: {
    backgroundColor: 'palette.color-toast-warning',
    color: 'palette.color-toast-text-warning',
  },
  messageError: {
    backgroundColor: 'palette.color-toast-error',
    color: 'palette.color-toast-text-error',
  },
  messageContent: {
    fontSize: 16,
  },
  messageIconView: {
    paddingRight: 10,
  },
};
