// const shareToInstaVideo = async (videouri: any) => {
//   const uri = Platform.OS === "android" ? "file://" + videouri : videouri;

//   Clipboard.setStringAsync(link).then(async () => {
//     try {
//       if (Platform.OS === "android") {
//         Share.shareSingle({
//           social: Social.InstagramStories,
//           backgroundVideo: uri,
//           backgroundBottomColor: Colors.CANDOR_BLACK,
//           backgroundTopColor: Colors.CANDOR_BLACK,
//           appId: "688761346318080",
//           attributionURL: link,
//         });
//       } else {
//         let options = {
//           type: "video/mp3",
//           url: videouri,
//           subject: "Candor",
//         };
//         await Share.open(options)
//           .then((res) => {
//             return true;
//           })
//           .catch((err) => {
//             alert(err);
//             err && console.log(err);
//           });
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   });
// };

// const shareToSnapchatVideo = async (videouri: any, imgUrl: any) => {
//   const uri = Platform.OS === "android" ? "file://" + videouri : videouri;
//   if (uri) {
//     if (Platform.OS === "android") {
//       const photoContent: VideoContentParams = {
//         content: {
//           uri: uri,
//         },
//         sticker: {
//           uri: imgUrl,
//           width: 300,
//           height: 300,
//           posX: 0.5,
//           posY: 0.3,
//           rotationDegreesInClockwise: 0,
//           isAnimated: false,
//         },
//         attachmentUrl: link,
//         caption: "Candor - No Lies, Only Truths",
//       };

//       CreativeKit.shareVideo(photoContent)
//         .then((d) => {})
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       let options = {
//         type: "video/mp3",
//         url: videouri,
//         subject: "Candor",
//       };
//       await Share.open(options)
//         .then((res) => {
//           return true;
//         })
//         .catch((err) => {
//           err && console.log(err);
//         });
//     }
//   }
// };

// const shareToWhatsappVideo = async (image: any, from: any) => {
//   try {
//     if (Platform.OS === "android") {
//       await Share.shareSingle({
//         social: Social.Whatsapp,
//         message: link,
//         url: Platform.OS === "android" ? "file://" + image : "" + image,
//         filename: "video",
//         title: "Candor",
//         type: "video/mp3",
//       });
//     } else {
//       if (from === "whatsapp") {
//         let options = {
//           type: "video/mp4",
//           url: image,
//           subject: "Candor",
//         };
//         await Share.open(options)
//           .then((res) => {
//             return true;
//           })
//           .catch((err) => {
//             err && console.log(err);
//           });
//       } else {
//         let options = {
//           type: "video/mp3",
//           url: image,
//           subject: "Candor",
//         };
//         await Share.open(options)
//           .then((res) => {
//             return true;
//           })
//           .catch((err) => {
//             err && console.log(err);
//           });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

//   if (openedMsg?.card?.response_type == "audio") {
//     videoGen.current.open();

//     answerCard.current.capture().then(async (uri: any) => {
//       let urii = uri;
//       if (Platform.OS === "ios") {
//         urii = "file:/" + uri;
//       }

//       setvideoGenProgress("25%");
//       RNFetchBlob.config({
//         fileCache: true,
//         // by adding this option, the temp files will have a file extension
//         appendExt: "wav",
//       })
//         .fetch("GET", openedMsg?.answer_audio, {
//           //some headers ..
//         })
//         .then(async (res) => {
//           setvideoGenProgress("45%");
//           const data = new FormData();

//           const audiouri =
//             Platform.OS === "android"
//               ? "file://" + res.path()
//               : "" + res.path();

//           const audioFile: any = {
//             uri: audiouri,
//             name: "audio.wav",
//             type: "audio/wav",
//           };
//           const imageFile: any = {
//             uri: urii,
//             name: "image.png",
//             type: "image/png",
//           };

//           data.append("audio", audioFile);
//           data.append("image", imageFile);

//           await fetch("https://media-process.playcandor.com/createVideo/", {
//             method: "POST",
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//             body: data,
//           })
//             .then(async (res) => {
//               setvideoGenProgress("85%");
//               return await res.json();
//             })
//             .then((data) => {
//               if (data.status) {
//                 RNFetchBlob.config({
//                   fileCache: true,
//                   // by adding this option, the temp files will have a file extension
//                   appendExt: "mp4",
//                 })
//                   .fetch("GET", data?.uri, {
//                     //some headers ..
//                   })
//                   .then(async (res) => {
//                     setvideoGenProgress("95%");
//                     if (item == "Instagram") {
//                       if (Platform.OS === "android") {
//                         await shareToInstaVideo(res.path());
//                       } else {
//                         await shareToWhatsappVideo(res.path(), "instagram");
//                       }
//                     } else if (item === "Snapchat") {
//                       if (Platform.OS === "ios") {
//                         await shareToSnapchatVideo(data.uri, urii);
//                       } else {
//                         await shareToSnapchatVideo(res.path(), urii);
//                       }
//                     } else {
//                       await shareToWhatsappVideo(res.path(), "whatsapp");
//                     }

//                     videoGen.current.close();
//                     setvideoGenProgress("0%");
//                   });
//               }
//             })
//             .catch((error) => {
//               console.log(error);
//               videoGen.current.close();
//               setvideoGenProgress("0%");
//               toast({ message: "Error creating video" });
//             });
//         })
//         .catch((error) => {
//           console.log(error);
//           videoGen.current.close();
//           setvideoGenProgress("0%");
//           toast({ message: "Error creating video" });
//         });
//     });
//   }
