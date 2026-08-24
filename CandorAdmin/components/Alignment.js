import styles from "../styles/Components.module.scss";

export default function Alignment({
  direction = "row",
  justify = "",
  align = "",
  children,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: justify,
        alignItems: align,
        flexDirection: direction,
        ...style,
      }}
      className={""}
    >
      {children}
    </div>
  );
}
