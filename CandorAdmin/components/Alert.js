import { useState } from "react";
import mstyles from "../styles/Modal.module.scss";

import Button from "./Button";
import Spacer from "./Spacer";
import Typography from "./Typography";
import { toaster } from "evergreen-ui";

export default function Alert({
  onClose,
  onPress,
  text = "",
  showDialog = false,
  showBtn = true,
  btnText = "Yes",
}) {
  const [reason, setreason] = useState("");

  return (
    <div className={mstyles.modalcon}>
      <div className={mstyles.modal2}>
        {text}
        <Spacer height={22} />
        {showDialog && (
          <select
            onChange={(val) => {
              setreason(val.target.value);
            }}
            className={mstyles.options}
            name="type"
            id="type"
          >
            <option value="Retired">Retired</option>
            <option value="Inapporpriate">Inapporpriate</option>
          </select>
        )}
        <Spacer height={22} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          className={mstyles.mpage}
        >
          {showBtn ? (
            <Button
              style={{
                backgroundColor: "black",
              }}
              type="square"
              onPress={() => {
                onPress(reason);
                onClose();
              }}
              text={btnText}
            />
          ) : null}
          <Button type="disable" onPress={onClose} text="Cancel" />
        </div>
      </div>
    </div>
  );
}
