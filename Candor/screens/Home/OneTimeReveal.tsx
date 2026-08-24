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
  ActivityIndicator,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableText,
  Typography,
} from "../../components";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import { Colors, FontType } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { ToastContext } from "../../context";
import * as IAP from "react-native-iap";
import { useMutation } from "@apollo/client";
import {
  MARK_MESSAGE_AS_PAID,
  MARK_MESSAGE_ANDROID,
  MARK_DM_CHATS_AS_PAID,
} from "../../graphQL/mutations";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import { Screens } from "../../navigation";

interface OneTimeRevealProps {
  navigation: any;
  rbSheetRef: any;
  message: any;
  setOpenedMessage: (message: any) => void;
  closeModal: any;
  isChat?: boolean;
}

const items: any = Platform.select({
  ios: ["cdrh_199"],
  android: ["cdrh_199"],
});

export const OneTimeReveal: FC<OneTimeRevealProps> = ({
  rbSheetRef,
  message,
  setOpenedMessage,
  closeModal,
  isChat = false,
  navigation,
}): ReactElement => {
  const [product, setProduct] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const { toast } = useContext<any>(ToastContext);
  const [loading, setLoading] = useState(false);
  const [MarkMessageAsPaid] = useMutation(MARK_MESSAGE_AS_PAID, {
    async onCompleted(d) {
      console.log(d);
      await IAP.finishTransaction({ purchase });
      setOpenedMessage(d?.MarkMessageAsPaid);
      rbSheetRef?.current?.close();
      setLoading(false);
    },
    async onError(error) {
      console.log(error);
      setLoading(false);
      // rbSheetRef?.current?.close();
    },
  });

  const [MarKChatAsPaid] = useMutation(MARK_DM_CHATS_AS_PAID, {
    async onCompleted(d) {
      await IAP.finishTransaction({ purchase });
      setOpenedMessage({ ...message, is_paid: true });
      rbSheetRef?.current?.close();
      setLoading(false);
    },
    async onError(error) {
      console.log(error, "mark chat as paid");
      setLoading(false);
      // rbSheetRef?.current?.close();
    },
  });
  const [MarkMessageAndroid] = useMutation(MARK_MESSAGE_ANDROID, {
    async onCompleted(d) {
      // toast({
      //   message: "Pro card purchase is successful",
      //   intent: "success",
      // });
      setOpenedMessage(d?.MarkMessageAsPaidAndroid);
      setLoading(false);
      await IAP.finishTransaction({ purchase });
      rbSheetRef?.current?.close();
    },
    async onError(error) {
      setLoading(false);
      toast({ message: "There has been an error with your purchase" });
    },
  });

  const validate = async (receipt: any) => {
    try {
      const deliveryReceipt = await fetch(
        "https://us-central1-candor-b084e.cloudfunctions.net/validateProduct",
        {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ data: JSON.parse(receipt) }),
        }
      ).then((res) => {
        res.json().then(async (r) => {
          if (r.result.error == -1) {
            // alert("Error There has been an error with your purchase");
            setLoading(false);
          } else if (r.result.isActiveSubscription) {
            //success
            MarkMessageAndroid({
              variables: {
                messageId: message?._id,
              },
            });
            close();
          } else {
            // alert("Error validating your purchase");
            setLoading(false);
          }
        });
      });
    } catch (error: any) {
      console.log("Error!", error?.message);
      // toast({ message: "Error validating your purchase" });
    }
  };

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {})
      .then(() => {
        if (Platform.OS === "ios") {
          IAP.getSubscriptions({ skus: items })
            .catch((error: any) => {
              console.log(JSON.stringify(error));
              console.log("error finding purchases");
            })
            .then((res: any) => {
              const filteredRes: any[] = res?.filter((item: any) => {
                if (items.includes(item.productId)) return item;
              });
              setProduct(filteredRes[0]);
            });
        } else {
          IAP.getProducts({ skus: items })
            .catch((error: any) => {
              console.log(JSON.stringify(error));
              console.log("error finding purchases");
            })
            .then((res: any) => {
              //android
              console.log(JSON.stringify(res));
              const filtered: any[] = res?.filter((item: any) => {
                return true;
              });

              let d1Obj = {
                countryCode: filtered[0].currency,
                currency: filtered[0].currency,
                description: "",
                discounts: [],
                introductoryPrice: "",
                introductoryPriceAsAmountIOS: "",
                introductoryPriceNumberOfPeriodsIOS: "",
                introductoryPricePaymentModeIOS: "",
                introductoryPriceSubscriptionPeriodIOS: "",
                localizedPrice: filtered[0].localizedPrice,
                platform: "android",
                price: Number(
                  filtered[0].oneTimePurchaseOfferDetails?.priceAmountMicros /
                    1000000
                ).toFixed(2),
                productId: filtered[0].productId,
                subscriptionPeriodNumberIOS: "1",
                subscriptionPeriodUnitIOS: "DAY",
                title: "",
                type: "subs",
              };

              // const newArr = [d1Obj];
              // console.log(">>>> ", JSON.stringify(res));
              setProduct(d1Obj);
            });
        }
      });

    const purchaseErrorListener = IAP.purchaseErrorListener((error: any) => {
      if (error["responseCode"] === "2") {
      } else {
        setLoading(false);
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

    const purchaseUpdatedListener = IAP.purchaseUpdatedListener(
      async (purchase: IAP.Purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          setPurchase(purchase);
          if (receipt) {
            if (Platform.OS === "ios") {
              if (isChat) {
                MarKChatAsPaid({
                  variables: {
                    msgToken: message?.msg_token,
                    anonymousUserId: message?.anonymous_user_id,
                    appleReceipt: receipt,
                  },
                });
              } else
                MarkMessageAsPaid({
                  variables: {
                    messageId: message?._id,
                    appleReceipt: receipt,
                  },
                });
            } else {
              validate(receipt);
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

  const purchaseOneTimeReveal = async () => {
    if (Platform.OS === "ios") {
      setLoading(true);
      await IAP.requestSubscription({
        sku: product?.productId,
        subscriptionOffers: [
          {
            sku: product?.description,
            offerToken: product?.productId,
          },
        ],
      });
    } else {
      setLoading(true);
      await IAP.requestPurchase({
        sku: product?.productId,
        skus: [product?.productId],
      });
    }
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
              MarkMessageAsPaid({
                variables: {
                  messageId: message?._id,
                  appleReceipt: receipt,
                },
              });
            } else {
              validate(receipt);
            }
          }
        }
      });
  };

  if (!product) {
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
    <ImageBackground
      style={styles.imageBackground}
      source={require("../../assets/bottomSheetBackground.png")}
    >
      <Column
        flex={1}
        style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
        alignItems="center"
      >
        <Spacer height={22} />
        <Typography
          textAlign="center"
          type="Heading1"
          color={Colors.CANDOR_WHITE}
        >
          {`One \ntime reveal`}
        </Typography>
        <Spacer height={15} />
        <Row>
          <Typography color={Colors.CANDOR_WHITE} lineHeight={40} size={30}>
            {product?.currency}
          </Typography>
          <Typography color={Colors.CANDOR_WHITE} lineHeight={111} size={100}>
            {Number(product?.price).toFixed(2)}
          </Typography>
        </Row>
        <Spacer height={15} />
        <Button
          height={45}
          color={Colors.CANDOR_BLUE}
          loading={loading}
          onPress={purchaseOneTimeReveal}
          title={"Buy for " + product?.price}
        />
        <Spacer height={15} />
        <TouchableText
          onPress={_restorePurchases}
          textAlign="center"
          color={Colors.CANDOR_WHITE}
        >
          Restore Purchases
        </TouchableText>
        <Spacer height={17} />
        <Row alignItems="center">
          <HorizontalLine />
          <Spacer width={34} />
          <Typography color={Colors.CANDOR_DARK_GRAY}>Or</Typography>
          <Spacer width={34} />
          <HorizontalLine />
        </Row>
        <Spacer height={17} />
        <Button
          onPress={() => {
            rbSheetRef.current?.close();
            closeModal();
            navigation.navigate(Screens.PRO, { type: "OneTimeReveal" });
          }}
          height={45}
          color={Colors.CANDOR_GRAY}
        >
          <Row alignItems="center">
            <Typography color={Colors.CANDOR_WHITE}>Candor</Typography>
            <Spacer width={5} />
            <Column
              width={45}
              height={24}
              style={{ borderRadius: 5 }}
              alignItems="center"
              justifyContent="center"
              backgroundColor={Colors.CANDOR_WHITE}
            >
              <Typography>Pro</Typography>
            </Column>
          </Row>
        </Button>
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
