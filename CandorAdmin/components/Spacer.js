import styles from "../styles/Components.module.scss";

export default function Spacer({ text = "", height = 0, width = 0 }) {
  return <div style={{ width, height }} />;
}
