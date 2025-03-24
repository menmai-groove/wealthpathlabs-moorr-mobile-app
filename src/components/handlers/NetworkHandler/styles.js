export default {
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 99999,
  },
  boxPosition: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 0,
    backgroundColor: 'network-message.no-connection.background-color',
  },
  boxMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: 'network-message.no-connection.color',
    paddingLeft: 15,
  },
  boxConnecting: {
    backgroundColor: 'network-message.reconnecting.background-color',
  },
  textConnecting: {
    color: 'network-message.reconnecting.color',
  },
  boxConnected: {
    backgroundColor: 'network-message.connected.background-color',
  },
  textConnected: {
    color: 'network-message.connected.color',
  },
};
