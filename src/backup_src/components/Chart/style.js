export default {
  primary: {
    color: 'palette.color-primary-1',
  },
  explanatoryContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  explanatoryItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  explanatoryText: { color: 'grey', marginLeft: 10 },
  thumbnail: { width: 40, aspectRatio: 2 },
  titleContainer: { alignItems: 'center' },
  titleText: { color: 'grey', fontWeight: 'bold' },

  chartContainer: { flex: 1, width: '100%' },
  chartRow: {
    height: 300,
    flexDirection: 'row',
  },
  labelLeft: { paddingRight: 10 },
  labelRight: { paddingLeft: 10 },
  chartColumn: { flex: 1 },
  barChart: { flex: 1 },
  pieChart: { flex: 1 },
  centerLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineChart: {
    flex: 1,
  },
  labelBottom: { height: 20 },
};
