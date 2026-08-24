import React, { ReactElement, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  TouchableText,
  Typography,
} from "../../components";
import { Colors } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  openAppSettings,
} from "../../utils";
import messaging from "@react-native-firebase/messaging";
import Polygon from "../../assets/svgs/Polygon.svg";
import { Screens } from "../../navigation";
import Setting from "../../assets/svgs/Setting.svg";
import GamePad from "../../assets/svgs/GamePad.svg";
import { UserProfile, UserToken } from "../../context";

export const NavBar = ({
  navigation,
  isPro,
  imageUploadLoading = false,
  page = 1,
  openRevShare,
  openProfile,
  totalEarnings,
  openSupport,
}: any): ReactElement => {
  const { setUserToken }: any = useContext(UserToken);
  const { setUserProfile, userProfile }: any = useContext<any>(UserProfile);
  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      style={{
        width: "100%",
      }}
    >
      <Typography
        color={page === 0 ? Colors.CANDOR_WHITE : Colors.CANDOR_BLACK}
        textAlign="center"
        lineHeight={29}
        style={
          page === 0
            ? {
                textShadowColor: Colors.CANDOR_BLACK,
                textShadowRadius: 6,
                // marginLeft: getScreenResponsiveWidth(10),
                width: getScreenResponsiveWidth(100),
              }
            : {}
        }
        size={24}
      >
        Candor
      </Typography>

      <Row>
        <>
          {isPro && (
            <Button
              onPress={openSupport}
              height={30}
              width={45}
              title="🤩"
              textStyle={{
                fontSize: 12,
              }}
              color={Colors.CANDOR_BLACK}
              style={{
                minWidth: 43,
                paddingHorizontal: 5,
                marginRight: 6,
              }}
            />
          )}
        </>

        <>
          {!isPro && (
            <Button
              onPress={() => {
                navigation.navigate(Screens.PRO, { type: "Pro" });
              }}
              height={30}
              width={45}
              title="Pro"
              textStyle={{
                fontSize: 12,
              }}
              color={Colors.CANDOR_BLACK}
              style={{
                paddingHorizontal: getScreenResponsiveWidth(5),
                marginRight: getScreenResponsiveWidth(5),
              }}
            />
          )}
        </>

        <Row alignItems="center">
          <Button
            onPress={openRevShare}
            height={30}
            width={45}
            title={`$${totalEarnings}`}
            textStyle={{
              fontSize: 12,
            }}
            color={"rgba(0,0,0,0.4)"}
            style={{
              paddingHorizontal: getScreenResponsiveWidth(5),
            }}
          />

          <TouchableIcon
            onPress={() => {
              navigation.navigate(Screens.POLLS);
            }}
          >
            <Row
              width={30}
              height={30}
              alignItems="center"
              justifyContent="center"
              backgroundColor={Colors.CANDOR_BLACK}
              style={{
                borderRadius: 30,
                marginLeft: getScreenResponsiveWidth(5),
                marginRight: getScreenResponsiveWidth(5),
              }}
            >
              <GamePad />
            </Row>
          </TouchableIcon>
          {imageUploadLoading ? (
            <ActivityIndicator />
          ) : userProfile?.is_snap_logged_in ? (
            <TouchableIcon
              onPress={() => {
                openProfile();
              }}
            >
              <Image
                source={{ uri: userProfile?.snapchat_bitmoji }}
                style={{
                  width: getScreenResponsiveWidth(32),
                  height: getScreenResponsiveHeight(32),
                  borderRadius: 30,
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
              />
            </TouchableIcon>
          ) : (
            <TouchableIcon
              onPress={() => {
                openProfile();
              }}
            >
              <Setting />
            </TouchableIcon>
          )}
        </Row>
      </Row>
    </Row>
  );
};
