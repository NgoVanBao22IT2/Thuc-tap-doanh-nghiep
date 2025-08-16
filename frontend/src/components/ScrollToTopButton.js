import React from "react";

const ScrollToTopButton = ({
  bottom = 88,
  right = 32,
  zIndex = 999,
  iconClass = "bi bi-arrow-up",
  color = "#00a65a",
  ...props
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom,
        right,
        zIndex,
        background: color,
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 24,
        cursor: "pointer",
      }}
      title="Lên đầu trang"
      {...props}
    >
      <i className={iconClass}></i>
    </button>
  );
};

export default ScrollToTopButton;
