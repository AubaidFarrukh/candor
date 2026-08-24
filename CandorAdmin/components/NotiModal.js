import styles from "../styles/Index.module.scss";
import { AdminData, NotiData } from "../context";
import { useState, useContext, useEffect } from "react";
import { TOP_USERS } from "../graphQL/queries";
import { SEND_NOTI } from "../graphQL/mutations";
import { useQuery, useMutation } from "@apollo/client";
import { toaster } from "evergreen-ui";

export default function NotiModal({ noti, onPress }) {
  let { admin, setadmin } = useContext(AdminData);
  const [poly, setpoly] = useState(false);

  const [listUsers, setlistUsers] = useState([]);

  const [subject, setsubject] = useState("");
  const [body, setbody] = useState("");
  const [query, setquery] = useState("");
  const [selectedUsers, setselectedUsers] = useState([]);
  const [selectedUsersID, setselectedUsersID] = useState([]);

  const getListUsers = useQuery(TOP_USERS, {
    variables: {
      limit: 100000,
      page: 0,
    },
  });

  const [sendNotification, notification] = useMutation(SEND_NOTI);

  useEffect(() => {
    if (getListUsers.data) {
      setlistUsers(getListUsers.data?.AdminListTopUsers);
      //console.log(getListUsers?.data);
    }
    if (getListUsers.error) {
      //console.log(getListUsers.error);
      // alert(getListUsers.error?.message);
    }

    if (notification.data) {
      //console.log(notification?.data);
      toaster.success("Notification sent successfully");
      onPress({
        open: false,
        page: -1,
      });
      setsubject("");
      setbody("");
    }
    if (notification.error) {
      //console.log(notification.error);
      // alert(notification.error?.message);
      toaster.error("Error sending notification");
    }
  }, [
    getListUsers.data,
    getListUsers.error,
    notification.data,
    notification.error,
  ]);

  return (
    <div className={styles.noticon}>
      {noti.page == 1 ? (
        <div className={styles.notimodal}>
          <div className={styles.nttop}>
            <text className={styles.notitext}>
              Create A General Notification
            </text>

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

          <input
            onChange={(val) => {
              setsubject(val.target.value);
            }}
            className={styles.input}
            placeholder="Subject"
            value={subject}
          />

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
              if (body && selectedUsersID.length > 0) {
                sendNotification({
                  variables: {
                    message: body,
                    broadcast: true,
                  },
                });
              }
            }}
            className={styles.ntbtn}
          >
            <text className={styles.notitext}>
              {notification.loading ? "Loading" : "Send Notification"}
            </text>
          </div>
        </div>
      ) : null}

      {noti.page == 2 ? (
        <div className={styles.notimodal}>
          <div className={styles.nttop}>
            <text className={styles.notitext}>
              Create A Recurring Notification
            </text>

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

          <input
            onChange={(val) => {
              setsubject(val.target.value);
            }}
            className={styles.input}
            placeholder="Subject"
            value={subject}
          />

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
              if (body && selectedUsersID.length > 0) {
                sendNotification({
                  variables: {
                    message: body,
                    broadcast: true,
                  },
                });
              }
            }}
            className={styles.ntbtn}
          >
            <text className={styles.notitext}>
              {notification.loading ? "Loading" : "Send Notification"}
            </text>
          </div>
        </div>
      ) : null}

      {noti.page == 3 ? (
        <div className={styles.notimodal}>
          <div className={styles.nttop}>
            <text className={styles.notitext}>
              Create A Specific Notification
            </text>

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

          <div className={styles.toinput}>
            <div>
              <text>To:</text>
              <input
                onChange={(val) => {
                  setquery(val.target.value);
                }}
                placeholder="Type username"
                value={query}
              />
            </div>

            <img src="/group.png" />
            {query && listUsers.length > 0 ? (
              <div className={styles.notidrop}>
                {listUsers
                  .filter((item) => {
                    return (
                      item?.user?.username
                        .toLowerCase()
                        .indexOf(query.toLowerCase()) !== -1
                    );
                  })
                  .map((item, index) => {
                    return (
                      <div
                        onClick={() => {
                          let arr1 = selectedUsersID;
                          arr1.push(item?.user?._id);

                          let arr2 = selectedUsers;
                          arr2.push(item?.user);

                          setselectedUsers([...arr2]);
                          setselectedUsersID([...arr1]);

                          setquery("");

                          //console.log(selectedUsersID)
                        }}
                        className={styles.ntdropitem}
                      >
                        <img src={item?.user?.avatar} />
                        <div>
                          <text className={styles.notitext}>
                            {item?.user?.name}
                          </text>
                          <text className={styles.notitext}>
                            @{item?.user?.username}
                          </text>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : null}
          </div>
          {selectedUsers.length > 0 ? (
            <div className={styles.tags}>
              {selectedUsers.map((item) => {
                return <text>@{item.username}</text>;
              })}
            </div>
          ) : null}

          <input
            onChange={(val) => {
              setsubject(val.target.value);
            }}
            className={styles.input}
            placeholder="Subject"
            value={subject}
          />

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
              if (body && selectedUsersID.length > 0) {
                sendNotification({
                  variables: {
                    message: body,
                    broadcast: false,
                    ids: selectedUsersID,
                  },
                });
              }
            }}
            className={styles.ntbtn}
          >
            <text className={styles.notitext}>
              {notification.loading ? "Loading" : "Send Notification"}
            </text>
          </div>
        </div>
      ) : null}
    </div>
  );
}
