/** @format */

import "../styles/globals.scss";
import styles from "../styles/Index.module.scss";
import HomeStyles from "../styles/Home.module.scss";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ModalData, AdminData, NotiData, PhoneData } from "../context";
import { persistCache } from "apollo3-cache-persist";
import convDate from "../functions/getDate";
import NotiModal from "../components/NotiModal";
import PhoneModal from "../components/PhoneModal";

import DashboardLogo from "../public/svg/dashboard.svg";
import UsersLogo from "../public/svg/user.svg";
import GameLogo from "../public/svg/game.svg";
import PollLogo from "../public/svg/poll.svg";
import NotificationsLogo from "../public/svg/notifications.svg";
import PhoneLogo from "../public/svg/phone.svg";

const cache = new InMemoryCache();

const geturl = (env = "PROD") => {
  const pathname =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  if (env == "LOCAL") {
    return "https://prod-api.playcandor.com/graphql";
  }
  // console.log(origin);
  if (pathname === "https://manage.playcandor.com") {
    return "https://prod-api.playcandor.com/graphql";
  }
  // return "https://api.candour.app/graphql";
  return "https://prod-api.playcandor.com/graphql";
};

const httpLink = createHttpLink({
  uri: `${geturl("PROD")}`, //PROD or DEV
});

const authLink = setContext(async (_, { headers }) => {
  const token = await window.sessionStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  const { pathname } = useRouter();
  const [dropdown, setdropdown] = useState({
    page: -1,
    index: -1,
  });
  const [modal, setmodal] = useState({
    open: false,
    page: 0,
    data: {},
  });
  const [noti, setnoti] = useState({
    open: false,
    page: 0,
  });

  const [phone, setphone] = useState({
    open: false,
    page: 0,
  });

  const [admin, setadmin] = useState({});

  const [loading, setloading] = useState(true);

  // let context = useContext(ModalData);
  const router = useRouter();
  const path = useRouter().pathname;

  useEffect(async () => {
    persistCache({
      cache,
      storage: window.localStorage,
    });

    const token = await window.sessionStorage.getItem("accessToken");
    const adminProfile = await window.sessionStorage.getItem("adminProfile");

    if (token) {
      if (adminProfile) {
        setadmin(JSON.parse(adminProfile));
      }
      if (path == "/auth") {
        router.push("/");
      }
      setloading(false);
    } else {
      if (path != "/auth") {
        router.push("/auth").then(() => {
          setloading(false);
        });
      }
      // setloading(false);
    }
  }, [path]);

  return (
    <ApolloProvider client={client}>
      <AdminData.Provider value={{ admin, setadmin }}>
        <ModalData.Provider value={{ modal, setmodal }}>
          <NotiData.Provider value={{ noti, setnoti }}>
            <PhoneData.Provider value={{ phone, setphone }}>
              <div className={styles.container}>
                {pathname != "/auth" ? (
                  <section className={styles.sidebar}>
                    <div className={styles.logo}>
                      <img style={styles.logoimg} src="/logo.png" />
                      <text>Candor</text>
                      <img
                        src="/poly.svg"
                        style={{ width: 16, height: 14 }}
                        className={`${HomeStyles.poly}`}
                      />
                    </div>

                    <div className={styles.menus}>
                      <Link href="/">
                        <div
                          className={`${
                            pathname == "/" ? styles.menuitem : styles.menuitem2
                          }`}
                        >
                          <DashboardLogo
                            fill={pathname == "/" ? "#fff" : "#767676"}
                            style={{
                              minWidth: 35,
                              minHeight: 35,
                              marginRight: 20,
                            }}
                          />
                          <text>Overview</text>
                        </div>
                      </Link>

                      <Link href="/profile">
                        <div
                          className={`${
                            pathname == "/profile" || pathname == "/user"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <UsersLogo
                            fill={pathname == "/profile" ? "#fff" : "#767676"}
                            style={{
                              minWidth: 35,
                              minHeight: 35,
                              marginRight: 20,
                            }}
                          />
                          <text>Users Profile</text>
                        </div>
                      </Link>

                      <Link href="/cards">
                        <div
                          className={`${
                            pathname == "/cards"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <GameLogo
                            fill={pathname == "/cards" ? "#fff" : "#767676"}
                            style={{
                              minWidth: 35,
                              maxWidth: 35,
                              minHeight: 25,
                              marginRight: 20,
                            }}
                          />
                          <text>Cards</text>
                        </div>
                      </Link>

                      <Link href="/submit-poll">
                        <div
                          className={`${
                            pathname == "/submit-poll"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <PollLogo
                            fill={
                              pathname == "/submit-poll" ? "#fff" : "#767676"
                            }
                            style={{
                              minWidth: 34,
                              minHeight: 34,
                              marginRight: 20,
                            }}
                          />
                          <text>Submit poll</text>
                        </div>
                      </Link>

                      <Link href="/revenue">
                        <div
                          className={`${
                            pathname == "/revenue"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <PollLogo
                            fill={pathname == "/revenue" ? "#fff" : "#767676"}
                            style={{
                              minWidth: 34,
                              minHeight: 34,
                              marginRight: 20,
                            }}
                          />
                          <text>Revenue</text>
                        </div>
                      </Link>

                      <Link href="/notification">
                        <div
                          className={`${
                            pathname == "/notification"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <NotificationsLogo
                            fill={
                              pathname == "/notification" ? "#fff" : "#767676"
                            }
                            style={{
                              minWidth: 30,
                              minHeight: 22,
                              marginRight: 20,
                            }}
                          />
                          <text>Notification</text>
                        </div>
                      </Link>

                      <Link href="/phonebook">
                        <div
                          className={`${
                            pathname == "/phonebook"
                              ? styles.menuitem
                              : styles.menuitem2
                          }`}
                        >
                          <PhoneLogo
                            fill={pathname == "/phonebook" ? "#fff" : "#767676"}
                            style={{
                              minWidth: 35,
                              minHeight: 35,
                              marginRight: 20,
                            }}
                          />
                          <text>Phonebook</text>
                        </div>
                      </Link>
                    </div>
                  </section>
                ) : null}
                <Component {...pageProps} />
                {modal.open ? (
                  <div className={styles.modalcon}>
                    {modal.page == 0 ? (
                      <div className={styles.modal}>
                        <div
                          onClick={() => {
                            setmodal({
                              open: false,
                              page: 0,
                              data: modal.data,
                            });
                          }}
                          className={styles.xcon}
                        >
                          <img src="/close.png" />
                        </div>
                        <div className={styles.mtop}>
                          <div className={styles.profiles}>
                            <img className={styles.profilepic} />
                            <div className={styles.textx}>
                              <text>{modal.data.user.name}</text>
                              <text>@{modal.data.user.username}</text>
                            </div>
                            <div
                              style={{ marginRight: 13 }}
                              className={styles.search}
                            >
                              <input placeholder="Search users"></input>
                              <img
                                className={styles.searchimg}
                                src="/search.png"
                              ></img>
                            </div>
                          </div>

                          <div className={styles.four}>
                            <img
                              className={styles.sideimg}
                              src="/contento.png"
                            />
                            {modal.data.content.posts} Contents
                          </div>
                        </div>
                        <div className={styles.beginings}>
                          <div className={styles.one}>Dates</div>
                          <div className={styles.one}>Battle</div>
                          <div className={styles.one}>Challenge</div>
                          <div className={styles.one}>Reaction+</div>
                          <div className={styles.one}>Updates</div>
                        </div>
                        {modal?.data?.user?.posts.map((item, index) => {
                          return (
                            <div
                              // style={{ marginBottom: index == reports.length - 1 ? 50 : 0 }}
                              className={styles.begining}
                            >
                              <div className={styles.five}></div>
                              <div
                                onClick={() => {
                                  setmodal({
                                    open: true,
                                    page: 1,
                                    data: modal.data,
                                  });
                                }}
                                className={styles.five}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/content.png"
                                />
                                0 Contents
                                <img className={styles.ad} src="/ad.png" />
                              </div>
                              <div
                                onClick={() => {
                                  setmodal({
                                    open: true,
                                    page: 1,
                                    data: modal.data,
                                  });
                                }}
                                className={styles.five}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/content.png"
                                />
                                0 Contents
                                <img className={styles.ad} src="/ad.png" />
                              </div>
                              <div
                                onClick={() => {
                                  setmodal({
                                    open: true,
                                    page: 1,
                                    data: modal.data,
                                  });
                                }}
                                className={styles.five}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/content.png"
                                />
                                0 Contents
                                <img className={styles.ad} src="/ad.png" />
                              </div>
                              <div
                                onClick={() => {
                                  setmodal({
                                    open: true,
                                    page: 1,
                                    data: modal.data,
                                  });
                                }}
                                className={styles.five}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/content.png"
                                />
                                0 Contents
                                <img className={styles.ad} src="/ad.png" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {modal.page == 1 ? (
                      <div className={styles.modal}>
                        <div
                          onClick={() => {
                            setmodal({
                              open: true,
                              page: 0,
                              data: modal.data,
                            });
                          }}
                          className={styles.back}
                        >
                          <img src="/back.png" />
                        </div>
                        <div
                          onClick={() => {
                            setmodal({
                              open: false,
                              page: 0,
                              data: modal.data,
                            });
                          }}
                          className={styles.xcon}
                        >
                          <img src="/close.png" />
                        </div>
                        <div className={styles.mtop}>
                          <div className={styles.profiles}>
                            <img className={styles.profilepic} />
                            <div className={styles.textx}>
                              <text>{modal.data.user.name}</text>
                              <text>@{modal.data.user.username}</text>
                            </div>
                            <div
                              style={{ marginRight: 13 }}
                              className={styles.search}
                            >
                              <input placeholder="Search users"></input>
                              <img
                                className={styles.searchimg}
                                src="/search.png"
                              ></img>
                            </div>
                          </div>

                          <div className={styles.four}>
                            <img
                              className={styles.sideimg}
                              src="/contento.png"
                            />
                            {modal.data?.content?.posts}
                            Reactions
                          </div>
                        </div>
                        <div className={styles.beginings}>
                          <div className={styles.first}>Names</div>
                          <div className={styles.second}>Date</div>
                          <div className={styles.third}>Engagements</div>
                          <div className={styles.fourth}>Content</div>
                        </div>
                        {modal.data.user.posts.map((item, index) => {
                          return (
                            <div className={styles.beginingx}>
                              <div className={styles.firstx}>#styleUp</div>
                              <div className={styles.second}>
                                15TH March, 2021
                              </div>
                              <div className={styles.third}>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                  />
                                  0
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                  />
                                  0
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                  />
                                  0
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                  />
                                  0
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/repr.png"
                                  />
                                  0
                                </div>
                              </div>
                              <div
                                style={{ color: "#1795f9" }}
                                className={styles.fourth}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/galler.png"
                                />
                                <Link href={`/post/${item?._id}`}>
                                  View Contents
                                </Link>
                                <img
                                  onClick={() => {
                                    if (dropdown.page == 1) {
                                      setdropdown({
                                        page: -1,
                                      });
                                    } else {
                                      setdropdown({
                                        page: 1,
                                        index: index,
                                      });
                                    }
                                  }}
                                  src={"/ad.png"}
                                  className={`${styles.more} ${
                                    dropdown.page == 1 ? styles.rotate : ""
                                  } `}
                                />
                                {index == dropdown.index ? (
                                  <div className={styles.dropdown}>
                                    <Link href={`/post/${item?._id}`}>
                                      <div className={styles.dpitem}>
                                        <text>Watch content</text>
                                        <img />
                                      </div>
                                    </Link>
                                    <div className={styles.dpitem}>
                                      <text>Remove content</text>
                                      <img />
                                    </div>
                                    <div className={styles.dpitem}>
                                      <text>Suspend content</text>
                                      <img />
                                    </div>
                                    <div className={styles.dpitem}>
                                      <text>Suppend account</text>
                                      <img />
                                    </div>
                                    <div className={styles.dpitem}>
                                      <text>Delete account</text>
                                      <img />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {modal.page == 2 ? (
                      <div className={styles.modal}>
                        <div
                          onClick={() => {
                            setmodal({
                              open: false,
                              page: 0,
                              data: modal.data,
                            });
                          }}
                          className={styles.xcon}
                        >
                          <img src="/close.png" />
                        </div>
                        <div className={styles.beginings}>
                          <div className={styles.one}>Names</div>
                          <div className={styles.one}>Friends</div>
                          <div className={styles.one}>Followers</div>
                          <div className={styles.one}>Reactions</div>
                          <div className={styles.one}>Content</div>
                        </div>

                        <div
                          // style={{ marginBottom: index == reports.length - 1 ? 50 : 0 }}
                          className={styles.begining}
                        >
                          <div className={styles.five}>
                            {modal.data.user?.name}
                          </div>
                          <div
                            onClick={() => {
                              setmodal({
                                open: true,
                                page: 1,
                                data: modal.data,
                              });
                            }}
                            className={styles.five}
                          >
                            <img className={styles.sideimg} src="/users.png" />
                            {modal.data.friends} Friends
                          </div>
                          <div
                            onClick={() => {
                              setmodal({
                                open: true,
                                page: 1,
                                data: modal.data,
                              });
                            }}
                            className={styles.five}
                          >
                            <img className={styles.sideimg} src="/users1.png" />
                            {modal.data.followers} Followers
                          </div>
                          <div
                            onClick={() => {
                              setmodal({
                                open: true,
                                page: 1,
                                data: modal.data,
                              });
                            }}
                            className={styles.five}
                          >
                            <img
                              className={styles.sideimg}
                              src="/content.png"
                            />
                            {modal.data?.reactions?.likes +
                              modal.data?.reactions?.comments +
                              modal.data?.reactions?.commentsLikes}{" "}
                            Reactions
                            <img className={styles.ad} src="/ad.png" />
                          </div>
                          <div
                            onClick={() => {
                              setmodal({
                                open: true,
                                page: 1,
                                data: modal.data,
                              });
                            }}
                            className={styles.five}
                          >
                            <img
                              className={styles.sideimg}
                              src="/content.png"
                            />
                            {modal.data?.content?.posts +
                              modal.data?.content?.battleChallengePost}{" "}
                            Contents
                            <img className={styles.ad} src="/ad.png" />
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {modal.page == 3 ? (
                      <div className={styles.modal}>
                        <div
                          onClick={() => {
                            setmodal({
                              open: false,
                              page: 0,
                              data: modal.data,
                            });
                          }}
                          className={styles.xcon}
                        >
                          <img src="/close.png" />
                        </div>
                        <div className={styles.mtop}>
                          <div className={styles.profiles}>
                            <img
                              src={modal.data?.creator?.avatar}
                              className={styles.profilepic}
                            />
                            <div className={styles.textx}>
                              <text>{modal.data?.creator?.name}</text>
                              <text>@{modal.data?.creator?.username}</text>
                            </div>
                            {/* <div
                          style={{ marginRight: 13 }}
                          className={styles.search}
                        >
                          <input placeholder="Search users"></input>
                          <img
                            className={styles.searchimg}
                            src="/search.png"
                          ></img>
                        </div> */}
                          </div>

                          <div className={styles.four}></div>
                        </div>
                        <div className={styles.beginings}>
                          <div className={styles.first}>Names</div>
                          <div className={styles.second}>Date</div>
                          <div className={styles.third}>Engagements</div>
                          <div className={styles.fourth}>Content</div>
                        </div>
                        {modal?.data?.posts.map((item, index) => {
                          return (
                            <div className={styles.beginingx}>
                              <div className={styles.firstx}>
                                #{item?.hashtag}
                              </div>
                              <div className={styles.second}>
                                {convDate(item?.CreationTime)}
                              </div>
                              <div className={styles.third}>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                    alt="views"
                                  />
                                  {item?.viewsCount}
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                    alt="likes"
                                  />
                                  {item?.likeCount ? item?.likeCount : 0}
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                    alt="comments"
                                  />
                                  {item?.commentCount ? item?.commentCount : 0}
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/content.png"
                                    alt="shares"
                                  />
                                  {item?.shareCount ? item?.shareCount : 0}
                                </div>
                                <div>
                                  <img
                                    className={styles.sideimg}
                                    src="/repr.png"
                                  />
                                  0
                                </div>
                              </div>
                              <div
                                style={{ color: "#1795f9" }}
                                className={styles.fourth}
                              >
                                <img
                                  className={styles.sideimg}
                                  src="/galler.png"
                                />

                                <div
                                  onClick={() => {
                                    setmodal({
                                      page: -1,
                                    });
                                  }}
                                >
                                  <Link href={`/post/${item?._id}`}>
                                    Watch Content
                                  </Link>
                                </div>

                                <img
                                  onClick={() => {
                                    if (dropdown.page == 3) {
                                      setdropdown({
                                        page: -1,
                                      });
                                    } else {
                                      setdropdown({
                                        page: 3,
                                        index: index,
                                      });
                                    }
                                  }}
                                  src={"/ad.png"}
                                  className={`${styles.more} ${
                                    dropdown.index == index ? styles.rotate : ""
                                  } `}
                                />
                                {dropdown.index == index ? (
                                  <div className={styles.dropdown}>
                                    <div
                                      onClick={() => {
                                        setmodal({
                                          page: -1,
                                        });
                                      }}
                                      className={styles.dpitem}
                                    >
                                      {dropdown.index == index ? (
                                        <Link
                                          href={`/user/${item?.creator._id}`}
                                        >
                                          <text>View Profile</text>
                                        </Link>
                                      ) : null}
                                    </div>

                                    <div className={styles.dpitem}>
                                      <Link href={`/posts/${item?._id}`}>
                                        <text>View content</text>
                                      </Link>
                                      <img />
                                    </div>
                                    {/* <div className={styles.dpitem}>
                                    <text>Suspend content</text>
                                    <img />
                                  </div> */}
                                    {/* <div className={styles.dpitem}>
                                    <text>Suppend account</text>
                                    <img />
                                  </div> */}
                                    {/* <div className={styles.dpitem}>
                                    <text>Delete account</text>
                                    <img />
                                  </div> */}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {noti.open ? (
                  <NotiModal
                    onPress={(obj) => {
                      setnoti(obj);
                    }}
                    noti={noti}
                  />
                ) : null}

                {phone.open ? (
                  <PhoneModal
                    onPress={(obj) => {
                      setphone(obj);
                    }}
                    noti={phone}
                  />
                ) : null}
              </div>

              {loading && path !== "/auth" ? (
                <div className={styles.loadercon}>
                  <div className={`${styles.colsm} ${styles.textcenter}`}>
                    <div className={styles.loader1}>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              ) : null}
            </PhoneData.Provider>
          </NotiData.Provider>
        </ModalData.Provider>
      </AdminData.Provider>
    </ApolloProvider>
  );
}

export default MyApp;

export const getServerSideProps = async (context) => ({
  props: { host: context.req.headers.host || null },
});
