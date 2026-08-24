import { FC, ReactElement, useState } from "react";
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
import { Screens } from "../../navigation";
import BackButton from "../../assets/svgs/Backbutton.svg";
import { REQUEST_PASSWORD_RESET } from "../../graphQL/mutations";
import { useMutation } from "@apollo/client";
interface ForgotPasswordProps {
  navigation: any;
}

export const ForgotPassword: FC<ForgotPasswordProps> = ({
  navigation,
}): ReactElement => {
  const [payload, setpayload] = useState<string | any>({
    email: "",
  });

  const [RequestRest, { loading, error }] = useMutation(
    REQUEST_PASSWORD_RESET,
    {
      onCompleted: () => {
        navigation.navigate(Screens.RECOVERY_CODE);
      },
    }
  );

  const handleRequest = () => {
    RequestRest({
      variables: {
        email: payload.email,
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
        {`Don’t remember your password, enter\n your email?\n👇`}
      </Typography>
      <Spacer height={10.5} />
      <Input
        placeholder="Email"
        onChangeText={(txt) =>
          setpayload({
            ...payload,
            email: txt,
          })
        }
        error={error?.message === "User not found" ? error?.message : undefined}
        value={payload.email}
      />
      <Spacer height={12.57} />

      <Spacer height={150} />
      <Button
        onPress={handleRequest}
        title="Recover your account"
        loading={loading}
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

export * from "./RecoveryCode";
export * from "./ResetPassword";
