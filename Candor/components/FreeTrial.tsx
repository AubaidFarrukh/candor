import React, {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  TouchableText,
  Typography,
} from "./main";
import CloseIcon from "../assets/svgs/CloseNoBackground.svg";
import VerticalGradientLine from "../assets/svgs/VerticalGradientLine.svg";
import { Colors, FontType } from "../theme";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import FullAccess from "../assets/svgs/FullAccess.svg";
import GetCharged from "../assets/svgs/GetCharged.svg";
import Reminder from "../assets/svgs/Reminder.svg";
import * as IAP from "react-native-iap";
import { ProSubscriptionContext, ToastContext } from "../context";
import { useMutation } from "@apollo/client";
import { MARK_USER_ANDROID, MARK_USER_AS_PAID } from "../graphQL/mutations";

interface FreeTrialProps {
  closeModal: () => void;
}

const items: any = Platform.select({
  ios: ["cd_399_1w"],
  android: ["cd_pro_sub"],
});

let purchaseUpdatedListener: any;
let purchaseErrorListener: any;

export const FreeTrial: FC<FreeTrialProps> = ({ closeModal }): ReactElement => {
  const [product, setProduct] = useState<any>();
  const [loading, setLoading] = useState(false);
  const { toast } = useContext<any>(ToastContext);
  const { setIsPro }: any = useContext(ProSubscriptionContext);
  const [purchase, setPurchase] = useState<any>(null);

  const [MarkUserAsPaid] = useMutation(MARK_USER_AS_PAID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setIsPro(true);
      toast({ message: "You are now a pro user", intent: "success" });
      setLoading(false);
      setTimeout(() => {
        closeModal();
      }, 1000);
    },
    async onError(e) {
      setLoading(false);
    },
  });

  const validate = async (receipt: any) => {
    const receiptBody = {
      "receipt-data": receipt,
      password: "7100affbce654a80b73ed5d22019b34a",
    };

    if (Platform.OS === "ios") {
      await IAP.validateReceiptIos({ receiptBody })
        .catch((error: any) => {})
        .then(async (receipt: any) => {
          try {
            const renewalHistory = receipt.latest_receipt_info;

            for (let history of renewalHistory) {
              const res = await IAP.finishTransaction({ purchase: history });
            }
            const expiration = renewalHistory[0].expiration;
            let expired = Date.now() > expiration;
            if (!expired) {
              // setIsPro(true);
            } else {
              setIsPro(false);
              // setPurchased(false);
            }
          } catch (error) {}
        });
    } else {
      try {
        const deliveryReceipt = await fetch(
          "https://us-central1-candor-b084e.cloudfunctions.net/validateSubscription",
          {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ data: JSON.parse(receipt) }),
          }
        ).then((res) => {
          res.json().then((r) => {
            if (r.result.error == -1) {
              toast({
                message: "Error There has been an error with your purchase",
                intent: "danger",
              });
            } else if (r.result.isActiveSubscription) {
              toast({ message: "Purchase successful", intent: "success" });
              MarkUserAndroid();
            } else {
              toast({ message: "Error with your purchase", intent: "danger" });
            }
          });
        });
      } catch (error: any) {
        Alert.alert("Error!", error?.message);
      }
    }
  };

  const [MarkUserAndroid] = useMutation(MARK_USER_ANDROID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setIsPro(true);
      toast({ message: "You are now a pro user", intent: "success" });
      setLoading(false);
      setTimeout(() => {}, 1000);
    },
    async onError(e) {
      // await IAP.finishTransaction({ purchase });
      console.log(e, "error");
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
              const filteredRes: any[] =
                res?.filter((item: any) => {
                  if (items.includes(item?.productId)) return item;
                }) || [];
              const week = filteredRes.findIndex(
                (item) => item?.productId === "cd_399_1w"
              );

              setProduct(filteredRes[week]);
            } else {
              //android
              let items = res[0].subscriptionOfferDetails;
              const filteredRes: any[] = items?.filter((item: any) => {
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
              let rawWeek =
                filteredRes[week]?.pricingPhases?.pricingPhaseList[0];
              let rawMonth =
                filteredRes[month]?.pricingPhases?.pricingPhaseList[0];
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
                productId: filteredRes[month]?.offerToken,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "MONTH",
                title: "",
                type: "subs",
              };
              // const newArr = [weekObj, monthObj];
              setProduct(weekObj);
            }
          });
      });

    purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
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
        try {
          const receipt = purchase.transactionReceipt;

          setPurchase(purchase);
          // validate(receipt);

          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserAsPaid({
                variables: {
                  appleReceipt: receipt,
                  restore: false,
                },
              });
            } else {
              MarkUserAndroid();
              purchaseUpdatedListener.remove();
            }
          }
        } catch (error) {}
      }
    );

    return () => {
      try {
        purchaseUpdatedListener.remove();
      } catch (err) {}
      try {
        purchaseErrorListener.remove();
      } catch (err) {}
      try {
        IAP.endConnection();
      } catch (err) {}
    };
  }, []);

  const purchaseSubscription = async () => {
    setLoading(true);
    await IAP.requestSubscription({
      sku: product?.productId,
      subscriptionOffers: [
        {
          sku: "cd_pro_sub",
          offerToken: product?.productId,
        },
      ],
    });
    // if (p) await IAP.finishTransaction({ purchase: p });
  };

  const _restorePurchases = () => {
    // setShowLoading(true);
    IAP.getPurchaseHistory()
      .catch(() => {})
      .then((res: any) => {
        if (res) {
          const filteredRes = res?.filter((item: any) => {
            if (items.includes(item.productId)) return item;
          });
          const receipt =
            filteredRes[filteredRes?.length - 1]?.transactionReceipt;

          if (receipt) {
            if (Platform.OS === "ios") {
              MarkUserAsPaid({
                variables: {
                  appleReceipt: receipt,
                  restore: true,
                },
              });
            } else {
              validate(receipt);
            }
          }
        }
      });
  };

  return (
    <ImageBackground
      source={require("../assets/PushNotificationBackground.png")}
      style={{ flex: 1, paddingHorizontal: getScreenResponsiveWidth(20) }}
    >
      <Spacer height={Platform.OS === "ios" ? 50 : 20} />

      <Row justifyContent="space-between">
        <TouchableIcon onPress={closeModal}>
          <CloseIcon style={{ opacity: 0.7 }} />
        </TouchableIcon>
        <TouchableText
          onPress={_restorePurchases}
          color={Colors.CANDOR_DARK_GRAY}
        >
          Restore
        </TouchableText>
      </Row>
      {!product ? (
        <Column flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} />
          <Typography color={Colors.CANDOR_BLACK}>
            Loading subscriptions
          </Typography>
        </Column>
      ) : (
        <Column>
          <Spacer height={35} />
          <Typography
            type="Heading1"
            textAlign="center"
            color={Colors.CANDOR_WHITE}
            style={{
              textShadowRadius: 5,
              textShadowColor: Colors.CANDOR_BLACK,
            }}
          >{`HOW YOUR FREE\nTRIAL WORKS`}</Typography>
          <Spacer height={59} />
          <Row
            justifyContent="space-evenly"
            style={{ paddingHorizontal: getScreenResponsiveWidth(20) }}
          >
            <VerticalGradientLine style={{ position: "absolute" }} />

            <Column style={{ marginTop: -10 }}>
              <Row alignItems="center">
                <FullAccess style={{ marginLeft: -50 }} />
                <Spacer width={20} />
                <Column>
                  <Typography size={17}>Today</Typography>
                  <Typography
                    color={Colors.CANDOR_GRAY}
                    fontFamily={FontType.REGULAR_INTER}
                    type="Paragraph3"
                  >
                    {`Get full access to Candor Pro &\neverything it comes with!`}
                  </Typography>
                </Column>
              </Row>
              <Spacer height={35} />

              <Row alignItems="center">
                <Reminder style={{ marginLeft: -50 }} />
                <Spacer width={20} />
                <Column>
                  <Typography size={17}>In 2 days</Typography>
                  <Typography
                    color={Colors.CANDOR_GRAY}
                    fontFamily={FontType.REGULAR_INTER}
                    type="Paragraph3"
                  >
                    {`Get reminded about your\ntrial’s expiration`}
                  </Typography>
                </Column>
              </Row>
              <Spacer height={35} />
              <Row alignItems="center">
                <GetCharged style={{ marginLeft: -50 }} />
                <Spacer width={20} />
                <Column>
                  <Typography size={17}>In 3 days</Typography>
                  <Typography
                    color={Colors.CANDOR_GRAY}
                    fontFamily={FontType.REGULAR_INTER}
                    type="Paragraph3"
                  >
                    {`You will be charged - cancel any\ntime earlier`}
                  </Typography>
                </Column>
              </Row>
            </Column>
          </Row>
          <Spacer height={50} />
          <Typography textAlign="center">3-day free trial</Typography>
          <ParsedText
            style={{
              color: Colors.CANDOR_DARK_GRAY,
              textAlign: "center",
              fontFamily: FontType.REGULAR_INTER,
              fontSize: getScreenResponsiveHeight(12),
            }}
            parse={[
              {
                pattern: /$6.99\/week/,
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
            ]}
            childrenProps={{ allowFontScaling: false }}
          >
            {`Then ${product?.localizedPrice} / week`}
          </ParsedText>
          <Spacer height={67} />

          <Button
            onPress={purchaseSubscription}
            width={318}
            loading={loading}
            title={"Start my Free Trial"}
          />
          <Spacer height={21.72} />
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
        </Column>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({});
