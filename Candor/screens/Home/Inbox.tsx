import React, { ReactElement, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  Column,
  Row,
  Spacer,
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
import { Message } from "./Message";
import { ChatWithMe } from "./ChatWithMe";
import { NavBar } from "../../components/v2/NavBar";
import { Page } from "../../layouts";
import { GroupChat } from "./GroupChat";
import { useQuery } from "@apollo/client";
import { GET_UNREAD_MESSAGES_COUNT } from "../../graphQL/queries";

export const Inbox = ({
  navigation,
  setActiveTab,
  refetchCount,
  isPro,
  imageUploadLoading = false,
  totalEarnings,
  openProfile,
  openRevShare,
  openSupport,
}: any): ReactElement => {
  const [activeTab, setactiveTab] = useState(0);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  useEffect(() => {
    (async () => {
      const authStatus = await messaging().hasPermission();
      const notificationStatus =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!notificationStatus) {
        setShowNotificationBanner(true);
      }
    })();
  }, []);
  const { refetch, data } = useQuery(GET_UNREAD_MESSAGES_COUNT, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      console.log("data", data);
    },
    variables: {
      limit: 10000000,
      page: 0,
    },
  });
  const refetchUnreadCount = () => {
    refetch();
    refetchCount();
  };
  return (
    <Page style={styles.center}>
      <Spacer height={30} />
      <NavBar
        navigation={navigation}
        isPro={isPro}
        totalEarnings={totalEarnings}
        imageUploadLoading={imageUploadLoading}
        openProfile={openProfile}
        openRevShare={openRevShare}
        openSupport={openSupport}
      />
      <Spacer height={10} />

      <Row
        width={"100%"}
        height={43}
        style={{
          borderRadius: 28,
          paddingHorizontal: getScreenResponsiveWidth(5),
        }}
        backgroundColor={Colors.CANDOR_BLACK}
        alignItems="center"
        justifyContent="space-evenly"
      >
        <Row
          backgroundColor={
            activeTab === 0 ? Colors.CANDOR_WHITE : Colors.CANDOR_BLACK
          }
          style={{
            borderRadius: 20.5,
          }}
          height={34}
          flex={1}
          width={"100%"}
          justifyContent="center"
          alignItems="center"
        >
          <TouchableText
            type="Paragraph3"
            onPress={() => setactiveTab(0)}
            color={activeTab === 0 ? Colors.CANDOR_BLACK : Colors.CANDOR_WHITE}
          >
            GroupThreads
          </TouchableText>
          <>
            {data?.TotalUnreadGroupMessagesCount > 0 ? (
              <>
                <Spacer width={5} />
                <Column
                  height={10}
                  width={10}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    zIndex: 1,
                    borderWidth: 2,
                    borderColor: Colors.CANDOR_BLACK,
                    borderRadius: 100,
                  }}
                  backgroundColor={Colors.CANDOR_PINK}
                ></Column>
              </>
            ) : null}
          </>
        </Row>
        <Row
          backgroundColor={
            activeTab === 1 ? Colors.CANDOR_WHITE : Colors.CANDOR_BLACK
          }
          style={{
            borderRadius: 20.5,
          }}
          height={34}
          flex={1}
          width={"100%"}
          justifyContent="center"
          alignItems="center"
        >
          <TouchableText
            type="Paragraph3"
            onPress={() => setactiveTab(1)}
            color={activeTab === 1 ? Colors.CANDOR_BLACK : Colors.CANDOR_WHITE}
          >
            Your Message
          </TouchableText>
          <>
            {data?.UnreadMessageCount > 0 ? (
              <>
                <Spacer width={5} />
                <Column
                  height={10}
                  width={10}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    zIndex: 1,
                    borderWidth: 2,
                    borderColor: Colors.CANDOR_BLACK,
                    borderRadius: 100,
                  }}
                  backgroundColor={Colors.CANDOR_PINK}
                ></Column>
              </>
            ) : null}
          </>
        </Row>
        <Row
          backgroundColor={
            activeTab === 2 ? Colors.CANDOR_WHITE : Colors.CANDOR_BLACK
          }
          style={{
            borderRadius: 20.5,
          }}
          height={34}
          flex={1}
          width={"100%"}
          justifyContent="center"
          alignItems="center"
        >
          <TouchableText
            type="Paragraph3"
            onPress={() => setactiveTab(2)}
            color={activeTab === 2 ? Colors.CANDOR_BLACK : Colors.CANDOR_WHITE}
          >
            ChatWithMe
          </TouchableText>
          <>
            {data?.TotalUnreadDMMessagesCount > 0 ? (
              <>
                <Spacer width={5} />
                <Column
                  height={10}
                  width={10}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    zIndex: 1,
                    borderWidth: 2,
                    borderColor: Colors.CANDOR_BLACK,
                    borderRadius: 100,
                  }}
                  backgroundColor={Colors.CANDOR_PINK}
                ></Column>
              </>
            ) : null}
          </>
        </Row>
      </Row>
      <Spacer height={20} />
      <>
        {showNotificationBanner && (
          <>
            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={openAppSettings}
            >
              <Row
                backgroundColor={Colors.CANDOR_PINK}
                height={41}
                justifyContent="center"
                alignItems="center"
                width={"100%"}
                style={{
                  borderRadius: 10,
                }}
              >
                <Typography type="Paragraph2" color={Colors.CANDOR_WHITE}>
                  Tap to open settings to turn notifications
                </Typography>
              </Row>
            </TouchableOpacity>
            <Spacer height={20} />
          </>
        )}
      </>
      <>
        {activeTab === 0 && (
          <GroupChat
            setActiveTab={setActiveTab}
            navigation={navigation}
            refetchCount={refetchUnreadCount}
          />
        )}
        {activeTab === 1 && (
          <Message
            navigation={navigation}
            setActiveTab={setActiveTab}
            refetchCount={refetchUnreadCount}
          />
        )}
        {activeTab === 2 && (
          <ChatWithMe
            setActiveTab={setActiveTab}
            navigation={navigation}
            refetchCount={refetchUnreadCount}
          />
        )}
      </>
    </Page>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    flex: 1,
    // backgroundColor: "red",
    paddingHorizontal: getScreenResponsiveWidth(20),
  },
});
