const graphql = require('graphql')
const { methods, GenerateRandomString, ValidateUser, sendEmail, sendNotification } = require('../../core/functions');
const appleReceiptVerify = require('node-apple-receipt-verify');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs')
const env = require('dotenv');
env.config({ path: '.env' });  

appleReceiptVerify.config({
    environment: [process.env.APPLE_RECEIPT_ENV],
    secret: process.env.APPLE_RECEIPT_SECRET,
});

const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLError,
    GraphQLBoolean,
    GraphQLList,
    GraphQLInt
} = graphql

const { User, OutputMsg, REV_SHARE_PAYMENT_REQUESTS } = require('../types');

const queries = {
    User: {
        type: User,
        description: 'Get User by ID Mongo',
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            return methods.FindSingleRecord('users', "_id", ObjectId(args.id), true);
        }
    },
    LoginUser: {
        type: User,
        description: 'Login User',
        args: {
            email: { type: new GraphQLNonNull(GraphQLString) },
            password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            args.email = args.email.toLowerCase();
            const user = await methods.FindSingleRecord('users', "email", args.email, true);
            if (!user) {
                throw new GraphQLError('User not found')
            }
            if (user.status == "inactive") {
                methods.UpdateRecord("users", {"_id": user._id}, {"status": "active"});
            }
            const is_password_valid = await bcrypt.compare(args.password, user.password);
            if (!is_password_valid) {
                throw new GraphQLError('Invalid password')
            }
            const auth_token = GenerateRandomString(32);
            await methods.InsertRecord("AuthTokens", {"token": auth_token, "user_id": user._id, "time": new Date().getTime()});
            return {
                ...user,
                auth_token
            }
        }
    },
    ListRevSharePaymentRequests: {
        type: new GraphQLList(REV_SHARE_PAYMENT_REQUESTS),
        description: 'List Rev Share Payment Requests',
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            return methods.ListRecords('rev_share_payment_requests', {
                "user_id": ObjectId(isAuth.user_id),
                "status": "pending"
            }, args.limit, args.page);
        }
    },
}

const mutations = {
    UpdateUserPaymentStatus: {
        type: OutputMsg,
        description: 'Update User Payment Status',
        args: {
            is_premium: { type: new GraphQLNonNull(GraphQLBoolean) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            return methods.UpdateRecord('users', {"_id": user_id}, {"is_premium": args.is_premium}).then(() => {
                return {
                    status: "success",
                    message: "User payment status updated"
                }
            });
        }
    },
    CreateUser: {
        type: User,
        description: 'Create User',
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            phone: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            birthday: { type: new GraphQLNonNull(GraphQLString) },
            password: { type: new GraphQLNonNull(GraphQLString) },
            referral: { type: GraphQLString },
        },
        resolve: async (parent, args, context) => {
            args.email = args.email.toLowerCase();
            const pass_hash = await bcrypt.hash(args.password, 10)
            // random 4 digit number
            const random_username = args.name.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * (9999 - 1000) + 1000);
            const is_user_exist = await methods.FindSingleRecord('users', "email", args.email, true);
            if (is_user_exist) {
                throw new GraphQLError('User already exist')
            }
            const auth_token = GenerateRandomString(32);
            const user = await methods.InsertRecord('users', {
                name: args.name,
                phone: args.phone,
                email: args.email,
                birthday: args.birthday,
                password: pass_hash,
                username: random_username,
                status: "active",
                referral: args.referral,
            }).then(async (user) => {
                await methods.InsertRecord("AuthTokens", {"token": auth_token, "user_id": user._id });
                return {
                    ...user,
                    auth_token
                }
            })
            return user
        }
    },
    UpdateUserFCMToken: {
        type: OutputMsg,
        description: 'Use this to update the user\'s FCM Token',
        args: {
            fcm_token: { type: new GraphQLNonNull(GraphQLString) },
            device: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve(parentValue, args, context){
            return ValidateUser(context).then(result => {
                // allowed device types: android, ios
                if(args.device != "android" && args.device != "ios"){
                    throw new GraphQLError('Invalid device type')
                }
                if (args.device == "android") {
                    methods.UpdateRecord("users", {"_id": result.user_id}, {"fcm_token_android": args.fcm_token});
                } else {
                    methods.UpdateRecord("users", {"_id": result.user_id}, {"fcm_token_ios": args.fcm_token});
                }
                return {
                    status: "success",
                    message: "FCM Token Updated"
                }
            })
        }
    },
    UpdateUser: {
        type: User,
        description: 'Update User',
        args: {
            name: { type: GraphQLString },
            phone: { type: GraphQLString },
            email: { type: GraphQLString },
            birthday: { type: GraphQLString },
            username: { type: GraphQLString },
            snapchat_name: { type: GraphQLString },
            snapchat_bitmoji: { type: GraphQLString },
        },
        resolve: async (parent, args, context) => {
            if(args.email){
                args.email = args.email.toLowerCase();
            }
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            const data = {
                ...user,
                ...args
            }
            const updated_user = await methods.UpdateRecord('users', {"_id": user_id}, data, true);
            return updated_user
        }
    },
    UpdatePassword: {
        type: OutputMsg,
        description: 'Update Password',
        args: {
            old_password: { type: new GraphQLNonNull(GraphQLString) },
            new_password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            const is_password_valid = await bcrypt.compare(args.old_password, user.password);
            if (!is_password_valid) {
                throw new GraphQLError('Invalid password')
            }
            const pass_hash = await bcrypt.hash(args.new_password, 10)
            await methods.UpdateRecord('users', {"_id": user_id}, {"password": pass_hash});
            return { status: "success", message: "Password updated successfully" }
        }
    },
    SendForgotPasswordResetEmail: {
        type: OutputMsg,
        args:{
            email: { type: GraphQLString }
        },
        description: "This endpoint sends an email to user's email address to reset password.",
        resolve: async(parentValue, args) => {
            args.email = args.email.toLowerCase();
            return new Promise((resolve, reject) => {
                methods.FindSingleRecord("users", "email", args.email).then(user => {
                    if(user){
                        const otp = Math.floor(Math.random() * (999999 - 100000) + 100000)
                        methods.UpdateRecord("users", {"_id": user._id}, {"pass_reset_otp": otp, "reset_pass_token_time": new Date().getTime()}).then(() => {
                            const subject = "🔐 Password reset request for Candor Account"
                            const body = `
                                <p>Hi ${user.name},</p>
                                <p>You have requested to reset your password for Candor Account.</p>
                                <p>Your OTP for resetting your password is</p>
                                <p><center><h3>${otp}</h3></center></p>
                                <p>If you did not request to reset your password, please ignore this email.</p>
                                <p>Thanks,</p>
                                <p>Candor Team</p>
                            `
                            sendEmail(user.email, subject, body).then((resp) => {
                                resolve({
                                    status: "success",
                                    message: "Email sent successfully!"
                                })
                            }).catch(err => {
                                reject({
                                    status: "error",
                                    message: "Email sending failed!"
                                })
                            })
                        })
                    }else{
                        reject("User not found")
                    }
                })
            }).catch(err => {
                throw new Error(err)
            })
        }
    },
    ChangePasswordWithPasswordReset: {
        type: OutputMsg,
        args:{
            otp: { type: new GraphQLNonNull(GraphQLInt) },
            password: { type: new GraphQLNonNull(GraphQLString) }
        },
        description: "This endpoint validates reset OTP sent from mutation SendForgotPasswordResetEmail",
        resolve: async(parentValue, args) => {
            return new Promise((resolve, reject) => {
                methods.FindSingleRecord("users", "pass_reset_otp", args.otp, true).then(user => { 
                    if(user){
                        if(user.reset_pass_token_time > new Date().getTime() - (1000 * 60 * 60 * 15)){
                            bcrypt.hash(args.password, 10, function(err, hash) {
                                user.password = hash
                                methods.UpdateRecord("users", {"_id": ObjectId(user._id)}, {"password": hash, "pass_reset_otp": "", "reset_pass_token_time": ""})
                                resolve({
                                    status: "success",
                                    message: "Password Changed successfully!"
                                })
                            });
                        }else{
                            reject({
                                status: "error",
                                message: "Please request a new password reset request."
                            })
                        }
                    }else{
                        reject({
                            status: "error",
                            message: "Invalid OTP provided"
                        })
                    }
                })
            }).catch(err => {
                throw new Error(err.message)
            })
        }
    },
    DeleteAccount: {
        type: OutputMsg,
        description: 'Delete Account',
        args: {
            password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            const is_password_valid = await bcrypt.compare(args.password, user.password);
            if (!is_password_valid) {
                throw new GraphQLError('Invalid password')
            }
            // Schedule account delete after 6 months
            const delete_time = new Date().getTime() + (1000 * 60 * 60 * 24 * 30 * 6)
            await methods.UpdateRecord('users', {"_id": user_id}, {"delete_scheduled_time": delete_time, "status": "inactive"});
            return { status: "success", message: "Account delete scheduled successfully" }
        }
    },
    MarkUserAsPaid: {
        type: OutputMsg,
        description: 'Mark User as Paid',
        args: {
            is_trial: { type: GraphQLBoolean },
            apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
            restore: { type: GraphQLBoolean }
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);

            if(user.is_premium){
                throw new GraphQLError('User is already paid')
            }

            try {
                methods.InsertRecord('apple_receipts_log', {
                    "user_id": user_id,
                    "receipt": args.apple_receipt,
                    "created_at": new Date(),
                    "via": "mark_user_as_paid"
                })
                const response = await appleReceiptVerify.validate({
                    'receipt': args.apple_receipt,
                });
                const filteredReceipts = response.filter((receipt) => {
                    return receipt.productId === "cd_6699_1y" || receipt.productId === "cd_699_1m" || receipt.productId === "cd_399_1w";
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
                if (sortedReceipts.length > 0) {
                    const transactionId = sortedReceipts[0].transactionId;
                    if(args.restore !== undefined && !args.restore) {
                        let transactionSearch = await methods.countDocuments('users', {
                            "subscription_payload.transactionId": transactionId
                        });
                        if (transactionSearch > 0) {
                            return {
                                status: "error",
                                message: "Transaction already exists"
                            }
                        }
                    }
                }

                return methods.UpdateRecord('users', {
                    "_id": user_id
                }, {
                    is_premium: true,
                    purchased_at: response[0].purchaseDate,
                    subscription_payload: sortedReceipts[0],
                    was_premium: false,
                    is_trial: args.is_trial,
                }).then(() => {
                    methods.InsertRecord("payment_transactions", {
                        "user_id": user_id,
                        "transactionId":  sortedReceipts[0].transactionId,
                        "productId": sortedReceipts[0].productId,
                        "purchaseDate": sortedReceipts[0].purchaseDate,
                        "created_at": new Date(),
                    });
                    return {
                        status: "success",
                        message: "User marked as paid successfully"
                    }
                })
            } catch (error) {
                throw new GraphQLError(error.message)
            }
        }
    },
    MarkUserAsPaidAndroid: {
        type: OutputMsg,
        description: 'Mark User as Paid',
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            if(user.is_premium){
                throw new GraphQLError('User is already paid')
            }

            return methods.UpdateRecord('users', {
                "_id": user_id
            }, {
                is_premium: true,
                purchased_at: new Date(),
                subscription_payload: {},
                was_premium: false,
            }).then(() => {
                return {
                    status: "success",
                    message: "User marked as paid successfully"
                }
            })
        }
    },
    MarkUserDonationAsPaid: {
        type: OutputMsg,
        description: 'Mark User Donation as Paid',
        args: {
            apple_receipt: { type: new GraphQLNonNull(GraphQLString) },
            restore: { type: GraphQLBoolean }
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);

            if(user.is_donated){
                throw new GraphQLError('User is already paid')
            }

            try {
                methods.InsertRecord('apple_receipts_log', {
                    "user_id": user_id,
                    "receipt": args.apple_receipt,
                    "created_at": new Date(),
                    "via": "mark_user_donation_as_paid"
                });
                const response = await appleReceiptVerify.validate({
                    'receipt': args.apple_receipt,
                });
                const filteredReceipts = response.filter((receipt) => {
                    return receipt.productId === "cdds_199_wk" || receipt.productId === "cdds_399_1m" || receipt.productId === "cdds_699_yl";
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
                if (sortedReceipts.length > 0) {
                    const transactionId = sortedReceipts[0].transactionId;
                    if(args.restore !== undefined && !args.restore) {
                        let transactionSearch = await methods.countDocuments('users', {
                            "donation_subscription_payload.transactionId": transactionId
                        });
                        if (transactionSearch > 0) {
                            return {
                                status: "error",
                                message: "Transaction already exists"
                            }
                        }
                    }
                }

                return methods.UpdateRecord('users', {
                    "_id": user_id
                }, {
                    is_donated: true,
                    donation_purchased_at: response[0].purchaseDate,
                    donation_subscription_payload: sortedReceipts[0],
                    was_donated: false,
                }).then(() => {
                    methods.InsertRecord("payment_transactions", {
                        "user_id": user_id,
                        "transactionId":  sortedReceipts[0].transactionId,
                        "productId": sortedReceipts[0].productId,
                        "purchaseDate": sortedReceipts[0].purchaseDate,
                        "created_at": new Date(),
                    });
                    return {
                        status: "success",
                        message: "User Donation marked as paid successfully"
                    }
                })
            } catch (error) {
                throw new GraphQLError(error.message)
            }
        }
    },
    MarkUserDonationAsPaidAndroid: {
        type: OutputMsg,
        description: 'Mark User Donation as Paid',
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            if(user.is_donated){
                throw new GraphQLError('User is already paid')
            }

            return methods.UpdateRecord('users', {
                "_id": user_id
            }, {
                is_donated: true,
                donation_purchased_at: new Date(),
                donation_subscription_payload: {},
                was_donated: false,
            }).then(() => {
                return {
                    status: "success",
                    message: "User Donation marked as paid successfully"
                }
            })
        }
    },
    CreateRevShareWithdrawalRequest: {
        type: OutputMsg,
        description: 'Create Rev Share Withdrawal Request',
        args: {
            payment_method: { type: new GraphQLNonNull(GraphQLString) },
            payment_details: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args, context) => {
            const isAuth = await ValidateUser(context);
            const user_id = ObjectId(isAuth.user_id);
            const user = await methods.FindSingleRecord('users', "_id", user_id, true);
            const pending_amount_ids = await methods.ListRecords('user_earnings', {
                user_id: user_id,
                status: "payout_pending"
            }, 10000);
            const pending_user_earning_ids = pending_amount_ids.map((earning) => {
                return earning._id;
            });
            const total_pending_amount = pending_amount_ids.reduce((total, earning) => {
                return total + earning.amount;
            }, 0);
            const already_pending_request = await methods.FindRecordByMultipleFields('rev_share_withdrawal_requests', {
                user_id: user_id,
                status: "pending"
            });
            if(already_pending_request && already_pending_request?.length > 0){
                throw new GraphQLError('You can only have one pending withdrawal request at a time')
            }
            await methods.InsertRecord('rev_share_withdrawal_requests', {
                user_id: user_id,
                amount: total_pending_amount,
                payment_method: args.payment_method,
                payment_details: args.payment_details,
                pending_user_earning_ids: pending_user_earning_ids,
                status: "pending",
                created_at: new Date(),
                updated_at: new Date()
            })
            return {
                status: "success",
                message: "Withdrawal request created successfully"
            }
        }
    },
}


module.exports = {
    queries,
    mutations
}