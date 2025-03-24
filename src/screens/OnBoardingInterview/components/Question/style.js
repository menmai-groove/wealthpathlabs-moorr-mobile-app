export default {
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  image: {
    height: 50,
    width: 60,
    resizeMode: 'contain',
    marginRight: 10,
  },
  box: {
    backgroundColor: 'palette.color-dynamic-container',
    borderRadius: 20,
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'rgba(188, 181, 206, 0.16)',
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    marginRight: 2,
  },
  triangle: {
    position: 'absolute',
    bottom: 0,
    left: -15,
  },
  question: {
    marginTop: 20,
  },
  excitedOpti: {
    width: '40@s',
    height: '40@s',
  },
  blinkOpti: {
    width: '40@s',
    height: '40@s',
  },
  smileOpti: {
    width: '40@s',
    height: '40@s',
  },
  confusedOpti: {
    width: '40@s',
    height: '40@s',
  },
  markdownStyle: {
    body: {
      color: 'typography.paragraph-2.color',
      fontFamily: 'typography.paragraph-2.font-family',
    },
  },
};
