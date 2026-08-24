import React, { FC, ReactElement, useRef, useState } from "react";
import { useEffect } from "react";
import { ImageBackground, Platform } from "react-native";
import { PermissionData } from "../constants";
import { Button, Column, Row, Spacer, TouchableIcon, Typography } from "./main";
import Swiper from "react-native-swiper";
import { Colors, FontType } from "../theme";
import * as Contacts from "expo-contacts";
import { useMutation } from "@apollo/client";
import { UPLOAD_CONTACTS } from "../graphQL/mutations";
import { getScreenResponsiveHeight, getScreenResponsiveWidth } from "../utils";
import CloseIcon from "../assets/svgs/Close.svg";
import ParsedText from "react-native-parsed-text";
import * as WebBrowser from "expo-web-browser";

interface PermissionProps {
  closeModal: () => void;
}

export const Permission: FC<PermissionProps> = ({
  closeModal,
}): ReactElement => {
  const slider = useRef<any>();

  const [acceptedContact, setAcceptedContact] = useState(false);

  const [UploadPhoneContact, { loading }] = useMutation(UPLOAD_CONTACTS, {
    onCompleted() {
      setAcceptedContact(true);
    },
    onError() {
      setAcceptedContact(true);
    },
  });
  const requestContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Emails,
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
        ],
      }).then(({ data }) => {
        if (data.length > 0) {
          let names: any = [];
          let phone: any = [];
          let email: any = [];
          data.map((contact: any) => {
            names.push(contact.name ? contact.name : "");
            phone.push(
              contact.phoneNumbers ? contact.phoneNumbers[0].number : ""
            );
            email.push("");
          });

          UploadPhoneContact({
            variables: {
              name: names,
              phone: phone,
              email: email,
            },
          });
        }
      });
    }
    if (status === "denied") {
      setAcceptedContact(true);
    }
  };

  useEffect(() => {
    if (acceptedContact) {
      closeModal();
    }
  }, [acceptedContact]);

  return (
    <ImageBackground
      source={require("../assets/PushNotificationBackground.png")}
      style={{ flex: 1, paddingHorizontal: getScreenResponsiveWidth(20) }}
    >
      <Spacer height={Platform.OS === "ios" ? 50 : 20} />
      <Row justifyContent="flex-end">
        <TouchableIcon onPress={closeModal}>
          <CloseIcon style={{ opacity: 0.7 }} />
        </TouchableIcon>
      </Row>
      <Column alignItems="center" height={"100%"} width={"100%"}>
        <Spacer height={Platform.OS == "ios" ? 280 : 250} />
        <Column height={270}>
          <Swiper
            activeDotStyle={{
              width: getScreenResponsiveWidth(31.72),
            }}
            ref={slider}
            loop={true}
            scrollEnabled={true}
          >
            {[PermissionData.contact].map((item, index) => {
              return (
                <Column
                  justifyContent="center"
                  alignItems={"center"}
                  key={index}
                >
                  <Typography
                    type="Heading1"
                    textAlign="center"
                    lineHeight={121}
                    size={100}
                    color={Colors.CANDOR_BLACK}
                    key={index}
                  >
                    {item.emoji}
                  </Typography>
                  <Spacer height={15} />
                  <Typography
                    type="Heading1"
                    textAlign="center"
                    color={Colors.CANDOR_BLACK}
                  >
                    {item.title}
                  </Typography>
                  <Spacer height={7} />
                  <Typography
                    type="Paragraph3"
                    textAlign="center"
                    color={Colors.CANDOR_BLACK}
                  >
                    {item.description}
                  </Typography>
                </Column>
              );
            })}
          </Swiper>
        </Column>

        <Spacer height={15} />

        <Button
          width={318}
          disabled={acceptedContact}
          onPress={requestContact}
          title={"Continue"}
          loading={loading}
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
    </ImageBackground>
  );
};
