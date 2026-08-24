import mstyles from "../styles/Modal.module.scss";
import { useState, useEffect } from "react";
import Button from "./Button";
import Typography from "./Typography";
import Spacer from "./Spacer";
import Input from "./Input";
import Alignment from "./Alignment";
import { CREATE_CARD } from "../graphQL/mutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import { toaster } from "evergreen-ui";
import domtoimage from "dom-to-image";
import { GET_S3_PRESIGNED_URL } from "../graphQL/queries";
import "rc-color-picker/assets/index.css";
import ColorPicker from "rc-color-picker";

export default function Create({ onClose, poll = null }) {
  const [isUploading, setisUploading] = useState(false);
  const [isReady, setisReady] = useState(false);
  const [isReady2, setisReady2] = useState(false);

  const [page, setpage] = useState(0);
  const [insta, setinsta] = useState("");
  const [snap, setsnap] = useState("");
  const [simque, setsimque] = useState("");

  const [similarquestions, setsimilarquestions] = useState([]);

  const [UploadAsset, UploadAssetQuery] = useLazyQuery(GET_S3_PRESIGNED_URL, {
    onError(error) {
      console.log(error);
      setisUploading(false);
    },
    onCompleted(data) {
      console.log("running", data);
      try {
        let urls = data?.GetS3PreSignedUrls?.urls;
        if (urls.length === 0) {
          return;
        }
        domtoimage
          .toBlob(document.getElementById("snapchat"), {
            quality: 1,
          })
          .then(async function (blob) {
            let data0 = await fetch(urls[0]?.put, {
              method: "PUT",
              body: blob,
            });

            if (data0.status === 200) {
              let snapchatlink =
                "https://bsocial-assets.s3-accelerate.amazonaws.com/" +
                urls[0].key;

              // setcard({
              //   ...card,
              //   stickerImage: snapchatlink,
              // });
              console.log(snapchatlink);
              setsnap(snapchatlink);

              setisReady(true);

              console.log(snap);
            } else {
              setisUploading(false);
            }
          });

        domtoimage
          .toBlob(document.getElementById("instagram"), {
            quality: 1,
            width: 375,
            height: 812,
          })
          .then(async function (blob) {
            let data0 = await fetch(urls[1]?.put, {
              method: "PUT",
              body: blob,
            });

            if (data0.status === 200) {
              let instagramlink =
                "https://bsocial-assets.s3-accelerate.amazonaws.com/" +
                urls[1].key;

              // setcard({
              //   ...card,
              //   backgroundImage: instagramlink,
              // });
              setinsta(instagramlink);

              setisReady2(true);

              console.log(instagramlink);
            } else {
              setisUploading(false);
            }
          });
      } catch (e) {
        console.log(e, "upload error..");
        setisUploading(false);
      }
    },
  });

  const [createCard, createCardQuery] = useMutation(CREATE_CARD, {
    onCompleted(data) {
      console.log(data);
      toaster.success("Card created");
      onClose();
    },
    onError(error) {
      console.log(error);
      onClose();
      toaster.danger("Card creation failed, try again");
    },
  });

  const [card, setcard] = useState({
    category: "",
    question: "",
    backgroundColor: "",
    textColor: "",
    type: "Normal",
    responseType: "Text",
    source: "Admin",
    amount: "",
    stickerImage: null,
    backgroundImage: null,
    isPremium: null,
    similarQuestions: null,
  });

  useEffect(() => {
    if (poll) {
      setcard({
        question: poll?.text,
        backgroundColor: "",
        textColor: "",
        type: poll?.is_paid ? "Pro" : "Normal",
        responseType: "Text",
        source: "User",
        amount: poll?.price ? poll?.price : 0,
        // stickerImage: poll?.sticker_image,
        // backgroundImage: poll?.background_image,
        isPremium: poll?.is_premium,
        similarQuestions: poll?.similar_questions,
      });
    }
  }, [poll]);

  useEffect(() => {
    if (isReady && isReady2) {
      toaster.success("Images generated successfully, You can upload now");
      setisUploading(false);
      console.log(card);
    }
  }, [isReady, isReady2]);

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const handelUpload = () => {
    try {
      setisUploading(true);
      UploadAsset({
        variables: {
          fileNames: [
            makeid(3) + "snapchatlinkkk1.png",
            makeid(3) + "instagramlinkk1.png",
          ],
        },
      });
    } catch (e) {
      console.log(e, "error from upload asset");
      setisUploading(false);
    }
  };

  return (
    <div className={mstyles.modalcon}>
      <div className={mstyles.modal}>
        <div className={mstyles.mtop}>
          <Typography text="Create Card" color="#1795f9" type="h3" />
        </div>
        {page == 0 && (
          <div className={mstyles.row}>
            <div className={mstyles.mpage}>
              <Spacer height={30} />
              <Typography text="Category Name" color="#000" type="h3" />
              <Spacer height={8} />
              <Input
                onChange={(txt) => {
                  setcard({
                    ...card,
                    category: txt,
                  });
                }}
                value={card.category}
                placeholder="Enter category name"
              />
              <Spacer height={22} />
              <Typography text="Default Question" color="#000" type="h3" />
              <Spacer height={8} />
              <Input
                onChange={(txt) => {
                  setcard({
                    ...card,
                    question: txt,
                  });
                }}
                value={card.question}
                placeholder="Enter question"
              />
              <Spacer height={22} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Typography text="SENDER TYPE" color="#000" type="h3" />
              <Spacer height={8} />
              <Alignment justify="space-between" direction="row">
                <Alignment
                  style={{
                    width: "30%",
                  }}
                  direction="column"
                >
                  <ColorPicker
                    color={"#fff"}
                    onChange={(colors) => {
                      console.log(colors);
                      setcard({
                        ...card,
                        backgroundColor: colors.color,
                      });
                    }}
                  >
                    <span className="react-custom-trigger">
                      <Input
                        editable={false}
                        onChange={(txt) => {
                          setcard({
                            ...card,
                            backgroundColor: txt,
                          });
                        }}
                        value={card.backgroundColor}
                        placeholder="#Background Color"
                      />
                    </span>
                  </ColorPicker>
                  <Spacer height={12} />
                  <ColorPicker
                    color={"#fff"}
                    onChange={(colors) => {
                      console.log(colors);
                      setcard({
                        ...card,
                        textColor: colors.color,
                      });
                    }}
                  >
                    <span className="react-custom-trigger">
                      <Input
                        editable={false}
                        onChange={(txt) => {
                          setcard({
                            ...card,
                            textColor: txt,
                          });
                        }}
                        value={card.textColor}
                        placeholder="#Color of Text"
                      />
                    </span>
                  </ColorPicker>
                </Alignment>
                <div className={mstyles.textarea}>
                  <div className={mstyles.inputcon}>
                    <input
                      onChange={(val) => {
                        setsimque(val.target.value);
                      }}
                      placeholder="Add a similar question"
                      value={simque}
                    />
                    <div
                      onClick={() => {
                        setsimilarquestions([simque, ...similarquestions]);
                        setsimque(null);
                      }}
                    >
                      Add
                    </div>
                  </div>

                  <div className={mstyles.questionrow}>
                    {similarquestions.map((item) => {
                      return <div className={mstyles.qrdiv}>{item}</div>;
                    })}
                  </div>
                </div>
              </Alignment>
              <Spacer height={22} />
              <Typography
                text="IS THIS CARD PRO (IF PRO, ADD AMOUNT) OR NORMAL?"
                color="#000"
                type="h3"
              />
              <Spacer height={8} />
              <Alignment justify="flex-start" direction="row">
                <Button
                  type="square"
                  inactive={card.type !== "Normal"}
                  onPress={() => {
                    setcard({
                      ...card,
                      type: "Normal",
                      isPremium: false,
                    });
                  }}
                  text="Normal"
                />
                <Button
                  type="square"
                  inactive={card.type !== "Pro"}
                  onPress={() => {
                    setcard({
                      ...card,
                      type: "Pro",
                      isPremium: true,
                    });
                  }}
                  text="Pro"
                />
                {/* <Input
                  type="input2"
                  onChange={(txt) => {
                    setcard({
                      ...card,
                      amount: txt,
                    });
                  }}
                  value={card.amount}
                  placeholder="Amount"
                  style={{
                    borderColor: card.type == "Pro" ? "#1795f9" : "",
                    color: card.type == "Pro" ? "#1795f9" : "",
                  }}
                /> */}
              </Alignment>
              <Spacer height={22} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Typography text="RESPONSE TYPE" color="#000" type="h3" />
              <Spacer height={8} />
              <Alignment justify="flex-start" direction="row">
                <div
                  style={{
                    opacity: card.responseType == "Text" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setcard({
                      ...card,
                      responseType: "Text",
                    })
                  }
                  className={mstyles.responseCard}
                >
                  Text
                </div>
                <Spacer width={8} />
                <div
                  style={{
                    opacity: card.responseType == "Audio" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setcard({
                      ...card,
                      responseType: "Audio",
                    })
                  }
                  className={mstyles.responseCard}
                >
                  Audio
                </div>
                <Spacer width={8} />
                <div
                  style={{
                    opacity: card.responseType == "Picture" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setcard({
                      ...card,
                      responseType: "Picture",
                    })
                  }
                  className={mstyles.responseCard}
                >
                  Picture
                </div>
              </Alignment>
              <Spacer height={22} />
              <div className={mstyles.line} />
              <Spacer height={22} />

              <Typography text="QUESTION SOURCE" color="#000" type="h3" />
              <Spacer height={8} />
              <Alignment justify="flex-start" direction="row">
                <Button
                  type="square"
                  inactive={card.source !== "Admin"}
                  text="Admin"
                />
                <Button
                  type="square"
                  inactive={card.source !== "User"}
                  text="User"
                />
              </Alignment>

              <Spacer height={50} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Alignment justify="flex-end" direction="row">
                {/* <Button
                  type="square"
                  inactive={!isReady && !isReady2}
                  onPress={() => {
                    if (card) {
                      createCard({
                        variables: {
                          backgroundColor: card.backgroundColor,
                          captionText: card.question,
                          textColor: card.textColor,
                          captionImage: "",
                          description: "",
                          similarQuestions: [],
                          linkedPollId: poll?._id,
                          isPremium: card?.isPremium,
                          price: poll?.amount,
                          stickerImage: card?.stickerImage,
                          backgroundImage: card?.backgroundImage,
                        },
                      });
                    }
                  }}
                  text={createCardQuery.loading ? "loading" : "Submit"}
                /> */}
                <Button
                  type="square"
                  onPress={() => {
                    setpage(page + 1);
                  }}
                  text={"Next"}
                />
                <Button type="disable" onPress={onClose} text="Cancel" />
              </Alignment>
              <Spacer height={22} />
            </div>
            <div className={mstyles.preview}>
              <div className={mstyles.previewcon1}>
                <div className={mstyles.inss}>
                  <div
                    style={{
                      backgroundColor: card.backgroundColor,
                      // transform: "scale(0.4)",
                      marginTop: -10,
                      // width: 200,
                    }}
                    className={mstyles.previewcon3}
                  >
                    <div className={mstyles.textcon}>
                      <text
                        style={{
                          color: card?.textColor,
                        }}
                        className={mstyles.ptext}
                      >
                        {card.question}
                      </text>
                      <br />
                      <text className={mstyles.pinboxtext}>Inbox</text>
                    </div>

                    <Alignment
                      style={{
                        position: "absolute",
                        bottom: 15,
                      }}
                      direction="row"
                      justify="space-between"
                    >
                      <img src="/tag.png" />
                    </Alignment>
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: card.backgroundColor,
                }}
                className={mstyles.previewcon2}
              >
                <div className={mstyles.textcon}>
                  <text
                    style={{
                      color: card?.textColor,
                    }}
                    className={mstyles.ptext}
                  >
                    {card.question}
                  </text>
                  <br />
                  <text className={mstyles.pinboxtext}>Anonymous Inbox</text>
                </div>

                <Alignment
                  style={{
                    position: "absolute",
                    bottom: 15,
                  }}
                  direction="row"
                  justify="space-between"
                >
                  <img src="/tag.png" />
                </Alignment>
              </div>
            </div>
          </div>
        )}
        {page == 1 && (
          <div className={mstyles.row}>
            <div className={mstyles.mpage}>
              <Spacer height={30} />
              <div
                style={{
                  backgroundColor: card.backgroundColor,
                }}
                className={mstyles.previewcon2x}
                id="snapchat"
              >
                <div className={mstyles.textcon}>
                  <text
                    style={{
                      color: card?.textColor,
                    }}
                    className={mstyles.ptextx}
                  >
                    {card.question}
                  </text>
                  <br />
                  <text className={mstyles.pinboxtextx}>Anonymous Inbox</text>
                </div>

                <Alignment
                  style={{
                    position: "absolute",
                    bottom: 15,
                  }}
                  direction="row"
                  justify="space-between"
                >
                  <img src="/tag.png" />
                </Alignment>
              </div>

              <Spacer height={50} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Alignment justify="space-between" direction="row">
                <Button
                  type="disable"
                  onPress={() => {
                    setpage(page - 1);
                  }}
                  text="Back"
                />

                <Alignment>
                  <Button
                    type="square"
                    inactive={!isReady && !isReady2}
                    onPress={() => {
                      if (card) {
                        console.log({
                          backgroundColor: card.backgroundColor,
                          captionText: card.question,
                          textColor: card.textColor,
                          captionImage: "",
                          description: "",
                          linkedPollId: poll?._id,
                          isPremium: card?.isPremium,
                          price: poll?.amount,
                          stickerImage: snap,
                          backgroundImage: insta,
                          category: card?.category,
                          responseType: card?.responseType.toLocaleLowerCase(),
                          similarQuestions: similarquestions,
                        });
                        createCard({
                          variables: {
                            backgroundColor: card.backgroundColor,
                            captionText: card.question,
                            textColor: card.textColor,
                            captionImage: "",
                            description: "",
                            linkedPollId: poll?._id,
                            isPremium: card?.isPremium,
                            price: poll?.amount,
                            stickerImage: snap,
                            backgroundImage: insta,
                            category: card?.category,
                            responseType:
                              card?.responseType.toLocaleLowerCase(),
                            similarQuestions: similarquestions,
                          },
                        });
                      }
                    }}
                    text={createCardQuery.loading ? "loading" : "Submit"}
                  />
                  <Button
                    type="square"
                    onPress={() => {
                      setisReady(false);
                      setisReady2(false);
                      handelUpload();
                    }}
                    text={isUploading ? "loading" : "Create"}
                  />
                  <Button type="disable" onPress={onClose} text="Cancel" />
                </Alignment>
              </Alignment>
              <Spacer height={22} />
            </div>
            <div className={mstyles.preview}>
              <div id="instagram" className={mstyles.previewcon1x}>
                <div
                  style={{
                    backgroundColor: card.backgroundColor,
                    // transform: "scale(0.4)",
                    marginTop: -30,
                    // width: 200,
                  }}
                  className={mstyles.previewcon3x}
                >
                  <div className={mstyles.textcon}>
                    <text
                      style={{
                        color: card?.textColor,
                      }}
                      className={mstyles.ptextxx}
                    >
                      {card.question}
                    </text>
                    <br />
                    <text className={mstyles.pinboxtextxx}>Inbox</text>
                  </div>

                  <Alignment
                    style={{
                      position: "absolute",
                      bottom: 15,
                    }}
                    direction="row"
                    justify="space-between"
                  >
                    <img src="/tag.png" />
                  </Alignment>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
