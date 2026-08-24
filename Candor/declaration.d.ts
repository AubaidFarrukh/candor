declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.jpg" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.jpeg" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "react-native-raw-bottom-sheet" {
  export type RBSheetProps = {
    animationType?: "none" | "fade" | "slide";
    height?: number;
    minClosingHeight?: number;
    openDuration?: number;
    closeDuration?: number;
    closeOnDragDown?: boolean;
    dragFromTopOnly?: boolean;
    closeOnPressMask?: boolean;
    closeOnPressBack?: boolean;
    children?: React.ReactElement | React.ReactElement[];
    onClose?: () => void;
    onOpen?: () => void;
    customStyles?: {
      wrapper?: StyleProp<ViewStyle>;
      container?: StyleProp<ViewStyle>;
      draggableIcon?: StyleProp<ViewStyle>;
    };
    keyboardAvoidingViewEnabled?: boolean;
  };

  export default class RBSheet extends React.Component<RBSheetProps> {
    open(): void;
    close(): void;
  }
}

declare module "react-native-story-share";
declare module "react-native-instagram-login";
