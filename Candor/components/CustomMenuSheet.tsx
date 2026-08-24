import { FC, ReactElement } from "react";
import { StyleSheet, View, Platform, TouchableOpacity } from "react-native";
import { getScreenResponsiveHeight } from "../utils";
import { Colors, FontType } from "../theme";
import { Column, Row, Spacer, Typography } from "./main";

interface CustomMenuSheetProps {
  navigation?: any;
  options?: any;
}

export const CustomMenuSheet: FC<CustomMenuSheetProps> = ({
  options = [],
}): ReactElement => {
  return (
    <View style={styles.imageBackground}>
      <Column flex={1} alignItems="center" width={"100%"}>
        <Spacer height={10} />

        {options?.map((item: any, index: number) => {
          return (
            <TouchableOpacity
              key={index.toString()}
              onPress={item?.onPress}
              style={{
                width: "100%",
                paddingVertical: getScreenResponsiveHeight(7),
              }}
            >
              <Row
                width={"100%"}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  textAlign="center"
                  type="Heading1"
                  color={Colors.CANDOR_BLACK}
                  size={14}
                >
                  {item?.text}
                </Typography>
                <Typography
                  textAlign="center"
                  type="Heading1"
                  color={Colors.CANDOR_BLACK}
                  size={14}
                >
                  {item?.emoji}
                </Typography>
              </Row>
            </TouchableOpacity>
          );
        })}
        <Spacer height={42} />

        <Typography
          textAlign="center"
          type="Paragraph6"
          color={Colors.CANDOR_GRAY}
          size={11}
          fontFamily={FontType.REGULAR_INTER}
        >
          {`Version ${
            Platform.OS === "android" ? "1.0.0 (49)" : "1.0.9 (1)"
          }. Made with ❤ from \nthe️ Candor Team`}
        </Typography>
      </Column>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(600),
    width: "100%",
    backgroundColor: Colors.CANDOR_WHITE,
  },
});
