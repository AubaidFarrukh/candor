import { FC, ReactElement, useState, useContext } from "react";
import { StyleSheet } from "react-native";
import {
  Button,
  Input,
  Row,
  Spacer,
  Title,
  TouchableIcon,
  TouchableText,
  Typography,
} from "../components";
import { Page } from "../layouts";
import { Screens } from "../navigation";
import BackButton from "../assets/svgs/Backbutton.svg";
import { Colors } from "../theme";
import { LOGIN } from "../graphQL/queries";
import { useLazyQuery } from "@apollo/client";
import {
  ProSubscriptionContext,
  ToastContext,
  UserProfile,
  UserToken,
} from "../context";
import { storeData } from "../functions/storage";
import { PasswordInput } from "../components/PasswordInput";
import { StatusBar } from "expo-status-bar";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import FastImage from "react-native-fast-image";

interface SignInProps {
  navigation: any;
}

export const SignIn: FC<SignInProps> = ({ navigation }): ReactElement => {
  const { toast } = useContext<any>(ToastContext);
  let { setUserToken }: any = useContext(UserToken);
  let { setUserProfile }: any = useContext(UserProfile);
  const { setIsPro }: any = useContext(ProSubscriptionContext);
  const [payload, setpayload] = useState<string | any>({
    email: null,
    password: null,

    // email: "cirlorm6@gmail.com",
    // password: "amselorm123",
  });
  const [Login, { loading }] = useLazyQuery(LOGIN, {
    async onCompleted(data) {
      if (data?.LoginUser !== null) {
        await storeData(data?.LoginUser?.auth_token, "accessToken");
        await storeData(JSON.stringify(data?.LoginUser), "user");
        setUserToken(data?.LoginUser?.auth_token);
        setUserProfile(data?.LoginUser);
        setIsPro(data?.LoginUser?.is_premium);
      } else {
        toast({ message: "Invalid Credential" });
      }
    },
    onError(error) {
      toast({ message: error.message });
    },
  });

  const handleSignin = () => {
    Login({
      variables: {
        email: payload.email,
        password: payload.password,
      },
    });
  };

  return (
    <Page safeAreaView keyboardAware dismissKeyboard>
      <StatusBar style="dark" />
      <Spacer height={15} />
      <TouchableIcon onPress={navigation.goBack}>
        <BackButton
          height={getScreenResponsiveHeight(35)}
          width={getScreenResponsiveWidth(35)}
        />
      </TouchableIcon>
      <Spacer height={8} />
      <Title />
      <Spacer height={60} />
      <Typography textAlign="center">
        {` Enter your email or phone number & \n password to access your inbox \n👇`}
      </Typography>
      <Spacer height={10.5} />
      <Input
        placeholder="Email"
        value={payload.email}
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            email: txt.trim(),
          })
        }
      />
      <Spacer height={10.5} />
      <PasswordInput
        secureTextEntry
        placeholder="Password"
        value={payload.password}
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            password: txt.trim(),
          })
        }
      />
      <Spacer height={12.57} />
      <TouchableText
        onPress={() => navigation.navigate(Screens.FORGOT_PASSWORD)}
        textAlign="center"
        color={Colors.CANDOR_BLUE}
      >
        Forgot Password?
      </TouchableText>
      <Spacer height={108} />
      <Button
        onPress={handleSignin}
        disabled={!(payload.email && payload.password)}
        title="Enter your inbox"
        loading={loading}
      />
      <Spacer height={8.5} />
      <Row justifyContent="center">
        <Typography textAlign="center">
          If you don’t have an account,
        </Typography>
        <TouchableText
          onPress={() => navigation.navigate(Screens.SIGNUP)}
          style={{
            textDecorationLine: "underline",
          }}
          textAlign="center"
        >{` tap here`}</TouchableText>
      </Row>
      <TouchableText
        onPress={() => navigation.navigate(Screens.SIGNUP)}
        style={{
          textDecorationLine: "underline",
        }}
        textAlign="center"
      >
        to create you own unique link
      </TouchableText>
    </Page>
  );
};

const styles = StyleSheet.create({});
