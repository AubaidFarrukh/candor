import { FC, ReactElement, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  Image,
} from "react-native";
import { Colors, TypographyStyle, FontType } from "../theme";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import { Spacer } from "./main/Spacer";
import { Typography } from "./main/Typography";
import { Row } from "./main/Row";
import { TouchableIcon } from "./main";

interface InputProps extends TextInputProps {
  error?: string;
  containerStyle?: ViewStyle;
  inputLeft?: () => ReactElement;
  inputRight?: () => ReactElement;
  disable?: boolean;
  required?: boolean;
  onPressIn?: () => void;
}

export const PasswordInput: FC<InputProps> = ({
  inputLeft,
  inputRight,
  containerStyle,
  error,
  disable = false,
  required = false,
  onPressIn,
  ...rest
}): ReactElement => {
  const baseHeight = 55;
  const heightToNumber =
    typeof containerStyle?.height === "string"
      ? ((parseInt("100%") / 100) * Dimensions.get("window").height) /
        Dimensions.get("screen").height
      : containerStyle?.height;
  const height = heightToNumber || baseHeight;
  const erroContainer = {
    height: error
      ? getScreenResponsiveHeight(height + 25)
      : getScreenResponsiveHeight(height),
    backgroundColor: Colors.CANDOR_RED,
    width: containerStyle?.width || "100%",
    borderRadius: 15,
  };
  const [secure, setSecure] = useState(true);
  return (
    <Pressable onPress={onPressIn}>
      <View>
        <View style={erroContainer}>
          <View style={{ ...styles.container, ...containerStyle }}>
            <Row alignItems="center">
              <>
                {inputLeft && inputLeft()}
                {inputLeft && <Spacer width={13} />}
              </>
              <TextInput
                style={{
                  ...styles.input,
                }}
                editable={!disable}
                placeholderTextColor={Colors.CANDOR_GRAY}
                autoCapitalize="none"
                {...rest}
                secureTextEntry={secure}
              />

              <TouchableIcon
                onPress={() => {
                  setSecure(!secure);
                }}
              >
                <Image
                  style={{
                    width: 22,
                    height: 15.7,
                    // marginRight: getScreenResponsiveWidth(50),
                    tintColor: Colors.CANDOR_BLUE,
                  }}
                  source={require("../assets/Eye.png")}
                />
              </TouchableIcon>
            </Row>

            {inputRight && inputRight()}
          </View>
          <Spacer height={3} />
          <Typography
            textAlign="center"
            color={Colors.CANDOR_WHITE}
            type="Paragraph3"
          >
            {error}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.CANDOR_WHITE,
    height: getScreenResponsiveHeight(56),
    paddingLeft: getScreenResponsiveWidth(24),
    paddingHorizontal: getScreenResponsiveWidth(15),
    borderColor: Colors.CANDOR_GRAY,
    borderWidth: 1,
  },

  input: {
    flex: 1,
    ...TypographyStyle.Paragraph2,
    height: "100%",
    fontFamily: FontType.REGULAR_FREDOKA,
    padding: 0,
    margin: 0,
    color: Colors.CANDOR_BLACK,
    fontSize: 14,
  },
});
