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
import Create from "./Create";
import Report from "./Report";

export default function Header({ profile }) {
  let { admin, setadmin } = useContext(AdminData);
  const [poly, setpoly] = useState(false);
  const [test, settest] = useState(false);
  const [showModal, setshowModal] = useState(false);
  const [showReport, setshowReport] = useState(false);
  const [testname, settestname] = useState("PRODUCTION");

  useEffect(() => {
    const pathname =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "";

    console.log(pathname);

    if (pathname == "https://manage.playcandor.com") {
      settestname("PRODUCTION");
    } else {
      settestname("TESTING");
    }
  }, []);

  return (
    <div className={styles.topone}>
      <Button
        onPress={() => setshowModal(true)}
        leftImg={"/add.svg"}
        text="Create"
      />
      {/* <Button rightImg={"/down.svg"} type="outline" text="Testing" /> */}
      <div
        onClick={() => {
          settest(!test);
        }}
        className={styles.apitype}
        style={{
          color: testname == "TESTING" ? "#1795f9" : "#09ce89",
          borderColor: testname == "TESTING" ? "#1795f9" : "#09ce89",
        }}
      >
        {testname}
      </div>
      <Button
        onPress={() => setshowReport(true)}
        leftImg={"/repr.png"}
        text="Report"
        style={{
          borderColor: "red",
          color: "red",
        }}
        type="outline"
      />

      <img src={"/user.png"} className={styles.profilepic} />
      <img
        id="poly"
        onClick={() => {
          setpoly(!poly);
        }}
        src="/poly.svg"
        className={`${styles.poly} ${poly ? styles.rotate : ""} `}
      />

      {poly ? (
        <div className={styles.topdrop}>
          <div
            onClick={async () => {
              await window.sessionStorage.clear();
              window.location.reload();
            }}
            className={styles.topdropitem}
          >
            <text>Log out</text>
            <img src="/ar.png" className={`${styles.al}`} />
          </div>
        </div>
      ) : null}

      {test ? (
        <div className={styles.topdrop2}>
          <div
            onClick={async () => {
              if (testname == "PRODUCTION") {
                window.open("https://staging-manage.playcandor.com", "_self");
              } else {
                window.open("https://manage.playcandor.com", "_self");
              }

              settest(false);
            }}
            className={styles.topdropitem2}
          >
            <text
              style={{
                color: testname == "PRODUCTION" ? "#1795f9" : "#09ce89",
              }}
            >
              {testname == "PRODUCTION" ? "TESTING" : "PRODUCTION"}
            </text>
          </div>
        </div>
      ) : null}

      {showModal && <Create onClose={() => setshowModal(false)} />}

      {showReport && <Report onClose={() => setshowReport(false)} />}
    </div>
  );
}

export async function getServerSideProps(context) {
  return { props: { host: "hey" } };
}
