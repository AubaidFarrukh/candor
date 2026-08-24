import { FC, ReactElement } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Colors, FontType, TypographyStyle } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Typography } from "./Typography";

interface ButtonProps {
  children?: ReactElement | ReactElement[];
  style?: ViewStyle;
  onPress?: (e: any) => void;
  title?: string;
  textStyle?: TextStyle;
  loading?: boolean;
  color?: string;
  textColor?: string;
  height?: number;
  width?: number;
  disabled?: boolean;
  loaderColor?: Colors;
}

export const Button: FC<ButtonProps> = ({
  children,
  style,
  title,
  onPress,
  textStyle,
  disabled,
  loading,
  color = Colors.CANDOR_BLACK,
  textColor = Colors.CANDOR_WHITE,
  height,
  width,
  loaderColor = Colors.CANDOR_WHITE,
}): ReactElement => {
  const { button, buttonText } = styles;
  const opacity = disabled ? 0.32 : 1;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        ...button,
        opacity,
        backgroundColor: color,
        height: height
          ? getScreenResponsiveHeight(height)
          : getScreenResponsiveHeight(62),
        width: width ? getScreenResponsiveWidth(width) : "100%",
        ...style,
      }}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : title ? (
        <Typography
          color={textColor}
          style={{
            ...buttonText,
            ...TypographyStyle.Paragraph2,
            ...textStyle,
          }}
          fontFamily={FontType.REGULAR_FREDOKA}
        >
          {title}
        </Typography>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: getScreenResponsiveHeight(52),
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
  },
  buttonText: {
    fontSize: getScreenResponsiveHeight(10),
    lineHeight: getScreenResponsiveHeight(12.1),
  },
});
