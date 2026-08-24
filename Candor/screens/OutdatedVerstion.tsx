import React, { FC, ReactElement } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Linking,
  Platform,
} from "react-native";
import { Button, Column, Spacer, Typography } from "../components";
import { Colors, FontType } from "../theme";
import { getScreenResponsiveWidth } from "../utils";

interface OutdatedVerstionProps {}

export const OutdatedVerstion: FC<
  OutdatedVerstionProps
> = ({}): ReactElement => {
  const openAppstore = () => {
    const link =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/candor-only-truths-no-lies/id1661979776"
        : "https://play.google.com/store/apps/details?id=com.besocial.candor&hl=en&gl=US";
    Linking.canOpenURL(link).then(
      (supported) => {
        supported && Linking.openURL(link);
      },
      (err) => console.log(err)
    );
  };
  return (
    <ImageBackground
      style={styles.imageBackground}
      source={require("../assets/ProSubscriptionBackground.png")}
    >
      <Column
        justifyContent="center"
        alignItems="center"
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      >
        <Typography size={40} lineHeight={50} color={Colors.CANDOR_WHITE}>
          Oops🧐
        </Typography>
        <Spacer height={20} />
        <Typography
          textAlign="center"
          fontFamily={FontType.REGULAR_SECULAR}
          color={Colors.CANDOR_WHITE}
        >
          We've noticed that you're using an older version of Candor. To enjoy
          the latest features and improvements, we recommend that you update
          your app. Simply tap on the 'Update' button to upgrade to the latest
          version. Thank you for choosing Candor!"
        </Typography>
        <Spacer height={70} />
        <Button
          title="Update"
          color={Colors.CANDOR_BLUE}
          width={300}
          onPress={openAppstore}
        />
      </Column>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: "100%",
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
