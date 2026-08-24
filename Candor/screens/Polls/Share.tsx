import React, { FC, ReactElement, useContext, useRef } from "react";
import { Image, StyleSheet } from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Page } from "../../layouts";
import { Colors, FontType } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
} from "../../utils";
import { ToastContext, UserProfile } from "../../context";
import BackButton2 from "../../assets/svgs/BackButton2.svg";
import * as Clipboard from "expo-clipboard";
import RBSheet from "react-native-raw-bottom-sheet";
import SnapChat from "../../assets/svgs/Snapchat.svg";
import Whatsapp from "../../assets/svgs/Whatsapp.svg";
import Instagram from "../../assets/svgs/Instagram.svg";
import Twitter from "../../assets/svgs/Twitter.svg";
interface OnboardingProps {
  navigation: any;
  route: any;
}

export const Share: FC<OnboardingProps> = ({
  navigation,
  route,
}): ReactElement => {
  const item = route.params.item;
  const bsheet = useRef<any>();
  const { toast } = useContext<any>(ToastContext);
  let { userProfile }: any = useContext(UserProfile);
  const userId = userProfile?.name?.split(" ")[0]?.toLowerCase();

  const handleCopy = async () => {
    const preLink = "https://candor.app/upvote";

    const link = preLink + item?._id;

    await Clipboard.setStringAsync(link);
    // Alert.alert("Copied to Clipboard!");
    toast({ message: "Copied link!", intent: "success" });
  };
  return (
    <Page style={styles.center}>
      <Row
        style={{
          position: "absolute",
          top: 60,
        }}
        width={"100%"}
        justifyContent={"space-between"}
      >
        <TouchableIcon
          onPress={() => {
            navigation.goBack();
          }}
        >
          <BackButton2 />
        </TouchableIcon>
      </Row>
      <Spacer height={29} />
      <Column style={{ borderRadius: 20 }} height={420}>
        <Column
          height={352}
          width={299}
          backgroundColor={Colors.CANDOR_YELLOW}
          justifyContent={"space-between"}
          style={{
            borderRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(21),
            paddingVertical: getScreenResponsiveHeight(20),
          }}
        >
          <Typography
            fontFamily={FontType.REGULAR_ANTON}
            lineHeight={45}
            color={item.textColor}
            textAlign={"left"}
            size={35}
            style={{ width: getScreenResponsiveWidth(172) }}
          >
            {item.text}
          </Typography>
          <Row alignItems="center" justifyContent="space-between">
            <Typography
              fontFamily={FontType.REGULAR_FREDOKA}
              type="Paragraph4"
              color={item.text_color || Colors.CANDOR_BLACK}
            >
              {item?.braggin_right}
            </Typography>
            <Image
              style={{
                width: getScreenResponsiveWidth(81),
                height: getScreenResponsiveHeight(24),
              }}
              source={require("../../assets/Logo.png")}
            />
          </Row>
        </Column>
      </Column>
      <Row
        height={88}
        width={"100%"}
        justifyContent="space-between"
        alignItems="center"
        backgroundColor={Colors.CANDOR_BLACK}
        style={{
          borderRadius: 25,
          paddingHorizontal: getScreenResponsiveWidth(17),
        }}
      >
        <Column justifyContent="flex-start">
          <Typography
            color={Colors.CANDOR_WHITE}
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            {`Share on \nsocials`}
          </Typography>
        </Column>
        <Row justifyContent="flex-end">
          <TouchableIcon
            onPress={() => {
              //
            }}
          >
            <Whatsapp />
          </TouchableIcon>
          <Spacer width={6} />
          <TouchableIcon
            onPress={() => {
              //
            }}
          >
            <SnapChat />
          </TouchableIcon>
          <Spacer width={6} />
          <TouchableIcon
            onPress={() => {
              //
              bsheet.current.open();
            }}
          >
            <Instagram />
          </TouchableIcon>
          <Spacer width={6} />
          <TouchableIcon
            onPress={() => {
              //
            }}
          >
            <Twitter />
          </TouchableIcon>
        </Row>
      </Row>
      <Spacer height={13} />
      <Row
        height={88}
        width={"100%"}
        justifyContent="space-between"
        alignItems="center"
        backgroundColor={Colors.CANDOR_BLACK}
        style={{
          borderRadius: 25,
          paddingHorizontal: getScreenResponsiveWidth(17),
        }}
      >
        <Column width={162} justifyContent="flex-start">
          <Typography
            color={Colors.CANDOR_WHITE}
            type="Paragraph5"
            size={14}
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            {showOnly(40, `playcandor.com/${userId}/`)}
          </Typography>
        </Column>
        <Button
          width={100}
          height={32}
          color={Colors.CANDOR_WHITE}
          onPress={handleCopy}
          title="Copy link"
          textColor={Colors.CANDOR_BLACK}
          textStyle={{
            fontSize: 12,
          }}
        />
      </Row>

      <RBSheet
        ref={bsheet}
        height={getScreenResponsiveHeight(370)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            justifyContent: "flex-start",
            alignItems: "center",
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
            paddingHorizontal: getScreenResponsiveWidth(28),
          },
          draggableIcon: {
            width: 43.6,
            height: 0,
            borderStyle: "solid",
            borderWidth: 3,
            borderColor: "#eeeeee",
            borderRadius: 20,
          },
        }}
      ></RBSheet>
    </Page>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.CANDOR_RED,
    width: getScreenResponsiveHeight(30),
    height: getScreenResponsiveHeight(30),
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_BLACK,
    borderWidth: 3,
    marginBottom: -20,
    zIndex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
