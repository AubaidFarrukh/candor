const graphql = require("graphql");
const {
  methods,
  GenerateRandomString,
  ValidateUser,
  sendEmail,
  getTimestampOfComingMondayStartTime,
} = require("../../core/functions");
const { ObjectId } = require("mongodb");
const appleReceiptVerify = require("node-apple-receipt-verify");
const env = require("dotenv");
env.config({ path: ".env" });

appleReceiptVerify.config({
  environment: [process.env.APPLE_RECEIPT_ENV],
  secret: process.env.APPLE_RECEIPT_SECRET,
});

const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLFloat,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
} = graphql;

const { Card, OutputMsg } = require("../types");

const queries = {
  ListCards: {
    type: new GraphQLList(Card),
    description: "List Cards",
    args: {
      category: { type: GraphQLString },
      limit: { type: GraphQLInt },
      page: { type: GraphQLInt },
      week_name: {
        type: GraphQLString,
        description: "Week name should be like Jan 1, 2023",
      },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      // list all those cards whose status is live or whose unix_time is less than current unix time
      const current_unix_time = new Date().getTime();
      let query = { status: { $in: ["live", "live_awaiting"] } };
      if (args.week_name) {
        const week = await methods.FindSingleRecord(
          "weeks",
          "name",
          args.week_name,
          true
        );
        if (!week) {
          throw new GraphQLError("Invalid week name");
        }
        const week_id = ObjectId(week._id);
        query.week_id = week_id;
      }
      if (args.category) {
        query.category = args.category;
      }
      return methods
        .ListRecords("cards", query, args.limit, args.page)
        .then((cards) => {
          // in each card, check if unix_time is there then delete that field and set status to live
          cards.forEach((card) => {
            if (card.unix_time) {
              card.status = "live";
            }
            methods.UpdateRecord(
              "cards",
              { _id: ObjectId(card._id) },
              { status: card.status }
            );
          });
          // if cards have _id 63c6d4bcd9f97ea81a1548cb or 63efce7cff566b5a941b4852 then move it to first position in array and remove it from original position
          const index = cards.findIndex(
            (card) =>
              card._id == "63c6d4bcd9f97ea81a1548cb" ||
              card._id == "63efce7cff566b5a941b4852"
          );
          if (index > -1) {
            const card = cards[index];
            cards.splice(index, 1);
            cards.unshift(card);
          }
          return cards;
        });
    },
  },
  Card: {
    type: Card,
    description: "Get Card by ID",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      return methods.FindSingleRecord("cards", "_id", ObjectId(args.id), true);
    },
  },
};

const mutations = {
  CreateCard: {
    type: Card,
    description: "Create Card",
    args: {
      background_color: { type: new GraphQLNonNull(GraphQLString) },
      category: { type: GraphQLString },
      caption_text: { type: GraphQLString },
      sticker_image: { type: GraphQLString },
      background_image: { type: GraphQLString },
      gradient_background_color: { type: GraphQLString },
      new_text_color: { type: GraphQLString },
      text_color: { type: GraphQLString },
      caption_image: { type: GraphQLString },
      description: { type: GraphQLString },
      response_type: { type: GraphQLString },
      linked_poll_id: { type: GraphQLString },
      is_premium: { type: GraphQLBoolean },
      similar_questions: { type: new GraphQLList(GraphQLString) },
      price: { type: GraphQLFloat },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user_info = await methods.FindSingleRecord(
        "users",
        "_id",
        ObjectId(isAuth.user_id)
      );
      let card;

      args.unix_time = getTimestampOfComingMondayStartTime();
      const week_name = new Date(args.unix_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const week = await methods.FindOrCreateRecord(
        "weeks",
        { unix_time: args.unix_time },
        { name: week_name }
      );
      const week_id = week._id;

      let questions = [];
      // merge caption_text and similar_questions
      if (
        args.similar_questions &&
        args.similar_questions.length > 0 &&
        args.caption_text
      ) {
        questions = [args.caption_text, ...args.similar_questions];
      } else if (args.similar_questions && args.similar_questions.length > 0) {
        questions = [...args.similar_questions];
      } else if (args.caption_text) {
        questions = [args.caption_text];
      }

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!user_info.is_admin) {
          card = await methods.InsertRecord("cards", {
            background_color: args.background_color,
            caption_text: question,
            sticker_image: args.sticker_image,
            background_image: args.background_image,
            category: args.category,
            response_type: args.response_type,
            text_color: args.text_color,
            caption_image: args.caption_image,
            description: args.description,
            gradient_background_color: args.gradient_background_color,
            new_text_color: args.new_text_color,
            user_id: user_id,
            status: "private",
            week_id: week_id,
            is_premium: args.is_premium,
            price: args.price,
          });
        } else {
          if (args.linked_poll_id) {
            const poll_data = await methods.FindSingleRecord(
              "polls",
              "_id",
              ObjectId(args.linked_poll_id)
            );
            if (!poll_data) {
              throw new GraphQLError("Invalid poll id");
            }
          }
          card = await methods.InsertRecord("cards", {
            background_color: args.background_color,
            caption_text: question,
            sticker_image: args.sticker_image,
            category: args.category,
            response_type: args.response_type,
            background_image: args.background_image,
            text_color: args.text_color,
            caption_image: args.caption_image,
            description: args.description,
            gradient_background_color: args.gradient_background_color,
            new_text_color: args.new_text_color,
            user_id: user_id,
            status: "private",
            unix_time: args.unix_time,
            week_id: week_id,
            linked_poll_id: ObjectId(args.linked_poll_id),
            is_premium: args.is_premium,
            price: args.price,
          });
        }
      }
      return card;
    },
  },
  MarkCardAsPaid: {
    type: OutputMsg,
    description: "Mark Card as Paid",
    args: {
      cardId: { type: new GraphQLNonNull(GraphQLString) },
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
      restore: { type: GraphQLBoolean },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const cardInfo = await methods.FindSingleRecord(
        "cards",
        "_id",
        ObjectId(args.cardId)
      );
      if (!cardInfo) {
        throw new GraphQLError("Invalid card id");
      }
      const creatorId = cardInfo.user_id;
      const is_card_purchased = await methods.FindRecordByMultipleFields(
        "purchased_cards",
        {
          card_id: ObjectId(args.cardId),
          user_id: ObjectId(isAuth.user_id),
        }
      );

      if (is_card_purchased) {
        throw new GraphQLError("Card already purchased");
      }
      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: ObjectId(isAuth.user_id),
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "card_purchase",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        if (!response) {
          throw new GraphQLError("Invalid receipt");
        }
        // let's iterate into each receipt from the response and look for the possible value cdpc_199 in productId and filter those and then from that list we will again extract only that record which has purchaseDate nearest to the current date
        const filteredReceipts = response.filter((receipt) => {
          return (
            receipt.productId === "cdpcr_199" ||
            receipt.productId === "cdpcp_199"
          );
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
        if (args.restore !== undefined && !args.restore) {
          let transactionSearch = await methods.countDocuments(
            "purchased_cards",
            {
              "subscription_payload.transactionId": transactionId,
            }
          );
          if (transactionSearch > 0) {
            return {
              status: "error",
              message: "Transaction already exists",
            };
          }
        }
        return methods
          .InsertRecord("purchased_cards", {
            card_id: ObjectId(args.cardId),
            user_id: ObjectId(isAuth.user_id),
            purchased_at: response[0].purchaseDate,
            purchased_via: "apple",
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
            return {
              status: true,
              message: "Card marked as paid",
              success: true,
            };
          });
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  MarkCardAsPaidAndroid: {
    type: OutputMsg,
    description: "Mark Card as Paid",
    args: {
      cardId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const cardInfo = await methods.FindSingleRecord(
        "cards",
        "_id",
        ObjectId(args.cardId)
      );
      if (!cardInfo) {
        throw new GraphQLError("Invalid card id");
      }
      return methods
        .InsertRecord("purchased_cards", {
          card_id: ObjectId(args.cardId),
          user_id: ObjectId(isAuth.user_id),
          purchased_at: new Date().getTime(),
          subscription_payload: {},
          purchased_via: "android",
        })
        .then(async (data) => {
          return {
            status: true,
            message: "Card marked as paid",
            success: true,
          };
        });
    },
  },
  MarkBlankTextCardFeatureAsPaid: {
    type: OutputMsg,
    description: "Mark Blank Text Card Feature as Paid",
    args: {
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
      restore: { type: GraphQLBoolean },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user = await methods.FindSingleRecord(
        "users",
        "_id",
        user_id,
        true
      );

      if (user.mark_blank_text_card_feature_as_paid) {
        throw new GraphQLError("Already paid");
      }

      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: user_id,
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "mark_blank_text_card_feature_as_paid",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        const filteredReceipts = response.filter((receipt) => {
          return (
            receipt.productId === "cdbtcr_499" ||
            receipt.productId === "cdbtcp_499" ||
            receipt.productId === "cdbtc_499"
          );
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

        if (args.restore !== undefined && !args.restore) {
          let transactionSearch = await methods.countDocuments("users", {
            "blank_text_card_subscription_payload.transactionId": transactionId,
          });

          if (transactionSearch > 0) {
            return {
              status: "error",
              message: "Transaction already exists",
            };
          }
        }

        return methods
          .UpdateRecord(
            "users",
            {
              _id: user_id,
            },
            {
              mark_blank_text_card_feature_as_paid: true,
              blank_text_card_purchased_at: response[0].purchaseDate,
              blank_text_card_subscription_payload: sortedReceipts[0],
            }
          )
          .then(() => {
            methods.InsertRecord("payment_transactions", {
              user_id: user_id,
              transactionId: sortedReceipts[0].transactionId,
              productId: sortedReceipts[0].productId,
              purchaseDate: sortedReceipts[0].purchaseDate,
              created_at: new Date(),
            });
            return {
              status: "success",
              message: "Blank card text marked as paid successfully",
            };
          });
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  MarkBlankTextCardFeatureAsPaidAndroid: {
    type: OutputMsg,
    description: "Mark Blank Text Card Feature as Paid",
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user = await methods.FindSingleRecord(
        "users",
        "_id",
        user_id,
        true
      );
      if (user.mark_blank_text_card_feature_as_paid) {
        throw new GraphQLError("User is already paid");
      }

      return methods
        .UpdateRecord(
          "users",
          {
            _id: user_id,
          },
          {
            mark_blank_text_card_feature_as_paid: true,
            blank_text_card_purchased_at: new Date().getTime(),
            blank_text_card_subscription_payload: {},
          }
        )
        .then(() => {
          return {
            status: "success",
            message: "Blank card text marked as paid successfully",
          };
        });
    },
  },
  MarkBlankAudioCardFeatureAsPaid: {
    type: OutputMsg,
    description: "Mark Blank Audio Card Feature as Paid",
    args: {
      apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
      restore: { type: GraphQLBoolean },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user = await methods.FindSingleRecord(
        "users",
        "_id",
        user_id,
        true
      );

      if (user.mark_blank_audio_card_feature_as_paid) {
        throw new GraphQLError("Already paid");
      }

      try {
        methods.InsertRecord("apple_receipts_log", {
          user_id: user_id,
          receipt: args.apple_receipt,
          created_at: new Date(),
          via: "mark_blank_audio_card_feature_as_paid",
        });
        const response = await appleReceiptVerify.validate({
          receipt: args.apple_receipt,
        });
        const filteredReceipts = response.filter((receipt) => {
          return receipt.productId === "cdbac_499";
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
        if (args.restore !== undefined && !args.restore) {
          let transactionSearch = await methods.countDocuments("users", {
            "blank_audio_card_subscription_payload.transactionId":
              transactionId,
          });

          if (transactionSearch > 0) {
            return {
              status: "error",
              message: "Transaction already exists",
            };
          }
        }
        return methods
          .UpdateRecord(
            "users",
            {
              _id: user_id,
            },
            {
              mark_blank_audio_card_feature_as_paid: true,
              blank_audio_card_purchased_at: response[0].purchaseDate,
              blank_audio_card_subscription_payload: sortedReceipts[0],
            }
          )
          .then(() => {
            methods.InsertRecord("payment_transactions", {
              user_id: user_id,
              transactionId: sortedReceipts[0].transactionId,
              productId: sortedReceipts[0].productId,
              purchaseDate: sortedReceipts[0].purchaseDate,
              created_at: new Date(),
            });
            return {
              status: "success",
              message: "Blank card audio marked as paid successfully",
            };
          });
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  MarkBlankAudioCardFeatureAsPaidAndroid: {
    type: OutputMsg,
    description: "Mark Blank Audio Card Feature as Paid",
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user = await methods.FindSingleRecord(
        "users",
        "_id",
        user_id,
        true
      );
      if (user.mark_blank_audio_card_feature_as_paid) {
        throw new GraphQLError("User is already paid");
      }

      return methods
        .UpdateRecord(
          "users",
          {
            _id: user_id,
          },
          {
            mark_blank_audio_card_feature_as_paid: true,
            blank_audio_card_purchased_at: new Date().getTime(),
            blank_audio_card_subscription_payload: {},
          }
        )
        .then(() => {
          return {
            status: "success",
            message: "Blank card audio marked as paid successfully",
          };
        });
    },
  },
  AdminUpdateCard: {
    type: Card,
    description: "Update Card",
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      background_color: { type: GraphQLString },
      text_color: { type: GraphQLString },
      sticker_image: { type: GraphQLString },
      background_image: { type: GraphQLString },
      gradient_background_color: { type: GraphQLString },
      new_text_color: { type: GraphQLString },
      caption_text: { type: GraphQLString },
      caption_image: { type: GraphQLString },
      description: { type: GraphQLString },
      is_premium: { type: GraphQLBoolean },
      price: { type: GraphQLFloat },
      status: { type: GraphQLString },
      status_reason: { type: GraphQLString },
      response_type: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      const user_info = await methods.FindSingleRecord(
        "users",
        "_id",
        ObjectId(isAuth.user_id)
      );
      const card_info = await methods.FindSingleRecord(
        "cards",
        "_id",
        ObjectId(args.id)
      );
      const current_status = card_info.status;
      let card;
      if (!user_info.is_admin) {
        throw new GraphQLError("You are not authorized to perform this action");
      } else {
        if (
          args.status &&
          args.status == "prioitized" &&
          current_status != "private"
        ) {
          throw new GraphQLError(
            "You are not authorized to move this card to prioitized, it should be private"
          );
        }
        if (
          args.status &&
          args.status == "live_awaiting" &&
          current_status != "prioitized"
        ) {
          throw new GraphQLError(
            "You are not authorized to move this card to live_awaiting because it should be prioitized first"
          );
        }
        if (args.status && args.status == "live_awaiting") {
          if (!user_info.is_superadmin) {
            throw new GraphQLError(
              "You are not authorized to move this card only superadmin can move it to live_awaiting"
            );
          }
        }
        card = await methods.UpdateRecord(
          "cards",
          { _id: ObjectId(args.id) },
          {
            background_color: args.background_color,
            caption_text: args.caption_text,
            caption_image: args.caption_image,
            description: args.description,
            is_premium: args.is_premium,
            price: args.price,
            response_type: args.response_type,
            text_color: args.text_color,
            gradient_background_color: args.gradient_background_color,
            new_text_color: args.new_text_color,
            status: args.status,
            status_reason: args.status_reason,
            background_image: args.background_image,
            sticker_image: args.sticker_image,
          }
        );
      }
      return card;
    },
  },
  CardLinkCopied: {
    type: OutputMsg,
    description: "Card Link Copied",
    args: {
      card_id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (parent, args, context) => {
      const isAuth = await ValidateUser(context);
      const user_id = ObjectId(isAuth.user_id);
      methods.InsertRecord("card_link_copied", {
        user_id: user_id,
        card_id: ObjectId(args.card_id),
        created_at: new Date(),
      });
    },
  },
};

module.exports = {
  queries,
  mutations,
};
