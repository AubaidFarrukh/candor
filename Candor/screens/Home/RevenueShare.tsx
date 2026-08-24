import {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, ImageBackground, Platform } from "react-native";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import { Colors, FontType } from "../../theme";
import {
  Button,
  Column,
  Input,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import HorizontalLine from "../../assets/svgs/HorizontalLine.svg";
import {
  ProSubscriptionContext,
  ToastContext,
  UserProfile,
} from "../../context";
import { Screens } from "../../navigation";
import Swiper from "react-native-swiper";
import ArrowBack from "../../assets/svgs/BackButton-White.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { REVENUE_SHARE_WITHDRAWAL_REQUEST } from "../../graphQL/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_REV_SHARE } from "../../graphQL/queries";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";

interface RevenueShareProps {
  rbSheetRef: any;
  navigation: any;
}

export const RevenueShare: FC<RevenueShareProps> = ({
  rbSheetRef,
  navigation,
}): ReactElement => {
  const { isPro }: any = useContext(ProSubscriptionContext);
  const [activePayment, setActivePayment] = useState<any>(null);
  const { userProfile }: any = useContext(UserProfile);

  const { data } = useQuery(GET_USER_REV_SHARE, {
    fetchPolicy: "network-only",
    variables: {
      userId: userProfile?._id,
    },
  });

  const slider = useRef<any>();
  const next = () => {
    slider.current.scrollBy(1, true);
  };
  const back = () => {
    slider.current.scrollBy(-1, true);
  };
  const moveToActivePayment = (activePayment: string) => {
    setActivePayment(activePayment);
    if (activePayment) {
      slider.current.scrollBy(1, true);
    }
  };

  const amount = Number(data?.User?.pending_earnings) || 0;
  const disabled = amount < 10;

  const closeModal = () => {
    rbSheetRef?.current?.close();
  };
  return (
    <ImageBackground
      style={styles.imageBackground}
      source={require("../../assets/bottomSheetBackground.png")}
    >
      <Swiper
        ref={slider}
        loop={false}
        showsPagination={false}
        width={getScreenResponsiveWidth(375)}
      >
        <Column
          flex={1}
          style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            textAlign="center"
            size={24}
            lineHeight={24}
            color={Colors.CANDOR_WHITE}
          >
            {`Your \nrevenue share`}
          </Typography>
          <Spacer height={15} />
          <Row>
            <Typography color={Colors.CANDOR_WHITE} lineHeight={40} size={39}>
              $
            </Typography>
            <Typography color={Colors.CANDOR_WHITE} lineHeight={111} size={100}>
              {amount?.toFixed(2)}
            </Typography>
          </Row>
          <Spacer height={15} />
          <Button
            height={45}
            onPress={next}
            disabled={disabled}
            color={disabled ? Colors.CANDOR_DARK_GRAY : Colors.CANDOR_BLUE}
            title="Cashout"
          />
          <Spacer height={17} />
          <>
            {!isPro && (
              <>
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
                    if (Platform.OS == "ios") {
                      navigation.navigate(Screens.PRO, { type: "Pro" });
                    }
                  }}
                  height={45}
                  color={Colors.CANDOR_BLUE}
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
              </>
            )}
          </>
          <Spacer height={17} />
          <Typography
            type="Paragraph6"
            textAlign="center"
            color={Colors.CANDOR_WHITE}
          >
            You must have a balance of at least $10 to request a cash out.
            Payments will be processed and sent on the first of every month.
          </Typography>
          <Spacer height={15} />
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
        <SelectPayoutMethod
          back={back}
          moveToActivePayment={moveToActivePayment}
          closeModal={closeModal}
          amount={amount}
        />
        <ActivePaymentMethod
          back={back}
          amount={amount}
          activePayment={activePayment}
          closeModal={closeModal}
        />
      </Swiper>
    </ImageBackground>
  );
};

const SelectPayoutMethod = ({
  back,
  moveToActivePayment,
  closeModal,
  amount,
}: any): ReactElement => {
  return (
    <Column
      style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      flex={1}
    >
      <TouchableIcon onPress={back}>
        <ArrowBack />
      </TouchableIcon>
      <Column flex={1}>
        <Typography
          textAlign="center"
          size={24}
          lineHeight={24}
          color={Colors.CANDOR_WHITE}
        >
          {`Your\nrevenue share`}
        </Typography>
        <Spacer height={15} />
        <Row justifyContent="center">
          <Typography color={Colors.CANDOR_WHITE} lineHeight={40} size={39}>
            $
          </Typography>
          <Typography color={Colors.CANDOR_WHITE} lineHeight={111} size={100}>
            {amount?.toFixed(2)}
          </Typography>
        </Row>
        <Spacer height={15} />
        <Typography type="Paragraph3" color={Colors.CANDOR_LIGHT_GRAY}>
          Select Payout method
        </Typography>
        <Spacer height={15} />
        <Row justifyContent="space-evenly">
          {["Paypal", "Wise", `Mobile Money`].map((item, index) => {
            return (
              <TouchableOpacity
                onPress={() => moveToActivePayment(item)}
                style={styles.paymentCard}
                key={index}
              >
                <Typography type="Paragraph4" color={Colors.CANDOR_WHITE}>
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </Row>
        <Spacer height={10} />
        <Row justifyContent="space-evenly">
          {["Venmo", "CashApp"].map((item, index) => {
            return (
              <TouchableOpacity
                onPress={() => moveToActivePayment(item)}
                style={styles.paymentCard}
                key={index}
              >
                <Typography type="Paragraph4" color={Colors.CANDOR_WHITE}>
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </Row>
        <Spacer height={15} />
        <Button
          height={45}
          onPress={closeModal}
          color={Colors.CANDOR_BLUE}
          title="Done"
        />
      </Column>
    </Column>
  );
};

const ActivePaymentMethod = ({
  back,
  activePayment,
  amount,
  closeModal,
}: any): ReactElement => {
  const isMobileMoney = activePayment === "Mobile Money";
  const isPaypal = activePayment === "Paypal";
  const isWise = activePayment === "Wise";
  const isCashApp = activePayment === "CashApp";
  const isVenmo = activePayment === "Venmo";
  const [payload, setpayload] = useState<any>({});

  const { toast } = useContext<any>(ToastContext);

  const [Withdrawal, { loading }] = useMutation(
    REVENUE_SHARE_WITHDRAWAL_REQUEST,
    {
      onCompleted(d) {
        console.log(d, "revenue share");
        setpayload({});
        closeModal();

        toast({
          message: `Your withdrawal request has been submitted.`,
          intent: "success",
        });
      },
      onError(error) {
        console.log(error);
        toast({ message: error.message });
      },
    }
  );
  const submitRequest = () => {
    Withdrawal({
      variables: {
        paymentMethod: activePayment,
        paymentDetails: JSON.stringify(payload),
      },
    });
  };

  useEffect(() => {
    return () => {
      setpayload({});
    };
  }, []);
  return (
    <Column
      style={{ paddingHorizontal: getScreenResponsiveWidth(28) }}
      flex={1}
    >
      <TouchableIcon onPress={back}>
        <ArrowBack />
      </TouchableIcon>
      <Column flex={1}>
        <Typography
          textAlign="center"
          size={24}
          lineHeight={24}
          color={Colors.CANDOR_WHITE}
        >
          {`Your\nrevenue share`}
        </Typography>
        <Spacer height={15} />
        <Row justifyContent="center">
          <Typography color={Colors.CANDOR_WHITE} lineHeight={40} size={39}>
            $
          </Typography>
          <Typography
            color={Colors.CANDOR_WHITE}
            lineHeight={isMobileMoney ? 55 : 111}
            size={isMobileMoney ? 50 : 100}
          >
            {amount?.toFixed(2)}
          </Typography>
        </Row>
        <Spacer height={15} />
        <Typography type="Paragraph3" color={Colors.CANDOR_LIGHT_GRAY}>
          {`${activePayment} payout method`}
        </Typography>
        <Spacer height={15} />
        <>
          {isMobileMoney && (
            <Column>
              <Input
                placeholder="Country"
                onChangeText={(text) => {
                  setpayload({ ...payload, country: text });
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                containerStyle={styles.inputContainer}
              />
              <Spacer height={10} />
              <Input
                placeholder="Mobile Money Number"
                onChangeText={(text) => {
                  setpayload({ ...payload, mobileMoneyNumber: text });
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                containerStyle={styles.inputContainer}
              />
              <Spacer height={10} />
              <Input
                placeholder="MTN or AirtelTogo Recipent"
                onChangeText={(text) => {
                  setpayload({ ...payload, recipent: text });
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                containerStyle={styles.inputContainer}
              />
            </Column>
          )}
        </>
        <>
          {isPaypal && (
            <Column>
              <Input
                placeholder="Add your paypal email"
                containerStyle={{
                  ...styles.inputContainer,
                  height: getScreenResponsiveHeight(77),
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                onChangeText={(text) => {
                  setpayload({ ...payload, paypalEmail: text });
                }}
              />
            </Column>
          )}
        </>
        <>
          {isCashApp && (
            <Column>
              <Input
                placeholder="Add your Cashtag"
                containerStyle={{
                  ...styles.inputContainer,
                  height: getScreenResponsiveHeight(77),
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                onChangeText={(text) => {
                  setpayload({ ...payload, cashTag: text });
                }}
              />
            </Column>
          )}
        </>
        <>
          {isVenmo && (
            <Column>
              <Input
                placeholder="Add your Venmo username"
                containerStyle={{
                  ...styles.inputContainer,
                  height: getScreenResponsiveHeight(77),
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                onChangeText={(text) => {
                  setpayload({ ...payload, venmo: text });
                }}
              />
            </Column>
          )}
        </>
        <>
          {isWise && (
            <Column>
              <Input
                placeholder="Add your Wise email"
                containerStyle={{
                  ...styles.inputContainer,
                  height: getScreenResponsiveHeight(77),
                }}
                style={{
                  color: Colors.CANDOR_WHITE,
                  width: "100%",
                  fontFamily: FontType.REGULAR_FREDOKA,
                  height: "100%",
                }}
                onChangeText={(text) => {
                  setpayload({ ...payload, wiseEmail: text });
                }}
              />
            </Column>
          )}
        </>
        <Spacer height={15} />
        <Button
          height={45}
          loading={loading}
          onPress={submitRequest}
          color={Colors.CANDOR_BLUE}
          title="Send"
        />
      </Column>
    </Column>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: getScreenResponsiveHeight(509),
    width: "100%",
  },
  paymentCard: {
    backgroundColor: Colors.CANDOR_DARK_GRAY,
    height: getScreenResponsiveHeight(58),
    width: getScreenResponsiveWidth(100),
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    backgroundColor: Colors.CANDOR_DARK_GRAY,
    height: getScreenResponsiveHeight(49),
    borderWidth: 0,
  },
});
