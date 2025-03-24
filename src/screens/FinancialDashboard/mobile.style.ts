import { AppSize } from 'theme';

export default {
  container: { flex: 1, backgroundColor: 'palette.color-dynamic-container' },
  listHeader: {
    backgroundColor: 'palette.color-dynamic-container',
  },
  contentList: {
    backgroundColor: 'palette.color-light-alice-blue-1',
  },
  refreshContainer: {
    backgroundColor: 'palette.color-dynamic-container',
  },
  bottomBounceBackground: {
    height: AppSize.screen.height,
    backgroundColor: 'palette.color-light-alice-blue-1',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  actionButton: {
    margin: '4@ms0',
    width: '34@ms0',
  },
  actionText: {
    color: 'typography.paragraph-1.color',
    fontSize: 'typography.paragraph-2.font-size',
    fontWeight: 'typography.paragraph-2.font-weight',
    fontFamily: 'typography.paragraph-2.font-family',
    lineHeight: 'typography.paragraph-2.line-height',
  },
  addIncomeButton: {
    backgroundColor: 'palette.color-green-2',
  },
  addExpenseButton: {
    backgroundColor: 'palette.color-orange-2',
  },
  addAssetButton: {
    backgroundColor: 'palette.color-blue-2',
  },
  addBorrowingButton: {
    backgroundColor: 'palette.color-red-2',
  },
  addArchivedButton: {
    backgroundColor: 'palette.color-grey-10',
  },
  cardItem: {
    container: {
      backgroundColor: 'palette.color-dynamic-container',
      borderRadius: 10,
      overflow: 'hidden',
      minHeight: 70,
      flexDirection: 'row',
    },
    leftLine: {
      width: 4,
      height: '100%',
    },
    body: {
      flex: 1,
      padding: 16,
      paddingRight: 20,
    },
    label: {
      alignSelf: 'flex-end',
      borderRadius: 4,
      paddingHorizontal: 10,
      paddingVertical: 2,
    },
    labelText: {
      color: '#fff',
    },
    icon: {
      height: 20,
      width: 20,
      marginRight: 10,
    },
    typeCard: {
      color: 'palette.color-blue-2',
    },
    captionText: {
      color: 'palette.color-grey-3',
    },
  },
  expanseContainer: {
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  childrenExpanseContainer: {
    marginHorizontal: 0,
    paddingHorizontal: 10,
  },
  childrenContainer: {
    borderWidth: 2,
  },
};
