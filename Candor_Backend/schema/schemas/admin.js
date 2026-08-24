const graphql = require('graphql')
const { methods, GenerateRandomString, ValidateUser, sendEmail, getTimestampOfComingMondayStartTime } = require('../../core/functions');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs')
const env = require('dotenv');
env.config({ path: '.env' });  

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLFloat,
    GraphQLError,
    GraphQLList,
    GraphQLInt
} = graphql

const { Card, OutputMsg, User, Poll, Week, REV_SHARE_PAYMENT_REQUESTS, PaymentTransactions } = require('../types');

const queries = {
    AdminListRevSharePaymentRequests: {
        type: new GraphQLList(REV_SHARE_PAYMENT_REQUESTS),
        description: 'List Rev Share Payment Requests',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            return methods.AggregateRecords('rev_share_withdrawal_requests', [
                {
                    $addFields: {
                      isPending: { $cond: [{ $eq: ["$status", "pending"] }, 0, 1] }
                    }
                  },
                  {
                    $sort: { isPending: 1 }
                  },
                  {
                    $project: { isPending: 0 }
                  }
            ], args.limit, args.page);
        }
    },
    AdminWeeklyStats: {
        type: GraphQLList(Week),
        description: 'Get weekly stats',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            return methods.ListRecords("weeks", {}, args.limit, args.page, { "unix_time": -1 });
        }
    },
    AdminStats: {
        type: OutputMsg,
        description: 'Get admin stats',
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            return {
                json: {
                    total_signups: await methods.countDocuments("users", {}),
                    total_questions: await methods.countDocuments("cards", {}),
                    total_polls: await methods.countDocuments("polls", {}),
                    total_poll_upovtes: await methods.countDocuments("poll_votes", {}),
                    total_earning: "10000000000000",
                    total_question_by_admin: await methods.countDocuments("cards", { "linked_poll_id": { $exists: false } }),
                    total_question_by_users: await methods.countDocuments("cards", { "linked_poll_id": { $exists: true } }),
                    total_deactivated_users: await methods.countDocuments("users", { "status": 'inactive' }),
                },
                message: "Admin stats fetched successfully",
                success: true,
            }
        }
    },
    AdminListTrendingCards: {
        type: new GraphQLList(Card),
        description: 'Get trending cards',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            return methods.ListRecords("cards", {}, args.limit, args.page, { "total_messages_count": -1 });
        }
    },
    AdminListUsers: {
        type: new GraphQLList(User),
        description: 'List all users',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id), false);
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            return methods.ListRecords("users", {}, args.limit, args.page);
        }
    },
    AdmminListPaymentTransactions: {
        type: new GraphQLList(PaymentTransactions),
        description: 'List all payment transactions',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            return methods.ListRecords("payment_transactions", {}, args.limit, args.page);
        }
    },
    AdminListCards: {
        type: new GraphQLList(Card),
        description: 'List all cards',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
            status: { 
                type: GraphQLString,
                description: 'Status of the card, can be private, priotized, live, inactive',
            },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            const query = {};
            if (args.status) {
                query.status = args.status;
            }
            return methods.ListRecords("cards", query, args.limit, args.page);
        }
    },
    AdminListPollCards: {
        type: new GraphQLList(Poll),
        description: 'List all poll cards',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
            status: {
                type: GraphQLString,
                description: 'Status of the card, can be private, priotized, live, inactive, private_paid_request',
            },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            const query = {};
            if (args.status) {
                query.status = args.status;
            }
            if (args.status == 'private_paid_request') {
                return methods.ListRecords("polls", {
                    "status": "private",
                    "is_premium": true,
                }, args.limit, args.page);
            }else{
                return methods.ListRecords("polls", query, args.limit, args.page);
            }
        }
    },
    GetCurrentVersionOfApp: {
        type: OutputMsg,
        description: 'Get current version',
        resolve: async (parent, args, context) => {
            const version = await methods.FindSingleRecord("app_version", "app", "candor", true);
            return {
                message: "Version fetched successfully",
                success: true,
                json: version
            }
        }
    },

}

const mutations = {
    UpdateCurrentVersionOfApp: {
        type: OutputMsg,
        description: 'Add new version',
        args: {
            version: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            const version = await methods.FindOrCreateRecord("app_version", { 
                "app": "candor"
            }, { 
                "version": args.version,
                "app": "candor"
            });
            return {
                message: "Version updated successfully",
                success: true,
            }
        }
    },
    AdminActivateDeactivateUser: {
        type: OutputMsg,
        description: 'Activate or deactivate a user',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            status: { type: 
                new GraphQLNonNull(GraphQLString),
                description: 'Status of the user, can be active or inactive'
            },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            const user = await methods.FindSingleRecord("users", "_id", ObjectId(args.id), true);
            if (!user) {
                throw new GraphQLError('User not found')
            }
            if (args.status !== 'active' && args.status !== 'inactive') {
                throw new GraphQLError('Invalid status, it should be active or inactive')
            }
            if (args.status == 'inactive') {
                methods.DeleteRecord("AuthTokens", { "user_id": ObjectId(args.id) });
            }
            await methods.UpdateRecord("users", { "_id": ObjectId(args.id) }, { "status": args.status });
            return { msg: "User status updated successfully" };
        }
    },
    AdminActivateCard: {
        type: OutputMsg,
        description: 'Activate a Card for public use',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');

            args.unix_time = getTimestampOfComingMondayStartTime();
            const week_name = new Date(args.unix_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const week = await methods.FindOrCreateRecord("weeks", {"unix_time": args.unix_time}, {"name": week_name});
            const week_id = week._id;

            const card = await methods.FindSingleRecord("cards", "_id", ObjectId(args.id), true);
            if (!card) {
                throw new GraphQLError('Card not found')
            }
            if(args.unix_time < new Date().getTime()) throw new GraphQLError('Invalid unix time, it should be greater than current time');
            await methods.UpdateRecord("cards", { "_id": ObjectId(args.id) }, { "unix_time": parseInt(args.unix_time), "status": "live_awaiting", "week_id": ObjectId(week_id) });
            return { message: "Card activated successfully" };
        }
    },
    AdminDeactivateCard: {
        type: Card,
        description: 'Deactivate a Card for public use',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            
            const card = await methods.FindSingleRecord("cards", "_id", ObjectId(args.id), true);
            if (!card) {
                throw new GraphQLError('Card not found')
            }
            await methods.UpdateRecord("cards", { "_id": ObjectId(args.id) }, {"status": "inactive"});
            return card;
        }
    },
    AdminActivatePollCard: {
        type: OutputMsg,
        description: 'Activate a Poll Card for public use',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');

            args.unix_time = getTimestampOfComingMondayStartTime();
            const week_name = new Date(args.unix_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const week = await methods.FindOrCreateRecord("weeks", {"unix_time": args.unix_time}, {"name": week_name});
            const week_id = week._id;

            const poll = await methods.FindSingleRecord("polls", "_id", ObjectId(args.id), true);
            if (!poll) {
                throw new GraphQLError('Poll not found')
            }
            if (args.unix_time < new Date().getTime()) throw new GraphQLError('Invalid unix time, it should be greater than current time');
            await methods.UpdateRecord("polls", { "_id": ObjectId(args.id) }, { "unix_time": parseInt(args.unix_time), "status": "live_awaiting", "week_id": ObjectId(week_id) });
            return { message: "Poll activated successfully" };
        }
    },
    AdminDeactivatePollCard: {
        type: Poll,
        description: 'Deactivate a Poll Card for public use',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            inactive_reason: { type: GraphQLString },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');

            const poll = await methods.FindSingleRecord("polls", "_id", ObjectId(args.id), true);
            if (!poll) {
                throw new GraphQLError('Poll not found')
            }
            await methods.UpdateRecord("polls", { "_id": ObjectId(args.id) }, { "status": "inactive", "inactive_reason": args.inactive_reason });
            return poll;
        }
    },
    AdminClearRevSharePayments: {
        type: OutputMsg,
        description: 'Clear Rev Share Payment for a user',
        args: {
            paid_amount: { type: new GraphQLNonNull(GraphQLFloat) },
            payment_method: { type: new GraphQLNonNull(GraphQLString) },
            transaction_id: { type: GraphQLString },
            withrawl_request_id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const withrawl_request_details = await methods.FindSingleRecord("rev_share_withdrawal_requests", "_id", ObjectId(args.withrawl_request_id), true);
            if (!withrawl_request_details) {
                throw new GraphQLError('Withdrawal request not found')
            }
            if (withrawl_request_details.status != "pending") throw new GraphQLError('Withdrawal request is not pending');
            const user_id = withrawl_request_details.user_id;
            if (withrawl_request_details.amount != args.paid_amount) throw new GraphQLError('Paid amount does not match with withdrawal request amount');

            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');

            const user = await methods.FindSingleRecord("users", "_id", ObjectId(user_id), true);
            if (!user) {
                throw new GraphQLError('User not found')
            }
            methods.InsertRecord("rev_share_paid_history", {
                 "user_id": ObjectId(user_id),
                 "paid_amount": args.paid_amount,
                 "payment_method": args.payment_method,
                 "transaction_id": args.transaction_id,
                 "unix_time": new Date().getTime(),
            });
            methods.UpdateRecord("rev_share_withdrawal_requests", { "_id": ObjectId(args.withrawl_request_id) }, { "status": "cleared", "updated_at": new Date()}).then(async () => {
                let pending_user_earning_ids = await methods.FindRecord("rev_share_withdrawal_requests", { "_id": ObjectId(args.withrawl_request_id)}, true).then((res) => {
                    return res.pending_user_earning_ids
                })
                if (pending_user_earning_ids.length > 0) {
                    methods.UpdateRecord("user_earnings", { "_id": { $in: pending_user_earning_ids } }, { "status": "cleared", "payment_method": args.payment_method, "paid_at": new Date() });
                }
            })
            return { message: "Rev Share cleared successfully" };
        }
    },
    AdminMarkRevShareAsPaid: {
        type: OutputMsg,
        description: 'Mark Rev Share as paid',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_info = await methods.FindSingleRecord("users", "_id", ObjectId(isAuth.user_id));
            if (!user_info.is_admin) throw new GraphQLError('You are not authorized to perform this action');
            
            const withdrawal_request = await methods.FindSingleRecord("rev_share_withdrawal_requests", "_id", ObjectId(args.id), true);
            if (!withdrawal_request) {
                throw new GraphQLError('Withdrawal request not found')
            }
            if (withdrawal_request.status != "pending") throw new GraphQLError('Withdrawal request is not pending');
            methods.UpdateRecord("rev_share_withdrawal_requests", { "_id": ObjectId(args.id) }, { "status": "paid", "updated_at": new Date() });
            return { message: "Rev Share marked as paid successfully" };
        }
    }
}


module.exports = {
    queries,
    mutations
}