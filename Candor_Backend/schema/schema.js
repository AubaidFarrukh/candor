const graphql = require("graphql");
const UserSchema = require("./schemas/user");
const CardSchema = require("./schemas/cards");
const MessageScehma = require("./schemas/message");
const PollSchema = require("./schemas/polls");
const AdminSchema = require("./schemas/admin");
const PhoneContactSchema = require("./schemas/phoneContact");
const UploadSchema = require("./schemas/upload");
const GroupChat = require("./schemas/groupChat");

const { GraphQLObjectType, GraphQLSchema } = graphql;

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  description:
    "Some Resource requires user's authentication, you can generate authentication code using LoginUser GraphQL endpoint, and pass it to authorization header for more see this https://prnt.sc/1o33ofj",
  fields: () => ({
    ...UserSchema.queries,
    ...CardSchema.queries,
    ...MessageScehma.queries,
    ...PollSchema.queries,
    ...AdminSchema.queries,
    ...PhoneContactSchema.queries,
    ...UploadSchema.queries,
    ...GroupChat.queries,
  }),
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  description:
    "Some Resource requires user's authentication, you can generate authentication code using LoginUser GraphQL endpoint, and pass it to authorization header for more see this https://prnt.sc/1o33ofj",
  fields: () => ({
    ...UserSchema.mutations,
    ...CardSchema.mutations,
    ...MessageScehma.mutations,
    ...PollSchema.mutations,
    ...AdminSchema.mutations,
    ...PhoneContactSchema.mutations,
    ...UploadSchema.mutations,
    ...GroupChat.mutations,
  }),
});

const subscription = new GraphQLObjectType({
  name: "Subscription",
  description:
    "Some Resource requires user's authentication, you can generate authentication code using LoginUser GraphQL endpoint, and pass it to authorization header for more see this https://prnt.sc/1o33ofj",
  fields: () => ({
    ...MessageScehma.subscriptions,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation,
  subscription: subscription,
});
