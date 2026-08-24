/** @format */

import Head from "next/head";
import { LOGIN_ADMIN } from "../graphQL/queries";
import { useLazyQuery } from "@apollo/client";
import styles from "../styles/Auth.module.scss";
import { useEffect, useState, useContext } from "react";
import { AdminData } from "../context";
import { useRouter } from "next/router";

export default function Auth() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const router = useRouter();

  let { admin, setadmin } = useContext(AdminData);

  const [loginAdmin, { loading, error, data }] = useLazyQuery(LOGIN_ADMIN);
  console.log(data, error, loading);

  useEffect(async () => {
    if (error) {
      //console.log(error);
      alert(error.message);
    }

    if (data?.LoginUser?.auth_token) {
      setadmin(data?.LoginUser);
      //console.log(data);
      await window.sessionStorage.setItem(
        "accessToken",
        data?.LoginUser?.auth_token
      );
      await window.sessionStorage.setItem(
        "adminProfile",
        JSON.stringify(data?.LoginUser)
      );
      router.push("/");
    }
  }, [data, error]);
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <img className={styles.logo} />

        <text className={styles.h1}>
          Log into your <br /> Candor Account
        </text>

        <input
          type="email"
          className={styles.input}
          placeholder="Company Email"
          onChange={(val) => {
            setemail(val.target.value);
          }}
          value={email}
        />
        <input
          type="password"
          className={styles.input}
          placeholder="Password"
          onChange={(val) => {
            setpassword(val.target.value);
          }}
          value={password}
        />

        <text className={styles.forgot}>Forgot password or company email?</text>

        <text className={styles.text}>
          Designed with protection from Candor. Privacy and Terms of services
          apply.
        </text>

        <div
          onClick={() => {
            loginAdmin({
              variables: {
                email: email,
                password: password,
              },
            });
          }}
          className={styles.btn}
        >
          {loading ? "Loading" : "Log In"}
        </div>
      </div>
    </div>
  );
}
