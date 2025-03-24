export default {
  container: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'palette.color-line-1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'flex-start',
    backgroundColor: 'palette.color-white-1',
    marginHorizontal: 15,
  },
  done: {
    backgroundColor: 'palette.color-green-2',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  open: {
    backgroundColor: '#F1E7F3',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  disable: {
    backgroundColor: '#C7C7C7',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  iconDate: {
    resizeMode: 'contain',
    marginRight: 6,
  },
  textDateDone: {
    color: 'palette.color-white-1',
    fontSize: 12,
  },
  textDateOpen: {
    color: 'palette.color-primary-1',
    fontSize: 12,
  },
  textDateDisable: {
    color: 'palette.color-white-1',
    fontSize: 12,
  },
  widthColumn: {
    width: '80@ms',
  },
  currency: {
    width: '85@ms',
    color: 'palette.color-primary-text-1',
  },
  textHeader: {
    color: 'palette.color-blue-2',
    fontSize: 12,
    lineHeight: 16,
  },
  floatingButton: {
    bottom: 100,
  },
  buttonClearAll: {
    flexDirection: 'row',
    backgroundColor: 'palette.color-red-2',
    borderRadius: 14,
    marginTop: 10,
    padding: 5,
    paddingRight: 10,
    alignItems: 'center',
  },
  iconXCircle: {
    width: 14,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: 'palette.color-white-1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconX: {
    fontSize: 10,
    color: 'palette.color-red-2',
  },
  textClearAll: {
    color: 'palette.color-white-1',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 5,
  },
  containerModal: {
    backgroundColor: 'palette.color-dynamic-container',
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 5,
    opacity: 1,
    borderRadius: 10,
    marginBottom: 30,
    gap: 10,
    flexDirection: 'row',
  },
  textFooterModal: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  textContentAddCheckUpNote: {
    paddingTop: 8,
    color: 'palette.color-primary-text-1',
    fontStyle: 'italic',
  },
  textContenAddCheckUp: {
    color: 'palette.color-primary-text-1',
  },
  textHighlightContenAddCheckUp: {
    color: 'palette.color-primary-1',
  },
  iconArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    position: 'absolute',
    right: 0,
  },
  activeIconBackground: {
    backgroundColor: 'palette.color-white-2',
  },
  iconArrow: { fontSize: 18, color: '#888888' },
  activeIconArrow: {
    color: 'palette.color-primary-1',
  },
  containerModalPrevius: {
    backgroundColor: 'palette.color-dynamic-container',
    opacity: 1,
    borderRadius: 10,
    height: '100%',
  },
  cardItemSpace: {
    width: '12@ms',
  },
  customModal: {
    container: {
      padding: 0,
      paddingVertical: 20,
      opacity: 1,
      borderRadius: 6,
      overflow: 'hidden',
    },
  },

  balanceCard: {
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },
  balanceBorder: { width: 6 },
  balanceIcon: {
    height: 24,
    width: 24,
  },
  leftIcon: {
    fontSize: 14,
  },
  changeStartDateContainer: { backgroundColor: '#fff', borderRadius: 10 },
  noteText: {
    fontWeight: '500',
    fontStyle: 'italic',
  },
  buttonContainer: {
    justifyContent: 'space-evenly',
  },
  errorInputMessage: {
    color: 'input.message-error-color',
    fontSize: 'input.message-error-font-size',
    fontFamily: 'input.message-error-font-family',
    lineHeight: 'input.message-error-line-height',
    marginTop: 5,
  },
  linkText: {
    color: 'palette.color-blue-2',
    textAlign: 'center',
  },
  scrollbarIndicatorContainer: {
    height: '100%',
    width: 5,
    borderRadius: 5 / 2,
    backgroundColor: '#541868',
    opacity: 0.2,
  },
  scrollbarIndicatorItem: {
    position: 'absolute',
    height: '100%',
    width: 5,
    borderRadius: 5 / 2,
    backgroundColor: 'palette.color-primary-1',
  },
  scrollbarIndicatorVisible: {
    opacity: 1,
  },
  scrollbarIndicatorHidden: {
    opacity: 0,
  },
  textError: {
    color: 'palette.color-red-1',
    flexDirection: 'row',
    fontSize: 12,
  },
  textErrorWithLink: {
    fontWeight: 'bold',
    color: 'palette.color-red-1',
    fontSize: 12,
  },
  loadingContainer: {
    backgroundColor: 'palette.color-white-1',
    borderRadius: 10,
  },
  textInfo: {
    color: 'palette.color-blue-2',
    flexDirection: 'row',
    fontSize: 12,
  },
  textInfoWithLink: {
    fontWeight: 'bold',
    color: 'palette.color-blue-2',
    fontSize: 12,
  },
};
