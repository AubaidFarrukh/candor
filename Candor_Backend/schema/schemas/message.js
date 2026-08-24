const graphql = require("graphql");
const {
  methods,
  GenerateRandomString,
  ValidateUser,
  pubsub,
  sendNotification,
} = require("../../core/functions");
const { ObjectId } = require("mongodb");
const { withFilter } = require("graphql-subscriptions");
const appleReceiptVerify = require("node-apple-receipt-verify");
const bcrypt = require("bcryptjs");
const env = require("dotenv");
env.config({ path: ".env" });

appleReceiptVerify.config({
  environment: [process.env.APPLE_RECEIPT_ENV],
  secret: process.env.APPLE_RECEIPT_SECRET,
});

const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLError,
  GraphQLList,
  GraphQLInt,
} = graphql;

const { OutputMsg, Inbox, Message } = require("../types");
const { default: GraphQLJSON } = require("graphql-type-json");

const queries = {
  Message: {
    type: Inbox,
    description: "Get Message",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }
      return message;
    },
  },
  ListMessages: {
    // grou by temporary_user_id
    type: new GraphQLList(Inbox),
    description: "List Messages",
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      return methods.ListRecords(
        "messages",
        { user_id },
        args.limit,
        args.page
      );
    },
  },
  UnreadMessageCount: {
    type: GraphQLInt,
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      return methods.countDocuments("messages", {
        user_id: ObjectId(user_id),
        is_read: false,
      });
    },
  },
  ListDMLinks: {
    type: OutputMsg,
    description: "List DM Card Links Paid by Users",
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const records = methods.ListRecords(
        "dm_links",
        {
          user_id: user_id,
        },
        args.limit,
        args.page
      );
      return {
        status: "success",
        json: records,
        message: "List DM Card Links Paid by Users",
      };
    },
  },
  ListDMChatThreads: {
    type: GraphQLJSON,
    description: "List DM Chat Threads",
    args: {
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      let threads = await methods.ListRecords(
        "dm_threads",
        {
          $or: [{ sender_id: user_id }, { receiver_id: user_id }],
        },
        args.limit,
        args.page,
        { last_message_time: -1 }
      );
      // also append unseen_count  to each thread
      const modified_threads = [];
      for (let i = 0; i < threads.length; i++) {
        const thread = threads[i];
        const unseen_count = await methods.countDocuments("dm_messages", {
          $and: [
            { msg_token: thread.msg_token },
            { receiver_id: user_id },
            { sender_id: thread.sender_id },
          ],
          seen: false,
        });
        threads[i].unseen_count = unseen_count;
        threads[i].is_paid = await methods
          .countDocuments("dm_threads_paid", {
            $or: [
              {
                user_id: user_id,
              },
              {
                anonymous_user_id: user_id,
              },
            ],
            msg_token: thread.msg_token,
          })
          .then((count) => {
            if (count > 0) {
              return true;
            } else {
              return false;
            }
          });
        modified_threads.push(threads[i]);
      }
      return modified_threads;
    },
  },
  ListMessagesFromDMThread: {
    type: new GraphQLList(Message),
    description: "List Message From DM Thread",
    args: {
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const anonymous_user_id = args.anonymous_user_id;
      return methods.ListRecords(
        "dm_messages",
        {
          $or: [
            { sender_id: user_id, receiver_id: anonymous_user_id },
            { sender_id: anonymous_user_id, receiver_id: user_id },
          ],
          msg_token: args.msg_token,
        },
        args.limit,
        args.page,
        { created_at: -1 }
      );
    },
  },
  ListMessagesFromDMThreadForAnyonymousUser: {
    type: new GraphQLList(Message),
    description: "List Message From DM Thread",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
    },
    resolve: async (parent, args, context) => {
      const msg_token = args.msg_token;
      const user_id = ObjectId(args.user_id);
      return methods.ListRecords(
        "dm_messages",
        {
          $or: [
            { receiver_id: args.anonymous_user_id, msg_token: msg_token },
            { sender_id: args.anonymous_user_id, msg_token: msg_token },
          ],
        },
        args.limit,
        args.page,
        { created_at: -1 }
      );
    },
  },
  TotalUnreadDMMessagesCount: {
    type: GraphQLInt,
    description: "Total Unread DM Message Count",
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      return methods.countDocuments("dm_messages", {
        receiver_id: user_id,
        seen: false,
      });
    },
  },
};

const mutations = {
  MarkMessageAsRead: {
    type: OutputMsg,
    description: "Mark Message as Read",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }
      if (message.user_id.toString() !== user_id.toString()) {
        throw new GraphQLError(
          "You are not allowed to mark this message as read"
        );
      }
      await methods.UpdateRecord(
        "messages",
        { _id: ObjectId(args.id) },
        { is_read: true }
      );
      return {
        message: "Message marked as read",
        status: true,
      };
    },
  },
  MarkMessageAsReplied: {
    type: OutputMsg,
    description: "Mark Message as Replied",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }
      if (message.user_id.toString() !== user_id.toString()) {
        throw new GraphQLError(
          "You are not allowed to mark this message as replied"
        );
      }
      await methods.UpdateRecord(
        "messages",
        { _id: ObjectId(args.id) },
        { is_replied: true }
      );
      return {
        message: "Message marked as replied",
        status: true,
      };
    },
  },
  DeleteMessage: {
    type: OutputMsg,
    description: "Delete Message",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user_info = await methods.FindSingleRecord(
        "users",
        "_id",
        user_id,
        true
      );
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }
      // if user is owner of message or if user is admin
      if (
        message.user_id.toString() !== user_id.toString() &&
        user_info.is_admin !== true
      ) {
        throw new GraphQLError("You are not allowed to delete this message");
      }
      await methods.DeleteRecord("messages", { _id: ObjectId(args.id) });
      return {
        message: "Message deleted",
        status: true,
      };
    },
  },
  SendMessage: {
    type: OutputMsg,
    description: "Send Message",
    args: {
      card_id: { type: new GraphQLNonNull(GraphQLString) },
      username: { type: new GraphQLNonNull(GraphQLString) },
      question: { type: new GraphQLNonNull(GraphQLString) },
      answer_text: { type: GraphQLString },
      answer_audio: { type: GraphQLString },
      additional_audio: { type: GraphQLString },
      answer_picture: { type: GraphQLString },
      temporary_sender_user_id: { type: new GraphQLNonNull(GraphQLString) },
      ip_address: { type: new GraphQLNonNull(GraphQLString) },
      network_provider: { type: new GraphQLNonNull(GraphQLString) },
      browser_name: { type: new GraphQLNonNull(GraphQLString) },
      country_name: { type: new GraphQLNonNull(GraphQLString) },
      approx_location: { type: new GraphQLNonNull(GraphQLString) },
      hints: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const user_id = await methods.FindSingleRecord(
        "users",
        "username",
        args.username,
        true
      );
      if (!user_id) {
        throw new GraphQLError("User not found");
      }
      const isBlocked = await methods.FindRecordByMultipleFields(
        "users_blocked",
        {
          temporary_sender_user_id: args.temporary_sender_user_id,
          user_id: ObjectId(user_id._id),
        }
      );
      if (isBlocked) {
        return {
          message: "You are blocked from sending messages to this user",
          status: false,
        };
      }
      const message = await methods
        .InsertRecord("messages", {
          user_id: ObjectId(user_id._id),
          question: args.question,
          answer_text: args.answer_text,
          answer_audio: args.answer_audio,
          additional_audio: args.additional_audio,
          answer_picture: args.answer_picture,
          temporary_sender_user_id: args.temporary_sender_user_id,
          ip_address: args.ip_address,
          network_provider: args.network_provider,
          browser_name: args.browser_name,
          country_name: args.country_name,
          approx_location: args.approx_location,
          hints: args.hints,
          is_read: false,
          card_id: ObjectId(args.card_id),
        })
        .then(async (message) => {
          methods.IncrementRecord(
            "cards",
            { _id: ObjectId(args.card_id) },
            "total_messages_count",
            1
          );
          sendNotification(
            ObjectId(user_id._id),
            "💬 New message!",
            "You have a new anonymous message, Check it out now.",
            "message",
            message._id,
            {
              type: "message",
            },
            ""
          );
        });
      return {
        message: "Message sent successfully",
        status: true,
      };
    },
  },
  MarkMessageAsPaid: {
    type: Inbox,
    description: "Mark Message as Paid",
    args: {
      message_id: { type: new GraphQLNonNull(GraphQLString) },
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.message_id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }

      const isPaid = await methods.countDocuments("messages_paid", {
        message_id: ObjectId(args.message_id),
        user_id: ObjectId(user_id),
      });
      if (isPaid > 0) {
        throw new GraphQLError("Message already paid");
      }

      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: user_id,
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "mark_message_as_paid",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        if (!response) {
          throw new GraphQLError("Invalid receipt");
        }
        // let's iterate into each receipt from the response and look for the possible value cdpc_199 in productId and filter those and then from that list we will again extract only that record which has purchaseDate nearest to the current date
        const filteredReceipts = response.filter((receipt) => {
          return receipt.productId === "cdrh_199";
        });

        if (filteredReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }

        const sortedReceipts = filteredReceipts.sort((a, b) => {
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        });
        if (sortedReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }
        const transactionId = sortedReceipts[0].transactionId;
        let transactionSearch = await methods.countDocuments("messages_paid", {
          "subscription_payload.transactionId": transactionId,
        });

        if (transactionSearch > 0) {
          return methods.FindSingleRecord(
            "messages",
            "_id",
            ObjectId(args.message_id),
            true
          );
        }

        return methods
          .InsertRecord("messages_paid", {
            message_id: ObjectId(args.message_id),
            user_id: ObjectId(isAuth.user_id),
            purchased_at: response[0].purchaseDate,
            subscription_payload: sortedReceipts[0],
          })
          .then(async (data) => {
            methods.InsertRecord("payment_transactions", {
              user_id: ObjectId(isAuth.user_id),
              transactionId: sortedReceipts[0].transactionId,
              productId: sortedReceipts[0].productId,
              purchaseDate: sortedReceipts[0].purchaseDate,
              created_at: new Date(),
            });
            return methods.FindSingleRecord(
              "messages",
              "_id",
              ObjectId(args.message_id),
              true
            );
          });
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  MarkMessageAsPaidAndroid: {
    type: Inbox,
    description: "Mark Message as Paid",
    args: {
      message_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.FindSingleRecord(
        "messages",
        "_id",
        ObjectId(args.message_id),
        true
      );
      if (!message) {
        throw new GraphQLError("Message not found");
      }

      const isPaid = await methods.countDocuments("messages_paid", {
        message_id: ObjectId(args.message_id),
        user_id: ObjectId(user_id),
      });
      if (isPaid > 0) {
        throw new GraphQLError("Message already paid");
      }
      return methods
        .InsertRecord("messages_paid", {
          message_id: ObjectId(args.message_id),
          user_id: ObjectId(isAuth.user_id),
          purchased_at: new Date(),
          subscription_payload: {},
        })
        .then(async (data) => {
          return methods.FindSingleRecord(
            "messages",
            "_id",
            ObjectId(args.message_id),
            true
          );
        });
    },
  },
  MarkDMChatsAsPaid: {
    type: Message,
    description: "Mark Message as Paid",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const sender_id = ObjectId(isAuth.user_id);
      const receiver_id = args.anonymous_user_id;
      const dm_threads = await methods.FindRecordByMultipleFields(
        "dm_threads",
        {
          $or: [
            {
              sender_id: sender_id,
              receiver_id: receiver_id,
            },
            {
              sender_id: receiver_id,
              receiver_id: sender_id,
            },
          ],
          msg_token: args.msg_token,
        }
      );
      if (dm_threads.length === 0) {
        throw new GraphQLError("Chat thread not found");
      }

      const isPaid = await methods.countDocuments("dm_threads_paid", {
        msg_token: args.msg_token,
        user_id: ObjectId(user_id),
        anonymous_user_id: args.anonymous_user_id,
      });

      if (isPaid > 0) {
        throw new GraphQLError("Chat thread already paid");
      }

      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: user_id,
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "mark_dm_chats_as_paid",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        if (!response) {
          throw new GraphQLError("Invalid receipt");
        }
        // let's iterate into each receipt from the response and look for the possible value cdpc_199 in productId and filter those and then from that list we will again extract only that record which has purchaseDate nearest to the current date
        const filteredReceipts = response.filter((receipt) => {
          return receipt.productId === "cdrh_199";
        });

        if (filteredReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }

        const sortedReceipts = filteredReceipts.sort((a, b) => {
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        });
        if (sortedReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }
        const transactionId = sortedReceipts[0].transactionId;
        let transactionSearch = await methods.countDocuments(
          "chat_threads_paid",
          {
            "subscription_payload.transactionId": transactionId,
          }
        );

        if (transactionSearch > 0) {
          return methods.FindRecordByMultipleFields("dm_threads", {
            $or: [
              {
                sender_id: sender_id,
                receiver_id: receiver_id,
              },
              {
                sender_id: receiver_id,
                receiver_id: sender_id,
              },
            ],
            msg_token: args.msg_token,
          });
        }

        return methods
          .InsertRecord("dm_threads_paid", {
            msg_token: args.msg_token,
            user_id: ObjectId(isAuth.user_id),
            anonymous_user_id: args.anonymous_user_id,
            purchased_at: response[0].purchaseDate,
            subscription_payload: sortedReceipts[0],
          })
          .then(async (data) => {
            methods.InsertRecord("payment_transactions", {
              user_id: ObjectId(isAuth.user_id),
              transactionId: sortedReceipts[0].transactionId,
              productId: sortedReceipts[0].productId,
              purchaseDate: sortedReceipts[0].purchaseDate,
              created_at: new Date(),
            });
            return dm_threads[0];
          });
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  BlockSender: {
    type: OutputMsg,
    description: "Block Sender",
    args: {
      temporary_sender_user_id: { type: new GraphQLNonNull(GraphQLString) },
      reason: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const message = await methods.InsertRecord("users_blocked", {
        user_id: user_id,
        temporary_sender_user_id: args.temporary_sender_user_id,
        reason: args.reason,
      });
      return {
        message: "Sender blocked successfully",
        status: true,
      };
    },
  },
  CreateLinkForDMPaidByUsers: {
    type: OutputMsg,
    description: "Create Link For DM Card Paid By Users",
    args: {
      amount: { type: new GraphQLNonNull(GraphQLFloat) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const msg_token = GenerateRandomString(20);
      await methods.InsertRecord("dm_links", {
        user_id: user_id,
        amount: args.amount,
        msg_token: msg_token,
        created_at: new Date(),
        type: "paid_by_users",
      });
      return {
        status: "success",
        message: "Link created successfully",
        json: {
          msg_token: msg_token,
        },
      };
    },
  },
  CreateLinkForDMPaidByReceiver: {
    type: OutputMsg,
    description: "Create Link For DM Card Paid By Receiver",
    args: {
      amount: { type: new GraphQLNonNull(GraphQLFloat) },
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const msg_token = GenerateRandomString(20);

      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: user_id,
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "create_link_for_dm_paid_by_receiver",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        if (!response) {
          throw new GraphQLError("Invalid receipt");
        }
        // let's iterate into each receipt from the response and look for the possible value cdpc_199 in productId and filter those and then from that list we will again extract only that record which has purchaseDate nearest to the current date
        const filteredReceipts = response.filter((receipt) => {
          return receipt.productId === "cdcwmp_499";
        });

        if (filteredReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }

        const sortedReceipts = filteredReceipts.sort((a, b) => {
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        });
        if (sortedReceipts.length === 0) {
          throw new GraphQLError("Invalid receipt");
        }
        const transactionId = sortedReceipts[0].transactionId;
        let transactionSearch = await methods.countDocuments("dm_links_paid", {
          "subscription_payload.transactionId": transactionId,
        });

        if (transactionSearch > 0) {
          throw new GraphQLError("Already used");
        }
      } catch (error) {
        throw new GraphQLError(error.message);
      }
      await methods.InsertRecord("dm_links", {
        user_id: user_id,
        amount: args.amount,
        msg_token: msg_token,
        created_at: new Date(),
        type: "paid_by_receiver",
        expiry_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      return {
        status: "success",
        message: "Link created successfully",
        json: {
          msg_token: msg_token,
        },
      };
    },
  },
  MarkPaymentForDMPaidByUsers: {
    type: OutputMsg,
    description: "Mark Payment For DM Card Paid By Users",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const link = await methods.FindSingleRecord(
        "dm_links",
        "msg_token",
        args.msg_token,
        true
      );
      if (!link) {
        throw new GraphQLError("Invalid link");
      }
      const isPaid = await methods.countDocuments("dm_links_paid", {
        anonymous_user_id: args.anonymous_user_id,
        msg_token: args.msg_token,
        created_at: new Date(),
      });
      if (isPaid > 0) {
        throw new GraphQLError("Already paid");
      }
      // expiry after 24 hours from current time
      // credit amount 80% of amount
      const expiry_time = new Date().getTime() + 24 * 60 * 60 * 1000;
      await methods.InsertRecord("dm_links_paid", {
        anonymous_user_id: args.anonymous_user_id,
        receiver_user_id: link.user_id,
        msg_token: args.msg_token,
        amount: link.amount,
        amount_to_credit: link.amount * 0.8,
        is_amount_credited_to_receiver: false,
        expiry_time: expiry_time,
        created_at: new Date(),
      });
      return {
        status: "success",
        message: "Payment marked successfully",
      };
    },
  },
  SendMessageFromDMLinks: {
    type: OutputMsg,
    description: "Send Message Via DM Card Paid By Users Link",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      message: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
      ip_address: { type: GraphQLString },
      network_provider: { type: GraphQLString },
      browser_name: { type: GraphQLString },
      country_name: { type: GraphQLString },
      approx_location: { type: GraphQLString },
      hints: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context).catch((err) => {
        return null;
      });
      const sender_id = isAuth
        ? ObjectId(isAuth.user_id)
        : args.anonymous_user_id;
      const link = await methods.FindSingleRecord(
        "dm_links",
        "msg_token",
        args.msg_token,
        true
      );
      const receiver_id = isAuth ? args.anonymous_user_id : link.user_id;
      if (!link) {
        throw new GraphQLError("Invalid link");
      }

      const type = link.type;

      const isBlocked = await methods.FindRecordByMultipleFields(
        "users_blocked",
        {
          temporary_sender_user_id: args.anonymous_user_id,
          user_id: receiver_id,
        }
      );

      if (isBlocked) {
        throw new GraphQLError(
          "You are blocked from sending messages to this user"
        );
      }

      if (type == "paid_by_users") {
        const PaymentInfo = await methods.FindRecordByMultipleFields(
          "dm_links_paid",
          {
            anonymous_user_id: args.anonymous_user_id,
            msg_token: args.msg_token,
          }
        );
        if (!PaymentInfo) {
          throw new GraphQLError("Payment not found");
        }
        if (new Date(PaymentInfo.expiry_time) < new Date()) {
          throw new GraphQLError("Link expired");
        }
        methods
          .UpdateRecord(
            "dm_links_paid",
            {
              _id: PaymentInfo._id,
              is_amount_credited_to_receiver: false,
            },
            {
              is_amount_credited_to_receiver: true,
              amount_credited_to_receiver_at: new Date(),
            }
          )
          .then(async (data) => {
            let receiver_user_id = PaymentInfo.receiver_user_id;
            const isExist = await methods.FindRecordByMultipleFields(
              "user_earnings",
              {
                reference_id: PaymentInfo._id,
              }
            );
            if (!isExist) {
              methods.InsertRecord("user_earnings", {
                user_id: receiver_user_id,
                amount: PaymentInfo.amount_to_credit,
                type: "dm_earning_from_paid_by_users",
                created_at: new Date(),
                reference_id: PaymentInfo._id,
                reference_from: "dm_links_paid",
                status: "payout_pending",
              });
            }
          });
      } else if (type == "paid_by_receiver") {
        if (new Date(link.expiry_time) < new Date()) {
          throw new GraphQLError("Link expired");
        }
      }

      const message = await methods
        .InsertRecord("dm_messages", {
          message: args.message,
          created_at: new Date(),
          receiver_id: receiver_id,
          sender_id: sender_id,
          msg_token: args.msg_token,
          seen: false,
        })
        .then(async (data) => {
          // createa a new dm_threads record if not exists for this sender and receiver pair and if exists then update the last message text and last message time
          const dm_threads = await methods.FindRecordByMultipleFields(
            "dm_threads",
            {
              $or: [
                {
                  sender_id: sender_id,
                  receiver_id: receiver_id,
                },
                {
                  sender_id: receiver_id,
                  receiver_id: sender_id,
                },
              ],
              msg_token: args.msg_token,
            }
          );
          if (dm_threads) {
            methods.UpdateRecord(
              "dm_threads",
              {
                $or: [
                  {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                  },
                  {
                    sender_id: receiver_id,
                    receiver_id: sender_id,
                  },
                ],
                msg_token: args.msg_token,
              },
              {
                last_message_text: args.message,
                last_message_time: new Date(),
                ip_address: args.ip_address,
                network_provider: args.network_provider,
                browser_name: args.browser_name,
                country_name: args.country_name,
                approx_location: args.approx_location,
                hints: args.hints,
              }
            );
          } else {
            await methods.InsertRecord("dm_threads", {
              sender_id: sender_id,
              receiver_id: receiver_id,
              last_message_text: args.message,
              last_message_time: new Date(),
              created_at: new Date(),
              msg_token: args.msg_token,
              anonymous_user_id: args.anonymous_user_id,
              msg_token_type: type,
              ip_address: args.ip_address,
              network_provider: args.network_provider,
              browser_name: args.browser_name,
              country_name: args.country_name,
              approx_location: args.approx_location,
              hints: args.hints,
              amount: await methods
                .FindRecordByMultipleFields("dm_links_paid", {
                  anonymous_user_id: args.anonymous_user_id,
                  msg_token: args.msg_token,
                })
                .then((data) => {
                  return data.amount;
                })
                .catch((err) => {
                  return 0;
                }),
            });
          }
          pubsub.publish("message", {
            ListenMessages: {
              _id: data.insertedId,
              message: args.message,
              msg_token: args.msg_token,
              created_at: new Date(),
              receiver_id: receiver_id,
              sender_id: sender_id,
            },
          });
          await sendNotification(
            ObjectId(link.user_id),
            "💬 New message!",
            "You have a new anonymous message, Check it out now.",
            "dm_threads",
            data._id,
            {
              type: "dm_threads",
            },
            ""
          );
        });
      return {
        status: "success",
        message: "Message sent successfully",
      };
    },
  },
  MarkDMMessagesAsSeen: {
    type: OutputMsg,
    description: "Mark DM Messages As Seen",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      await methods.UpdateRecord(
        "dm_messages",
        {
          sender_id: args.anonymous_user_id,
          msg_token: args.msg_token,
        },
        {
          seen: true,
        }
      );
      return {
        status: "success",
        message: "Messages marked as seen successfully",
      };
    },
  },
  DeleteDMThread: {
    type: OutputMsg,
    description: "Delete DM Thread",
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      await methods.DeleteRecord("dm_threads", {
        msg_token: args.msg_token,
        anonymous_user_id: args.anonymous_user_id,
      });
      await methods.DeleteRecord("dm_messages", {
        $or: [
          {
            sender_id: args.anonymous_user_id,
            msg_token: args.msg_token,
            receiver_id: isAuth.user_id,
          },
          {
            sender_id: isAuth.user_id,
            msg_token: args.msg_token,
            receiver_id: args.anonymous_user_id,
          },
        ],
      });
      return {
        status: "success",
        message: "Thread deleted successfully",
      };
    },
  },
};

const subscriptions = {
  ListenMessages: {
    type: Message,
    args: {
      msg_token: { type: new GraphQLNonNull(GraphQLString) },
      anonymous_user_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    description:
      "Subscribe to this subscription for Listening realtime messages for this user",
    subscribe: withFilter(
      (parent, args, context) => {
        return pubsub.asyncIterator("message");
      },
      async (payload, args, context) => {
        const link = await methods.FindSingleRecord(
          "dm_links",
          "msg_token",
          args.msg_token,
          true
        );
        if (!link) {
          throw new GraphQLError("Invalid link");
        }
        const receiver_id = link.user_id;
        if (
          payload.ListenMessages.receiver_id == receiver_id.toString() &&
          payload.ListenMessages.sender_id == args.anonymous_user_id
        ) {
          return true;
        } else if (
          payload.ListenMessages.sender_id == receiver_id.toString() &&
          payload.ListenMessages.receiver_id == args.anonymous_user_id
        ) {
          return true;
        }
        return false;
      }
    ),
  },
};

module.exports = {
  queries,
  mutations,
  subscriptions,
};
