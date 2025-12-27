import React from "react";
import PrimaryBtn from "../../../../components/Buttons/PrimaryBtn";
import useContent from "../../../../hooks/useContent";

const NewOwnerCard = ({
  content,
  selectedLanguage,
  setIsOwner,
  FaTimes,
  handleAddOwnerRole,
  roleAdding,
  FaExclamationTriangle,
}) => {
  return (
    <div
      className="card shadow rounded w-100 h-100 p-2"
      style={{
        minWidth: "20rem",
        maxWidth: "25rem",
        zIndex: "999",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
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
        <div style={{ cursor: "pointer" }} onClick={() => setIsOwner(true)}>
          <FaTimes />
        </div>
      </div>
      <div className="mt-2">
        {useContent(
          "NotHavingSkillOwnerProfile",
          "nf You're not having profile as Skill Owner, Like to create one?"
        )}
      </div>
      {/* BUTTONS */}
      <div className={`d-flex justify-content-evenly align-items-center mt-2`}>
        <PrimaryBtn
          style={{
            color: useContent("NavBarFontColor", "#000"),
            backgroundColor: useContent("NavBarBgColor", "#000"),
            direction: useContent("Direction", "ltr"),
          }}
          label={useContent("No", "nf No")}
          onClick={() => setIsOwner(true)}
        />
        <PrimaryBtn
          style={{
            color: useContent("NavBarFontColor", "#000"),
            backgroundColor: useContent("NavBarBgColor", "#000"),
            direction: useContent("Direction", "ltr"),
          }}
          className={`${roleAdding && "btn-loading"}`}
          label={useContent("Yes", "nf Yes")}
          onClick={handleAddOwnerRole}
        />
      </div>
    </div>
  );
};

export default NewOwnerCard;
