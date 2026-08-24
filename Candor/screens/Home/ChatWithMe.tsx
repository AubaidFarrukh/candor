import React, { ReactElement, useContext, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
} from "react-native";
import {
  Button,
  Column,
  Input,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import { ProSubscriptionContext, UserProfile } from "../../context";
import { Screens } from "../../navigation";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
} from "../../utils";
import BackButton3 from "../../assets/svgs/BackButton3.svg";
import Reportbutton from "../../assets/svgs/Reportbutton1.svg";
import { Page } from "../../layouts";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { LISTEN_MESSAGES } from "../../graphQL/subscriptions";
import { LIST_CHATS, LIST_CHAT_MESSAGES } from "../../graphQL/queries";
import {
  DELETE_AND_BLOCK_CHAT,
  DELETE_DM_THREADS,
  MARK_CHAT_AS_READ,
  SEND_MESSAGE,
} from "../../graphQL/mutations";
import { emojis } from "../../constants";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as MailComposer from "expo-mail-composer";
import ModalPopup from "react-native-modal";
import CloseIcon from "../../assets/svgs/Close.svg";
import RBSheet from "react-native-raw-bottom-sheet";
import { OneTimeReveal } from "./OneTimeReveal";
import { WhoSentThis } from "./WhoSentThis";
import SendButtonInactive from "../../assets/svgs/SendButton-Inactive.svg";
import SendButton from "../../assets/svgs/SendButton.svg";
import { LinearGradient } from "expo-linear-gradient";
import MPL from "../../assets/svgs/mpl.svg";
import MPR from "../../assets/svgs/mpr.svg";

export const ChatWithMe = ({
  setActiveTab,
  navigation,
  refetchCount,
}: any): ReactElement => {
  const { isPro }: any = useContext(ProSubscriptionContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setModalIsVisible] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [page, setpage] = useState<any>(0);
  const [chatPage, setChatPage] = useState<any>(0);
  const [openedChat, setOpenedChat] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const { userProfile }: any = useContext(UserProfile);
  const [textMessage, setTextMessage] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const whoSentThis = useRef<any>();
  const reveeal = isPro || openedChat?.is_paid;

  useSubscription(LISTEN_MESSAGES, {
    variables: {
      msgToken: openedChat?.msg_token,
      anonymousUserId: openedChat?.anonymous_user_id,
    },
    onError(error) {
      console.log(error, "subscription");
    },
    onData(options: any) {
      setChatMessages([options.data?.data?.ListenMessages, ...chatMessages]);
    },
  });

  const limit = 12;

  const {
    loading: loadingChats,
    refetch,
    fetchMore,
    data: chatData,
  } = useQuery(LIST_CHATS, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      setpage(page + 1);
      setChats(data?.ListDMChatThreads);
      refetchCount();
    },
    variables: {
      limit: limit,
      page: 0,
    },
  });

  const [MarkChatAsRead] = useMutation(MARK_CHAT_AS_READ, {
    async onCompleted(d) {
      refetchCount();
      await refetch();
    },
    onError(e) {
      console.log(e);
    },
  });

  const { loading: loadingChatMessages, fetchMore: fetchMoreChatMessages } =
    useQuery(LIST_CHAT_MESSAGES, {
      fetchPolicy: "network-only",
      onCompleted(data) {
        setChatPage(chatPage + 1);
        setChatMessages(data?.ListMessagesFromDMThread);

        MarkChatAsRead({
          variables: {
            msgToken: openedChat?.msg_token,
            anonymousUserId: openedChat?.anonymous_user_id,
          },
        });
        refetchCount();
      },
      variables: {
        limit: limit,
        page: 0,
        anonymousUserId: openedChat?.anonymous_user_id,
        msgToken: openedChat?.msg_token,
      },
    });

  const [SendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted(d) {
      console.log(d, "messeage");
      setTextMessage("");
    },
    onError(e) {
      console.log(e, "message error");
    },
  });

  const onRefresh = async () => {
    setpage(0);
    setRefreshing(true);
    const { loading } = await refetch();
    setRefreshing(loading);
  };

  const closeModal = async () => {
    setModalVisible(!modalVisible);
    setTextMessage("");
    setOpenedChat(null);
  };
  const { showActionSheetWithOptions } = useActionSheet();
  const openMail = async () => {
    const isAvail = await MailComposer.isAvailableAsync();
    if (isAvail)
      await MailComposer.composeAsync({
        recipients: ["report.candor@gmail.com"],
        body: `-----\nUSERID:${userProfile?._id}\nMESSAGE_TOKEN:${openedChat?.msg_token}\nANONYMOUSE_USERID:${openedChat?.anonymous_user_id}\n-----\n`,
      });
  };

  const [DeleteChat] = useMutation(DELETE_DM_THREADS, {
    onCompleted() {
      refetch();
      refetchCount();
      setModalVisible(!modalVisible);
    },
  });

  const [DeleteChatAndBlockSender, { loading }] = useMutation(
    DELETE_AND_BLOCK_CHAT,
    {
      onCompleted() {
        setModalIsVisible(false);
        refetch();
        refetchCount();
        setModalVisible(!modalVisible);
        setReason("");
      },
      onError(e) {
        console.log(e);
      },
    }
  );

  const deleteAndBlockChatUser = () => {
    DeleteChatAndBlockSender({
      variables: {
        msgToken: openedChat?.msg_token,
        anonymousUserId: openedChat?.anonymous_user_id,
        temporarySenderUserId: openedChat?.anonymous_user_id,
        reason,
      },
    });
  };

  const openReportAction = () => {
    const options = [
      "Delete message",
      "Block user",
      "Tell Candor Team",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: [0, 1, 2],
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 0:
            DeleteChat({
              variables: {
                msgToken: openedChat?.msg_token,
                anonymousUserId: openedChat?.anonymous_user_id,
              },
            });
            break;

          case 1:
            setModalIsVisible(true);
            break;

          case 2:
            openMail();
            break;
        }
      }
    );
  };
  const openReport = () => {
    if (Platform.OS === "android") {
      setModalVisible(false);
    }
    const options = [
      "Bullying or harassment",
      "Spam",
      "I just dont like it",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 2,
        title: "Why are you reporting this message?",
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 0:
            openReportAction();
            break;

          case 1:
            openReportAction();
            break;

          case 2:
            openReportAction();
            break;
          case 3:
            setModalVisible(true);
            break;
        }
      }
    );
  };

  if (loadingChats) {
    if (chatData === undefined) refetch();
    return (
      <Column flex={1} justifyContent={"center"} alignItems="center">
        <ActivityIndicator size={"large"} />
        <Typography type="Paragraph1" textAlign="center">
          Loading Chats
        </Typography>
      </Column>
    );
  }

  return (
    <View style={styles.center}>
      {chats?.length === 0 ? (
        <Column
          flex={1}
          width={"100%"}
          alignItems="center"
          justifyContent="center"
        >
          <Typography type="Heading1" textAlign="center">
            ChatWithMe
          </Typography>
          <Spacer height={5} />
          <Typography
            color={Colors.CANDOR_GRAY}
            textAlign="center"
            size={15}
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            {`You have not received any anonymous \nmessages yet. Share your Candor link with\nyour friends or your socials or messaging  \napp to start receiving messages`}
          </Typography>
          <Spacer height={22} />
          <Button
            color={Colors.CANDOR_BLUE}
            onPress={() => setActiveTab(0)}
            title="Go back to Game"
          />
        </Column>
      ) : (
        <Column justifyContent="space-between" flex={1} width={"100%"}>
          <FlatList
            data={chats}
            horizontal={false}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: 20, width: 25 }} />
            )}
            keyExtractor={(_, index) => index.toFixed(1)}
            columnWrapperStyle={{
              alignItems: "flex-start",
              justifyContent: "space-evenly",
            }}
            renderItem={({ item, index }: any) => (
              <ListItem
                onPress={() => {
                  setOpenedChat(item);
                  setModalVisible(true);
                }}
                item={item}
                index={index}
              />
            )}
            onEndReached={async () => {
              await fetchMore({
                variables: {
                  limit: limit,
                  page: page,
                },
                updateQuery(previousResult, { fetchMoreResult }) {
                  const newEntries = fetchMoreResult?.ListDMChatThreads;

                  return {
                    ListDMChatThreads: [
                      ...previousResult?.ListDMChatThreads,
                      ...newEntries,
                    ],
                  };
                },
              });
            }}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          {/* <Spacer height={10} /> */}

          {!isPro ? (
            <>
              <Button
                color={Colors.CANDOR_BLUE}
                onPress={() => {
                  navigation.navigate(Screens.PRO, { type: "Pro" });
                }}
                title="Who sent this👀"
              />
              <Spacer height={50} />
            </>
          ) : (
            <></>
          )}
        </Column>
      )}

      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
        onShow={() => {}}
      >
        <LinearGradient style={{ flex: 1 }} colors={["#0076B2", "#0DEEF7"]}>
          <Page
            style={{
              paddingTop: getScreenResponsiveHeight(35),
              backgroundColor: "transparent",
              flex: 1,
            }}
            safeAreaView
            keyboardAware
          >
            <Spacer height={Platform.OS === "android" ? 0 : 30} />

            <Row width={"100%"} justifyContent={"space-between"}>
              <TouchableIcon onPress={closeModal}>
                <BackButton3 height={35} width={35} />
              </TouchableIcon>
              <TouchableIcon onPress={openReport}>
                <Reportbutton height={35} width={35} />
              </TouchableIcon>
            </Row>
            <Spacer height={21} />
            <Column
              height={"auto"}
              flex={1}
              style={{
                borderRadius: 18,
                elevation: 10,
                shadowColor: Colors.CANDOR_BLACK,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 11,
                shadowOpacity: 0.116,
                alignSelf: "center",
                paddingHorizontal: getScreenResponsiveWidth(2),
                paddingBottom: getScreenResponsiveHeight(3),
              }}
              width={318}
              backgroundColor={Colors.CANDOR_BLACK}
            >
              <Typography
                color={Colors.CANDOR_WHITE}
                type="Paragraph5"
                textAlign="center"
                fontFamily={FontType.REGULAR_FREDOKA}
                style={{
                  paddingTop: getScreenResponsiveHeight(21),
                }}
              >
                Anonymous Chat
              </Typography>
              <Spacer height={5} />
              <Typography
                color={Colors.CANDOR_WHITE}
                type="Heading1"
                size={18}
                textAlign="center"
                fontFamily={FontType.REGULAR_ANTON}
                lineHeight={24}
              >
                ChatWithMe
              </Typography>
              <Spacer height={10} />
              <Column
                height={384}
                width={"100%"}
                backgroundColor={Colors.CANDOR_WHITE}
                style={{
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  paddingHorizontal: getScreenResponsiveWidth(13),
                  paddingVertical: getScreenResponsiveHeight(20),
                }}
              >
                {loadingChatMessages ? (
                  <Column
                    flex={1}
                    height={"100%"}
                    justifyContent={"center"}
                    alignItems="center"
                  >
                    <ActivityIndicator size={"large"} />
                    <Typography
                      color={Colors.CANDOR_BLACK}
                      type="Paragraph1"
                      textAlign="center"
                    >
                      Loading Chat Messages
                    </Typography>
                  </Column>
                ) : (
                  <ScrollView
                    horizontal={true}
                    style={{
                      width: "100%",
                    }}
                    contentContainerStyle={{
                      width: "100%",
                      flex: 1,
                    }}
                  >
                    <Column flex={1} width={"100%"}>
                      <FlatList
                        data={chatMessages}
                        horizontal={false}
                        scrollEnabled
                        style={{ width: "100%" }}
                        inverted
                        contentContainerStyle={{
                          // flex: 1,
                          width: "100%",
                        }}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                          <View style={{ height: 20, width: 25 }} />
                        )}
                        keyExtractor={(_, index) => index.toFixed(1)}
                        renderItem={({ item, index }: any) => (
                          <MessageItem item={item} user={userProfile} />
                        )}
                        onEndReached={async () => {
                          await fetchMoreChatMessages({
                            variables: {
                              limit: limit,
                              page: chatPage,
                            },
                            updateQuery(previousResult, { fetchMoreResult }) {
                              const newEntries =
                                fetchMoreResult?.ListMessagesFromDMThread;
                              return {
                                ListMessagesFromDMThread: [
                                  ...previousResult?.ListMessagesFromDMThread,
                                  ...newEntries,
                                ],
                              };
                            },
                          });
                        }}
                        onEndReachedThreshold={0.3}
                      />
                    </Column>
                  </ScrollView>
                )}
              </Column>
              <Column
                backgroundColor={Colors.CANDOR_WHITE}
                width={"100%"}
                height={103}
                alignItems="center"
                justifyContent="center"
                style={{
                  borderBottomEndRadius: 18,
                  borderBottomStartRadius: 18,
                }}
              >
                <Input
                  containerStyle={{
                    height: getScreenResponsiveHeight(73),
                    borderColor: Colors.CANDOR_DARK_GRAY,
                    backgroundColor: Colors.CANDOR_DARK_GRAY,
                    width: getScreenResponsiveWidth(290),
                    paddingVertical: getScreenResponsiveHeight(5),
                    // justifyContent: "flex-start",
                    alignItems: "flex-start",
                    shadowColor: Colors.CANDOR_BLACK,
                    shadowOpacity: 0.25,
                    elevation: 10,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 4,
                  }}
                  value={textMessage || undefined}
                  multiline
                  onChangeText={(text) => setTextMessage(text)}
                  autoCapitalize="sentences"
                  maxLength={150}
                  placeholderTextColor={Colors.CANDOR_GRAY}
                  // multiline
                  style={{
                    lineHeight: 18,
                    fontFamily: FontType.REGULAR_FREDOKA,
                    width: "80%",
                    color: Colors.CANDOR_WHITE,
                  }}
                  placeholder="Type something back"
                  inputRight={() => (
                    <TouchableIcon
                      disabled={!textMessage}
                      style={{
                        alignSelf: "flex-end",
                        marginBottom: getScreenResponsiveHeight(10),
                      }}
                      onPress={() => {
                        if (textMessage)
                          SendMessage({
                            variables: {
                              message: textMessage,
                              msgToken: openedChat?.msg_token,
                              anonymousUserId: openedChat?.anonymous_user_id,
                            },
                          });
                      }}
                    >
                      {textMessage ? <SendButton /> : <SendButtonInactive />}
                    </TouchableIcon>
                  )}
                />
              </Column>
            </Column>

            <RBSheet
              ref={whoSentThis}
              closeOnDragDown={true}
              closeOnPressMask={true}
              height={getScreenResponsiveHeight(500)}
              customStyles={{
                wrapper: styles.wrapper,
                draggableIcon: styles.draggableIcon,
                container: styles.container,
              }}
            >
              {!reveeal ? (
                <OneTimeReveal
                  closeModal={async () => {
                    setModalVisible(false);
                  }}
                  message={openedChat}
                  isChat={true}
                  navigation={navigation}
                  setOpenedMessage={setOpenedChat}
                  rbSheetRef={whoSentThis}
                />
              ) : (
                <WhoSentThis
                  item={openedChat}
                  navigation={navigation}
                  onClose={() => {
                    return whoSentThis.current.close();
                  }}
                />
              )}
            </RBSheet>
            <ModalPopup
              animationIn={"fadeIn"}
              animationOut={"fadeOut"}
              avoidKeyboard
              isVisible={isModalVisible}
              style={{ justifyContent: "center", alignItems: "center" }}
              onBackdropPress={() => setModalVisible(false)}
            >
              <Column
                backgroundColor={Colors.CANDOR_WHITE}
                style={{
                  borderRadius: 26,
                  paddingHorizontal: getScreenResponsiveWidth(20),
                  paddingVertical: getScreenResponsiveHeight(14),
                }}
                // height={300}
                width={300}
              >
                <View style={{ alignSelf: "flex-end" }}>
                  <TouchableIcon onPress={() => setModalVisible(false)}>
                    <CloseIcon />
                  </TouchableIcon>
                </View>
                <Spacer height={10} />
                <Typography
                  type="Paragraph1"
                  color={Colors.CANDOR_BLACK}
                  size={15}
                  style={{ width: "70%" }}
                  textAlign="left"
                  fontFamily={FontType.REGULAR_FREDOKA}
                >
                  Reason
                </Typography>
                <Spacer height={20} />
                <Input
                  containerStyle={{
                    height: getScreenResponsiveHeight(120),
                    paddingTop: getScreenResponsiveHeight(10),
                    paddingHorizontal: getScreenResponsiveWidth(10),
                  }}
                  value={reason}
                  onChangeText={(text) => setReason(text)}
                  style={{
                    height: getScreenResponsiveHeight(93),
                    fontFamily: FontType.REGULAR_FREDOKA,
                  }}
                  placeholder="Enter Reason"
                  multiline
                />
                <Spacer height={20} />
                <Button
                  onPress={deleteAndBlockChatUser}
                  loading={loading}
                  title="Block User"
                />
              </Column>
            </ModalPopup>
            <Spacer height={Platform.OS == "ios" ? 34 : 24} />
            {Platform.OS == "ios" ? (
              <Button
                textColor={Colors.CANDOR_BLACK}
                color={Colors.CANDOR_WHITE}
                onPress={() => {
                  whoSentThis.current.open();
                }}
                title={reveeal ? "View Who sent this👀" : "Who sent this👀"}
              />
            ) : (
              <></>
            )}
          </Page>
        </LinearGradient>
      </Modal>
    </View>
  );
};
const MessageItem = ({ item, user }: any) => {
  // console.log(item);

  const sentMessage = item?.sender_id === user?._id;
  return (
    <Column>
      <Typography
        style={{
          alignSelf: sentMessage ? "flex-end" : "flex-start",
        }}
        color={sentMessage ? "#0497C5" : Colors.CANDOR_GRAY}
        type="Paragraph6"
      >
        {sentMessage ? "You" : "Anonymous user"}
      </Typography>
      <Spacer height={5} />
      <Row
        style={{
          alignSelf: sentMessage ? "flex-end" : "flex-start",
        }}
        alignItems="center"
      >
        <Spacer width={5} />
        <Row>
          <>
            {!sentMessage && (
              <Column
                style={{
                  left: -5,
                  position: "absolute",
                }}
              >
                <MPL />
              </Column>
            )}
          </>
          <Column
            width={"auto"}
            backgroundColor={sentMessage ? "#0497C5" : Colors.CANDOR_LIGHT_GRAY}
            style={{
              borderRadius: 12,
              paddingHorizontal: getScreenResponsiveWidth(12),
              paddingVertical: getScreenResponsiveHeight(12),
            }}
          >
            <Typography
              textAlign={"left"}
              color={sentMessage ? Colors.CANDOR_WHITE : Colors.CANDOR_BLACK}
            >
              {item?.message}
            </Typography>
          </Column>
          <>
            {sentMessage && (
              <Column
                style={{
                  right: -5,
                  position: "absolute",
                }}
              >
                <MPR />
              </Column>
            )}
          </>
        </Row>
        <Spacer width={5} />
      </Row>
    </Column>
  );
};
const ListItem = ({ onPress, item, index }: any) => {
  const data = item;
  const isPro = item?.msg_token_type === "paid_by_receiver";
  // const emoji = emojis[randomRange(0, emojis.length - 1)];
  const emoji = emojis[index];

  // const emoji[0]
  return (
    <Column justifyContent="center" alignItems="center">
      {item?.unseen_count > 0 ? (
        <Column
          height={22}
          width={22}
          justifyContent="center"
          alignItems="center"
          style={{
            position: "absolute",
            zIndex: 1,
            borderWidth: 2,
            borderColor: Colors.CANDOR_BLACK,
            borderRadius: 100,
            alignSelf: "flex-end",
            top: 0,
            right: 5,
          }}
          backgroundColor={Colors.CANDOR_PINK}
        >
          <Typography
            textAlign="center"
            type="Paragraph5"
            color={Colors.CANDOR_WHITE}
          >
            {item?.unseen_count}
          </Typography>
        </Column>
      ) : (
        <></>
      )}
      <Button
        onPress={() => {
          onPress();
        }}
        title={isPro ? emoji : `$${data?.amount}`}
        color={
          item?.unseen_count === 0 ? Colors.CANDOR_GRAY : Colors.CANDOR_YELLOW
        }
        style={{
          borderRadius: getScreenResponsiveWidth(100),
          opacity: item?.unseen_count === 0 ? 0.5 : 1,
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
        textStyle={{
          fontSize: isPro ? 48 : 32,
          lineHeight: isPro ? 70 : 38,
          color: Colors.CANDOR_BLACK,
          textAlign: "center",
        }}
      />
    </Column>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  wrapper: {
    backgroundColor: getHexColorOpacity(Colors.CANDOR_BLACK, 32),
  },
  draggableIcon: {
    backgroundColor: Colors.CANDOR_BLACK,
  },
  container: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: Colors.CANDOR_BLACK,
  },
  badge: {
    backgroundColor: Colors.CANDOR_SEA_BLUE,
    width: 30,
    height: 30,
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_WHITE,
    borderWidth: 3,
    zIndex: 1,
    position: "absolute",
    top: -2,
  },
});
