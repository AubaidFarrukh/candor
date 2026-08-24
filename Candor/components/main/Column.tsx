import { FC, ReactElement } from "react";
import { View, FlexAlignType, ViewStyle } from "react-native";
import { Colors } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";

interface ColumnProps {
  children?: ReactElement | ReactElement[];
  style?: ViewStyle;
  flex?: number;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string | Colors;
  justifyContent?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: FlexAlignType;
}

export const Column: FC<ColumnProps> = ({
  children,
  style,
  justifyContent,
  alignItems,
  flex,
  width,
  height,
  backgroundColor,
  ...rest
}): ReactElement => {
  if (typeof height === "number") height = getScreenResponsiveHeight(height);
  if (typeof width === "number") width = getScreenResponsiveWidth(width);
  return (
    <View
      style={{
        justifyContent,
        alignItems,
        width,
        height,
        backgroundColor,
        flex,
        ...style,
      }}
      {...rest}
    >
      {children}
    </View>
  );
};
