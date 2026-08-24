const graphql = require('graphql'); 
const { GenerateRandomString, ValidateUser, SignS3 } = require('../../core/functions')
const env = require('dotenv') 
env.config({ path: '.env' });  

const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt
} = graphql

const { S3Upload } = require('../types')

const queries = {
    GetS3PreSignedUrls:{
        type: S3Upload,
        description: "Use this endpoint to fetch PresignUrls before uploading it to S3, after fetching \"put\" url from response, you can use that url to upload file directly on S3 server. For more info just google \"How to upload file with S3 PreSign URL using Javascript/Swift/Java/Kotlin.\n\n\n In case you are confused with structure of this request just look over this image https://prnt.sc/1oig4yw \n\n\n After getting response from this endpoint, you can extract value of \"key\" and send it back to another GraphQL endpoints from where you can update / insert file or images on server (Remember any kind of upload is 2 Step-Process in our system) \n 1. Fetch Pre-Sign URL \n 2. Upload files directlly to S3 using PUT request \n 3. Check if it's uploaded successfully then send extracted key from first step to another GraphQL endpoint to update recrods on server.",
        args: {  
            fileNames: { 
                description:"This argument takes list/array of file names, so that you can generate multiple presign urls in 1 shot, in case you need", 
                type: new GraphQLList(new GraphQLNonNull(GraphQLString))
            }
        },
        resolve(parentValue, { fileNames }, context){
            return ValidateUser(context).then(result => {
                const user_id = result.user_id
                var key;
                var FolderName = new Date().toLocaleDateString().replace(/\//g, "-");
                var S3UploadProps = [] 
                for(i in fileNames){ 
                    key = 'uploads/'+user_id+'/'+GenerateRandomString(9)+'-'+fileNames[i] 
                    var urls = {}
                    urls["file"] = fileNames[i]
                    urls["key"] = key
                    urls["put"] = SignS3('putObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                    urls["delete"] = SignS3('deleteObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                    urls["get"] = SignS3('getObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                    S3UploadProps.push(urls)
                } 
                return {"urls": S3UploadProps}
            }).catch(err => {
                return new Error(err.message)
            })
        }
    },
    GetS3PreSignedUrlPublicUpload:{
        type: S3Upload,
        description: "Use this endpoint to fetch PresignUrls before uploading it to S3, after fetching \"put\" url from response, you can use that url to upload file directly on S3 server. For more info just google \"How to upload file with S3 PreSign URL using Javascript/Swift/Java/Kotlin.\n\n\n In case you are confused with structure of this request just look over this image https://prnt.sc/1oig4yw \n\n\n After getting response from this endpoint, you can extract value of \"key\" and send it back to another GraphQL endpoints from where you can update / insert file or images on server (Remember any kind of upload is 2 Step-Process in our system) \n 1. Fetch Pre-Sign URL \n 2. Upload files directlly to S3 using PUT request \n 3. Check if it's uploaded successfully then send extracted key from first step to another GraphQL endpoint to update recrods on server.",
        args: {
            fileNames: {
                description:"This argument takes list/array of file names, so that you can generate multiple presign urls in 1 shot, in case you need",
                type: new GraphQLList(new GraphQLNonNull(GraphQLString))
            },
        },
        resolve(parentValue, { fileNames }, context){
            var S3UploadProps = []
            for(i in fileNames){
                key = 'uploads/card_responses/'+GenerateRandomString(9)+'-'+fileNames[i]
                var urls = {}
                urls["file"] = fileNames[i]
                urls["key"] = key
                urls["put"] = SignS3('putObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                urls["delete"] = SignS3('deleteObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                urls["get"] = SignS3('getObject', process.env.AWS_S3_BUCKET, key, 60 * 5)
                S3UploadProps.push(urls)
            }
            return {"urls": S3UploadProps}
        }
    }
 }

module.exports = {
    queries
}