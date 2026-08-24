import React, { ReactElement, useContext, useState } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { Colors, FontType, getHexColorOpacity } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
} from "../../utils";
import { emojis } from "../../constants";
import {
  Column,
  Typography,
  Button,
  Spacer,
  Row,
  TouchableIcon,
  Input,
} from "../../components";
import { UserProfile } from "../../context";
import { LinearGradient } from "expo-linear-gradient";
import { GET_GROUP_MESSAGES, GET_USER_GROUPS } from "../../graphQL/queries";
import Reportbutton from "../../assets/svgs/Reportbutton1.svg";
import { useMutation, useQuery } from "@apollo/client";
import { Page } from "../../layouts";
import BackButton3 from "../../assets/svgs/BackButton3.svg";
import SendButtonInactive from "../../assets/svgs/SendButton-Inactive.svg";
import SendButton from "../../assets/svgs/SendButton.svg";
import Reply from "../../assets/svgs/Reply.svg";
import Close from "../../assets/svgs/Close.svg";
import { DELETE_GROUP, SEND_GROUP_MESSAGE } from "../../graphQL/mutations";
import { useActionSheet } from "@expo/react-native-action-sheet";
import MPL from "../../assets/svgs/mpl.svg";
import MPR from "../../assets/svgs/mpr.svg";

export const GroupChat = ({
  setActiveTab,
  refetchCount,
}: any): ReactElement => {
  const [modalVisible, setModalVisible] = useState(false);
  const { userProfile }: any = useContext(UserProfile);
  const [chats, setChats] = useState<any[]>([]);
  const [page, setpage] = useState<any>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [openedChat, setOpenedChat] = useState<any>(null);
  const [chatPage, setChatPage] = useState<any>(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [textMessage, setTextMessage] = useState<string>("");
  const [taggedMessage, setTaggedMessage] = useState<any>(null);
  const limit = 12;
  const {
    loading: loadingChats,
    refetch,
    fetchMore,
    data: chatData,
  } = useQuery(GET_USER_GROUPS, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      setpage(page + 1);
      setChats(data?.GetUserGroups);
      refetchCount();
    },
    variables: {
      limit: limit,
      page: 0,
    },
  });

  const {
    loading: loadingChatMessages,
    fetchMore: fetchMoreChatMessages,
    refetch: refetchChats,
  } = useQuery(GET_GROUP_MESSAGES, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      setChatPage(chatPage + 1);
      setChatMessages(data?.GetGroupMessages);
      refetchCount();
      refetch();
    },
    variables: {
      limit: limit,
      page: 0,
      groupToken: openedChat?.group_token,
    },
  });
  const [SendMessage] = useMutation(SEND_GROUP_MESSAGE, {
    onCompleted(d) {
      setTextMessage("");
      setTaggedMessage(null);
      refetchChats();
    },
    onError(e) {
      console.log(e);
    },
  });

  const [DeleteChat] = useMutation(DELETE_GROUP, {
    onCompleted() {
      refetch();
      refetchCount();
      setModalVisible(!modalVisible);
    },
    onError(error, clientOptions) {
      console.log(error);
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
    setOpenedChat(null);
    setTextMessage("");
  };

  const { showActionSheetWithOptions } = useActionSheet();
  const openReportAction = () => {
    const options = ["Delete Group", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: [0, 1],
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 0:
            DeleteChat({
              variables: {
                groupToken: openedChat?.group_token,
              },
            });
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
            Group Threads
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
                  const newEntries = fetchMoreResult?.GetUserGroups;
                  return {
                    GetUserGroups: [
                      ...previousResult?.GetUserGroups,
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
              flex: 1,
              backgroundColor: "transparent",
            }}
            safeAreaView
            keyboardAware
          >
            <Spacer height={Platform.OS === "android" ? 0 : 30} />
            <Row width={"100%"} justifyContent={"space-between"}>
              <TouchableIcon onPress={closeModal}>
                <BackButton3 height={35} width={35} />
              </TouchableIcon>
              <TouchableIcon onPress={openReportAction}>
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
                paddingHorizontal: getScreenResponsiveWidth(2),
                paddingBottom: getScreenResponsiveHeight(3),
                alignSelf: "center",
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
                Anonymous Group-thread
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
                {openedChat?.group_name}
              </Typography>
              <Spacer height={10} />
              <Column
                height={380}
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
                    <Column
                      style={{
                        paddingBottom: taggedMessage
                          ? getScreenResponsiveHeight(20)
                          : 0,
                      }}
                      flex={1}
                      width={"100%"}
                    >
                      <FlatList
                        data={chatMessages}
                        horizontal={false}
                        scrollEnabled
                        style={{ width: "100%" }}
                        inverted
                        contentContainerStyle={{
                          width: "100%",
                        }}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                          <Spacer height={38} width={38} />
                        )}
                        keyExtractor={(_, index) => index.toFixed(1)}
                        renderItem={({ item, index }: any) => (
                          <MessageItem
                            item={item}
                            setTaggedMessage={setTaggedMessage}
                            user={userProfile}
                          />
                        )}
                        onEndReached={async () => {
                          await fetchMoreChatMessages({
                            variables: {
                              limit: limit,
                              page: chatPage,
                            },
                            updateQuery(previousResult, { fetchMoreResult }) {
                              const newEntries =
                                fetchMoreResult?.GetGroupMessages;
                              return {
                                GetGroupMessages: [
                                  ...previousResult?.GetGroupMessages,
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
                style={{
                  borderBottomEndRadius: 18,
                  borderBottomStartRadius: 18,
                }}
                justifyContent="center"
              >
                {taggedMessage && (
                  <Row
                    width={290}
                    height={65}
                    backgroundColor={Colors.CANDOR_LEMON}
                    justifyContent="space-between"
                    alignItems="flex-start"
                    style={{
                      borderRadius: 18,
                      position: "absolute",
                      top: -getScreenResponsiveHeight(30),
                      paddingTop: getScreenResponsiveHeight(8),
                      paddingHorizontal: getScreenResponsiveWidth(10),
                    }}
                  >
                    <Column>
                      <Typography
                        fontFamily={FontType.REGULAR_INTER}
                        type="Paragraph7"
                      >
                        Reply to {taggedMessage?.sender?.name}
                      </Typography>
                      <Spacer height={4} />
                      <Typography type="Paragraph3">
                        {showOnly(28, taggedMessage?.message)}
                      </Typography>
                    </Column>
                    <TouchableIcon onPress={() => setTaggedMessage(null)}>
                      <Close height={16} width={16} />
                    </TouchableIcon>
                  </Row>
                )}

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
                  placeholderTextColor={Colors.CANDOR_GRAY}
                  autoCapitalize="sentences"
                  maxLength={150}
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
                        if (textMessage) {
                        }
                        SendMessage({
                          variables: {
                            message: textMessage,
                            groupToken: openedChat?.group_token,
                            taggedMessageId: taggedMessage?._id,
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
            <Spacer height={20} />
            <Button
              color={Colors.CANDOR_WHITE}
              onPress={() => refetchChats()}
              textColor={Colors.CANDOR_BLACK}
              title={"Refresh"}
            />
          </Page>
        </LinearGradient>
      </Modal>
    </View>
  );
};

const MessageItem = ({ item, user, setTaggedMessage }: any) => {
  const sentMessage = item?.sender?.user === user?._id;
  return (
    <Row
      style={{
        alignSelf: sentMessage ? "flex-end" : "flex-start",
      }}
      alignItems="center"
    >
      <>
        {!sentMessage && (
          <Column
            backgroundColor={Colors.CANDOR_YELLOW}
            style={{ borderRadius: 100, height: 34, width: 34 }}
            justifyContent="center"
            alignItems="center"
          >
            <Typography textAlign="center" type="Paragraph2">
              {item?.sender?.emoji}
            </Typography>
          </Column>
        )}
      </>
      <Spacer width={7} />
      <Column>
        <Typography
          style={{
            alignSelf: sentMessage ? "flex-end" : "flex-start",
          }}
          color={sentMessage ? "#0497C5" : Colors.CANDOR_GRAY}
          type="Paragraph6"
        >
          {sentMessage ? "You" : item?.sender?.name}
        </Typography>
        <Spacer height={5} />
        <Row alignItems="center">
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
              justifyContent="center"
              backgroundColor={
                sentMessage ? "#0497C5" : Colors.CANDOR_LIGHT_GRAY
              }
              style={{
                borderRadius: 15,
                paddingHorizontal: getScreenResponsiveWidth(12),
                paddingVertical: getScreenResponsiveHeight(12),
                maxWidth: getScreenResponsiveWidth(188),
              }}
            >
              <>
                {item?.taggedMessage && (
                  <>
                    <Column
                      height={52}
                      width={"auto"}
                      style={{
                        borderRadius: 13,
                        paddingHorizontal: getScreenResponsiveWidth(12),
                        maxWidth: getScreenResponsiveWidth(165),
                      }}
                      backgroundColor={getHexColorOpacity(
                        Colors.CANDOR_BLACK,
                        30
                      )}
                      justifyContent="center"
                      alignItems="flex-start"
                    >
                      <Typography
                        type="Paragraph7"
                        color={
                          sentMessage
                            ? getHexColorOpacity(Colors.CANDOR_WHITE, 60)
                            : getHexColorOpacity(Colors.CANDOR_BLACK, 60)
                        }
                      >
                        {item?.taggedMessage?.sender?.name}
                      </Typography>
                      <Spacer height={5} />
                      <Typography
                        type="Paragraph5"
                        color={
                          sentMessage
                            ? Colors.CANDOR_WHITE
                            : Colors.CANDOR_BLACK
                        }
                      >
                        {showOnly(25, item?.taggedMessage?.message)}
                      </Typography>
                    </Column>
                    <Spacer height={10} />
                  </>
                )}
              </>

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
          <Spacer width={7} />
          <>
            {!sentMessage && (
              <TouchableIcon
                style={{
                  marginHorizontal: 0,
                }}
                onPress={() => setTaggedMessage(item)}
              >
                <Reply height={23} width={23} />
              </TouchableIcon>
            )}
          </>
        </Row>
      </Column>
    </Row>
  );
};

const ListItem = ({ onPress, item, index }: any) => {
  const data = item;
  // const emoji = emojis[randomRange(0, emojis.length - 1)];
  const emoji = emojis[index];

  // const emoji[0]
  return (
    <Column justifyContent="center" alignItems="center">
      {item?.unread_messages > 0 ? (
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
            {item?.unread_messages}
          </Typography>
        </Column>
      ) : (
        <></>
      )}
      <Button
        onPress={() => {
          onPress();
        }}
        title={emoji}
        color={
          item?.unread_messages === 0
            ? Colors.CANDOR_GRAY
            : Colors.CANDOR_YELLOW
        }
        style={{
          borderRadius: getScreenResponsiveWidth(100),
          opacity: item?.unread_messages === 0 ? 0.5 : 1,
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
        textStyle={{
          fontSize: 32,
          lineHeight: 38,
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
