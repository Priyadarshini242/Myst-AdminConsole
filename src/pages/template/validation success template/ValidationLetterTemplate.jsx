import React from "react";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";

const ValidationLetterTemplate = ({
  dateSent,
  firstName,
  lastName,
  skillOccupation,
  fromDate,
  toDate,
  briefDescription,
  keyName,
  keyTable,
  relationship,
  location,
}) => {
  const letterStyle = {
    fontFamily: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fafafa",
    borderRadius: "10px",
  };

  const paragraphStyle = {
    margin: "10px 0",
    lineHeight: "1.6",
  };

  const headerStyle = {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "20px",
    textDecoration: "underline",
    color: "#333",
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
  };

  return (
    <div style={letterStyle}>
      <h2 style={headerStyle}>Validation Request</h2>
      <p style={paragraphStyle}>
        <strong>Date:</strong>{" "}
        {formatTimestampToDate(Number(dateSent), "mm/dd/yyyy")}
      </p>
      <p style={paragraphStyle}>Hi,</p>
      <p style={paragraphStyle}>I hope this letter finds you well.</p>
      <p style={paragraphStyle}>
        I am reaching out to kindly request your assistance with{" "}
        {skillOccupation}. Your expertise and experience in this field are
        greatly appreciated, and I believe your insight would be invaluable.
      </p>
      <p style={paragraphStyle}>
        The period of time that I am seeking validation for is from{" "}
        {formatTimestampToDate(Number(fromDate), "mm/dd/yyyy")} to{" "}
        {formatTimestampToDate(Number(toDate), "mm/dd/yyyy")}.
      </p>
      <p style={paragraphStyle}>
        Here is a brief description of the {skillOccupation} activities that I
        have been engaged in during this time: {briefDescription}.
      </p>
      <p style={paragraphStyle}>
        Attached are the key elements of my work during this period, including{" "}
        {keyTable} in the {keyName}.
      </p>
      <p style={paragraphStyle}>
        Our {relationship} and your support would mean a lot to me. Your
        validation would greatly assist in solidifying my standing in the{" "}
        {location} community.
      </p>
      <p style={paragraphStyle}>
        Thank you very much for considering my request. Please let me know if
        you require any further information or clarification.
      </p>
      <p style={paragraphStyle}>Warm regards,</p>
      <p style={paragraphStyle}>
        {firstName} {lastName}
      </p>
    </div>
  );
};

export default ValidationLetterTemplate;