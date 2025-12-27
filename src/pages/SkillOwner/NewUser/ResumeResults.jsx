import React, { useCallback, useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import PostApi from "../../../api/PostData/PostApi";
import SkillSuggestionApi from "../../../api/skillOwner/mySkill/SkillSuggestionApi";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import SuccessBtn from "../../../components/Buttons/SuccessBtn";
import { toTitleCase } from "../../../components/SkillOwner/HelperFunction/toTitleCase";
import CreateSelectOccupation from "../../../components/SkillOwner/SelectComponent/CreateSelectOccupation";
import ResumeAchi from "./components/ResumeAchi";
import ResumeAsso from "./components/ResumeAsso";
import ResumeCert from "./components/ResumeCert";
import ResumeEdu from "./components/ResumeEdu";
import ResumeEmp from "./components/ResumeEmp";
import ResumeLang from "./components/ResumeLang";
import ResumeLice from "./components/ResumeLice";
import ResumePersonalAttributes from "./components/ResumePersonalAttributes";
import ResumeProfile from "./components/ResumeProfile";
import ResumeRef from "./components/ResumeRef";
import ResumeTrain from "./components/ResumeTrain";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const ResumeResults = () => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const topSkill = useSelector((state) => state.TopSkill);
  const [resumeData, setResumeData] = useState(
    JSON.parse(sessionStorage.getItem("resumeData"))?.Value?.ResumeData
  );
  const [profileInfo, setProfileInfo] = useState(null);
  const [resumePersonalAtt, setResumePersonalAtt] = useState(null);
  const [resumeSkills, setResumeSkills] = useState(null);
  const [resumeEmp, setResumeEmp] = useState(null);
  const [resumeEdu, setResumeEdu] = useState(null);
  const [resumeCert, setResumeCert] = useState(null);
  const [resumeLice, setResumeLice] = useState(null);
  const [resumeTrain, setResumeTrain] = useState(null);
  const [resumeAsso, setResumeAsso] = useState(null);
  const [resumeLang, setResumeLang] = useState(null);
  const [resumeAchi, setResumeAchi] = useState(null);
  const [resumeRef, setResumeRef] = useState(null);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowOccupationPopup, setIsShowOccupationPopup] = useState(false);
  const [isSavingOccupation, setIsSavingOccupation] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [isNewOccupation, setIsNewOccupation] = useState(false);
  const [skillValue, setSkillValue] = useState("");
  const [startImport, setStartImport] = useState(false);

  useEffect(() => {}, [selectedOccupation]);

  /* HANDLE CREATING NEW SKILL IN MASTER */
  const handleInsertNewSkill = useCallback(
    async (
      newSkillName,
      occupationNameData,
      skillOccupationNameData,
      lang,
      moduleName,
      contentName,
      itemId
    ) => {
      const payload = {
        skill: newSkillName,
        occupation: occupationNameData,
        skillOccupation: skillOccupationNameData,
        mlanguage: lang,
        mstatus: "W",
      };
      try {
        const res = await exceptionPOSTapi("skill", payload);
        const data = res?.data;

        handleSkillExceptions(
          data?.applicationName,
          data?.id,
          moduleName,
          contentName,
          itemId
        );
        if (isNewOccupation) {
          handleOccupationExceptions(
            data?.applicationName,
            data?.id,
            moduleName,
            occupationNameData,
            itemId
          );
        }
      } catch (error) {
        console.error("Error inserting new skill: ", error);
      }
    },
    [isNewOccupation]
  );

  /* HANDLE SKILL EXCEPTION */
  const handleSkillExceptions = async (
    applicationName,
    recordId,
    moduleName,
    contentName,
    itemId
  ) => {
    const body = {
      masterTable: applicationName,
      masterTableRecordID: recordId,
      module: moduleName,
      userId:getCookie("userId"),
      content: contentName,
      itemId: itemId,
      status: "New",
    };
    try {
      await exceptionPOSTapi("Exceptions", body);
    } catch (error) {
      console.error("Error while handling exceptions: ", error);
    }
  };

  /* HANDLE OCCUPATION EXCEPTION */
  const handleOccupationExceptions = async (
    applicationName,
    recordId,
    moduleName,
    contentName,
    itemId
  ) => {
    const body = {
      masterTable: applicationName,
      masterTableRecordID: recordId,
      module: moduleName,
      userId:getCookie("userId"),
      content: contentName,
      itemId: itemId,
      status: "New",
    };
    try {
      await exceptionPOSTapi("Exceptions", body);
    } catch (error) {
      console.error("Error while handling exceptions: ", error);
    }
  };

  /* CHECK FOR SKILL */
  const checkSkillExists = async (lang, skillValue) => {
    try {
      const response = await SkillSuggestionApi(skillValue, lang, "skill");
      const insSet = new Set(
        response?.data.map((val) => val?.skill?.toLowerCase())
      );
      return insSet.has(skillValue?.toLowerCase());
    } catch (error) {
      console.error("Error checking skill existence: ", error);
      return false;
    }
  };

  /* MEMOIZE THAT API */
  const memoizedCheckSkillExists = useCallback(checkSkillExists, []);

  /* IMPORT SKILLS */
  const handleImportSkill = useCallback(async (skillVal) => {
    setIsShowOccupationPopup(true);
    setSkillValue(skillVal);
  }, []);

  /* HANDLE OCCUPATION SAVE */
  const handleOccupationSave = () => {
    setIsSavingOccupation(true);
    setIsShowOccupationPopup(false);
    /* RETURN TO FALSE */
    setIsSavingOccupation(false);
    setStartImport(true);
  };

  const dataUpload = useCallback(async () => {
    if (
      startImport &&
      selectedOccupation &&
      selectedOccupation?.label &&
      !isSavingOccupation &&
      !isShowOccupationPopup
    ) {
      setIsLoading(true);
      try {
        const findRank = topSkill?.data?.filter(
          (item) => item.mlanguage === selectedLanguage
        );
        const titleCaseSkillName = toTitleCase(skillValue);
        const formattedSkillOccupation = `${titleCaseSkillName} || ${selectedOccupation?.label}`;
        const payload = {
          title: "",
          skillOccupation: formattedSkillOccupation,
          skill: titleCaseSkillName,
          occupation: selectedOccupation?.label,
          userId:getCookie("userId"),
          mlanguage: selectedLanguage,
          userRank: findRank.length + 1,
          yoe: "0",
        };
        /* CREATE A SKILL */
        const res = await PostApi("User Skills", payload);
        const data = res?.data;
        const isSkillExists = await memoizedCheckSkillExists(
          selectedLanguage,
          skillValue
        );
        console.log("SKILL CONSOLE FOR CHECK", isSkillExists);
        if (!isSkillExists) {
          handleInsertNewSkill(
            data?.skill,
            data?.occupation,
            data?.skillOccupation,
            data?.mlanguage,
            data?.applicationName,
            data?.skill,
            data?.id
          );
        }
        /* RESETTING STATES */
        setSelectedOccupation(null);
        setIsNewOccupation(false);
        setSkillValue("");
        setStartImport(false);
      } catch (error) {
        console.error("Error importing the skill: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    handleInsertNewSkill,
    memoizedCheckSkillExists,
    selectedLanguage,
    selectedOccupation,
    skillValue,
    topSkill?.data,
    startImport,
    isSavingOccupation,
    isShowOccupationPopup,
  ]);

  useEffect(() => {
    dataUpload();
  }, [dataUpload]);

  useEffect(() => {
    const profileInfo = {
      fullName: resumeData?.ContactInformation?.CandidateName.FormattedName,
      firstName: resumeData?.ContactInformation?.CandidateName?.GivenName,
      lastName: resumeData?.ContactInformation?.CandidateName?.FamilyName,
      address: resumeData?.ContactInformation?.Location?.StreetAddressLines,
      city: resumeData?.ContactInformation?.Location?.Municipality,
      state: resumeData?.ContactInformation?.Location?.Regions
        ? resumeData?.ContactInformation?.Location?.Regions[0]
        : "",
      country: resumeData?.ContactInformation?.Location?.CountryCode,
      postalCode: resumeData?.ContactInformation?.Location?.PostalCode,
      phone: resumeData?.ContactInformation?.Telephones
        ? resumeData?.ContactInformation?.Telephones[0]?.Raw
        : "",
      about: resumeData?.ProfessionalSummary,
      objective: resumeData?.Objective,
      edit: false,
    };
    const resumePersonalAtt = resumeData?.PersonalAttributes && {
      availability: resumeData?.PersonalAttributes?.Availability,
      birthplace: resumeData?.PersonalAttributes?.Birthplace,
      currentLocation: resumeData?.PersonalAttributes?.CurrentLocation,
      drivingLicense: resumeData?.PersonalAttributes?.DrivingLicense,
      DOB: resumeData?.PersonalAttributes?.DateOfBirth?.Date,
      currentSalaryAmount:
        resumeData?.PersonalAttributes?.CurrentSalary?.Amount,
      currentSalaryCurrency:
        resumeData?.PersonalAttributes?.CurrentSalary?.Currency,
      requiredSalaryAmount:
        resumeData?.PersonalAttributes?.RequiredSalary?.Amount,
      requiredSalaryCurrency:
        resumeData?.PersonalAttributes?.RequiredSalary?.Currency,
      familyComposition: resumeData?.PersonalAttributes?.FamilyComposition,
      fathersName: resumeData?.PersonalAttributes?.FathersName,
      gender: resumeData?.PersonalAttributes?.Gender,
      maritalStatus: resumeData?.PersonalAttributes?.MaritalStatus,
      mothersMaidenName: resumeData?.PersonalAttributes?.MothersMaidenName,
      motherTongue: resumeData?.PersonalAttributes?.MotherTongue,
      nationality: resumeData?.PersonalAttributes?.Nationality,
      // nationalIdentities   : resumeData?.PersonalAttributes?.NationalIdentities[0] ? resumeData?.PersonalAttributes?.NationalIdentities[0]?.Phrase : '',
      passportNumber: resumeData?.PersonalAttributes?.PassportNumber,
      preferredLocation: resumeData?.PersonalAttributes?.PreferredLocation,
      visaStatus: resumeData?.PersonalAttributes?.VisaStatus,
      willingToRelocate: resumeData?.PersonalAttributes?.WillingToRelocate,

      edit: false,
    };
    const resumeSkills = resumeData?.Skills?.Normalized?.map((e) => ({
      id: e.Id,
      skill: e.Name,
      experience: "0",
      required: false,
      validated: false,
      addToList: false,
      edit: false,
    }));
    const resumeEmp = resumeData?.EmploymentHistory?.Positions?.map((e) => ({
      id: e.Id,
      organization: e?.Employer?.Name?.Raw,
      position: e?.JobTitle?.Raw,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeEdu = resumeData?.Education?.EducationDetails?.map((e) => ({
      id: e.Id,
      institution: e?.SchoolName?.Raw,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeCert = resumeData?.Certifications?.map((e, i) => ({
      id: i,
      name: e.Name,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeLice = resumeData?.Licenses?.map((e, i) => ({
      id: i,
      name: e.Name,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeTrain = resumeData?.Training?.Trainings?.map((e, i) => ({
      id: i,
      name: e.Text,
      institution: e.Entity,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeAsso = resumeData?.Associations?.map((e, i) => ({
      id: i,
      name: e.Organization,
      role: e.Role,
      startDate: e?.StartDate?.Date,
      endDate: e?.EndDate?.Date,
      description: e?.Description,
      edit: false,
    }));
    const resumeLang = resumeData?.LanguageCompetencies?.map((e, i) => ({
      id: i,
      language: e.Language,
      languageCode: e.LanguageCode,
      edit: false,
    }));
    const resumeAchi = resumeData?.Achievements?.map((e, i) => ({
      id: i,
      name: e,
      date: "",
      edit: false,
    }));
    const resumeRef = resumeData?.References?.map((e, i) => ({
      id: i,
      name: e.ReferenceName.FormattedName,
      phone: "",
      title: e.Title,
      company: e.Company,
      edit: false,
    }));

    setProfileInfo(profileInfo);
    setResumeEmp(resumeEmp);
    setResumeEdu(resumeEdu);
    setResumeSkills(resumeSkills);
    setResumeCert(resumeCert);
    setResumeLice(resumeLice);
    setResumeTrain(resumeTrain);
    setResumeAsso(resumeAsso);
    setResumeLang(resumeLang);
    setResumeAchi(resumeAchi);
    setResumeRef(resumeRef);
    setResumePersonalAtt(resumePersonalAtt);
  }, [resumeData]);

  console.log(resumeData);
  console.log(resumePersonalAtt);

  return (
    <div className="d-flex justify-content-center align-items-center flex-column px-md-5 py-5 px-1 mb-5">
      <div className="bg-light w-100 text-center p-1 border mb-3">
        {" "}
        <span className="fw-bold ">Name:</span>{" "}
        {resumeData?.ContactInformation?.CandidateName.FormattedName}
      </div>

      <div class="accordion w-100" id="accordionPanelsStayOpenExample">
        <div class="accordion-item  ">
          <h2 class="accordion-header ">
            <button
              class={`accordion-button collapsed `}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseProfileInfo"
              aria-expanded={setShowAllDetails}
              aria-controls="panelsStayOpen-collapseProfileInfo"
            >
              Profile Info
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseProfileInfo"
            class={`accordion-collapse collapse ${
              showAllDetails ? "show" : ""
            }`}
          >
            <div class="accordion-body" style={{ position: "relative" }}>
              <ResumeProfile
                profileInfo={profileInfo}
                setProfileInfo={setProfileInfo}
              />
            </div>
          </div>
        </div>

        {resumePersonalAtt && (
          <div class="accordion-item  ">
            <h2 class="accordion-header ">
              <button
                class={`accordion-button collapsed `}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseProfileInfoPersonal"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseProfileInfoPersonal"
              >
                Personal Attributes
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseProfileInfoPersonal"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body" style={{ position: "relative" }}>
                <ResumePersonalAttributes
                  resumePersonalAtt={resumePersonalAtt}
                  setResumePersonalAtt={setResumePersonalAtt}
                />
              </div>
            </div>
          </div>
        )}

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed  "
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseThree"
              aria-expanded={setShowAllDetails}
              aria-controls="panelsStayOpen-collapseThree"
            >
              Employment History
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseThree"
            class={`accordion-collapse collapse ${
              showAllDetails ? "show" : ""
            }`}
          >
            <div class="accordion-body py-md-5 py-2 px-md-5 px-2">
              {resumeEmp?.map((emp, i) => {
                return (
                  <ResumeEmp emp={emp} setResumeEmp={setResumeEmp} index={i} />
                );
              })}
            </div>
          </div>
        </div>

        <div class="accordion-item ">
          <h2 class="accordion-header ">
            <button
              class="accordion-button collapsed "
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseTwo"
              aria-expanded={setShowAllDetails}
              aria-controls="panelsStayOpen-collapseTwo"
            >
              Education History
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseTwo"
            class={`accordion-collapse collapse ${
              showAllDetails ? "show" : ""
            }`}
          >
            <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
              {resumeEdu?.map((edu, i) => {
                return (
                  <ResumeEdu
                    edu={edu}
                    resumeEdu={resumeEdu}
                    setResumeEdu={setResumeEdu}
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {resumeCert && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseFive"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseFive"
              >
                Certification History
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseFive"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeCert?.map((cert, i) => {
                  return (
                    <ResumeCert
                      data={cert}
                      setResumeCert={setResumeCert}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeLice && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseSix"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseSix"
              >
                Licenses
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseSix"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeLice?.map((lice, i) => {
                  return (
                    <ResumeLice
                      data={lice}
                      setResumeLice={setResumeLice}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeTrain && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseSeven"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseSeven"
              >
                Trainings
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseSeven"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeTrain?.map((lice, i) => {
                  return (
                    <ResumeTrain
                      data={lice}
                      setResumeTrain={setResumeTrain}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeAsso && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseEight"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseEight"
              >
                Associations
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseEight"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeAsso?.map((asso, i) => {
                  return (
                    <ResumeAsso
                      data={asso}
                      setResumeAsso={setResumeAsso}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeLang && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseNine"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseNine"
              >
                Languages
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseNine"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeLang?.map((lang, i) => {
                  return (
                    <ResumeLang
                      data={lang}
                      setResumeLang={setResumeLang}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeAchi && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseTen"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseTen"
              >
                Achivements
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseTen"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeAchi?.map((achi, i) => {
                  return (
                    <ResumeAchi
                      data={achi}
                      setResumeAchi={setResumeAchi}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {resumeRef && (
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseEleven"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseEleven"
              >
                References
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseEleven"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
                {resumeRef?.map((ref, i) => {
                  return (
                    <ResumeRef
                      data={ref}
                      setResumeRef={setResumeRef}
                      index={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div class="accordion-item ">
          <h2 class="accordion-header ">
            <button
              class="accordion-button collapsed "
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseFour"
              aria-expanded={setShowAllDetails}
              aria-controls="panelsStayOpen-collapseFour"
            >
              Skills
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseFour"
            class={`accordion-collapse collapse ${
              showAllDetails ? "show" : ""
            }`}
          >
            <div class="accordion-body  py-md-5 py-2 px-md-5 px-2">
              <div className="table-responsive w-100">
                <table className="table table-sm  table-fixed table-hover    ">
                  <thead>
                    <tr className="border-dark-subtle ">
                      <th scope="col" className="bg-body- ">
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Skills"
                          ) || {}
                        ).mvalue || "nf Skills"}
                      </th>

                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {resumeSkills?.map((skill) => (
                      <tr className="">
                        <td>{skill?.skill}</td>

                        <td className="d-flex justify-content-end align-items-center">
                          <MdDelete
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const updatedList = resumeSkills.filter(
                                (s) => s?.id !== skill?.id
                              );
                              setResumeSkills(updatedList);
                            }}
                          />
                          {/* IMPORT BUTTON */}
                          <SuccessBtn
                            label={
                              (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Import"
                                ) || {}
                              ).mvalue || "nf Import"
                            }
                            onClick={() => handleImportSkill(skill?.skill)}
                            isLoading={isLoading}
                            disable={isLoading}
                          />
                        </td>
                      </tr>
                    ))}
                    {/* OCCUPATION POPUP */}
                    {isShowOccupationPopup && (
                      <React.Fragment>
                        <div
                          class="modal"
                          tabindex="-1"
                          role="dialog"
                          style={{ display: "block" }}
                        >
                          <div
                            class="modal-dialog"
                            role="document"
                            style={{ marginTop: "5rem" }}
                          >
                            <div class="modal-content">
                              <div class="modal-header">
                                <h5 class="modal-title fw-bold">
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "EnterOccupation"
                                    ) || {}
                                  ).mvalue || "nf Enter Occupation"}
                                </h5>
                                <button
                                  type="button"
                                  class="close"
                                  style={{ border: "none" }}
                                  data-dismiss="modal"
                                  aria-label="Close"
                                  onClick={() =>
                                    setIsShowOccupationPopup(false)
                                  }
                                >
                                  <span aria-hidden="true">
                                    <FaTimes />
                                  </span>
                                </button>
                              </div>
                              <div class="modal-body">
                                <CreateSelectOccupation
                                  occupationData={setSelectedOccupation}
                                  setIsNewOccupation={setIsNewOccupation}
                                />
                              </div>
                              <div class="modal-footer border-top-0">
                                <SecondaryBtnLoader
                                  label={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Save&Close"
                                      ) || {}
                                    ).mvalue || "nf Save & Close"
                                  }
                                  backgroundColor="var(--primary-color)"
                                  color="#F8F8E9"
                                  onClick={handleOccupationSave}
                                  loading={isSavingOccupation}
                                />
                                <SecondaryBtnLoader
                                  label={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) => item.elementLabel === "Close"
                                      ) || {}
                                    ).mvalue || "nf Close"
                                  }
                                  backgroundColor="var(--primary-color)"
                                  color="#F8F8E9"
                                  data-dismiss="modal"
                                  onClick={() =>
                                    setIsShowOccupationPopup(false)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeResults;
