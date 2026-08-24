import Head from "next/head";
import styles from "../styles/Home.module.scss";
import { useState } from "react";

export default function Filter({ red = false, cal = true, onfilter }) {
  const [filter, setFilter] = useState(false);
  const [filterType, setFilterType] = useState("All");
  return (
    <div className={styles.gtright}>
      <div
        style={{ borderColor: red ? "#fc3737" : "#744efc" }}
        className={styles.filtercon}
        onClick={() => {
          setFilter(!filter);
        }}
      >
        {red ? (
          <img className={styles.fimg} src="/flagr.png" />
        ) : (
          <img className={styles.fimg} src="/flag.png" />
        )}

        <text>{filterType}</text>
        <img
          src="/ad.png"
          className={`${styles.ad} ${filter ? styles.rotate : ""} `}
        />
        {filter ? (
          red ? (
            <div
              style={{ backgroundColor: red ? "#ffdada" : "#b4a0ff" }}
              className={styles.dropdown}
            >
              <div
                onClick={() => {
                  setFilterType("All");
                  onfilter("all");
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>All</text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Account");
                  onfilter("account");
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Account
                </text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Post");
                  onfilter("challengepost");
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>Post</text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Battle");
                  onfilter("battlechallenge");
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>Battle</text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Challenge");
                  onfilter("challengepost");
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Challenge
                </text>
                <img />
              </div>
            </div>
          ) : (
            <div
              style={{
                zIndex: 9999,
                backgroundColor: red ? "#ffdada" : "#b4a0ff",
              }}
              className={styles.dropdown}
            >
              <div
                onClick={() => {
                  setFilterType("All");
                  onfilter(1);
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>All</text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Numer of Users");
                  onfilter(2);
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Numer of Users
                </text>
                <img />
              </div>
              <div
                onClick={() => {
                  setFilterType("Active Users");
                  onfilter(3);
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Active Users
                </text>
                <img />
              </div>

              <div
                onClick={() => {
                  setFilterType("Content Created");
                  onfilter(4);
                }}
                className={styles.dpitem}
              >
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Content Created
                </text>
                <img />
              </div>

              {/* <div onClick={() => {
                  setFilterType("Numer of Users");
                }} className={styles.dpitem}>
                <text style={{ color: red ? "#fc3737" : "white" }}>
                  Reported Users
                </text>
                <img />
              </div> */}
            </div>
          )
        ) : null}
      </div>
      {cal ? (
        <div
          style={{ borderColor: red ? "red" : "#744efc" }}
          className={styles.filtercon}
        >
          {red ? (
            <img className={styles.fimg} src="/calendarr.png" />
          ) : (
            <img className={styles.fimg} src="/calendar.png" />
          )}

          <text>All time</text>
          {/* <img /> */}
        </div>
      ) : null}
    </div>
  );
}
