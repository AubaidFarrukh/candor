import styles from "../styles/Components.module.scss";
import Typography from "./Typography";

export default function Card({
  text = "",
  emoji = "",
  number = "",
  style = {},
  textType = "h1",
  width = "normal", // long, short
  children,
}) {
  return (
    <div style={{ ...style }} className={`${styles[width]} ${styles.card} }`}>
      <div className={styles.row}>
        <Typography style={{ width: "60%" }} text={text} type="h4" />

        <text className={styles.rowEmoji}>{emoji}</text>
      </div>

      {children ? (
        children
      ) : (
        <Typography
          text={number}
          type={textType}
          style={{
            color: "black",
            marginBottom: 10,
          }}
        />
      )}
    </div>
  );
}
