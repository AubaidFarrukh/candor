import { FC, ReactElement, useState } from "react";
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
} from "../../components";
import { Page } from "../../layouts";
import { NativeStackParamList, Screens } from "../../navigation";
import BackButton from "../../assets/svgs/Backbutton.svg";
import { Colors } from "../../theme";
import { RESET_PASSWORD } from "../../graphQL/mutations";
import { useMutation } from "@apollo/client";
interface ResetPasswordProps {
  navigation: any;
  route?: any;
}

export const ResetPassword: FC<ResetPasswordProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [payload, setpayload] = useState<string | any>({
    otp: route?.params?.otp,
    password: null,
    confirmPassword: null,
  });

  const [ResetPassword, { data, loading, error }] = useMutation(
    RESET_PASSWORD,
    {
      onCompleted() {
        navigation.navigate(Screens.SIGNIN);
      },
    }
  );

  const handleRest = () => {
    ResetPassword({
      variables: {
        otp: parseInt(payload.otp),
        password: payload.password,
      },
    });
  };

  return (
    <Page keyboardAware dismissKeyboard>
      <TouchableIcon onPress={navigation.goBack}>
        <BackButton />
      </TouchableIcon>
      <Title />
      <Spacer height={96} />
      <Typography textAlign="center">
        {`Enter your email or phone number &\npassword to access your inbox\n👇`}
      </Typography>
      <Spacer height={10.5} />
      <Input
        secureTextEntry
        placeholder="New Password"
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            password: txt,
          })
        }
        value={payload.password}
      />
      <Spacer height={10.5} />
      <Input
        secureTextEntry
        placeholder="Re-new password"
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            confirmPassword: txt,
          })
        }
        value={payload.confirmPassword}
      />
      <Spacer height={12.57} />
      <TouchableText
        onPress={() => navigation.navigate(Screens.FORGOT_PASSWORD)}
        textAlign="center"
        color={Colors.CANDOR_BLUE}
      >
        Forgot Password?
      </TouchableText>
      <Spacer height={128} />
      <Button
        onPress={handleRest}
        title="Create new password"
        loading={loading}
        disabled={payload.password !== payload.confirmPassword}
      />
      <Spacer height={10.5} />
      <Row justifyContent="center">
        <Typography textAlign="center">
          If you don’t have an account,
        </Typography>
        <TouchableText
          onPress={() => navigation.navigate(Screens.FORGOT_PASSWORD)}
          style={{
            textDecorationLine: "underline",
          }}
          textAlign="center"
        >{` tap here`}</TouchableText>
      </Row>
      <TouchableText
        onPress={() => navigation.navigate(Screens.FORGOT_PASSWORD)}
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
