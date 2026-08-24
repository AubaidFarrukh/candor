import styles from "../styles/Components.module.scss";

export default function Button({
  outline = false,
  text = "",
  rightImg,
  leftImg,
  onPress = () => {},
  type = "button", // outline, square, disable
  inactive = false,
  style,
}) {
  return (
    <div
      onClick={inactive?()=>{}:onPress}
      style={{
        opacity: inactive ? 0.5 : 1,
        ...style,
      }}
      className={`${styles[type]}`}
    >
      {leftImg && (
        <img
          id="poly"
          onClick={() => {
            //   setpoly(!poly);
          }}
          src={leftImg}
          className={`${styles.add}`}
        />
      )}
      {text}
      {rightImg && (
        <img
          id="poly"
          onClick={() => {
            //   setpoly(!poly);
          }}
          src={rightImg}
          className={`${styles.down}`}
        />
      )}
    </div>
  );
}
