import styles from "../styles/Index.module.scss";
import { AdminData, NotiData } from "../context";
import { useState, useContext, useEffect } from "react";
import { SEND_SMS } from "../graphQL/queries";
import { useLazyQuery } from "@apollo/client";
import { toaster } from "evergreen-ui";

export default function PhoneModal({ noti, onPress }) {
  let { admin, setadmin } = useContext(AdminData);
  const [poly, setpoly] = useState(false);

  const [listUsers, setlistUsers] = useState({});

  const [subject, setsubject] = useState("");
  const [body, setbody] = useState("");
  const [query, setquery] = useState("");
  const [selectedUsers, setselectedUsers] = useState([]);
  const [selectedUsersID, setselectedUsersID] = useState([]);

  const [sendSMS, { loading, error, data }] = useLazyQuery(SEND_SMS);

  useEffect(() => {
    if (data) {
      toaster.success("Message sent succesfully");
      // alert("Message sent");
      onPress({ open: false, page: -1 });
    }
    if (error) {
      console.log(error);
      // alert(error?.message);
      toaster.success("Error occured when sending message, Please try again");
    }
  }, [data, error]);

  return (
    <div className={styles.noticon}>
      <div className={styles.notimodal}>
        <div className={styles.nttop}>
          <text className={styles.notitext}>Send Bulk Marketing Messages</text>

          <img
            onClick={() => {
              onPress({
                open: false,
                page: -1,
              });
              setsubject("");
              setbody("");
            }}
            src="/closew.png"
            className={styles.closew}
          />
        </div>

        <div className={styles.tabs}>
          <text>To</text>
          {noti.page == 1 ? (
            <>
              <div className={styles.tab}>All</div>
              <div className={styles.tab}>USA</div>
              <div className={styles.tab}>Ghana</div>
              <div className={styles.tab}>India</div>{" "}
            </>
          ) : null}
          {noti.page == 2 ? <div className={styles.tab}>USA</div> : null}
          {noti.page == 3 ? <div className={styles.tab}>Ghana</div> : null}
          {noti.page == 4 ? <div className={styles.tab}>India</div> : null}
        </div>

        <textarea
          onChange={(val) => {
            setbody(val.target.value);
          }}
          className={styles.textarea}
          placeholder="Body"
          value={body}
        />

        <div
          onClick={() => {
            if (body) {
              sendSMS({
                variables: {
                  message: body,
                  countryCode:
                    noti.page == 1
                      ? ""
                      : noti.page == 2
                      ? "US"
                      : noti.page == 3
                      ? "GH"
                      : noti.page == 4
                      ? "IN"
                      : "",
                },
              });
            }
          }}
          className={styles.ntbtn}
        >
          <text className={styles.notitext}>
            {loading ? "Loading" : "Send Bulk Messages"}
          </text>
        </div>
      </div>
    </div>
  );
}
