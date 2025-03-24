import { AppSize } from 'theme';

export default {
  container: {
    padding: 20,
    opacity: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  topComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
  },
  content: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    minWidth: AppSize.screen.width < 350 ? 135 : 140,
    height: 44,
  },
};
