import React, { useCallback, useEffect, useState } from "react";
import logo from "../../../Images/logo.png";
import { useSelector } from "react-redux";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import Navbar from "../../../components/Navbar";
import { GetUserForSelectedLanguage } from "../../../components/SkillOwner/HelperFunction/GetUserForSelectedLanguage";
import ResumeContent from "../../../components/Resume/ResumeContent";
import ResumeControls from "../../../components/Resume/ResumeControls";
import { resumeBGImages } from "./resumeImageData";

const ResumeTemplate = () => {
  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    content,
    regionalData,
    SkillsApplied,
    SkillSelected,
    resumeSkills,
    TopSkill,
    getUserValidation: { userValidationData },
  } = useSelector((state) => state);
  const userDetails = useSelector((state) =>
    GetUserForSelectedLanguage(state.userProfile.data, selectedLanguage)
  );
  const SkillsAcquired = useSelector((state) => state.SkillsAcquired.data);

  /* STATES INIT */
  const [timestamp, setTimestamp] = useState();
  const [skillAppliedCount, setSkillAppliedCount] = useState(0);
  const [skillAcquiredCount, setSkillAcquiredCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [fontColor, setFontColor] = useState("#808080");
  const [profileNameColor, setProfileNameColor] = useState("");
  const [profieOtherDetailColor, setProfileOtherDetailColor] = useState("");
  const [alignment, setAlignment] = useState("left");
  const [profileNameAlignment, setProfileNameAlignment] = useState("");
  const [profileDetailAlignment, setProfileDetailAlignment] = useState("");
  const [isProfileImgLeft, setIsProfileImgLeft] = useState(true);
  const [isShowStylingOptions, setIsShowStylingOptions] = useState(false);
  const [isCustomize, setIsCustomize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [top5Skills, setTop5Skills] = useState([]);
  const [remainingSkills, setRemainingSkills] = useState([]);
  /* FONT SIZE STATE */
  const [fontSize, setFontSize] = useState(14);
  const [profileNameSize, setProfileNameSize] = useState(28);
  const [profielDetailSize, setProfileDetailSize] = useState(14);

  /* BACKGROUND IMAGE FOR HEADER */
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {}, [resumeSkills]);

  useEffect(() => {
    SkillsApplied?.data?.map(
      (skill, ind) =>
        skill.mlanguage === selectedLanguage &&
        SkillSelected.skillOccupation === skill.title &&
        setSkillAppliedCount(skillAppliedCount + 1)
    );
  }, [SkillSelected, SkillsApplied, SkillsAcquired, selectedLanguage]);

  useEffect(() => {}, [userValidationData]);

  useEffect(() => {
    SkillsAcquired?.map(
      (skill, ind) =>
        skill.mlanguage === selectedLanguage &&
        SkillSelected?.skillOccupation === skill.title &&
        setSkillAcquiredCount(skillAcquiredCount + 1)
    );
  }, [SkillSelected?.skillOccupation, SkillsAcquired, selectedLanguage]);

  useEffect(() => {
    if (TopSkill?.status === "success") {
      const filteredSkills = TopSkill?.data?.filter(
        (val) => val?.mlanguage === selectedLanguage
      );
      setAllSkills(filteredSkills);
    }
  }, [TopSkill?.status, TopSkill?.data, selectedLanguage]);

  useEffect(() => {
    if (allSkills.length > 0) {
      setTop5Skills(allSkills.slice(0, 5));
      setRemainingSkills(allSkills.slice(5, 15));
    }
  }, [allSkills]);

  useEffect(() => {
    setTimestamp(
      formatTimestampToDate(
        new Date().getTime(),
        regionalData.selectedCountry.dateFormat
      )
    );
  }, [regionalData]);

  /* HANDLE COLOR CHANGE */
  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
    setBackgroundImage(null);
  }, []);

  /* HANDLE FONT COLOR CHANGE */
  const handleFontColor = useCallback((fc) => {
    setFontColor(fc);
  }, []);

  /* HANDLE PROFILE NAME FONT COLOR */
  const handleProfileNameColor = useCallback((fontCol) => {
    setProfileNameColor(fontCol);
  }, []);

  /* HANDLE PROFILE OTHER DETAIL FONT COLOR */
  const handleProfileOtherColor = useCallback((fontCol) => {
    setProfileOtherDetailColor(fontCol);
  }, []);

  /* HANDLE HEADER TEXT ALIGNMENT */
  const handleAlignmentChange = useCallback((align) => {
    setAlignment(align);
  }, []);

  /* PROFILE NAME ALIGNMENT */
  const handleProfileNameAlignment = useCallback((alignPName) => {
    setProfileNameAlignment(alignPName);
  }, []);

  /* HANDLE PROFILE OTHER DETAIL ALIGNMENT */
  const handleOtherDetailAligment = useCallback((alignmentOtherD) => {
    setProfileDetailAlignment(alignmentOtherD);
  }, []);

  /* HANDLE HEADER COLUMN ALIGNMENT */
  const handleHeaderColAlign = useCallback(() => {
    setIsProfileImgLeft((prev) => !prev);
  }, []);

  /* HANDLE FONT SIZE INCREMENT */
  const handleFontSizeInc = useCallback(() => {
    setFontSize((prev) => prev + 1);
  }, []);

  /* HANDLE FONT SIZE DECREMENT */
  const handleFontSizeDec = useCallback(() => {
    setFontSize((prev) => prev - 1);
  }, []);

  /* HANDLE FONT SIZE INC PROFILE NAME */
  const handleFontPNSizeInc = useCallback(() => {
    setProfileNameSize((prev) => prev + 1);
  }, []);

  /* HANDLE FONT SIZE DEC PROFILE NAME */
  const handleFontPNSizeDec = useCallback(() => {
    setProfileNameSize((prev) => prev - 1);
  }, []);

  /* HANDLE FONT SIZE INC PROFILE DETAIL */
  const handleFontOtherDSizeInc = useCallback(() => {
    setProfileDetailSize((prev) => prev + 1);
  }, []);

  /* HANDLE FONT SIZE DEC PROFILE DETAIL */
  const handleFontOtherDSizeDec = useCallback(() => {
    setProfileDetailSize((prev) => prev - 1);
  }, []);

  /* HANDLE BACKGROUND IMAGE CHANGE */
  const handleBackgroundImageChange = useCallback((image) => {
    setBackgroundImage(image);
    setSelectedColor("#FFFFFF");
  }, []);

  /* HANDLE STYLING OPTIONS */
  const handleStylingOptions = useCallback(
    (value) => {
      setIsShowStylingOptions((prev) => !prev);
      /* CONFIGURE VALUE PASSED */
      if (value === "profileName") {
        handleProfileNameColor();
        setProfileNameColor(profileNameColor);
      } else if (value === "OtherDetails") {
        handleProfileOtherColor();
        setProfileOtherDetailColor(profieOtherDetailColor);
      }
    },
    [
      handleProfileNameColor,
      handleProfileOtherColor,
      profileNameColor,
      profieOtherDetailColor,
    ]
  );

  /* HANDLE CUSTOMIZE TOGGLE */
  const handleCustomizeToggle = useCallback(() => {
    setIsCustomize(true);
  }, []);

  return (
    <React.Fragment>
      {/* RESUME TEMPLATE STARTS */}
      <div className="d-flex resume-whole-container">
        <div style={{ flex: "1", order: "2" }} className="no-print">
          {!isCustomize && (
            <div
              className="btn"
              style={{
                margin: "20px auto",
                border: "2px solid var(--primary-color)",
                color: "var(--primary-color)",
              }}
              onClick={handleCustomizeToggle}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Customize"
                ) || {}
              ).mvalue || "nf Customize"}
              ...
            </div>
          )}
          {isCustomize && (
            <React.Fragment>
              <div className="d-flex justify-content-center mt-2 no-print">
                <span className="fw-bold fs-2 text-success no-print">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CustomizeYourResume"
                    ) || {}
                  ).mvalue || "nf Customize your Resume"}
                </span>
              </div>
              <div className="d-flex justify-content-center no-print">
                <div className="fw-bold fs-6 text-success no-print">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SelectTemplateColor"
                    ) || {}
                  ).mvalue || "nf Select a template color"}
                </div>
              </div>
              <ResumeControls
                handleColorChange={handleColorChange}
                handleFontColor={handleFontColor}
                handleFontSizeInc={handleFontSizeInc}
                handleFontSizeDec={handleFontSizeDec}
                handleAlignmentChange={handleAlignmentChange}
                handleHeaderColAlign={handleHeaderColAlign}
                handleBackgroundImageChange={handleBackgroundImageChange}
                isLoading={isLoading}
                resumeBGImages={resumeBGImages}
              />
            </React.Fragment>
          )}
        </div>
        {/* RESUME CONTENT */}
        <div style={{ flex: "3", order: "1" }}>
          <ResumeContent
            logo={logo}
            content={content}
            selectedLanguage={selectedLanguage}
            timestamp={timestamp}
            userDetails={userDetails}
            selectedColor={selectedColor}
            fontColor={fontColor}
            profileNameColor={profileNameColor}
            profieOtherDetailColor={profieOtherDetailColor}
            skillAppliedCount={skillAppliedCount}
            skillAcquiredCount={skillAcquiredCount}
            SkillsApplied={SkillsApplied}
            SkillSelected={SkillSelected}
            SkillsAcquired={SkillsAcquired}
            regionalData={regionalData}
            alignment={alignment}
            fontSize={fontSize}
            isProfileImgLeft={isProfileImgLeft}
            handleFontColor={handleFontColor}
            handleProfileNameColor={handleProfileNameColor}
            handleProfileOtherColor={handleProfileOtherColor}
            handleAlignmentChange={handleAlignmentChange}
            handleProfileNameAlignment={handleProfileNameAlignment}
            handleOtherDetailAligment={handleOtherDetailAligment}
            profileNameAlignment={profileNameAlignment}
            profileDetailAlignment={profileDetailAlignment}
            handleStylingOptions={handleStylingOptions}
            isShowStylingOptions={isShowStylingOptions}
            setIsShowStylingOptions={setIsShowStylingOptions}
            profileNameSize={profileNameSize}
            profielDetailSize={profielDetailSize}
            handleFontPNSizeDec={handleFontPNSizeDec}
            handleFontPNSizeInc={handleFontPNSizeInc}
            handleFontOtherDSizeDec={handleFontOtherDSizeDec}
            handleFontOtherDSizeInc={handleFontOtherDSizeInc}
            backgroundImage={backgroundImage}
            top5Skills={top5Skills}
            remainingSkills={remainingSkills}
            userValidationData={userValidationData}
            resumeSkills={resumeSkills}
          />
        </div>
      </div>
      {/* BUTTONS */}
      <div
        className="d-flex w-100 gap-2 p-4 pt-2 justify-content-between bg-white no-print d-print-none"
        style={{ bottom: "10px" }}
      >
        <button
          className="btn"
          style={{
            border: "2px solid var(--primary-color)",
            color: "var(--primary-color)",
            opacity: ".5",
          }}
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Back"
            ) || {}
          ).mvalue || "nf Back"}
        </button>
        <button
          className="btn"
          style={{ backgroundColor: "var(--primary-color)", color: "white" }}
          onClick={() => window.print()}
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Next"
            ) || {}
          ).mvalue || "nf Next"}
        </button>
      </div>
    </React.Fragment>
  );
};

export default ResumeTemplate;
