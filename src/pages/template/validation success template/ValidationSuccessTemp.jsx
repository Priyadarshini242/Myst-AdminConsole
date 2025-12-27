import React from "react";
import LottieAnimation from "./LottieAnimation ";

const ValidationSuccessTemp = ({ content, selectedLanguage }) => {
  return (
    <div className="d-flex flex-column align-items-center text-center">
      <div
        style={{
          color: "#4caf50",
          fontSize: "5rem",
          animation: "heartbeat 1s infinite",
          width: "100%",
          height: "100%",
        }}
      >
        <LottieAnimation />
      </div>
      <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
        {(
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "ValidationSubmitted"
          ) || {}
        ).mvalue || "nf Validation Already Submitted"}
      </h2>
      <p style={{ fontSize: "1.4rem", color: "#666" }}>
        {(
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "ThanksForCooperation"
          ) || {}
        ).mvalue || "nf Thank you for your Cooperation"}
        !
      </p>
    </div>
  );
};

export default ValidationSuccessTemp;
