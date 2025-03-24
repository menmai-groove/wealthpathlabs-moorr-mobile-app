import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CropRect } from 'react-native-image-crop-picker';

export const COLORS = [
  '#596AFC',
  '#D43D69',
  '#FEBC55',
  '#DD2F0D',
  '#52D1BD',
  '#72228D',
  '#46BFFD',
  '#017E71',
  '#FD7F9D',
  '#FF7F00',
  '#2BD431',
  '#8151EB',
];

export const DEFAULT_COLOR = COLORS.find(c => c === '#72228D') || COLORS[0];

export const DEFAULT_IMAGE_URL = 'https://picsum.photos/id/242/200/200';

export const SELECTED_ITEM_TYPE = ['photo', 'icon'] as const;

export type IconData = {
  id: string;
  uuidFileName: string;
  type: string;
  uri?: string;
  source?: string;
};

export type SelectedImageOrIconItem = {
  type: (typeof SELECTED_ITEM_TYPE)[number];
  data: {
    path?: string; // local path
    source?: string;
    uri?: string; // server uri
    width?: number;
    height?: number;
    mime?: string;
    cropRect?: CropRect | null;
    uuidFileName?: string;
    type?: string;
    photo: string;
  };
};

export type NamedStyles = { [P in keyof any]: ViewStyle | TextStyle | ImageStyle };
