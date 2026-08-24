import React, { FC, ReactElement, useContext, useState } from "react";
import { StyleSheet } from "react-native";
import { Page } from "../../layouts";
import {
  Button,
  Input,
  Spacer,
  Title,
  TouchableIcon,
  Typography,
} from "../../components";
import BackButton from "../../assets/svgs/Backbutton.svg";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PASSWORD } from "../../graphQL/mutations";
import { PasswordInput } from "../../components/PasswordInput";
import { ToastContext } from "../../context";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";

interface ChangePasswordProps {
  navigation: any;
}

export const ChangePassword: FC<ChangePasswordProps> = ({
  navigation,
}): ReactElement => {
  const { toast } = useContext<any>(ToastContext);

  const [payload, setpayload] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [UpdateUserPassword, { loading }] = useMutation(UPDATE_USER_PASSWORD, {
    onCompleted() {
      navigation.goBack();
      toast({
        message: `📝\nYour password has been changed successfully\n`,
        intent: "success",
      });
    },
  });

  const disable = () => {
    if (
      !payload.oldPassword ||
      !payload.newPassword ||
      !payload.confirmPassword
    ) {
      return true;
    }
    if (payload.newPassword.length < 8) return true;
    if (payload.newPassword !== payload.confirmPassword) return true;
    return false;
  };

  const onSubmit = async () => {
    await UpdateUserPassword({
      variables: {
        oldPassword: payload.oldPassword,
        newPassword: payload.newPassword,
      },
    });
  };
  return (
    <Page dismissKeyboard keyboardAware>
      <Spacer height={26} />
      <TouchableIcon onPress={navigation.goBack}>
        <BackButton
          height={getScreenResponsiveHeight(35)}
          width={getScreenResponsiveWidth(35)}
        />
      </TouchableIcon>
      <Spacer height={10} />
      <Title />
      <Spacer height={26} />
      <Typography textAlign="center">
        {`Enter your old password and new\npassword\n👇`}
      </Typography>
      <Spacer height={10.5} />
      <Input
        placeholder="Enter old password"
        secureTextEntry
        value={payload.oldPassword}
        onChangeText={(txt) => {
          setpayload({ ...payload, oldPassword: txt });
        }}
      />
      <Spacer height={10.5} />
      <PasswordInput
        placeholder="Enter new password"
        secureTextEntry
        value={payload.newPassword}
        onChangeText={(txt) => {
          setpayload({ ...payload, newPassword: txt });
        }}
      />
      <Spacer height={10.5} />
      <PasswordInput
        placeholder="Retype new password"
        secureTextEntry
        value={payload.confirmPassword}
        onChangeText={(txt) => {
          setpayload({ ...payload, confirmPassword: txt });
        }}
      />
      <Spacer height={105} />
      <Button
        loading={loading}
        disabled={disable() || loading}
        onPress={onSubmit}
        title="Change password"
      />
      <Spacer height={15} />
      <Typography textAlign="center">
        {`Entering your old password,\nhelps us secure your account`}
      </Typography>
    </Page>
  );
};

const styles = StyleSheet.create({});
