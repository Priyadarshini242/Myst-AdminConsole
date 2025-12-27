import React from "react";
import PrimaryBtn from "../../../../components/Buttons/PrimaryBtn";
import useContent from "../../../../hooks/useContent";

const JobViewSoAlertBox = ({
  FaTimes,
  setShowAlert,
  FaExclamationTriangle,
}) => {
  return (
    <main
      className="card shadow rounded w-100 h-100 p-2"
      style={{
        minWidth: "20rem",
        maxWidth: "25rem",
        zIndex: "999",
      }}
    >
      <section className="d-flex justify-content-between align-items-center">
        <div className="fw-bold d-flex align-items-center">
          {useContent("Warning", "nf Warning")}
          &nbsp;
          <span
            style={{
              color: useContent("SystemGreenColor", "var(--primary-color)"),
            }}
          >
            <FaExclamationTriangle />
          </span>
        </div>
        <div style={{ cursor: "pointer" }} onClick={() => setShowAlert(false)}>
          <FaTimes />
        </div>
      </section>
      <section className="mt-2">
        {useContent(
          "PleaseFillDetailsAndProceed",
          "nf Please fill your details and then proceed"
        )}
      </section>
      {/* BUTTONS */}
      <section className={`d-flex justify-content-end align-items-center mt-2`}>
        <PrimaryBtn
          style={{
            color: useContent("NavBarFontColor", "#000"),
            backgroundColor: useContent("NavBarBgColor", "#000"),
            direction: useContent("Direction", "ltr"),
          }}
          label={useContent("Yes", "nf Yes")}
          onClick={() => setShowAlert(false)}
        />
      </section>
    </main>
  );
};

export default JobViewSoAlertBox;
