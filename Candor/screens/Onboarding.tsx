import { FC, ReactElement, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button, Column, Row, Spacer, Typography } from "../components";
import { OnboardingCarouselData } from "../constants";
import { Page } from "../layouts";
import { Screens } from "../navigation";
import { Colors, FontType } from "../theme";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import Swiper from "react-native-swiper";
import C from "../assets/svgs/C.svg";
import { StatusBar } from "expo-status-bar";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
interface OnboardingProps {
  navigation: any;
}

export const Onboarding: FC<OnboardingProps> = ({
  navigation,
}): ReactElement => {
  const [currIndex] = useState(0);
  return (
    <Page style={styles.center}>
      <StatusBar style="dark" />
      <Column height={520}>
        <Swiper
          activeDotColor={Colors.CANDOR_BLUE}
          activeDotStyle={{
            width: getScreenResponsiveWidth(31.72),
          }}
          loop
          autoplay
          autoplayTimeout={3}
          width={getScreenResponsiveWidth(375)}
        >
          {OnboardingCarouselData.map((item, index) => {
            return (
              <View key={index}>
                <CarouselItem item={item} index={index} currIndex={currIndex} />
              </View>
            );
          })}
        </Swiper>
      </Column>
      <Spacer height={5} />
      <Button
        onPress={() => navigation.navigate(Screens.SIGNUP)}
        title="Sign Up"
      />
      <Spacer height={5} />
      <Button
        onPress={() => navigation.navigate(Screens.SIGNIN)}
        title="Log In"
      />
      <Spacer height={15.72} />
      <ParsedText
        style={{
          color: Colors.CANDOR_BLACK,
          textAlign: "center",
          fontFamily: FontType.REGULAR_INTER,
          fontSize: getScreenResponsiveHeight(12),
        }}
        parse={[
          {
            pattern: /Terms of Use/,
            style: {
              textDecorationStyle: "solid",
              textDecorationColor: Colors.CANDOR_BLACK,
              textDecorationLine: "underline",
            },
            onPress: async () => {
              await WebBrowser.openBrowserAsync(
                "https://www.playcandor.com/terms-of-services"
              );
            },
          },
          {
            pattern: /Privacy Policy/,
            style: {
              textDecorationStyle: "solid",
              textDecorationColor: Colors.CANDOR_BLACK,
              textDecorationLine: "underline",
            },
            onPress: async () => {
              await WebBrowser.openBrowserAsync(
                "https://www.playcandor.com/privacy-policy"
              );
            },
          },
        ]}
        childrenProps={{ allowFontScaling: false }}
      >
        {` By continuing, you agree to our Terms of Use and\n have read and agreed to our Privacy Policy.`}
      </ParsedText>
    </Page>
  );
};

const CarouselItem = ({ item, index }: any): ReactElement => {
  if (index == 0) {
    return (
      <Column alignItems="center" width={"100%"}>
        <Column height={467} width={319} style={{ borderRadius: 20 }}>
          <Column
            height={467}
            width={319}
            backgroundColor={item.background_color || Colors.CANDOR_YELLOW}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              borderRadius: 20,
              paddingHorizontal: getScreenResponsiveWidth(21),
              paddingVertical: getScreenResponsiveHeight(34),
            }}
          >
            <C width={207} height={150} />
            <Spacer height={16} />
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              lineHeight={29}
              color={item.text_color || Colors.CANDOR_BLACK}
              textAlign={"center"}
              size={24}
              style={{ width: getScreenResponsiveWidth(218) }}
            >
              {item.caption_text}
            </Typography>
          </Column>
        </Column>
      </Column>
    );
  }

  return (
    <Column alignItems="center" width={"100%"}>
      <Column height={447} width={319} style={{ borderRadius: 20 }}>
        <Column
          height={447}
          width={319}
          backgroundColor={item.background_color || Colors.CANDOR_YELLOW}
          justifyContent={"space-between"}
          style={{
            borderRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(21),
            paddingTop: getScreenResponsiveHeight(34),
            paddingBottom: getScreenResponsiveHeight(15),
          }}
        >
          <Column>
            <Typography
              fontFamily={FontType.REGULAR_ANTON}
              lineHeight={40}
              color={item.text_color || Colors.CANDOR_BLACK}
              textAlign={"left"}
              size={33}
              style={{ width: getScreenResponsiveWidth(218) }}
            >
              {item.caption_text}
            </Typography>
          </Column>
          <Row alignItems="center" justifyContent="space-between">
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              type="Paragraph4"
              lineHeight={22}
              size={13}
              color={item.text_color || Colors.CANDOR_BLACK}
            >
              Only Truths, No Lies!
            </Typography>
            <Image
              style={{
                width: getScreenResponsiveWidth(81),
                height: getScreenResponsiveHeight(24),
              }}
              source={require("../assets/Logo.png")}
            />
          </Row>
        </Column>
      </Column>
    </Column>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
