import React, {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  NativeModules,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Button, Column, Row, Spacer, Typography } from "../../components";
import { Colors } from "../../theme";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { DonationationSubscriptionContext } from "../../context";
import Swiper from "react-native-swiper";
import { benefitsData } from "../../constants";
import { BenefitsItem } from "./ProSubscription";

interface SupportProps {
  close: () => void;
  openDonateSheet: () => void;
  openRecurringSheet: () => void;
}

async function startIosAdsRewardsAds() {
  return await NativeModules.AdsModule.showRewardsAds();
}

async function showInterstitialAds() {
  return await NativeModules.AdsModule.showInterstitialAds();
}

async function startAndroidAdsRewardsAds() {
  return await NativeModules.AdsModule.showRewardsAds();
}

export const Support: FC<SupportProps> = ({
  close,
  openDonateSheet,
  openRecurringSheet,
}): ReactElement => {
  function showAd() {
    close();
    if (Platform.OS === "ios") {
      startIosAdsRewardsAds()
        .then((item) => {
          if (item?.loaded === "0") {
            showInterstitialAds()
              .then((item) => {})
              .catch((e) => {});
          }
        })
        .catch((e) => {
          console.log(e, "error");
        });
    } else {
      startAndroidAdsRewardsAds()
        .then((item) => {})
        .catch((e) => {});
    }
  }

  const { isDonated }: any = useContext(DonationationSubscriptionContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  if (loading) {
    return (
      <ImageBackground
        style={{
          ...styles.imageBackground,
        }}
        source={require("../../assets/ProSubscriptionBackground.png")}
      >
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_WHITE}>Loading</Typography>
        </Column>
      </ImageBackground>
    );
  }

  return (
    <Column
      style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      backgroundColor={Colors.CANDOR_BLACK}
    >
      <Column>
        <Spacer height={10} />

        <Row justifyContent="center" alignItems="center">
          <Typography
            textAlign="center"
            type="Heading1"
            size={24}
            color={Colors.CANDOR_WHITE}
          >
            {`Candor`}
          </Typography>
          <Spacer width={6} />
          <Column
            width={45}
            height={24}
            style={{ borderRadius: 5 }}
            alignItems="center"
            justifyContent="center"
            backgroundColor={Colors.CANDOR_BLUE}
          >
            <Typography color={Colors.CANDOR_WHITE}>Pro</Typography>
          </Column>
          <Spacer width={6} />

          <Typography
            textAlign="center"
            type="Heading1"
            size={24}
            color={Colors.CANDOR_WHITE}
          >
            {`User`}
          </Typography>
        </Row>
        <Spacer height={30} />
        <Column
          style={{
            borderColor: Colors.CANDOR_BLUE,
            borderWidth: 3,
            borderRadius: 9,
            paddingTop: getScreenResponsiveHeight(22),
          }}
          height={298}
        >
          <Swiper
            dotColor={Colors.CANDOR_GRAY}
            activeDotColor={Colors.CANDOR_BLUE}
            loop
            autoplay
            height={getScreenResponsiveHeight(250)}
          >
            {benefitsData.map((item, index) => (
              <Column flex={1} alignItems="center">
                <Spacer height={20} />
                <Typography
                  color={Colors.CANDOR_WHITE}
                  type="Paragraph3"
                  textAlign="center"
                  size={13}
                >
                  Benefits for going Candor Pro
                </Typography>
                <Spacer height={40} />
                <Typography size={60} lineHeight={67}>
                  {item.icon}
                </Typography>
                <Spacer height={5} />
                <Typography
                  size={14}
                  type="Paragraph2"
                  color={Colors.CANDOR_WHITE}
                >
                  {item.title}
                </Typography>
                <Spacer height={4} />
                <Typography
                  textAlign="center"
                  type="Paragraph4"
                  color={Colors.CANDOR_GRAY}
                  size={12}
                >
                  {item.description}
                </Typography>
              </Column>
            ))}
          </Swiper>
        </Column>
        <Spacer height={23} />
        <Typography
          textAlign="center"
          type="Paragraph4"
          color={Colors.CANDOR_WHITE}
        >
          {`Support candor pay its server cost`}
        </Typography>
        <Spacer height={20} />
        <Row justifyContent="space-evenly">
          <>
            {!isDonated && (
              <Button
                onPress={() => {
                  close();
                  setTimeout(() => openRecurringSheet(), 500);
                }}
                color={Colors.CANDOR_BLUE}
                title="Recurring Support"
                width={152}
                height={45}
              />
            )}
          </>
          <Button
            onPress={() => {
              close();
              setTimeout(() => openDonateSheet(), 500);
            }}
            color={Colors.CANDOR_BLUE}
            title="One time Support"
            width={152}
            height={45}
          />
        </Row>
      </Column>
      <Spacer height={17} />
      <Row alignItems="center">
        <HorizontalLine />
        <Spacer width={34} />
        <Typography color={Colors.CANDOR_GRAY}>Or</Typography>
        <Spacer width={34} />
        <HorizontalLine />
      </Row>
      <Spacer height={17} />
      <Button
        height={45}
        onPress={showAd}
        color={Colors.CANDOR_DARK_GRAY}
        title="Watch an Ad to help pay our server cost"
      />

      <Spacer height={17} />
      <Typography
        textAlign="center"
        type="Paragraph6"
        color={Colors.CANDOR_WHITE}
      >
        Thank you so much for helping Candor continue to serve you with amazing
        anonymous contents
      </Typography>
    </Column>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(509),
    width: "100%",
  },
});
