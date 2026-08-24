const graphql = require("graphql");
const { GraphQLJSON } = require("graphql-type-json");
const s3ParseUrl = require("s3-url-parser");
const {
  methods,
  ValidateUser,
  SignS3,
  getSaturdayEnd,
} = require("../core/functions");
const env = require("dotenv");
const { ObjectId } = require("mongodb");
env.config({ path: ".env" });

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
} = graphql;

const OutputMsg = new GraphQLObjectType({
  name: "OutputMsg",
  description:
    "This holds all properties / fields related to OutputMsg Object.",
  fields: () => ({
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    json: { type: GraphQLJSON },
  }),
});

const Message = new GraphQLObjectType({
  name: "Message",
  description: "Message is the message that is sent between users.",
  fields: () => ({
    message: { type: GraphQLString },
    created_at: { type: GraphQLString },
    receiver_id: { type: GraphQLString },
    sender_id: { type: GraphQLString },
    msg_token: { type: GraphQLString },
    is_paid: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        const isPaid = await methods.countDocuments("dm_threads_paid", {
          $or: [
            {
              user_id: parent.sender_id,
              anonymous_user_id: parent.receiver_id,
            },
            {
              user_id: parent.receiver_id,
              anonymous_user_id: parent.sender_id,
            },
          ],
          msg_token: args.msg_token,
        });
        return isPaid > 0 ? true : false;
      },
    },
  }),
});

const GroupChat = new GraphQLObjectType({
  name: "GroupChatCard",
  description: "This holds all properties / fields related to GroupChat",
  fields: () => ({
    _id: { type: GraphQLString },
    group_name: { type: GraphQLString },
    group_token: { type: GraphQLString },
    unread_messages: {
      type: GraphQLInt,
    },
    responses: {
      type: GraphQLInt,
      resolve(parent) {
        return methods.countDocuments("group_messages", {
          group_token: parent.group_token,
        });
      },
    },
    creator: {
      type: User,
      resolve: (user) => {
        return methods.FindSingleRecord("users", "_id", user.user_id);
      },
    },
    created_at: { type: GraphQLString },
  }),
});

const GroupMessage = new GraphQLObjectType({
  name: "GroupMessage",
  description: "This holds all properties / fields related to Group Message.",
  fields: (parent, args, context) => ({
    _id: { type: GraphQLString },
    group_token: { type: GraphQLString },
    sender: {
      type: GroupMember,
      resolve: (parent, args, context) => {
        return methods.FindRecordByMultipleFields("group_members", {
          group_token: parent.group_token,
          user: parent.sender_id,
        });
      },
    },
    message: { type: GraphQLString },
    created_at: { type: GraphQLString },
    taggedMessage: {
      type: GroupMessage,
      resolve: (parent, args, context) => {
        return methods.FindSingleRecord(
          "group_messages",
          "_id",
          parent.tagged_message_id
        );
      },
    },
  }),
});
const GroupMember = new GraphQLObjectType({
  name: "GroupMember",
  description: "This holds all properties / fields related to Group Member.",
  fields: (parent, args, context) => ({
    _id: { type: GraphQLString },
    group_token: { type: GraphQLString },
    user: { type: GraphQLString },
    emoji: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});
const REV_SHARE_PAYMENT_REQUESTS = new GraphQLObjectType({
  name: "REV_SHARE_PAYMENT_REQUESTS",
  description:
    "This holds all properties / fields related to REV_SHARE_PAYMENT_REQUESTS Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    user_id: { type: GraphQLString },
    user: {
      type:User,
      resolve: async (parent, args, context) => {
        const user = await methods.FindSingleRecord(
          "users",
          "_id",
          ObjectId(parent.user_id)
        );
        return user;
      },
    },
    amount: { type: GraphQLFloat },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  }),
});

const User = new GraphQLObjectType({
  name: "User",
  description:
    "This holds all properties / fields related schema for User Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    auth_token: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    birthday: { type: GraphQLString },
    username: { type: GraphQLString },
    referral: { type: GraphQLString },
    total_earnings: {
      type: GraphQLFloat,
      resolve: async (parent, args, context) => {
        const userEarnings = await methods.FindMultipleRecord(
          "user_earnings",
          "user_id",
          ObjectId(parent._id)
        );
        let totalEarnings = 0;
        if (userEarnings) {
          userEarnings.forEach((earning) => {
            totalEarnings += earning.amount;
          });
        }
        return Math.round(totalEarnings * 100) / 100;
      },
    },
    pending_earnings: {
      type: GraphQLFloat,
      resolve: async (parent, args, context) => {
        const userEarnings = await methods.FindMultipleRecord(
          "user_earnings",
          "user_id",
          ObjectId(parent._id)
        );
        let totalEarnings = 0;
        if (userEarnings) {
          userEarnings.forEach((earning) => {
            if (earning.status === "payout_pending") {
              totalEarnings += earning.amount;
            }
          });
        }
        return Math.round(totalEarnings * 100) / 100;
      },
    },
    referralCount: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return methods.countDocuments("users", { referral: parent.username });
      },
    },
    is_blank_text_card_enabled: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.mark_blank_text_card_feature_as_paid
          ? parent.mark_blank_text_card_feature_as_paid
          : false;
      },
    },
    is_blank_audio_card_enabled: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.mark_blank_audio_card_feature_as_paid
          ? parent.mark_blank_audio_card_feature_as_paid
          : false;
      },
    },
    is_premium: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.is_premium ? parent.is_premium : false;
      },
    },
    was_premium: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.was_premium ? parent.was_premium : false;
      },
    },
    is_trial: { type: GraphQLBoolean },
    is_donated: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.is_donated ? parent.is_donated : false;
      },
    },
    was_donated: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.was_donated ? parent.was_donated : false;
      },
    },
    status: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        return parent.status ? parent.status : "active";
      },
    },
    total_poll_count: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return methods.countDocuments("polls", {
          submitted_by: ObjectId(parent._id),
        });
      },
    },
    poll_count_live: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return methods.countDocuments("polls", {
          submitted_by: ObjectId(parent._id),
          status: { $in: ["live", "inactive"] },
        });
      },
    },
    total_card_count: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return methods.countDocuments("cards", {
          user_id: ObjectId(parent._id),
        });
      },
    },
    card_count_live: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return methods.countDocuments("cards", {
          user_id: ObjectId(parent._id),
          status: { $in: ["live", "inactive"] },
        });
      },
    },
    weeks_card_submitted: {
      type: new GraphQLList(GraphQLString),
      resolve: async (parent, args, context) => {
        const cards = await methods.FindMultipleRecord(
          "cards",
          "user_id",
          ObjectId(parent._id)
        );
        let weeks = [];
        cards.forEach((card) => {
          weeks.push(card.week_id);
        });
        // remove duplicates
        weeks = weeks.filter((item, index) => weeks.indexOf(item) === index);
        return methods
          .FindMultipleRecord("weeks", "_id", weeks)
          .then((weeks) => {
            // return list of week names
            let week_names = [];
            weeks.forEach((week) => {
              week_names.push(week.name);
            });
            return week_names;
          });
      },
    },
    weeks_poll_submitted: {
      type: new GraphQLList(GraphQLString),
      resolve: async (parent, args, context) => {
        const polls = await methods.FindMultipleRecord(
          "polls",
          "submitted_by",
          ObjectId(parent._id)
        );
        let weeks = [];
        polls.forEach((poll) => {
          weeks.push(poll.week_id);
        });
        // remove duplicates
        weeks = weeks.filter((item, index) => weeks.indexOf(item) === index);
        return methods
          .FindMultipleRecord("weeks", "_id", weeks)
          .then((weeks) => {
            // return list of week names
            let week_names = [];
            weeks.forEach((week) => {
              week_names.push(week.name);
            });
            return week_names;
          });
      },
    },
    is_snap_logged_in: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.snapchat_name ? true : false;
      },
    },
    snapchat_name: { type: GraphQLString },
    snapchat_bitmoji: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        if (
          parent?.snapchat_bitmoji &&
          parent?.snapchat_bitmoji.includes("bsocial-assets.s3-accelerate")
        ) {
          const { bucket, region, key } = s3ParseUrl(parent.snapchat_bitmoji);
          return SignS3("getObject", bucket, key, 60 * 60 * 24);
        }
        return parent.snapchat_bitmoji;
      },
    },
  }),
});

const USER_EARNINGS = new GraphQLObjectType({
  name: "USER_EARNINGS",
  description:
    "This holds all properties / fields related schema for User Earnings Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    user: {
      type: User,
      resolve: async (parent, args, context) => {
        return methods.FindOneRecord("users", "_id", ObjectId(parent.user_id));
      },
    },
    amount: { type: GraphQLFloat },
    type: { type: GraphQLString },
    created_at: { type: GraphQLString },
    status: { type: GraphQLString },
  }),
});

const S3Upload = new GraphQLObjectType({
  name: "S3Upload",
  description:
    "This holds all properties / fields related schema for S3 Upload Object.",
  fields: () => ({
    urls: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "S3Urls",
          fields: () => ({
            file: { type: GraphQLString },
            key: { type: GraphQLString },
            put: { type: GraphQLString },
            get: { type: GraphQLString },
            delete: { type: GraphQLString },
          }),
        })
      ),
    },
  }),
});

const Card = new GraphQLObjectType({
  name: "Card",
  description:
    "This holds all properties / fields related schema for Game Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    background_color: { type: GraphQLString },
    gradient_background_color: { type: GraphQLString },
    category: { type: GraphQLString },
    response_type: { type: GraphQLString },
    isPurchased: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        const isAuth = await ValidateUser(context);
        if (!parent.is_premium) {
          return true;
        }
        const is_card_purchased = await methods.countDocuments(
          "purchased_cards",
          {
            card_id: parent._id,
            user_id: ObjectId(isAuth.user_id),
          }
        );
        return is_card_purchased > 0 ? true : false;
      },
    },
    background_image: {
      type: GraphQLString,
    },
    sticker_image: {
      type: GraphQLString,
      resolve: (parent) => {
        if (!parent.sticker_image) {
          return null;
        }
        const { bucket, region, key } = s3ParseUrl(parent.sticker_image);
        return SignS3("getObject", bucket, key, 60 * 60 * 24);
      },
    },
    text_color: { type: GraphQLString },
    new_text_color: { type: GraphQLString },
    caption_text: { type: GraphQLString },
    total_messages_count: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        return parent.total_messages_count || 0;
      },
    },
    caption_image: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    is_premium: { type: GraphQLBoolean },
    linked_poll: {
      type: Poll,
      resolve: async (parent, args, context) => {
        const poll = await methods.FindSingleRecord(
          "polls",
          "_id",
          ObjectId(parent.linked_poll_id)
        );
        return poll;
      },
    },
    week_title: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        const week = await methods.FindSingleRecord(
          "weeks",
          "_id",
          ObjectId(parent.week_id)
        );
        return week.name;
      },
    },
    is_activated: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        if (parent.status == "live") {
          return true;
        } else {
          return false;
        }
      },
    },
    creator: {
      type: User,
      resolve: async (parent, args, context) => {
        const user = await methods.FindSingleRecord(
          "users",
          "_id",
          ObjectId(parent.user_id)
        );
        return user;
      },
    },
    status: { type: GraphQLString },
    status_reason: { type: GraphQLString },
  }),
});

const Inbox = new GraphQLObjectType({
  name: "Inbox",
  description:
    "This holds all properties / fields related schema for Inbox Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    question: { type: GraphQLString },
    answer_text: { type: GraphQLString },
    answer_audio: {
      type: GraphQLString,
      resolve: (parent) => {
        if (!parent.answer_audio) {
          return null;
        }
        if (parent.answer_audio.includes("res.cloudinary.com")) {
          return parent.answer_audio;
        }
        const { bucket, region, key } = s3ParseUrl(parent.answer_audio);
        return SignS3("getObject", bucket, key, 60 * 60 * 24);
      },
    },
    additional_audio: {
      type: GraphQLString,
      resolve: (parent) => {
        if (!parent.additional_audio) {
          return null;
        }
        if (parent.additional_audio.includes("res.cloudinary.com")) {
          return parent.additional_audio;
        }
        const { bucket, region, key } = s3ParseUrl(parent.additional_audio);
        return SignS3("getObject", bucket, key, 60 * 60 * 24);
      },
    },
    answer_picture: {
      type: GraphQLString,
      resolve: (parent) => {
        if (!parent.answer_picture) {
          return null;
        }
        const { bucket, region, key } = s3ParseUrl(parent.answer_picture || "");
        return SignS3("getObject", bucket, key, 60 * 60 * 24);
      },
    },
    profile_link: { type: GraphQLString },
    temporary_sender_user_id: { type: GraphQLString },
    ip_address: { type: GraphQLString },
    browser_name: { type: GraphQLString },
    network_provider: { type: GraphQLString },
    country_name: { type: GraphQLString },
    approx_location: { type: GraphQLString },
    card: {
      type: Card,
      resolve: async (parent, args, context) => {
        const card = await methods.FindSingleRecord(
          "cards",
          "_id",
          ObjectId(parent.card_id)
        );
        return card;
      },
    },
    is_read: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.is_read == 1 ? true : false;
      },
    },
    isPaid: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        const isAuth = await ValidateUser(context);
        const doc = await methods.countDocuments("messages_paid", {
          message_id: parent._id,
          user_id: ObjectId(isAuth.user_id),
        });
        return doc > 0 ? true : false;
      },
    },
    is_replied: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.is_replied == 1 ? true : false;
      },
    },
    hints: { type: GraphQLString },
  }),
});

const Poll = new GraphQLObjectType({
  name: "Poll",
  description:
    "This holds all properties / fields related schema for Poll Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    text: { type: GraphQLString },
    submitted_by: {
      type: User,
      resolve: async (parent, args, context) => {
        const user = await methods.FindSingleRecord(
          "users",
          "_id",
          ObjectId(parent.submitted_by)
        );
        return user;
      },
    },
    brag_name: { type: GraphQLString },
    is_paid: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        return parent.is_premium;
      },
    },
    week_title: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        const week = await methods.FindSingleRecord(
          "weeks",
          "_id",
          ObjectId(parent.week_id)
        );
        return week?.name;
      },
    },
    week: {
      type: Week,
      resolve: async (parent, args, context) => {
        const week = await methods.FindSingleRecord(
          "weeks",
          "_id",
          ObjectId(parent.week_id)
        );
        return week;
      },
    },
    is_selected: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        if (parent.status == "live") {
          return true;
        } else {
          return false;
        }
      },
    },
    status: { type: GraphQLString },
    inactive_reason: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        return parent.inactive_reason || "Retired";
      },
    },
    total_votes: {
      type: GraphQLInt,
      resolve: async (parent, args, context) => {
        const votes = await methods.countDocuments("poll_votes", {
          poll_id: ObjectId(parent._id),
        });
        methods.UpdateRecord(
          "polls",
          { _id: ObjectId(parent._id) },
          { total_votes: votes }
        );
        return votes;
      },
    },
    isVoted: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        const user = await ValidateUser(context);
        const isVoted = await methods
          .countDocuments("poll_votes", {
            poll_id: ObjectId(parent._id),
            user_id: ObjectId(user.user_id),
          })
          .then((res) => {
            return res > 0 ? true : false;
          });
        return isVoted;
      },
    },
    isCardLive: {
      type: GraphQLBoolean,
      resolve: async (parent, args, context) => {
        const card = await methods.FindSingleRecord(
          "cards",
          "linked_poll_id",
          ObjectId(parent._id)
        );
        if (card?.status == "live") {
          return true;
        } else {
          return false;
        }
      },
    },
    Card: {
      type: Card,
      resolve: async (parent, args, context) => {
        const card = await methods.FindSingleRecord(
          "cards",
          "linked_poll_id",
          ObjectId(parent._id)
        );
        return card;
      },
    },
  }),
});

const PhoneContact = new GraphQLObjectType({
  name: "PhoneContact",
  description:
    "PhoneContactSingle are the single phone numbers that are uploaded by users via phone.",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    userInfo: {
      type: User,
      resolve: (user) => {
        const data = methods.FindSingleRecord(
          "users",
          "phone",
          user.phone,
          true
        );
        user.name = data.name;
        return data;
      },
    },
    uploadedBy: {
      type: User,
      resolve: (user) => {
        return methods.FindSingleRecord("users", "_id", user.uploadedBy);
      },
    },
  }),
});

const PhoneContactList = new GraphQLObjectType({
  name: "PhoneContactList",
  description:
    "PhoneContacts are uploaded by users via phone, this holds all propertier related to that phone number.",
  fields: () => ({
    contacts: {
      type: new GraphQLList(PhoneContact),
      resolve: (phoneContact) => {
        if (phoneContact[0] != undefined) {
          return methods.ListRecords(
            "phoneContacts",
            { uploadedBy: phoneContact[0].uploadedBy },
            2000
          );
        } else {
          return [];
        }
      },
    },
    uploader: {
      type: User,
      resolve: (user) => {
        return methods.FindSingleRecord("users", "_id", user[0].uploadedBy);
      },
    },
  }),
});

const PaymentTransactions = new GraphQLObjectType({
  name: "PaymentTransactions",
  description:
    "This holds all properties / fields related schema for PaymentTransactions Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    user: {
      type: User,
      resolve: async (parent, args, context) => {
        const user = await methods.FindSingleRecord(
          "users",
          "_id",
          ObjectId(parent.user_id)
        );
        return user;
      },
    },
    transactionId: { type: GraphQLString },
    productId: { type: GraphQLString },
    purchaseDate: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

const Week = new GraphQLObjectType({
  name: "Week",
  description:
    "This holds all properties / fields related schema for weeks Object.",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    current_time: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        const currentTime = new Date().toISOString();
        return currentTime;
      },
    },
    expiry_time: {
      type: GraphQLString,
      resolve: async (parent, args, context) => {
        const expiryTime = getSaturdayEnd(parent.unix_time);
        return new Date(expiryTime).toISOString();
      },
    },
    polls: {
      type: new GraphQLList(Poll),
      args: {
        limit: { type: GraphQLInt },
        page: { type: GraphQLInt },
      },
      resolve: async (parent, args, context) => {
        return await methods.ListRecords(
          "polls",
          { week_id: ObjectId(parent._id) },
          args.limit,
          args.page,
          { total_votes: -1 }
        );
      },
    },
  }),
});

module.exports = {
  OutputMsg,
  User,
  Card,
  Inbox,
  Poll,
  PhoneContact,
  PhoneContactList,
  S3Upload,
  Week,
  REV_SHARE_PAYMENT_REQUESTS,
  PaymentTransactions,
  Message,
  USER_EARNINGS,
  GroupChat,
  GroupMessage,
  GroupMember,
};
