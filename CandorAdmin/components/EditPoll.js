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
import { ACTIVATE_POLL, UPDATE_POLL } from "../graphQL/mutations";
import { useMutation } from "@apollo/client";
import { toaster } from "evergreen-ui";

export default function EditPoll({ onClose, poll = null }) {
  const [updatePoll, updatePollQuery] = useMutation(UPDATE_POLL, {
    onCompleted(data) {
      console.log(data);
      toaster.success("Poll updated");
      onClose();
    },
    onError(error) {
      console.log(error);
      onClose();
      toaster.danger("Update failed, try again");
    },
  });

  const [makeactive, makeactiveQuery] = useMutation(ACTIVATE_POLL, {
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

  const [card, setcard] = useState({
    status: null,
  });

  useEffect(() => {
    if (poll) {
      setcard({
        status: poll?.status,
      });
    }
  }, [poll]);

  return (
    <div className={mstyles.modalcon}>
      <div
        style={{
          height: "fit-content",
        }}
        className={mstyles.rmodal}
      >
        <div className={mstyles.mtop}>
          <Typography text="Edit Poll" type="h3" />
        </div>
        <div className={mstyles.mpage2}>
          <Spacer height={30} />
          <Typography text="Change Poll State" color="#000" type="h3" />
          <Spacer height={8} />
          <Alignment justify="flex-start" direction="row">
            <Button
              type="square"
              inactive={card.status !== "private"}
              onPress={() => {
                setcard({
                  ...card,
                  status: "private",
                });
              }}
              text="Private"
            />
            <Button
              type="square"
              inactive={card.status !== "priotized"}
              onPress={() => {
                setcard({
                  ...card,
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
                    adminActivatePollCardId: poll?._id,
                  },
                });
              }}
            />
            <Button
              type="square"
              inactive={card.status !== "live"}
              text="Live"
            />
          </Alignment>
          <Spacer height={50} />
          <div className={mstyles.line} />
          <Spacer height={22} />
          <Alignment justify="flex-end" direction="row">
            <Button
              type="square"
              onPress={() => {
                if (card) {
                  updatePoll({
                    variables: {
                      updatePollId: poll._id,
                      status: card?.status,
                      text: poll?.text,
                    },
                  });
                }
              }}
              text={updatePollQuery.loading ? "loading" : "Save"}
            />
            <Button type="disable" onPress={onClose} text="Cancel" />
          </Alignment>
          <Spacer height={22} />
        </div>
      </div>
    </div>
  );
}
