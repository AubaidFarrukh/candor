import styles from "../styles/Home.module.scss";
import mstyles from "../styles/Modal.module.scss";
import { AdminData } from "../context";
import { useContext } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./Button";
import Typography from "./Typography";
import Spacer from "./Spacer";
import Input from "./Input";
import Alignment from "./Alignment";
import { ACTIVATE_CARD, UPDATE_CARD } from "../graphQL/mutations";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toaster } from "evergreen-ui";
import domtoimage from "dom-to-image";
import { GET_S3_PRESIGNED_URL } from "../graphQL/queries";
import "rc-color-picker/assets/index.css";
import ColorPicker from "rc-color-picker";

export default function Edit({ onClose, card = null }) {
  const [isUploading, setisUploading] = useState(false);
  const [isReady, setisReady] = useState(false);
  const [isReady2, setisReady2] = useState(false);

  const [page, setpage] = useState(0);
  const [snap, setsnap] = useState(null);
  const [insta, setinsta] = useState(null);

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

              // setnewcard({
              //   ...newcard_,
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
            // width: 480 / 2,
            // height: 870 / 2,
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

              // setnewcard({
              //   ...newcard_,
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

  const [updateCard, updateCardQuery] = useMutation(UPDATE_CARD, {
    onCompleted(data) {
      console.log(data);
      toaster.success("Changes saved");
      onClose();
    },
    onError(error) {
      console.log(error);
      onClose();
      toaster.danger(error.message);
    },
  });

  const [makeactive, makeactiveQuery] = useMutation(ACTIVATE_CARD, {
    onCompleted(data) {
      console.log(data);
      toaster.success("Card Activated");
      onClose();
    },

    onError(error) {
      console.log(error);
      toaster.danger(error.message);
    },
  });

  const [newcard_, setnewcard] = useState({
    category: "",
    question: "",
    backgroundColor: "",
    textColor: "",
    backgroundColor2: "",
    textColor2: "",
    type: "Normal",
    responseType: "Text",
    source: "Admin",
    status: null,
    braggingName: " ",
    amount: "",
    stickerImage: "",
    backgroundImage: "",
    isPremium: false,
    similarQuestions: [],
  });

  useEffect(() => {
    if (card) {
      if (snap && insta) {
        setisReady(true);
        setisReady2(true);
      }

      console.log(card);
      setnewcard({
        category: card?.category,
        question: card.caption_text,
        backgroundColor: card.background_color,
        textColor: card.text_color,
        backgroundColor2: card.gradient_background_color,
        textColor2: card.new_text_color,
        type: card.is_premium ? "Pro" : "Normal",
        responseType: card.response_type,
        source: "Admin",
        status: card?.status,
        braggingName: card?.linked_poll?.brag_name,
        amount: card.price ? card?.price : 0,
        stickerImage: card?.sticker_image ? card?.sticker_image : "",
        backgroundImage: card?.background_image ? card?.background_image : "",
        isPremium: card?.is_premium ? true : false,
        similarQuestions: card?.similar_questions,
      });
    }
  }, [card]);

  useEffect(() => {
    if (isReady && isReady2) {
      toaster.success("Images generated successfully, You can upload now");
      setisUploading(false);
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
          <Typography text="Edit Card" color="#1795f9" type="h3" />
        </div>
        {page == 0 && (
          <div className={mstyles.row}>
            <div className={mstyles.mpage}>
              <Spacer height={30} />
              <Typography text="Category Name" color="#000" type="h3" />
              <Spacer height={8} />
              <Input
                onChange={(txt) => {
                  setnewcard({
                    ...newcard_,
                    category: txt,
                  });
                }}
                value={newcard_.category}
                placeholder="Enter category name"
              />
              <Spacer height={22} />
              <Typography text="Default Question" color="#000" type="h3" />
              <Spacer height={8} />
              <Input
                onChange={(txt) => {
                  setnewcard({
                    ...newcard_,
                    question: txt,
                  });
                }}
                value={newcard_.question}
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
                      setnewcard({
                        ...newcard_,
                        backgroundColor: colors.color,
                      });
                    }}
                  >
                    <span className="react-custom-trigger">
                      <Input
                        // editable={false}
                        onChange={(txt) => {
                          setnewcard({
                            ...newcard_,
                            backgroundColor: txt,
                          });
                        }}
                        value={newcard_.backgroundColor}
                        placeholder="#Legacy Background Color"
                      />
                    </span>
                  </ColorPicker>
                  <Spacer height={12} />
                  <Input
                    // editable={false}
                    onChange={(txt) => {
                      setnewcard({
                        ...newcard_,
                        backgroundColor2: txt,
                      });
                    }}
                    value={newcard_.backgroundColor2}
                    placeholder="#Gradiend Background Color"
                  />

                  <Spacer height={12} />
                  <ColorPicker
                    color={"#fff"}
                    onChange={(colors) => {
                      console.log(colors);
                      setnewcard({
                        ...newcard_,
                        textColor: colors.color,
                      });
                    }}
                  >
                    <span className="react-custom-trigger">
                      <Input
                        editable={false}
                        onChange={(txt) => {
                          setnewcard({
                            ...newcard_,
                            textColor: txt,
                          });
                        }}
                        value={newcard_.textColor}
                        placeholder="#Legacy Color of Text"
                      />
                    </span>
                  </ColorPicker>
                  <Spacer height={12} />
                  <ColorPicker
                    color={"#fff"}
                    onChange={(colors) => {
                      console.log(colors);
                      setnewcard({
                        ...newcard_,
                        textColor2: colors.color,
                      });
                    }}
                  >
                    <span className="react-custom-trigger">
                      <Input
                        editable={false}
                        onChange={(txt) => {
                          setnewcard({
                            ...newcard_,
                            textColor2: txt,
                          });
                        }}
                        value={newcard_.textColor2}
                        placeholder="#Gradient Color of Text"
                      />
                    </span>
                  </ColorPicker>
                </Alignment>
                <div className={mstyles.textarea}></div>
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
                  inactive={newcard_.type !== "Normal"}
                  onPress={() => {
                    setnewcard({
                      ...newcard_,
                      type: "Normal",
                    });
                  }}
                  text="Normal"
                />
                <Button
                  type="square"
                  inactive={newcard_.type !== "Pro"}
                  onPress={() => {
                    setnewcard({
                      ...newcard_,
                      type: "Pro",
                    });
                  }}
                  text="Pro"
                />
                <Input
                  type="input2"
                  onChange={(txt) => {
                    setnewcard({
                      ...newcard_,
                      amount: txt,
                    });
                  }}
                  value={newcard_.amount}
                  placeholder="Amount"
                  style={{
                    borderColor: newcard_.type == "Pro" ? "#1795f9" : "",
                    color: newcard_.type == "Pro" ? "#1795f9" : "",
                  }}
                />
              </Alignment>
              <Spacer height={22} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Typography text="RESPONSE TYPE" color="#000" type="h3" />
              <Spacer height={8} />
              <Alignment justify="flex-start" direction="row">
                <div
                  style={{
                    opacity: newcard_.responseType == "text" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setnewcard({
                      ...newcard_,
                      responseType: "text",
                    })
                  }
                  className={mstyles.responseCard}
                >
                  Text
                </div>
                <Spacer width={8} />
                <div
                  style={{
                    opacity: newcard_.responseType == "audio" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setnewcard({
                      ...newcard_,
                      responseType: "audio",
                    })
                  }
                  className={mstyles.responseCard}
                >
                  Audio
                </div>
                <Spacer width={8} />
                <div
                  style={{
                    opacity: newcard_.responseType == "picture" ? 1 : 0.5,
                  }}
                  onClick={() =>
                    setnewcard({
                      ...newcard_,
                      responseType: "picture",
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
                  inactive={newcard_.source !== "Admin"}
                  text="Admin"
                />
                <Button
                  type="square"
                  inactive={newcard_.source !== "User"}
                  text="User"
                />
              </Alignment>
              <Spacer height={22} />
              <div className={mstyles.line} />
              <Spacer height={22} />
              <Typography text="STATUS" color="#000" type="h3" />
              <Spacer height={8} />
              <Alignment justify="flex-start" direction="row">
                <Button
                  type="square"
                  inactive={newcard_.status !== "private"}
                  onPress={() => {
                    setnewcard({
                      ...newcard_,
                      status: "private",
                    });
                  }}
                  text="Private"
                />
                <Button
                  type="square"
                  inactive={newcard_.status !== "priotized"}
                  onPress={() => {
                    setnewcard({
                      ...newcard_,
                      status: "priotized",
                    });
                  }}
                  text="Priotized"
                />
                <Button
                  type="square"
                  inactive={makeactiveQuery.loading}
                  text={makeactiveQuery.loading ? "Loading" : "Live awaiting"}
                  onPress={() => {
                    makeactive({
                      variables: {
                        adminActivateCardId: card?._id,
                      },
                    });
                  }}
                />
                <Button
                  type="square"
                  inactive={newcard_.status !== "live"}
                  text="Live"
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
                    updateCard({
                      variables: {
                        backgroundColor: newcard_.backgroundColor,
                        captionText: newcard_.question,
                        textColor: newcard_.textColor,
                        captionImage: "",
                        description: "",
                        similarQuestions: [],
                        linkedPollId: poll?._id,
                        isPremium: newcard_?.isPremium,
                        price: poll?.amount,
                        stickerImage: newcard_?.stickerImage,
                        backgroundImage: newcard_?.backgroundImage,
                      },
                    });
                  }
                }}
                text={updateCardQuery.loading ? "loading" : "Submit"}
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
              <div className={mstyles.listBg}>
                {[
                  "/bg1.png",
                  "/bg2.png",
                  "/bg3.png",
                  "/bg4.png",
                  "/bg5.png",
                  "/bg6.png",
                  "/bg7.png",
                ].map((item) => {
                  return (
                    <img
                      onClick={() => {
                        console.log(window.location.origin);
                        setnewcard({
                          ...newcard_,
                          backgroundImage: window.location.origin + item,
                        });
                      }}
                      className={mstyles.listbgimg}
                      src={item}
                    />
                  );
                })}
              </div>

              <div className={mstyles.previewcon1}>
                <div
                  style={{
                    backgroundImage: `url(${newcard_?.backgroundImage})`,
                  }}
                  className={mstyles.inss}
                >
                  {/* <div
                    style={{
                      backgroundColor: newcard_.backgroundColor,
                      // transform: "scale(0.4)",
                      marginTop: -10,
                      // width: 200,
                    }}
                    className={mstyles.previewcon3}
                  >
                    <div className={mstyles.textcon}>
                      <text
                        style={{
                          color: newcard_?.textColor,
                        }}
                        className={mstyles.ptext}
                      >
                        {newcard_.question}
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
                  </div> */}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: newcard_.backgroundColor.substring(0, 7),
                }}
                className={mstyles.previewcon2}
              >
                <div className={mstyles.textcon}>
                  <text
                    style={{
                      color: newcard_?.textColor,
                    }}
                    className={mstyles.ptext}
                  >
                    {newcard_.question}
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
              <div id="instagram">
                <div
                  style={{
                    backgroundColor: newcard_.backgroundColor.substring(0, 7),
                  }}
                  className={mstyles.previewcon2x}
                  id="snapchat"
                >
                  <div className={mstyles.textcon}>
                    <text
                      style={{
                        color: newcard_?.textColor,
                      }}
                      className={mstyles.ptextx}
                    >
                      {newcard_.question}
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
                    <img className={mstyles.tag} src="/tag.png" />
                  </Alignment>
                </div>
                <img className={mstyles.previewcon2ximg} src="/link.png" />
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
                        updateCard({
                          variables: {
                            backgroundColor: newcard_.backgroundColor,
                            textColor: newcard_?.textColor,
                            captionText: newcard_.question,
                            captionImage: "",
                            description: "",
                            adminUpdateCardId: card?._id,
                            status: newcard_?.status,
                            isPremium: newcard_?.isPremium,
                            price: newcard_?.amount,
                            backgroundImage: newcard_?.backgroundImage,
                            stickerImage: snap ? snap : card?.stickerImage,
                            category: card?.category,
                            responseType:
                              newcard_?.responseType.toLocaleLowerCase(),
                            gradientBackgroundColor: newcard_?.backgroundColor2,
                            newTextColor: newcard_?.textColor2,
                          },
                        });
                      }
                    }}
                    text={updateCardQuery.loading ? "loading" : "Save"}
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
              <div
                // id="instagram"
                className={mstyles.previewcon1x}
              >
                <img src="/bgg.png" className={mstyles.bgg} />
                <div
                  style={{
                    backgroundColor: newcard_.backgroundColor,
                    marginTop: -10,
                  }}
                  className={mstyles.previewcon3x}
                >
                  <div className={mstyles.textcon}>
                    <text
                      style={{
                        color: newcard_?.textColor,
                      }}
                      className={mstyles.ptext}
                    >
                      {newcard_.question}
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
          </div>
        )}
      </div>
    </div>
  );
}
