import { FC, ReactElement } from "react";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import { Typography, TypographyProps } from "./Typography";

interface TouchableTextProps extends TypographyProps {
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const TouchableText: FC<TouchableTextProps> = (props): ReactElement => {
  return (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled}>
      <Typography {...props}>{props.children}</Typography>
    </TouchableOpacity>
  );
};
