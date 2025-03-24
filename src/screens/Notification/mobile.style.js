export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-dynamic-container',
  },
  scrollContent: {
    marginHorizontal: 10,
    marginTop: 20,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 5,
    borderRadius: 6,
    borderColor: 'palette.color-dynamic-container',
    borderLeftWidth: 3,
  },
  cardUnReadContainer: {
    backgroundColor: 'custom.screens.notification.card-unread-container-color',
    borderColor: 'palette.color-primary-1',
  },
  cardTouchable: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 50,
    height: 50,
    backgroundColor: 'palette.color-dynamic-container',
    borderWidth: 1,
    borderColor: 'custom.screens.notification.image-border-color',
    margin: 15,
    marginRight: 5,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    margin: 15,
    minHeight: 67,
  },
  cardTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  cardTimeIcon: {
    color: 'custom.screens.notification.card-time-icon-color',
    width: 16,
    height: 16,
    marginRight: 5,
  },
  blinkOpti: {
    width: '55@s',
    height: '55@s',
  },
  icon: {
    color: 'palette.color-primary-1',
    fontSize: '27@s',
  },
  image: {
    width: 36,
    height: 36,
  },
};
