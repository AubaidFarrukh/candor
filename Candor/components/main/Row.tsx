import { FC, ReactElement } from "react";
import { View, StyleSheet, ViewStyle, FlexAlignType } from "react-native";
import { Colors } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";

interface RowProps {
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

export const Row: FC<RowProps> = ({
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
        ...styles.container,
        justifyContent,
        flex,
        width,
        height,
        alignItems,
        backgroundColor,
        ...style,
      }}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});
