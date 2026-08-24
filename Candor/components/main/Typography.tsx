import { FC, ReactElement } from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { Colors, FontType, TypographyStyle } from "../../theme";
import { getScreenResponsiveHeight } from "../../utils";

export interface TypographyProps extends TextProps {
  textAlign?: "center" | "auto" | "left" | "right" | "justify";
  style?: TextStyle;
  color?: string;
  size?: number;
  children?: string | any;
  lineHeight?: number;
  fontFamily?: FontType;
  type?:
    | "Heading1"
    | "Paragraph1"
    | "Paragraph2"
    | "Paragraph3"
    | "Paragraph4"
    | "Paragraph5"
    | "Paragraph6"
    | "Paragraph7";
}

export const Typography: FC<TypographyProps> = ({
  style,
  children,
  textAlign,
  size,
  color,
  lineHeight,
  type = "Paragraph1",
  fontFamily = FontType.REGULAR_FREDOKA,
  ...rest
}): ReactElement => {
  let fontSize = TypographyStyle[type].fontSize;
  if (size) fontSize = getScreenResponsiveHeight(size);

  return (
    <Text
      style={{
        ...TypographyStyle[type],
        textAlign,
        color: color || Colors.CANDOR_BLACK,
        fontFamily,
        lineHeight: lineHeight
          ? getScreenResponsiveHeight(lineHeight)
          : TypographyStyle[type].lineHeight,
        fontSize: fontSize,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Text>
  );
};
