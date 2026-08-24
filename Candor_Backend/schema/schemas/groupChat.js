const graphql = require("graphql");
const {
  methods,
  GenerateRandomString,
  ValidateUser,
  sendNotification,
} = require("../../core/functions");
const { ObjectId } = require("mongodb");
const env = require("dotenv");
env.config({ path: ".env" });
const { GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt } = graphql;
const { OutputMsg, GroupChat, GroupMessage } = require("../types");
const { emojis, adjectives } = require("../../emojis");

const queries = {
  GetUserGroups: {
    type: new GraphQLList(GroupChat),
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const auth = await ValidateUser(context);
      const user_id = ObjectId(auth.user_id);
      const cards = await methods.ListRecords(
        "groups",
        {
          user_id: new ObjectId(user_id),
          status: "active",
        },
        args.limit,
        args.page
      );
      return cards;
    },
  },
  GetGroup: {
    type: GroupChat,
    args: {
      group_token: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const card = await methods.FindRecordByMultipleFields("groups", {
        group_token: args.group_token,
        status: { $ne: "deleted" },
      });
      if (!card) {
        throw new Error("Card not found");
      }
      return card;
    },
  },
  GetGroupMessages: {
    type: new GraphQLList(GroupMessage),
    args: {
      group_token: { type: new GraphQLNonNull(GraphQLString) },
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const card = await methods.FindRecordByMultipleFields("groups", {
        group_token: args.group_token,
        status: { $ne: "deleted" },
      });
      const isAuth = await ValidateUser(context).catch((err) => {
        return null;
      });
      if (!card) {
        throw new Error("Invalid Token");
      }
      const messages = await methods.ListRecords(
        "group_messages",
        {
          group_token: args.group_token,
        },
        args.limit,
        args.page
      );

      if (card && isAuth) {
        await methods.UpdateRecord(
          "groups",
          { group_token: args.group_token },
          {
            unread_messages: 0,
          }
        );
      }
      return messages;
    },
  },
  TotalUnreadGroupMessagesCount: {
    type: GraphQLInt,
    description: "Total Unread DM Message Count",
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      return methods.countDocuments("groups", {
        unread_messages: { $ne: 0 },
        user_id: user_id,
      });
    },
  },
};
const mutations = {
  CreateGroupChatCard: {
    type: GroupChat,
    args: {
      group_name: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const auth = await ValidateUser(context);
      const user_id = auth.user_id;
      const group = await methods.InsertRecord("groups", {
        user_id: ObjectId(user_id),
        group_name: args.group_name,
        created_at: new Date(),
        group_token: GenerateRandomString(20),
        unread_messages: 0,
        status: "inactive",
        members: 1,
      });
      console.log(group);
      const random = Math.floor(Math.random() * adjectives.length);
      const member = await methods.InsertRecord("group_members", {
        user: ObjectId(user_id),
        group_token: group.group_token,
        created_at: new Date(),
        name: adjectives[random] + " " + emojis[0].name,
        emoji: emojis[0].emoji,
      });
      console.log(member);
      return group;
    },
  },
  DeleteGroupChatCard: {
    type: OutputMsg,
    args: {
      group_token: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const auth = await ValidateUser(context);
      const user_id = auth.user_id;
      const group_chat_card = await methods.FindRecordByMultipleFields(
        "groups",
        {
          group_token: args.group_token,
          user_id: ObjectId(user_id),
        }
      );
      if (!group_chat_card) {
        throw new Error("Invalid group_token");
      }

      await methods.UpdateRecord(
        "groups",
        {
          group_token: args.group_token,
        },
        {
          status: "deleted",
        }
      );
      return {
        status: "success",
        message: "Deleted Group successfully",
      };
    },
  },
  SendGroupMessage: {
    type: OutputMsg,
    args: {
      group_token: { type: new GraphQLNonNull(GraphQLString) },
      message: { type: new GraphQLNonNull(GraphQLString) },
      tagged_message_id: { type: GraphQLString },
      anonymous_user_id: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context).catch((err) => {
        return null;
      });
      const sender_id = isAuth
        ? ObjectId(isAuth.user_id)
        : args.anonymous_user_id;

      if (!sender_id) {
        throw new Error("Invalid user");
      }
      const group_chat_card = await methods.FindRecordByMultipleFields(
        "groups",
        {
          group_token: args.group_token,
          status: { $ne: "deleted" },
        }
      );
      if (!group_chat_card) {
        throw new Error("Invalid group_token");
      }
      const group_member = await methods.FindRecordByMultipleFields(
        "group_members",
        {
          group_token: args.group_token,
          user: sender_id,
        }
      );
      const random = Math.floor(Math.random() * adjectives.length);
      if (!group_member) {
        await methods.InsertRecord("group_members", {
          user: sender_id,
          group_token: group_chat_card.group_token,
          created_at: new Date(),
          name: adjectives[random] + " " + emojis[group_chat_card.members].name,
          emoji: emojis[group_chat_card.members].emoji,
        });
      }
      if (!group_chat_card) {
        throw new Error("Invalid group_token");
      }

      await methods.UpdateRecord(
        "groups",
        {
          group_token: args.group_token,
        },
        {
          unread_messages: group_chat_card.unread_messages + 1,
          members: group_member
            ? group_chat_card.members
            : group_chat_card.members + 1,
          status: "active",
        }
      );

      const msg_data = {
        sender_id: sender_id,
        group_token: args.group_token,
        tagged_message_id: args.tagged_message_id,
        message: args.message,
        created_at: new Date(),
      };
      const message = await methods.InsertRecord("group_messages", msg_data);

      await sendNotification(
        ObjectId(group_chat_card.user_id),
        "💬 New message!",
        "You have a new anonymous message, Check it out now.",
        "group_chat",
        message._id,
        {
          type: "group_chat",
        },
        ""
      );
      return {
        status: "success",
        message: "Message sent",
      };
    },
  },
};

module.exports = {
  queries,
  mutations,
};
