import { ObjectId } from "mongodb";
const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const env = require("dotenv");
const rc = require("random-cron");

env.config();

const client = new MongoClient(process.env.MONGO_DB_URL);
const database = client.db("candor");

cron.schedule("00 00 * * *", async () => {
  const users = await database
    .collection("users")
    .find({
      is_premium: true,
    })
    .toArray();
  for (let user of users) {
    const subscriptionPayload = user.subscription_payload;
    const expiration = new Date(subscriptionPayload.expirationDate);
    const now = new Date();
    if (now > expiration) {
      await database.collection("users").updateOne(
        {
          _id: new ObjectId(user._id),
        },
        {
          $set: {
            is_premium: false,
            /*
            if you user subscribes set this field to false and when his subscription expires set it to true
             */
            was_premium: true,
          },
        }
      );
    }
  }
});

const job = rc
  .some("weekday")
  .between(1, 7)
  .some("hour")
  .between(1, 12)
  .generate();

const answers = [
  "yes",
  "no",
  "maybe",
  "i dont know",
  "i dont care",
  "i dont want to answer",
  "i dont",
];

function randomRange(myMin, myMax) {
  return Math.floor(Math.random() * (myMax - myMin + 1) + myMin);
}
cron.schedule(job, async () => {
  const cardLinkCopied = await database
    .collection("card_link_copied")
    .find({
      is_premium: true,
    })
    .toArray();

  for (let link of cardLinkCopied) {
    const card = await database.collection("cards").findOne({
      _id: new ObjectId(link.card_id),
    });
    if (card) {
      await database.collection("messages").insertOne({
        user_id: new ObjectId(link.user_id),
        question: card.caption_text,
        answer: answers[randomRange(0, answers.length - 1)],
        temporary_sender_user_id: randomRange(1, 100000000000000),
        card_id: new ObjectId(card._id),
        is_read: false,
        is_replied: false,
        is_from_bot: true,
      });
    }
  }
});
