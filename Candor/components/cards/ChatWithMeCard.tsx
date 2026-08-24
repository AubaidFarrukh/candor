import { ReactElement } from "react";
import { Image, Platform } from "react-native";
import { Colors, FontType } from "../../theme";
import {
  getScreenResponsiveWidth,
  getScreenResponsiveHeight,
} from "../../utils";
import { Column, Spacer, Typography, Row, TouchableIcon } from "../main";

export const ChatWithMeCard = (): ReactElement => {
  return (
    <Column
      alignItems="center"
      justifyContent="center"
      // width={"100%"}
      // backgroundColor="red"
      height={"100%"}
    >
      <Column
        alignItems="center"
        justifyContent="center"
        height={125}
        width={290}
        style={{
          position: "relative",
          width: "100%",
          borderRadius: 20,
        }}
      >
        <Row
          height={115}
          width={280}
          backgroundColor={"#000"}
          style={{
            borderRadius: 20,
            position: "absolute",
            top: 25,
            // right: 0,
          }}
        />
        <Column
          height={125}
          width={290}
          backgroundColor={Colors.CANDOR_WHITE}
          justifyContent={"space-between"}
          style={{
            borderRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(21),
            paddingVertical: getScreenResponsiveHeight(20),
            borderWidth: 3,
            borderColor: Colors.CANDOR_BLACK,
          }}
        >
          <Row
            width={290}
            justifyContent="center"
            alignItems="center"
            style={{
              position: "absolute",
              top: getScreenResponsiveHeight(-19),
            }}
          >
            <Image
              source={require("../../assets/cwm.png")}
              style={{
                width: getScreenResponsiveWidth(178.88),
                height: getScreenResponsiveHeight(38.93),
              }}
            />
          </Row>
          <Spacer height={8} />

          <Column height={"100%"} justifyContent="center" alignItems="center">
            <Typography
              fontFamily={FontType.REGULAR_SECULAR}
              lineHeight={18}
              color={Colors.CANDOR_BLACK}
              textAlign={"center"}
              size={16}
              style={{ width: "100%" }}
            >
              Get paid when your friends or fans chat with you anonymously
            </Typography>
          </Column>
        </Column>
      </Column>
      <Spacer height={30} />
    </Column>
  );
};
