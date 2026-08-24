import { useState } from "react";
import mstyles from "../styles/PayModal.module.scss";
import tabel from "../styles/Tabel.module.scss";

import Button from "./Button";
import Spacer from "./Spacer";
import Typography from "./Typography";
import Alignment from "./Alignment";

export default function EditPayment({
  onClose,
  onPress,
  item = {},
  titles = [],
  more = false,
}) {
  const [reason, setreason] = useState("");
  const [showPaid, setshowPaid] = useState(false);
  const [showNot, setshowNot] = useState(true);
  return (
    <div className={mstyles.modalcon}>
      <div className={mstyles.modal2}>
        <div className={mstyles.tabelHeader}>
          <img
            onClick={() => {
              onClose();
            }}
            src="/closer.svg"
            className={mstyles.closew}
          />
          {titles.map((item) => {
            return (
              <div
                style={{
                  width: item?.size,
                }}
                className={mstyles.one}
              >
                <Typography color="#767676" text={item?.name} type="h3" />
              </div>
            );
          })}
        </div>

        <CardItemRev titles={titles} item={item} />
        <Spacer height={50} />
        {!more && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            className={mstyles.mpage}
          >
            <Button
              style={{
                backgroundColor: "#00ed50",
                fontWeight: "bold",
              }}
              type="square"
              onPress={() => {
                setshowPaid(true);
                setshowNot(false);
              }}
              text="Paid"
            />
            {showPaid && (
              <div className={mstyles.btncon}>
                <input type="date" placeholder="Add date" />
                <Button
                  style={{
                    backgroundColor: "#00ed50",
                    fontWeight: "bold",
                    transform: "scale(0.85)",
                    margin: 0,
                    marginRight: -7,
                  }}
                  type="square"
                  onPress={() => {
                    onClose();
                  }}
                  text="Save"
                />
              </div>
            )}
            <Button
              style={{
                backgroundColor: "#f5f5f5",
                color: "black",
                fontWeight: "bold",
              }}
              onPress={() => {
                setshowPaid(false);
                setshowNot(true);
              }}
              text="Not yet"
              type="square"
            />
            {showNot && (
              <div className={mstyles.btncon}>
                <select
                  onChange={(val) => {
                    setreason(val.target.value);
                  }}
                  className={mstyles.options}
                  name="type"
                  id="type"
                >
                  <option value="Transaction Failed">Transaction Failed</option>
                  <option value="Something else">Something else</option>
                </select>
                <Button
                  style={{
                    backgroundColor: "#000",
                    fontWeight: "bold",
                    transform: "scale(0.8)",
                    marginRight: -9,
                    color: "white",
                  }}
                  type="square"
                  onPress={() => {
                    onPress(reason);
                    onClose();
                  }}
                  text="Save"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const CardItemRev = ({ item, onEdit, onMore, titles }) => {
  return (
    <div className={tabel.tabelRow}>
      <div
        style={{
          width: titles[0].size,
        }}
        className={tabel.three}
      >
        <Typography text={item?.user_id} type="h3" />
      </div>
      <div
        style={{
          width: titles[1].size,
        }}
        className={tabel.three}
      >
        <Typography text={item?.amount} type="h3" />
      </div>
      <div
        style={{
          width: titles[2].size,
        }}
        className={tabel.three}
      >
        <Typography text={new Date(item?.created_at)} type="h3" />
      </div>
      <div
        style={{
          width: titles[3].size,
        }}
        className={tabel.three}
      >
        <Typography text={item?.status} type="h3" />
      </div>
      <div
        style={{
          width: titles[3].size,
        }}
        className={tabel.three}
      >
        <Button type={"live"} text={item?.status == "paid" ? "Paid" : "Pay"} />
      </div>
    </div>
  );
};
