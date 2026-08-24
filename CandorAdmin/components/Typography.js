import styles from "../styles/Components.module.scss";

export default function Typography({
  type = "h4",
  text = "",
  style = {},
  color = "",
}) {
  return (
    <text style={{ color: color, ...style }} className={`${styles[type]}`}>
      {`${text}`}
    </text>
  );
}
