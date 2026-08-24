import React, { ReactElement, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import {
  Button,
  Column,
  Row,
  Spacer,
  TouchableIcon,
  Typography,
} from "../../components";
import { Screens } from "../../navigation";
import { Colors, FontType } from "../../theme";
import {
  getScreenResponsiveHeight,
  getScreenResponsiveWidth,
  showOnly,
} from "../../utils";
import { useQuery } from "@apollo/client";
import { LIST_POLLS } from "../../graphQL/queries";
import ShareIcon from "../../assets/svgs/Share-dark.svg";
import Share from "react-native-share";
import dayjs from "dayjs";
import Modal from "react-native-modal";
import CloseIcon from "../../assets/svgs/Close.svg";
// import DeleteIcon from "../../assets/svgs/DeleteIcon.svg";

export const YourPoll = ({ navigation, submitPoll }: any): ReactElement => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [pollText, setPollText] = useState<string>("");
  const { data, loading } = useQuery(LIST_POLLS, {
    fetchPolicy: "cache-and-network",
    variables: {
      limit: 10,
      page: 0,
      type: "my",
    },
  });

  if (loading) {
    return (
      <Column flex={1} justifyContent={"center"} alignItems="center">
        <ActivityIndicator size={"large"} />
        <Typography
          type="Heading1"
          color={Colors.CANDOR_WHITE}
          textAlign="center"
        >
          Loading Your Polls
        </Typography>
      </Column>
    );
  }

  const polls = data?.ListPolls;

  const openModal = (text: string) => {
    if (text) {
      setPollText(text);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.center}>
      {polls?.length < 1 ? (
        <View
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            color={Colors.CANDOR_BLACK}
            type="Heading1"
            textAlign="center"
          >
            Your Polls
          </Typography>
          <Spacer height={5} />
          <Typography
            type="Paragraph3"
            color={Colors.CANDOR_BLACK}
            textAlign="center"
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            You have not submitted a question yet . Submit a question now. You
            may find your question featured live under your name in the app.
          </Typography>
          <Spacer height={22} />
          <Button
            color={Colors.CANDOR_BLACK}
            onPress={submitPoll}
            title="Submit a poll"
            textColor={Colors.CANDOR_WHITE}
          />
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <FlatList
            data={polls}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }: any) => {
              return (
                <Pressable
                  onPress={() => openModal(item?.text)}
                  key={index.toString()}
                >
                  <YourPollItem item={item} navigation={navigation} />
                </Pressable>
              );
            }}
          />
        </View>
      )}
      <Modal
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
        isVisible={isModalVisible}
        style={{ justifyContent: "center", alignItems: "center" }}
        onBackdropPress={() => setModalVisible(false)}
      >
        <Column
          backgroundColor={Colors.CANDOR_WHITE}
          style={{
            borderRadius: 26,
            paddingHorizontal: getScreenResponsiveWidth(11),
            paddingLeft: getScreenResponsiveWidth(29),
            paddingVertical: getScreenResponsiveHeight(14),
          }}
          height={200}
          width={250}
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
            size={22}
            style={{ width: "70%" }}
            textAlign="left"
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            {pollText}
          </Typography>
        </Column>
      </Modal>
    </View>
  );
};

const YourPollItem = ({ item, navigation }: any) => {
  const currentTime = new Date(item?.week?.current_time).getTime();
  const resultsDay = dayjs(currentTime).format("dddd") == "Sunday";

  const status: any = {
    inactive: {
      text: `Inactive - ${item?.inactive_reason}`,
    },
    live: {
      text: "Live",
    },
    private: {
      text: "Pending approval",
    },
  };
  const showVotes = resultsDay && !item?.isCardLive;

  status.live.text = item?.isCardLive
    ? `Live in game tab - Check it out`
    : "Live in poll - Share with friends to be upvoted";

  if (item)
    item.brag_name = item?.brag_name
      ? item?.brag_name
      : item?.submitted_by?.name;

  const link = "playcandor.com/upvote/" + item?._id;
  const generalShare = async () => {
    try {
      await Share.open({
        title: "Hey, check out my card on Candor!",
        message: link,
      });
    } catch (err) {}
  };

  const onPress = async () => {
    if (!item?.isCardLive) {
      return await generalShare();
    }

    navigation.navigate(Screens.HOME, { tab: 0 });
  };

  return (
    <Column
      height={166}
      backgroundColor={Colors.CANDOR_BLUE}
      style={styles.card}
      justifyContent="space-between"
    >
      <Column>
        <Row justifyContent="space-between">
          <Typography color={Colors.CANDOR_WHITE} type="Paragraph6">
            {item?.is_paid
              ? `Premium poll by\n${
                  item?.brag_name?.trim() || item?.submitted_by?.name?.trim()
                }`
              : `Submitted by\n${
                  item?.brag_name?.trim() || item?.submitted_by?.name?.trim()
                }`}
          </Typography>

          {!showVotes && item?.status === "live" ? (
            <Row alignItems="center">
              {item?.is_paid && (
                <Button
                  onPress={() => {}}
                  height={28}
                  width={40}
                  title="$0"
                  textStyle={{
                    fontSize: 12,
                  }}
                  color={Colors.CANDOR_BLACK}
                  style={{
                    paddingHorizontal: 5,
                    marginRight: 6,
                  }}
                />
              )}

              <TouchableIcon onPress={generalShare}>
                <ShareIcon
                  height={getScreenResponsiveHeight(30)}
                  width={getScreenResponsiveWidth(30)}
                />
              </TouchableIcon>
            </Row>
          ) : (
            <></>
          )}
        </Row>
        <Spacer height={5} />
        <Typography
          style={{ width: getScreenResponsiveWidth(180) }}
          type="Paragraph1"
          size={22}
          color={Colors.CANDOR_WHITE}
        >
          {showOnly(28, item?.text?.trim())}
        </Typography>
      </Column>
      <Button
        onPress={onPress}
        height={33}
        width={286}
        textStyle={{
          fontSize: getScreenResponsiveHeight(11),
        }}
        style={{
          opacity: 1,
        }}
        disabled={item?.status !== "live"}
        color={
          item?.status !== "live" || showVotes ? "#0069BC" : Colors.CANDOR_BLACK
        }
        textColor={
          item?.status !== "live" || showVotes
            ? Colors.CANDOR_WHITE
            : Colors.CANDOR_WHITE
        }
        title={
          showVotes
            ? `${item?.total_votes} votes`
            : `${status[item?.status]?.text as string}`
        }
      />
    </Column>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.CANDOR_SEA_BLUE,
    width: getScreenResponsiveHeight(30),
    height: getScreenResponsiveHeight(30),
    alignSelf: "flex-end",
    borderRadius: 100,
    borderColor: Colors.CANDOR_WHITE,
    borderWidth: 3,
    zIndex: 1,
    position: "absolute",
    top: -2,
  },
  center: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  card: {
    borderRadius: 27,
    paddingTop: getScreenResponsiveHeight(20),
    paddingBottom: getScreenResponsiveHeight(13),
    paddingHorizontal: getScreenResponsiveWidth(22),
    marginBottom: getScreenResponsiveHeight(20),
  },
});
