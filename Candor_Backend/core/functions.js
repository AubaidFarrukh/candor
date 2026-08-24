const db = require("./db").db;
const { ObjectId } = require("mongodb");
const sgMail = require("@sendgrid/mail");
const AWS = require("aws-sdk");
const s3ParseUrl = require("s3-url-parser");
const env = require("dotenv");
const flatCache = require("flat-cache");
exports.Cache = require("./Cache");
const FCM = require("fcm-node");
const { RedisPubSub } = require("graphql-redis-subscriptions");

const fcm = new FCM(process.env.FCM_SERVER_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// connection timeout for redis pubsub
exports.pubsub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST,
  },
  timeout: 1000,
});

exports.sendEmail = function (email, subject, message) {
  return new Promise(async (resolve, reject) => {
    const totalMsgSendInLast10Min = await exports.methods.countRecord(
      "sentEmailsLogs",
      {
        email: email,
        time: {
          $gte: new Date(new Date().getTime() - 600000).getTime(),
        },
      }
    );

    if (totalMsgSendInLast10Min >= 10) {
      if (!supressError) {
        throw new Error("You can send only 10 emails in 10 minutes.");
      }
      return false;
    }

    //TODO: complete check for same email messages in 24hrs
    const obj = {
      to: email,
      from: {
        name: "Candor",
        email: process.env.SENDGRID_EMAIL,
      },
      subject: subject,
      html: message,
    };
    sgMail
      .send(obj)

      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

// For download / view
exports.s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

// For Upload
exports.s3Upload = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
  useAccelerateEndpoint: true,
});

exports.SignS3 = function (operation, bucketName, fileName, expiryTime) {
  return new Promise((resolve, reject) => {
    const extension = fileName.split(".").pop();
    if (operation === "putObject" || operation === "deleteObject") {
      exports.s3Upload.getSignedUrl(
        operation,
        {
          Bucket: bucketName,
          Key: fileName,
          Expires: expiryTime,
        },
        function (err, data) {
          if (err) resolve(err);
          resolve(data);
        }
      );
    } else {
      let dat = {
        Bucket: bucketName,
        Key: fileName,
        Expires: expiryTime,
        ResponseContentType: exports.ExtensionToMimeType(extension),
        ResponseContentDisposition: `inline; filename="${fileName}"`,
      };
      exports.s3.getSignedUrl(operation, dat, function (err, data) {
        if (err) resolve(err);
        if (typeof data === undefined) resolve(null);
        const S3domain = data.split("/")[2];
        data = data.replace(S3domain, process.env.CLOUDFRONT_DOMAIN);
        resolve(data);
      });
    }
  });
};

exports.ExtensionToMimeType = function (extension) {
  const MIME_TYPES = {
    move: "video/quicktime",
    mp4: "video/mp4",
    m4v: "video/mp4",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/m4a",
  };
  return MIME_TYPES[extension];
};

exports.EmptyS3Folder = function (folderName) {
  return new Promise((resolve, reject) => {
    exports.s3.listObjectsV2(
      {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: folderName,
        MaxKeys: 10000000,
      },
      function (err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject(err);
        } else {
          if (data.Contents.length > 0) {
            const deleteParams = {
              Bucket: process.env.AWS_S3_BUCKET,
              Delete: {
                Objects: [],
                Quiet: false,
              },
            };
            data.Contents.forEach(function (content) {
              deleteParams.Delete.Objects.push({ Key: content.Key });
            });
            deleteParams.Delete.Objects.push({ Key: folderName });
            exports.s3.deleteObjects(deleteParams, function (err, data) {
              if (err) {
                console.log(err, err.stack); // an error occurred
                reject(err);
              } else {
                resolve(data);
              }
            });
          } else {
            resolve(data);
          }
        }
      }
    );
  });
};

exports.methods = {
  CreateIndex: function (collection, obj) {
    db.then(function (db) {
      db.collection(collection).createIndex(obj, { unique: true });
    });
  },
  InsertRecord: async function (collection, obj) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).insertOne(obj, function (err, response) {
          if (err) {
            reject(err);
          } else {
            obj._id = response.insertedId;
            resolve(obj);
          }
        });
      });
    });
  },
  BulkInsertRecord: async function (collection, obj) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).insertMany(obj, function (err, response) {
          if (err) {
            reject(err);
          } else {
            const insertedIds = response.insertedIds;
            for (var i = 0; i < insertedIds.length; i++) {
              obj[i]._id = insertedIds[i];
            }
            resolve(obj);
          }
        });
      });
    });
  },
  FindSingleRecord: function (
    collection,
    identifier,
    value,
    ignoreCache = false
  ) {
    const startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      var obj = {};
      if (typeof value === "undefined") {
        reject(
          new Error("FindSingleRecord function error, Value is required!")
        );
      }
      if (identifier == "_id") {
        obj = { _id: ObjectId(value) };
      } else {
        obj[identifier] = value;
      }
      let CacheKey = `${collection}${identifier}${JSON.stringify(value)}`;
      // remove all special chars from key but not underscore
      CacheKey = CacheKey.replace(/[^a-zA-Z0-9]/g, "");
      const response = exports.getCache(CacheKey);
      if (response !== undefined && !ignoreCache) {
        const endTime = new Date().getTime();
        resolve(response);
      } else {
        db.then(function (db) {
          db.collection(collection).findOne(obj, function (err, response) {
            if (err) resolve(err);
            if (!ignoreCache) {
              exports.setCache(CacheKey, response);
            }
            const endTime = new Date().getTime();
            resolve(response);
          });
        });
      }
    });
  },
  FindRecordByMultipleFields: function (collection, obj) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).findOne(obj, function (err, response) {
          if (err) resolve(err);
          resolve(response);
        });
      });
    });
  },
  FindDistinctRecords: function (collection, field, obj) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).distinct(
          field,
          obj,
          function (err, response) {
            if (err) resolve(err);
            resolve(response);
          }
        );
      });
    });
  },
  FindMultipleRecord: function (collection, identifier, value) {
    return new Promise((resolve, reject) => {
      var obj = {};
      var NewValue = [];
      if (value.constructor === Array) {
        value.forEach(function (val) {
          NewValue.push(ObjectId(val));
        });
      } else {
        NewValue.push(ObjectId(value));
      }
      obj[identifier] = { $in: NewValue };
      db.then(function (db) {
        db.collection(collection)
          .find(obj)
          .toArray(function (err, response) {
            if (err) resolve(err);
            resolve(response);
          });
      });
    });
  },
  ListRecords: function (
    collection,
    searchObj,
    limit = 10,
    page = 0,
    sortLogic = null
  ) {
    return new Promise((resolve, reject) => {
      const offsetValue = limit * page;
      if (sortLogic === null) {
        sortLogic = { $natural: -1 };
      }
      db.then(function (db) {
        db.collection(collection)
          .find(searchObj)
          .sort(sortLogic)
          .limit(limit)
          .skip(offsetValue)
          .toArray(function (err, response) {
            if (err) resolve(err);
            resolve(response);
          });
      });
    });
  },
  ListAggregateRecords: function (
    collection,
    searchObj,
    limit = 10,
    page = 0,
    sortLogic = null,
    random = false
  ) {
    return new Promise((resolve, reject) => {
      const offsetValue = limit * page;
      db.then(function (db) {
        const query = [
          { $match: searchObj },
          { $skip: offsetValue },
          { $limit: limit },
        ];
        if (random) {
          query.push({ $sample: { size: limit } });
        }
        if (sortLogic !== null) {
          query.push({ $sort: sortLogic });
        }
        db.collection(collection)
          .aggregate(query)
          .toArray(function (err, response) {
            if (err) resolve(err);
            resolve(response);
          });
      });
    });
  },
  AggregateRecords: function (collection, searchObj, limit = 10, page = 0) {
    return new Promise((resolve, reject) => {
      const offsetValue = limit * page;
      db.then(function (db) {
        db.collection(collection)
          .aggregate(searchObj)
          .limit(limit)
          .skip(offsetValue)
          .toArray(function (err, response) {
            if (err) resolve(err);
            resolve(response);
          });
      });
    });
  },
  IncrementRecord: function (collection, searchObj, field, value) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).updateOne(
          searchObj,
          { $inc: { [field]: value } },
          function (err, response) {
            if (err) resolve(err);
            resolve(response);
          }
        );
      });
    });
  },
  UpdateRecord: function (collection, SearchObj, ValueObj) {
    return new Promise((resolve, reject) => {
      var obj = {},
        CacheKey = null;
      if (SearchObj.hasOwnProperty("_id")) {
        obj = { _id: ObjectId(SearchObj["_id"]) };
        CacheKey = `${collection}_id${SearchObj["_id"].toString()}`;
      } else {
        obj = SearchObj;
      }
      db.then(function (db) {
        db.collection(collection).updateMany(
          obj,
          { $set: ValueObj },
          function (err, response) {
            if (err) {
              resolve(err);
            } else {
              CacheKey ? exports.DeleteCache(CacheKey) : null;
              db.collection(collection).findOne(obj, function (err, response) {
                if (err) resolve(err);
                resolve(response);
                console.log(response);
              });
            }
          }
        );
      });
    });
  },
  FindOrCreateRecord: function (collection, SearchObj, ValueObj) {
    return new Promise((resolve, reject) => {
      var obj = {};
      if (SearchObj.hasOwnProperty("_id")) {
        obj = { _id: ObjectId(SearchObj["_id"]) };
      } else {
        obj = SearchObj;
      }
      db.then(function (db) {
        db.collection(collection).updateOne(
          obj,
          { $set: ValueObj },
          { upsert: true },
          function (err, response) {
            if (err) {
              resolve(err);
            } else {
              db.collection(collection).findOne(obj, function (err, response) {
                if (err) resolve(err);
                resolve(response);
              });
            }
          }
        );
      });
    });
  },
  DeleteRecord: function (collection, SearchObj) {
    return new Promise((resolve, reject) => {
      var obj = {};
      if (SearchObj.hasOwnProperty("_id")) {
        obj = { _id: ObjectId(SearchObj["_id"]) };
      } else {
        obj = SearchObj;
      }
      db.then(function (db) {
        db.collection(collection).deleteOne(obj, function (err, response) {
          if (err) resolve(err);
          resolve(response);
        });
      });
    });
  },
  isRecordExist: function (collection, identifier, value) {
    return new Promise((resolve, reject) => {
      var obj = {};
      if (identifier == "_id") {
        obj = { _id: ObjectId(value) };
      } else {
        obj[identifier] = value;
      }
      db.then(function (db) {
        db.collection(collection).count(obj, function (err, count) {
          if (count > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  },
  countRecord: function (collection, identifier, value) {
    return new Promise((resolve, reject) => {
      var obj = {};
      if (identifier == "_id") {
        obj = { _id: ObjectId(value) };
      } else {
        obj[identifier] = value;
      }
      db.then(function (db) {
        db.collection(collection).count(obj, function (err, count) {
          if (count > 0) {
            resolve(count);
          } else {
            resolve(0);
          }
        });
      });
    });
  },
  countDocuments: function (collection, query = {}) {
    return new Promise((resolve, reject) => {
      db.then(function (db) {
        db.collection(collection).countDocuments(query, function (err, count) {
          if (err) resolve(err);
          resolve(count);
        });
      });
    });
  },
};

exports.ModifyTextParams = function (text, ReplaceWith) {
  if (text) {
    text = text.replace(/@\[FIRST_NAME\]/g, ReplaceWith.name.split(" ")[0]);
    text = text.replace(/@\[FULL_NAME\]/g, ReplaceWith.name);
    text = text.replace(/@\[USERNAME\]/g, ReplaceWith.username);
  }
  return text;
};

exports.sendPushNotification = async function (
  userId,
  title,
  body,
  data,
  notificationType
) {
  const user = await exports.methods.FindSingleRecord(
    "users",
    "_id",
    ObjectId(userId)
  );
  let fcmTokens = [];
  if (user.fcm_token_android) {
    fcmTokens.push(user.fcm_token_android);
  }
  if (user.fcm_token_ios) {
    fcmTokens.push(user.fcm_token_ios);
  }
  for (let i = 0; i < fcmTokens.length; i++) {
    const message = {
      to: fcmTokens[i],
      sound: "default",
      notification: {
        title: title,
        body: body,
        notificationType: notificationType,
        data: data,
        sound: "default",
      },
      notificationType: notificationType,
      data: data,
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log(err);
      }
    });
  }
};

exports.sendNotification = async function (
  receiverId,
  title,
  message,
  type,
  referenceId,
  data,
  image,
  sendPush = true,
  InsertNotification = true
) {
  return new Promise(async (resolve, reject) => {
    receiverId = ObjectId(receiverId);
    referenceId = ObjectId(referenceId);
    let notification = {
      type: type,
      text: message,
      image: image,
      data: data,
      receiver: receiverId,
      referenceId: referenceId,
      time: new Date().getTime(),
    };
    if (sendPush) {
      exports.sendPushNotification(receiverId, title, message, data, type);
    }
    if (InsertNotification) {
      exports.methods
        .InsertRecord("Notifications", notification)
        .then((response) => {
          resolve(response);
        });
    }
  });
};

exports.getTimestampOfComingMondayStartTime = function () {
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + ((8 - currentDate.getDay()) % 7));
  currentDate.setHours(0, 0, 0, 0);
  return currentDate.getTime();
};

exports.getTimestampOfCurrentMondayStartTime = function () {
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  currentDate.setHours(0, 0, 0, 0);
  return currentDate.getTime();
};

exports.getTimestampOfComingSundayStartTime = function (timestamp) {
  const date = new Date(timestamp);
  const dayOfWeek = date.getUTCDay();
  const daysUntilSunday = 7 - dayOfWeek;
  date.setUTCDate(date.getUTCDate() + daysUntilSunday);
  const nextSundayTimestamp = date.getTime();
  return nextSundayTimestamp;
};

exports.getTimestampOfCurrentSundayStartTimeFromTimestamp = function (
  timestamp
) {
  var currentDate = new Date(timestamp);
  currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  currentDate.setHours(0, 0, 0, 0);
  return currentDate.getTime();
};

exports.getSaturdayEnd = function (timestamp) {
  var date = new Date(timestamp);
  var saturday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - date.getDay() + 6
  );
  var saturdayEnd = new Date(
    saturday.getFullYear(),
    saturday.getMonth(),
    saturday.getDate(),
    23,
    59,
    59,
    999
  );
  return saturdayEnd.getTime();
};

exports.ValidateUser = function (context) {
  context.req = context.req || context.request;
  const authorization = context.req.headers.authorization;
  if (
    authorization &&
    authorization.split(" ")[0] == "Bearer" &&
    authorization.split(" ")[1]
  ) {
    return new Promise((resolve, reject) => {
      return exports.methods
        .FindSingleRecord("AuthTokens", "token", authorization.split(" ")[1])
        .then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject(new Error("User Session Expired or Invalid!"));
          }
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      reject(
        new Error("You need to provide Bearer Token in authorization header.")
      );
    });
  }
};

exports.setCache = function (key, value, expiry = 60) {
  let isCacheValueAvailable = false;
  if (value !== false) {
    isCacheValueAvailable =
      value !== null && value !== undefined && value != "";
  }
  {
    isCacheValueAvailable = true;
  }
  if (isCacheValueAvailable) {
    exports.cache = new exports.Cache(
      key,
      __dirname + "/../.cached/" + key.substring(0, 3),
      expiry
    );
    exports.cache.setKey(key, value);
    exports.cache.save();
  }
};
exports.getCache = function (key) {
  // key first 3 characters are used to determine the cache type
  exports.cache = new exports.Cache(
    key,
    __dirname + "/../.cached/" + key.substring(0, 3)
  );
  return exports.cache.getKey(key);
};
exports.DeleteCache = function (key) {
  exports.cache = new exports.Cache(
    key,
    __dirname + "/../.cached/" + key.substring(0, 3)
  );
  exports.cache.removeKey(key);
  flatCache.clearCacheById(key);
  exports.cache.save();
};
exports.DeleteCacheByRegex = async function (regex) {
  // extract text from regex
  const regexText = regex.toString().match(/\/(.*)\/(.*)/)[1];
  const guessedKey = regexText.replace(/[^a-zA-Z ]/g, "");
  exports.cache = new exports.Cache(
    "",
    __dirname + "/../.cached/" + guessedKey.substring(0, 3)
  );
  let CacheKeys = await exports.cache.listKeys();
  for (let i = 0; i < CacheKeys.length; i++) {
    if (CacheKeys[i].match(regex)) {
      exports.DeleteCache(CacheKeys[i]);
    }
  }
};

exports.GenerateRandomString = function (length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
