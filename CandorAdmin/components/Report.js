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
import { DELETE_MESSAGE } from "../graphQL/mutations";
import { useMutation } from "@apollo/client";
import { toaster } from "evergreen-ui";

export default function Report({ onClose }) {
  const [deleteMessage, deleteMessageQuery] = useMutation(DELETE_MESSAGE, {
    onCompleted(data) {
      console.log(data);
      toaster.success("Card created");
      onClose();
    },
    onError(error) {
      console.log(error);
      onClose();
      toaster.danger("Message deletion failed, try again");
    },
  });

  const [card, setcard] = useState({
    userid: "",
    messageid: "",
  });

  return (
    <div className={mstyles.modalcon}>
      <div
        style={{
          height: "fit-content",
        }}
        className={mstyles.rmodal}
      >
        <div className={mstyles.mtop}>
          <Typography text="Report" color="red" type="h3" />
        </div>
        <div className={mstyles.mpage2}>
          <Spacer height={30} />
          <Typography text="User ID" color="#000" type="h3" />
          <Spacer height={8} />
          <Input
            onChange={(txt) => {
              setcard({
                ...card,
                userid: txt,
              });
            }}
            value={card.userid}
            placeholder="Enter user ID"
          />
          <Spacer height={30} />
          <Typography text="Message ID" color="#000" type="h3" />
          <Spacer height={8} />
          <Input
            onChange={(txt) => {
              setcard({
                ...card,
                messageid: txt,
              });
            }}
            value={card.messageid}
            placeholder="Enter message ID"
          />

          <Spacer height={50} />
          <div className={mstyles.line} />
          <Spacer height={22} />
          <Alignment justify="flex-end" direction="row">
            <Button
              style={{
                backgroundColor: "red",
              }}
              type="square"
              onPress={() => {
                if (card) {
                  deleteMessage({
                    variables: {
                      deleteMessageId: card.messageid,
                    },
                  });
                }
              }}
              text={deleteMessageQuery.loading ? "loading" : "Delete"}
            />
            <Button type="disable" onPress={onClose} text="Cancel" />
          </Alignment>
          <Spacer height={22} />
        </div>
      </div>
    </div>
  );
}
