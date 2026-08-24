import { FC, ReactElement, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  ImageBackground,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Colors, FontType } from "../../theme";
import { Button, Column, Row, Spacer, Typography } from "../../components";
import * as IAP from "react-native-iap";
import { DonationationSubscriptionContext, ToastContext } from "../../context";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import { useMutation } from "@apollo/client";
import { MARK_USER_DONATION_AS_PAID } from "../../graphQL/mutations";

interface RevenueShareProps {
  navigation: any;
  close: () => void;
}

const items: any = Platform.select({
  ios: ["cdds_199_wk", "cdds_399_1m", "cdds_699_yl"],
  android: ["cd_donation_subscription"],
});

let purchaseErrorListener: any;
let purchaseUpdatedListener: any;

export const RecurringDonation: FC<RevenueShareProps> = ({
  navigation,
  close,
}): ReactElement => {
  const [products, setProducts] = useState<any[]>([]);
  const [activeSubCard, setActiveSubCard] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useContext<any>(ToastContext);
  const [purchase, setPurchase] = useState<any>(null);
  const { setIsDonated }: any = useContext(DonationationSubscriptionContext);
  const [MarkUserDonationAsPaid] = useMutation(MARK_USER_DONATION_AS_PAID, {
    async onCompleted(d) {
      console.log(d, "res");
      setLoading(false);
      setIsDonated(true);
      await IAP.finishTransaction({ purchase });
      close();
      toast({
        message: "Thank you! Your donation is successful",
        intent: "success",
      });
    },
    async onError(error) {
      console.log(error);
      setLoading(false);
    },
  });

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {
        console.log("error connecting to store");
      })
      .then(() => {
        console.log("connected to store...");
        IAP.getSubscriptions({ skus: items })
          .catch((error: any) => {
            console.log(JSON.stringify(error));
            console.log("error finding purchases");
          })
          .then((res: any) => {
            if (Platform.OS === "ios") {
              const filteredRes: any[] = res?.filter((item: any) => {
                if (items.includes(item.productId)) return item;
              });
              const week = filteredRes.findIndex(
                (item) => item.productId === "cdds_199_wk"
              );
              const month = filteredRes.findIndex(
                (item) => item.productId === "cdds_399_1m"
              );
              const year = filteredRes.findIndex(
                (item) => item.productId === "cdds_699_yl"
              );
              const newArr = [
                filteredRes[week],
                filteredRes[month],
                filteredRes[year],
              ];

              setProducts(newArr);
              setActiveSubCard(newArr[0]);
            } else {
              //android

              const filteredRes: any[] =
                res[0].subscriptionOfferDetails?.filter((item: any) => {
                  return true;
                });

              let week = filteredRes.findIndex(
                (item) =>
                  item.pricingPhases?.pricingPhaseList[0]?.billingPeriod ===
                  "P1W"
              );
              const month = filteredRes.findIndex(
                (item) =>
                  item.pricingPhases?.pricingPhaseList[0]?.billingPeriod ===
                  "P1M"
              );
              const year = filteredRes.findIndex(
                (item) =>
                  item.pricingPhases?.pricingPhaseList[0]?.billingPeriod ===
                  "P1Y"
              );

              let rawWeek =
                filteredRes[week]?.pricingPhases?.pricingPhaseList[0];
              let rawMonth =
                filteredRes[month]?.pricingPhases?.pricingPhaseList[0];
              let rawtYear =
                filteredRes[year]?.pricingPhases?.pricingPhaseList[0];

              let weekObj = {
                countryCode: rawWeek?.priceCurrencyCode,
                currency: rawWeek?.priceCurrencyCode,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: rawWeek?.formattedPrice,
                platform: "android",
                price: Number(rawWeek?.priceAmountMicros / 1000000).toFixed(2),
                productId: filteredRes[week]?.offerToken,
                subscriptionPeriodNumberIOS: "7",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };
              let monthObj = {
                countryCode: rawMonth?.priceCurrencyCode,
                currency: rawMonth?.priceCurrencyCode,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: rawMonth?.formattedPrice,
                platform: "android",
                price: Number(rawMonth?.priceAmountMicros / 1000000).toFixed(2),
                productId: filteredRes[week]?.offerToken,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "MONTH",
                title: "",
                type: "subs",
              };
              let yearObj = {
                countryCode: rawtYear?.priceCurrencyCode,
                currency: rawtYear?.priceCurrencyCode,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: rawtYear?.formattedPrice,
                platform: "android",
                price: Number(rawtYear?.priceAmountMicros / 1000000).toFixed(2),
                productId: filteredRes[week]?.offerToken,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "YEAR",
                title: "",
                type: "subs",
              };
              const newArr = [weekObj, monthObj, yearObj];
              setProducts(newArr);
              setActiveSubCard(weekObj);
            }
          });
      });

    purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
      console.log(error, "listener");
      setLoading(false);
      if (error["responseCode"] === "2") {
      } else {
        if (Platform.OS === "android") {
          if (error.code === "E_USER_CANCELLED") {
            return;
          }
          toast({
            message: error?.debugMessage,
          });

          purchaseErrorListener.remove();
        } else {
          toast({
            message:
              "There has been an error with your purchase, error code = " +
              error["code"],
          });
        }
      }
    });

    purchaseUpdatedListener = IAP.purchaseUpdatedListener(
      async (purchase: IAP.Purchase) => {
        console.log("run");
        try {
          const receipt = purchase.transactionReceipt;

          setPurchase(purchase);
          // validate(receipt);

          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserDonationAsPaid({
                variables: {
                  appleReceipt: receipt,
                },
              });
            } else {
              purchaseUpdatedListener.remove();
            }
          }
        } catch (error) {}
      }
    );

    return () => {
      try {
      } catch (err) {}
      try {
        purchaseErrorListener.remove();
        purchaseUpdatedListener.remove();
      } catch (err) {}
      try {
        IAP.endConnection();
      } catch (err) {}
    };
  }, []);
  const purchaseSubscription = async () => {
    setLoading(true);

    Platform.OS === "android"
      ? await IAP.requestSubscription({
          sku: activeSubCard?.productId,
          subscriptionOffers: [
            {
              sku: "cd_donation_subscription",
              offerToken: activeSubCard?.productId,
            },
          ],
        })
      : await IAP.requestSubscription({
          sku: activeSubCard?.productId,
        });
  };
  if (products.length < 1 || typeof activeSubCard?.price === "undefined") {
    return (
      <ImageBackground
        style={{
          ...styles.imageBackground,
        }}
        source={require("../../assets/ProSubscriptionBackground.png")}
      >
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_WHITE}>
            Loading subscriptions
          </Typography>
        </Column>
      </ImageBackground>
    );
  }
  return (
    <ImageBackground
      style={styles.imageBackground}
      source={require("../../assets/bottomSheetBackground.png")}
    >
      <Column
        flex={1}
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      >
        <Spacer height={32} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_WHITE}
        >
          {`Recurring \nDonation`}
        </Typography>
        <Spacer height={24} />
        <Row justifyContent="space-between" alignItems="center">
          {products?.map((item, index) => {
            const active = activeIndex === index;
            return (
              <Pressable
                key={index}
                onPress={() => {
                  setActiveSubCard(item);
                  setActiveIndex(index);
                }}
                style={{ justifyContent: "center" }}
              >
                <Column
                  style={{
                    borderRadius: 9,
                    borderColor: active
                      ? Colors.CANDOR_BLUE
                      : Colors.CANDOR_GRAY,
                    borderWidth: 2,
                    marginTop: -getScreenResponsiveHeight(10),
                    zIndex: -1,
                  }}
                  height={123}
                  width={95}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Typography
                    size={12}
                    type="Paragraph4"
                    color={Colors.CANDOR_GRAY}
                  >
                    {item?.subscriptionPeriodUnitIOS?.toLocaleLowerCase() ===
                    "day"
                      ? "WEEK"
                      : item?.subscriptionPeriodUnitIOS}
                  </Typography>
                  <Spacer height={3.5} />
                  <Typography
                    size={19}
                    type="Heading1"
                    color={Colors.CANDOR_WHITE}
                  >
                    {`${item?.localizedPrice}`}
                  </Typography>
                  <Spacer height={2} />
                  <Typography
                    size={12}
                    type="Paragraph4"
                    color={Colors.CANDOR_GRAY}
                  >
                    {`per  ${
                      item?.subscriptionPeriodUnitIOS?.toLocaleLowerCase() ===
                      "day"
                        ? "week"
                        : item?.subscriptionPeriodUnitIOS.toLocaleLowerCase()
                    }`}
                  </Typography>
                </Column>
              </Pressable>
            );
          })}
        </Row>
        <Spacer height={40} />
        <Button
          height={45}
          loading={loading}
          onPress={purchaseSubscription}
          color={Colors.CANDOR_BLUE}
          title="Donate to help pay our server cost"
        />
        <Spacer height={17} />
        <ParsedText
          style={{
            textAlign: "center",
            fontFamily: FontType.REGULAR_FREDOKA,
            color: Colors.CANDOR_WHITE,
          }}
          parse={[
            {
              pattern: /Terms/,
              style: {
                textDecorationStyle: "solid",
                textDecorationLine: "underline",
              },
              onPress: async () => {
                await WebBrowser.openBrowserAsync(
                  "https://www.playcandor.com/terms-of-services"
                );
              },
            },
            {
              pattern: /Privacy/,
              style: {
                textDecorationStyle: "solid",
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
          {`Terms and Privacy`}
        </ParsedText>
      </Column>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(509),
    width: "100%",
  },
});
