import { FC, ReactElement, useCallback, useState, useContext } from "react";
import { StyleSheet, Platform } from "react-native";
import { Page } from "../layouts";
import BackButton from "../assets/svgs/Backbutton.svg";
import {
  Button,
  Input,
  Row,
  Spacer,
  Title,
  TouchableIcon,
  Typography,
} from "../components";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import { CountryPicker } from "react-native-country-codes-picker";
import { Colors, FontType } from "../theme";
import IosArrowDown from "../assets/svgs/IosArrowDown.svg";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { CREATE_USER } from "../graphQL/mutations";
import { useMutation } from "@apollo/client";
import {
  ProSubscriptionContext,
  ToastContext,
  UserProfile,
  UserToken,
} from "../context";
import { storeData } from "../functions/storage";
import { PasswordInput } from "../components/PasswordInput";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";
import { Screens } from "../navigation";
import { ScrollView } from "react-native-gesture-handler";

interface SignUpProps {
  navigation: any;
  route: any;
}

export const SignUp: FC<SignUpProps> = ({
  navigation,
  route,
}): ReactElement => {
  const id = route?.params?.id;
  const { toast } = useContext<any>(ToastContext);
  const [modalVisible, setModalVisible] = useState(false);
  const { setUserToken }: any = useContext(UserToken);
  const { setUserProfile }: any = useContext(UserProfile);
  const { setIsPro }: any = useContext(ProSubscriptionContext);
  const [payload, setpayload] = useState<string | any>({
    name: null,
    email: null,
    phone: null,
    password: null,
    birthday: null,
    username: null,
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [birthday, setBirthday] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setBirthday(dayjs(date).format("DD/MM/YYYY"));
    hideDatePicker();
  };

  const toggleModal = useCallback(
    () => setModalVisible(!modalVisible),
    [setModalVisible, modalVisible]
  );

  const [CreateUser, { loading }] = useMutation(CREATE_USER, {
    async onCompleted(data) {
      await storeData(data?.CreateUser.auth_token, "accessToken");
      await storeData(JSON.stringify(data?.CreateUser), "user");
      setUserToken(data?.CreateUser.auth_token);
      setIsPro(data?.CreateUser?.is_premium);
      setUserProfile(data?.CreateUser);
    },
    onError(error) {
      toast({ message: error.message });
    },
  });

  const handleSignup = () => {
    CreateUser({
      variables: {
        name: payload.name,
        email: payload.email,
        phone: countryCode + payload.phone,
        password: payload.password,
        birthday: birthday,
        username: payload.name,
        referral: id,
      },
    });
  };

  return (
    <Page safeAreaView keyboardAware dismissKeyboard>
      <Spacer height={15} />
      <TouchableIcon onPress={navigation.goBack}>
        <BackButton
          height={getScreenResponsiveHeight(35)}
          width={getScreenResponsiveWidth(35)}
        />
      </TouchableIcon>
      <Spacer height={8} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title />
        <Spacer height={36} />
        <Input
          placeholder="Type your name"
          onChangeText={(txt: string) =>
            setpayload({
              ...payload,
              name: txt,
            })
          }
          required
          value={payload.name}
        />
        <Spacer height={10.5} />
        <Input
          placeholder="Email"
          onChangeText={(txt: string) =>
            setpayload({
              ...payload,
              email: txt,
            })
          }
          required
          value={payload.email}
        />
        <Spacer height={10.5} />
        <Row>
          <Button onPress={toggleModal} style={styles.phoneNumberInput}>
            <Row alignItems="center">
              <Typography>{countryCode}</Typography>
              <Spacer width={5} />
              <IosArrowDown />
            </Row>
          </Button>
          <Spacer width={6.49} />
          <Input
            containerStyle={{ width: getScreenResponsiveWidth(245) }}
            placeholder="Phone number"
            onChangeText={(txt: string) =>
              setpayload({
                ...payload,
                phone: txt,
              })
            }
            required
            value={payload.phone}
          />
        </Row>
        <Spacer height={10.5} />
        <Input
          disable
          value={birthday}
          pointerEvents="none"
          onPressIn={() => setDatePickerVisibility(true)}
          placeholder="Your birthday"
          required
        />
        <Spacer height={10.5} />
        <PasswordInput
          secureTextEntry
          placeholder="Password"
          onChangeText={(txt: string) =>
            setpayload({
              ...payload,
              password: txt,
            })
          }
          required
          value={payload.password}
        />
        <Spacer height={40} />

        <Button
          onPress={handleSignup}
          title="Lets get started!"
          disabled={
            !(
              payload.name &&
              payload.email &&
              payload.phone &&
              payload.password
            )
          }
          loading={loading}
        />
        <Spacer height={21.72} />
        <ParsedText
          style={{
            color: Colors.CANDOR_BLACK,
            textAlign: "center",
            fontFamily: FontType.REGULAR_INTER,
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
        <Spacer height={25} />
        <ParsedText
          style={{
            color: Colors.CANDOR_BLACK,
            textAlign: "center",
            fontFamily: FontType.REGULAR_FREDOKA,
          }}
          parse={[
            {
              pattern: /Login/,
              style: {
                color: Colors.CANDOR_BLUE,
              },
              onPress: () => {
                navigation.navigate(Screens.SIGNIN);
              },
            },
          ]}
          childrenProps={{ allowFontScaling: false }}
        >
          {`Already have an account? Login`}
        </ParsedText>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          maximumDate={new Date("2009-01-01")}
        />
        <CountryPicker
          show={modalVisible}
          lang={"en"}
          enableModalAvoiding
          onBackdropPress={toggleModal}
          style={{
            modal: {
              height: 500,
            },
            line: {
              display: "none",
            },
            textInput: {
              height: getScreenResponsiveHeight(56),
              borderRadius: 15,
              marginBottom: 10,
              backgroundColor: Colors.CANDOR_WHITE,
              paddingLeft: getScreenResponsiveWidth(24),
              paddingHorizontal: getScreenResponsiveWidth(15),
              borderColor: Colors.CANDOR_BLUE,
              borderWidth: 3,
            },
            countryButtonStyles: {
              height: 50,
              marginBottom: 10,
              backgroundColor: Colors.CANDOR_WHITE,
            },
          }}
          pickerButtonOnPress={(item) => {
            setCountryCode(item.dial_code);
            toggleModal();
          }}
        />

        <Spacer height={Platform.OS === "android" ? 50 : 0} />
      </ScrollView>
    </Page>
  );
};

const styles = StyleSheet.create({
  phoneNumberInput: {
    backgroundColor: Colors.CANDOR_WHITE,
    height: getScreenResponsiveHeight(56),
    width: getScreenResponsiveWidth(82),
    borderColor: Colors.CANDOR_GRAY,
    borderWidth: 1,
    borderRadius: 14,
  },
});
