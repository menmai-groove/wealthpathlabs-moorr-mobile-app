import { AppStyle } from 'theme';

export default {
  chartContainer: {
    flex: 1,
    backgroundColor: 'palette.color-white-1',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 15,

    ...AppStyle.shadow,
  },
  seeDetailsContainer: {
    marginBottom: -3,
    paddingVertical: 5,
    alignItems: 'center',
  },
  seeDetailsText: {
    color: 'palette.color-blue-2',
  },
  seeDetailsIcon: {
    color: 'palette.color-blue-2',
  },
  width0: {
    width: 0,
  },
  percentNumberNegative: {
    color: 'palette.color-green-4',
  },
  percentNumber: {
    color: 'palette.color-red-1',
  },
};
