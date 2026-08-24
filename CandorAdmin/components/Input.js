import styles from "../styles/Components.module.scss";

export default function Input({
  placeholder = "",
  height = "",
  width = "",
  style,
  onChange = () => {},
  value = "",
  type = "input",
  editable = true,
}) {
  return (
    <input
      className={styles[type]}
      placeholder={placeholder}
      style={{ width, height, ...style }}
      onChange={(val) => onChange(val.target.value)}
      value={value}
      contentEditable={editable}
      disabled={!editable}
    />
  );
}
