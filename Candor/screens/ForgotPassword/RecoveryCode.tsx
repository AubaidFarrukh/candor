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

interface RecoveryCodeProps {
  navigation: any;
}

export const RecoveryCode: FC<RecoveryCodeProps> = ({
  navigation,
}): ReactElement => {
  const [payload, setpayload] = useState<string | any>({
    otp: null,
  });

  return (
    <Page keyboardAware dismissKeyboard>
      <TouchableIcon onPress={navigation.goBack}>
        <BackButton />
      </TouchableIcon>
      <Title />
      <Spacer height={96} />
      <Typography textAlign="center">
        {`Enter the code sent to your email\n👇`}
      </Typography>
      <Spacer height={10.5} />
      <Input
        placeholder="Code"
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            otp: txt,
          })
        }
        value={payload.otp}
      />
      <Spacer height={12.57} />

      <Spacer height={190} />
      <Button
        onPress={() =>
          navigation.navigate(Screens.RESET_PASSWORD, { otp: payload.otp })
        }
        title="Verify your account"
        disabled={payload?.otp?.length < 6}
      />
      <Spacer height={10.5} />
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
