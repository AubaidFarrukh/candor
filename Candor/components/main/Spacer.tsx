import { FC, ReactElement } from "react";
import { View, ViewStyle } from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";

interface SpacerProps {
  style?: ViewStyle;
  height?: number;
  width?: number;
}

export const Spacer: FC<SpacerProps> = ({
  style,
  height,
  width,
}): ReactElement => {
  height = height
    ? getScreenResponsiveHeight(height)
    : getScreenResponsiveHeight(0);
  width = width ? getScreenResponsiveWidth(width) : getScreenResponsiveWidth(0);
  return <View style={{ ...style, height, width }}></View>;
};
