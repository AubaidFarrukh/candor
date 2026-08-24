import { ReactElement, useContext, useState } from "react";
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
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_CURRENT_WEEK,
  GET_POLL_WEEKLY_STATS,
  LIST_POLLS,
} from "../../graphQL/queries";
import ShareIcon from "../../assets/svgs/Share-dark.svg";
import Share from "react-native-share";
import { UPVOTE_POLL } from "../../graphQL/mutations";
import { ToastContext } from "../../context";
import dayjs from "dayjs";
import Modal from "react-native-modal";
import CloseIcon from "../../assets/svgs/Close.svg";

export const Public = ({ navigation, submitPoll }: any): ReactElement => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [pollText, setPollText] = useState<string>("");
  const [pollData, setPollData] = useState<any>([]);
  const [weekPollData, setWeeklyPollData] = useState<any>([]);

  const { data: weekData, loading: weekDataLoading } =
    useQuery(GET_CURRENT_WEEK);

  const currentTime = new Date(weekData?.CurrentWeek?.current_time).getTime();
  const expiryTime = new Date(weekData?.CurrentWeek?.expiry_time).getTime();
  const distance = expiryTime - currentTime;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  const { data, loading, refetch } = useQuery(LIST_POLLS, {
    variables: {
      limit: 25,
      page: 0,
      type: "selected",
    },
    onCompleted: (data) => {
      setPollData(data?.ListPolls);
    },
  });

  const { refetch: weeklyStatRefetch, data: weeklyStat } = useQuery(
    GET_POLL_WEEKLY_STATS,
    {
      variables: {
        limit: 25,
        page: 0,
      },
      onCompleted: (data) => {
        setWeeklyPollData(data?.PollsWeeklyStats);
      },
    }
  );
  if (weeklyStat === undefined) {
    weeklyStatRefetch();
  }

  const openModal = (text: string) => {
    if (text) {
      setPollText(text);
      setModalVisible(true);
    }
  };

  if (loading || weekDataLoading) {
    if (data == undefined) {
      refetch();
    }
    return (
      <Column flex={1} justifyContent={"center"} alignItems="center">
        <ActivityIndicator size={"large"} />
        <Typography
          type="Heading1"
          color={Colors.CANDOR_BLACK}
          textAlign="center"
        >
          Loading Polls
        </Typography>
      </Column>
    );
  }

  const resultsDay = dayjs(currentTime).format("dddd") == "Sunday";

  const poll = resultsDay ? weekPollData : pollData;

  const countDown = resultsDay
    ? "Poll Completed - Results"
    : `${days} day(s) ${hours} hours ${minutes} minutes`;

  return (
    <View style={styles.center}>
      {poll?.length < 1 ? (
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
            Public Polls
          </Typography>
          <Spacer height={5} />
          <Typography
            type="Paragraph3"
            color={Colors.CANDOR_BLACK}
            textAlign="center"
            fontFamily={FontType.REGULAR_FREDOKA}
          >
            You have not submitted a poll yet. Submit a poll / premium poll, get
            your friends to upvote it and get big bragging rights.
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
        <Column flex={1} width={"100%"}>
          <Typography
            type="Heading1"
            size={21}
            textAlign="center"
            color={Colors.CANDOR_BLACK}
          >
            {countDown}
          </Typography>
          <Spacer height={27} />
          <FlatList
            data={poll}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            renderItem={({ item, index }: any) => (
              <Pressable
                onPress={() => openModal(item?.text)}
                key={index.toString()}
              >
                <PublicPollItem
                  item={item}
                  refetch={refetch}
                  resultsDay={resultsDay}
                />
              </Pressable>
            )}
          />
        </Column>
      )}
      <Modal
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
        isVisible={isModalVisible}
        style={{ justifyContent: "center", alignItems: "center" }}
        onBackdropPress={() => setModalVisible(false)}
      >
        <Column
          backgroundColor={Colors.CANDOR_BLACK}
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

const PublicPollItem = ({ item, refetch, resultsDay }: any) => {
  const { toast } = useContext<any>(ToastContext);

  const [UpvotePoll, { loading }] = useMutation(UPVOTE_POLL, {
    onCompleted() {
      refetch();
    },
    onError(error) {
      toast({ message: error?.message });
    },
  });
  const handleUpvote = (item: any) => {
    UpvotePoll({
      variables: {
        upVotePollId: item?._id,
      },
    });
  };

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

  return (
    <Column
      height={166}
      backgroundColor={Colors.CANDOR_BLACK}
      style={styles.card}
      justifyContent="space-between"
    >
      <Column>
        <Row justifyContent="space-between">
          <Typography color={Colors.CANDOR_BLUE} type="Paragraph6">
            {item?.is_paid
              ? `Premium poll by\n${
                  item?.brag_name?.trim() || item?.submitted_by?.name?.trim()
                }`
              : `Submitted by\n${
                  item?.brag_name?.trim() || item?.submitted_by?.name?.trim()
                }`}
          </Typography>

          {!resultsDay ? (
            <TouchableIcon onPress={generalShare}>
              <ShareIcon
                height={getScreenResponsiveHeight(30)}
                width={getScreenResponsiveWidth(30)}
              />
            </TouchableIcon>
          ) : (
            <></>
          )}
        </Row>
        <Spacer height={5} />
        <Typography
          style={{ width: getScreenResponsiveWidth(180) }}
          type="Paragraph1"
          size={22}
        >
          {showOnly(28, item?.text?.trim())}
        </Typography>
      </Column>
      <Button
        onPress={() => handleUpvote(item)}
        height={33}
        width={286}
        textStyle={{
          fontSize: getScreenResponsiveHeight(11),
        }}
        loading={loading}
        style={{
          opacity: 1,
        }}
        disabled={item?.isVoted || resultsDay}
        color={
          item?.isVoted || resultsDay
            ? Colors.CANDOR_LIGHT_GRAY
            : Colors.CANDOR_BLACK
        }
        textColor={
          item?.isVoted || resultsDay
            ? Colors.CANDOR_BLACK
            : Colors.CANDOR_BLACK
        }
        title={
          resultsDay
            ? `${item?.total_votes} votes`
            : item?.isVoted
            ? "Upvoted"
            : "Upvote"
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
    borderColor: Colors.CANDOR_BLACK,
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
