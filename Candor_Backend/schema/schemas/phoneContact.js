const graphql = require('graphql')
const { phone } = require('phone')
const { methods, ValidateUser,  GenerateRandomString } = require('../../core/functions') 
const { ObjectId } = require('mongodb')
const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLList,
    GraphQLInt
} = graphql
const { PhoneContact, PhoneContactList, OutputMsg } = require('../types')

const queries = {
    PhoneContactList: {
        type: GraphQLList(PhoneContact),
        args: {
            limit: { type: GraphQLInt },
            page: { type: GraphQLInt },
            query: { type: GraphQLString },
            type: { type: GraphQLString }
        },
        resolve: async (parent, args, context) => {
            const auth = await ValidateUser(context).catch(err => {
                return new Error(err.message)
            });
            if(args.type!=undefined && args.type!="AppUsers" && args.type!="nonAppUsers"){
                return Error("Invalid type, valid types are AppUsers and nonAppUsers")
            }
            let searchQuery = {
                "uploadedBy": auth.user_id.toString(),
            }
            if(args.type=="AppUsers"){
                searchQuery["user"] = { $ne: null }
            }else if(args.type=="nonAppUsers"){
                searchQuery["user"] = null
            }
            if(args.query){
                searchQuery["name"] = {
                    $regex: new RegExp(args.query),  
                    $options: "i"
                };
            }
            return methods.ListRecords('phoneContacts', searchQuery, args.limit, args.page);
        }
    }
 }

 const mutations = {
    UploadPhoneContact: {
        type: PhoneContactList,
        description: 'You need to send contact details as an argument in array form, whenever you\'ll upload contact all previous contacts will be deleted and will be replaced with new one.',
        args: {
            name: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
            phone: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
            email: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
        },
        async resolve(parent, args, context){
            const result = await ValidateUser(context);
            let newContact = [];
            user_id = result.user_id;
            let UserInfo = await methods.FindSingleRecord("users", "_id", user_id);
            // get country code from user profile and add it to phone number
            //strip country code from user phone number
            let userPhone = ""
            let userCountryCode = userPhone.substring(0, userPhone.length - 10);
            if(args.name.length === args.phone.length && args.name.length === args.email.length){
                for(let i = 0; i < args.name.length; i++){
                    // remove all brackets, white spaces from phone number
                    let phoneNumber = args.phone[i].replace(/[\(\)\s-]/g, '');
                    if(phoneNumber.length > 0 && phoneNumber.charAt(0) !== '+'){
                        phoneNumber = userCountryCode + phoneNumber;
                    }
                    let phoneNumberProps = phone(phoneNumber);
                    if(phoneNumber !== '' && phoneNumberProps['isValid']){
                        const foundAccount = await methods.FindSingleRecord("users", "phone", phoneNumber);
                        newContact.push({
                            name: args.name[i],
                            phone: phoneNumber,
                            email: args.email[i],
                            countryCode: phoneNumberProps['countryIso2'],
                            uploadedBy: user_id.toString(),
                            user: foundAccount ? foundAccount._id.toString() : null,
                        })
                    }
                }
                return methods.DeleteRecord("phoneContacts", {"uploadedBy": user_id}).then(() => {
                    return methods.BulkInsertRecord("phoneContacts", newContact).then(res => {
                        return res;
                    })
                })
            }else{
                throw new Error('You need to provide same number of records for name, email and phone, If a value is not there, then you need to provide blank value like "" in array or list.');
            }
        }
    }
 }

module.exports = {
    queries,
    mutations
}