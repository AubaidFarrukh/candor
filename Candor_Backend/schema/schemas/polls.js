const graphql = require('graphql')
const { methods, GenerateRandomString, ValidateUser, getTimestampOfComingSundayStartTime, getTimestampOfComingMondayStartTime, getTimestampOfCurrentMondayStartTime } = require('../../core/functions');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs')
const env = require('dotenv');
env.config({ path: '.env' });  

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLError,
    GraphQLList,
    GraphQLInt
} = graphql

const { Poll, OutputMsg, Week } = require('../types');

const queries = {
   Poll: {
        type: Poll,
        description: 'Get Poll by ID',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            return methods.FindSingleRecord('polls', "_id", ObjectId(args.id), true);
        }
   },
   ListPolls: {
        type: new GraphQLList(Poll),
        description: 'List Polls',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
            type: { type: GraphQLString },
            week_name: { 
                type: GraphQLString,
                description: 'Week name should be like Jan 1, 2023',
            },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            if (args.type != "selected" && args.type != "my" && args.type != "public" && args.type != "all") {
                throw new GraphQLError("Invalid type, allowed types are selected, my, public");
            }
            let query = {};
            if (args.type == "selected") {
            const current_unix_time = new Date().getTime();
                query = { "status": { $in: ["live", "live_awaiting"] }};
            } else if (args.type == "my") {
                query = { "submitted_by": ObjectId(isAuth.user_id) };
            } 
            if (args.week_name) {
                const week = await methods.FindSingleRecord('weeks', "name", args.week_name, true);
                if (!week) {
                    throw new GraphQLError('Week not found');
                }
                query.week_id = ObjectId(week._id);
            }
            return methods.ListRecords("polls", query, args.limit, args.page).then((polls) => {
                polls.forEach((poll) => {
                    let coming_sunday_unix_time_against_timestamp = getTimestampOfComingSundayStartTime(poll.unix_time);
                    let current_time = new Date().getTime();
                    if (current_time > coming_sunday_unix_time_against_timestamp) {
                        poll.status = "private";
                    }
                    methods.UpdateRecord("polls", { "_id": ObjectId(poll._id) }, { "status": poll.status });
                });
                return polls;
            })
        }
    },
    PollsWeeklyStats: {
        type: GraphQLList(Poll),
        description: 'Get weekly stats',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const monday_unix_time = getTimestampOfCurrentMondayStartTime();
            const week_id = await methods.FindSingleRecord('weeks', "unix_time", monday_unix_time, true);
            if (!week_id) {
                throw new GraphQLError('Week not found');
            }
            return methods.ListRecords("polls", { "week_id": ObjectId(week_id._id), "status": "live" }, args.limit, args.page, { "total_votes": -1 });
        }
    },
    CurrentWeek: {
        type: Week,
        description: 'Get current week',
        resolve: async (parent, args, context) => {
            const monday_unix_time = getTimestampOfCurrentMondayStartTime();
            return methods.FindSingleRecord('weeks', "unix_time", monday_unix_time, true);
        }
    },
}

const mutations = {
   CreatePoll: {
        type: Poll,
        description: 'Create Poll',
        args: {
            text: { type: new GraphQLNonNull(GraphQLString) },
            brag_name: { type: GraphQLString },
            is_premium: { type: GraphQLBoolean },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            let poll;

            args.unix_time = getTimestampOfComingMondayStartTime();
            const week_name = new Date(args.unix_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const week = await methods.FindOrCreateRecord("weeks", {"unix_time": args.unix_time}, {"name": week_name});
            const week_id = week._id;

            if (!user_info.is_admin) {
                poll = await methods.InsertRecord("polls", {
                    text: args.text,
                    brag_name: args.brag_name,
                    submitted_by: ObjectId(isAuth.user_id),
                    is_premium: args.is_premium,
                    status: 'private',
                    week_id: ObjectId(week_id),
                });
            } else {
                poll = await methods.InsertRecord("polls", {
                    text: args.text,
                    brag_name: args.brag_name,
                    submitted_by: ObjectId(isAuth.user_id),
                    is_premium: args.is_premium,
                    status: 'private',
                    unix_time: args.unix_time,
                    week_id: ObjectId(week_id),
                });
            }
            return poll;
        }
   },
   UpdatePoll: {
        type: Poll,
        description: 'Update Poll',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            text: { type: GraphQLString },
            status: { type: GraphQLString },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));

            const poll_info = await methods.FindSingleRecord("polls", "_id", ObjectId(args.id));
            const current_status = poll_info.status;
            let poll;
            let update_data = {};
            if (args.text) {
                update_data.text = args.text;
            }
            if (!user_info.is_admin) {
                throw new GraphQLError("You are not authorized to perform this action");
            }else{
                if(args.status && args.status == "prioitized" && current_status != "private"){
                    throw new GraphQLError("You are not authorized to move this card to prioitized, it should be private");
                }
                if(args.status && args.status == "live_awaiting" && current_status != "prioitized"){
                    throw new GraphQLError("You are not authorized to move this card to live_awaiting because it should be prioitized first");
                }
                if (args.status && args.status == "live_awaiting") {
                    if (!user_info.is_superadmin) {
                        throw new GraphQLError("You are not authorized to move this card only superadmin can move it to live_awaiting");
                    }
                }
                update_data.status = args.status;
            }
            poll = await methods.UpdateRecord("polls", {"_id": ObjectId(args.id) }, update_data);
            return poll;
        }
    },
    UpVotePoll: {
        type: OutputMsg,
        description: 'Up Vote Poll',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            await methods.countDocuments('poll_votes', { "poll_id": ObjectId(args.id), "user_id": ObjectId(isAuth.user_id) }).then((res) => {
                if (res > 0) {
                    throw new GraphQLError("You have already voted for this poll");
                }
            });
            const poll = await methods.InsertRecord("poll_votes", {
                poll_id: ObjectId(args.id),
                user_id: ObjectId(isAuth.user_id),
            });
            return { message: "Up Vote Successful", status: true };
        }
    },
}


module.exports = {
    queries,
    mutations
}