import { FC, ReactElement } from "react";
import { GestureResponderEvent, TouchableOpacity } from "react-native";

interface TouchableIconProps {
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  children?: ReactElement;
  style?: {};
}

export const TouchableIcon: FC<TouchableIconProps> = ({
  onPress,
  disabled,
  children,
  style,
}): ReactElement => {
  return (
    <TouchableOpacity
      style={{ ...style }}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
};
