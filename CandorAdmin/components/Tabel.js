import Link from "next/link";
import styles from "../styles/Tabel.module.scss";
import { useState } from "react";
import Typography from "./Typography";
import Alignment from "./Alignment";
import Spacer from "./Spacer";
import Button from "./Button";

export default function Table({
  btnText = "",
  titles = [],
  onPress,
  children,
  onNext = () => {},
  onPrev = () => {},
  totalNumber = 0,
  currentNumber = 0,
  showFilter = true,
  showSearch = true,
  filterList = ["All"],
  filterSelected = ["All"],
  onSelectFilter = () => {},
  onSearch = () => {},
}) {
  const [search, setsearch] = useState(false);
  const [filter, setfilter] = useState(false);

  return (
    <div className={styles.tabel}>
      {filter && (
        <div
          style={{
            zIndex: 999999,
          }}
          className={styles.filter}
        >
          <img
            className={styles.close}
            onClick={() => setfilter(false)}
            src="/closew.png"
          />
          {filterList.map((item) => {
            return (
              <div
                onClick={() => onSelectFilter(item)}
                className={styles.fitem}
              >
                {filterSelected.includes(item) ? (
                  <img
                    className={styles.check}
                    onClick={() => {}}
                    src="/closew.png"
                  />
                ) : null}
                {item}
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.tabelHeader}>
        {titles.map((item) => {
          return (
            <div
              style={{
                width: item?.size,
              }}
              className={styles.one}
            >
              <Typography color="#767676" text={item?.name} type="h3" />
            </div>
          );
        })}

        <div
          style={{
            width: "9%",
          }}
          className={styles.five}
        >
          <Alignment
            style={{
              width: "75%",
              zIndex: 9,
            }}
            justify="flex-end"
            direction="row"
          >
            {showSearch && (
              <div className={styles.searchcon}>
                {search && (
                  <div className={styles.search}>
                    <input
                      onChange={(val) => {
                        onSearch(val.target.value);
                      }}
                      placeholder="Search name"
                    />
                    <div>
                      <img
                        onClick={() => {
                          setsearch(false);
                          onSearch("");
                        }}
                        src="/closew.png"
                      />
                    </div>
                  </div>
                )}
                <div
                  onClick={() => {
                    setsearch(true);
                  }}
                  className={styles.imageBtn}
                >
                  <img className={styles.image} src="/search.svg" />
                </div>
              </div>
            )}
            {showFilter && (
              <div onClick={() => setfilter(true)} className={styles.imageBtn}>
                <img className={styles.image} src="/filter.svg" />
              </div>
            )}
          </Alignment>
        </div>
      </div>

      {children}

      <div className={styles.footer}>
        {/* {} */}
        {/* <Typography color="#767676" text={"Rows per page(Week):"} type="h3" />
        <Spacer width={5} />

        <Typography text={"10"} type="h3" />

        <Spacer width={5} />
        <img className={styles.arrow} src="down2.svg" /> */}
        <Spacer width={40} />

        <Typography
          color="#767676"
          text={currentNumber + " of " + totalNumber}
          type="h3"
        />
        <Spacer width={30} />
        <img onClick={onPrev} className={styles.arrow} src="/left.svg" />
        <Spacer width={30} />
        <img onClick={onNext} className={styles.arrow} src="/right.svg" />
      </div>
    </div>
  );
}
