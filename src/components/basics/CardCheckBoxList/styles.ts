export const CARD_ITEM_MIN_HEIGHT = 50;

export default {
  checkAllContainer: {
    paddingHorizontal: 4,
  },
  customCheckBox: {
    active: {
      borderColor: 'palette.color-primary-1',
      backgroundColor: 'palette.color-primary-1',
    },
  },
  divider: {
    borderTopColor: 'palette.color-grey-6',
    borderTopWidth: 1,
    marginVertical: 10,
  },
  cardItem: {
    backgroundColor: 'palette.color-dynamic-container',
    // marginHorizontal: 15,
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: CARD_ITEM_MIN_HEIGHT,
    borderWidth: 1,
    borderColor: 'palette.color-grey-6',
  },
  leftLine: {
    width: 6,
    height: '100%',
  },
  body: {
    padding: 16,
  },
};
