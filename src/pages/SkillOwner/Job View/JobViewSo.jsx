import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  DownloadAttachment,
  GetAttachment,
} from "../../../api/Attachment  API/DownloadAttachmentApi";
import { fetchJobDetailWithToken } from "../../../api/SkillSeeker/job detail/fetchJobDetail";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import Navbar from "../../../components/Navbar";
import { icons, images } from "../../../constants";
import useContent from "../../../hooks/useContent";
import company_image from "../../../Images/skyline.png";
import { setLanguage } from "../../../reducer/localization/languageSlice";
import ApplyPopup from "./ApplyPopup";
import "./JobViewSo.css";
import SkillsMatchingLegends from "./../../../views/opportunities/SkillsMatchingLegends";
import { sessionEncrypt } from "../../../config/encrypt/encryptData";

const JobViewSo = () => {
  /* ROUTE PARAMS INIT */
  const content = useSelector((state) => state.content);

  const { id } = useParams();
  /* USE REFS */
  const navbarRef = useRef(null);
  /* DISPATCH INIT */
  const dispatch = useDispatch();
  /* STORE IMPORTS */
  const { language: selectedLanguage } = useSelector((state) => state);

  /* LOCAL STORAGES */
  const jobLang = sessionStorage.getItem("Jlang");
  /* STATES INIT */
  const [jobData, setJobData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const convertDaysMin = (days, phase) => {
    switch (phase) {
      case "year":
        const years = Math.floor(days / 365);
        return `${years} `;

      case "month":
        const months = Math.floor(days / 30);
        return `${months} `;
      case "day":
        return `${days} `;
      case "week":
        const week = Math.floor(days / 7);
        return `${week} `;
      default:
        return `${days} `;
    }
  };
  const convertDays = (days, phase) => {
    // come from content config
    switch (phase) {
      case "year":
        const years = Math.floor(days / 365);
        return `${years} ${
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Years"
            ) || {}
          ).mvalue || "nf Years"
        }`;
      case "month":
        const months = Math.floor(days / 30);
        return `${months} ${
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Months"
            ) || {}
          ).mvalue || "nf Months"
        }`;
      case "day":
        return `${days} ${
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Days"
            ) || {}
          ).mvalue || "nf Days"
        }`;
      case "week":
        const week = Math.floor(days / 7);
        return `${week} ${
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Weeks"
            ) || {}
          ).mvalue || "nf Weeks"
        } `;
      default:
        return `${days} ${
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Days"
            ) || {}
          ).mvalue || "nf Days"
        }`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchJobDetailWithToken(id);
        setJobData(res?.data);
      } catch (err) {
        console.error("Error GETting job details: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (jobLang) {
      sessionStorage.setItem("prevLang", sessionEncrypt(selectedLanguage));

      dispatch(setLanguage(sessionStorage.getItem("Jlang")));
    }
  }, [dispatch, selectedLanguage, jobLang]);

  /* CONTENT HANDLE */
  const navBarBgColor = useContent("NavBarBgColor", "var(--primary-color)");

  const [allSkills, setAllSkills] = useState([]);
  const { TopSkill } = useSelector((state) => state);

  useEffect(() => {
    if (TopSkill?.status === "success") {
      const filteredSkills = TopSkill?.data?.filter(
        (val) => val?.mlanguage === selectedLanguage
      );
      console.log("filtered skills", filteredSkills);
      setAllSkills(filteredSkills);
    }
  }, [TopSkill?.status, TopSkill?.data, selectedLanguage]);

  // jobdata skill filteration array
  const commonSkillsWithExperienceCheck =
    jobData?.jdSkillsList?.filter((skill) => {
      const skillInAllSkills = allSkills.find(
        (item) => item.skillOccupation === skill.skillOccupation
      );
      if (skillInAllSkills) {
        const skillAppliedExp = Number(skillInAllSkills.skillAppliedExp);
        const yoeMin = Number(skill.yoeMin);
        const yoeMax = Number(skill.yoeMax);
        if (yoeMin === 0 && yoeMax === 0) {
          return true;
        }
        return skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax;
      }
      return false;
    }) || [];

  console.log("commanskills", commonSkillsWithExperienceCheck);
  const countOfCommonSkills = commonSkillsWithExperienceCheck.length;

  // all skills filteration of experince and skill match array
  const matchingSkills =
    allSkills.filter((skill) => {
      const skillInJobData = jobData?.jdSkillsList?.find(
        (item) => item.skillOccupation === skill.skillOccupation
      );

      if (skillInJobData) {
        const skillAppliedExp = Number(skill.skillAppliedExp);
        const yoeMin = Number(skillInJobData.yoeMin);
        const yoeMax = Number(skillInJobData.yoeMax);
        if (yoeMin === 0 && yoeMax === 0) {
          return true;
        }
        return skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax;
      }
      return false;
    }) || [];

  console.log("matching", matchingSkills);

  const mergedSkills =
    jobData?.jdSkillsList
      ?.map((skill) => {
        const correspondingSkill = allSkills.find(
          (item) => item.skillOccupation === skill.skillOccupation
        );

        if (correspondingSkill) {
          const skillAppliedExp = Number(correspondingSkill.skillAppliedExp);
          const yoeMin = Number(skill.yoeMin);
          const yoeMax = Number(skill.yoeMax);

          let matchType = "partial";
          if (yoeMin === 0 && yoeMax === 0) {
            matchType = "perfect";
          } else if (skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax) {
            matchType = "perfect";
          }

          return {
            ...skill,
            ...correspondingSkill,
            matchType,
          };
        }
        return null;
      })
      .filter((skill) => skill !== null) || [];

  console.log("mergedSkills", mergedSkills);

  // Total number of filtered skills
  const filteredSkillCountName =
    jobData?.jdSkillsList?.filter((skill) => skill?.skill) || [];

  // Extract skill names from allSkills
  const allSkillsNames = allSkills.map((item) => item.skill);

  // Filter jdSkillsList to get mandatory skills and their experience requirements
  const mandatorySkillsWithExp =
    jobData?.jdSkillsList
      ?.filter((skill) => skill?.skill && skill?.jdType === "Mandatary")
      .map((item) => ({
        skill: item.skill,
        yoeMin: Number(item.yoeMin),
        yoeMax: Number(item.yoeMax),
      })) || [];

  // Check if all mandatory skills with experience are included in allSkills
  const allMandatorySkillsIncluded = mandatorySkillsWithExp.every(
    (mandatorySkill) => {
      // Find the corresponding skill in allSkills
      const skillInAllSkills = allSkills.find(
        (item) => item.skill === mandatorySkill.skill
      );

      // If skill is found in allSkills, check experience
      if (skillInAllSkills) {
        const skillAppliedExp = Number(skillInAllSkills.skillAppliedExp);
        return (
          (mandatorySkill.yoeMin === 0 && mandatorySkill.yoeMax === 0) ||
          (skillAppliedExp >= mandatorySkill.yoeMin &&
            skillAppliedExp <= mandatorySkill.yoeMax)
        );
      }

      return false; // Skill not found in allSkills
    }
  );

  return (
    <React.Fragment>
      {/* NAVBAR */}
      <div ref={navbarRef}>
        <Navbar />
      </div>

      {/* CONTENT */}
      <main
        className="site-section bg-light"
        style={{
          height: contentHeight,
          position: "relative",
          isolation: "isolate",
          overflowY: "auto",
        }}
      >
        <section className="container">
          <section className="row align-items-center mb-3 shadow-lg p-4">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="d-flex align-items-center">
                <div
                  className={`border p-1 d-inline-block rounded ${
                    isLoading && "skeleton-loading"
                  }`}
                >
                  <LazyLoadingImageComponent
                    src={
                      jobData?.logoExists
                        ? GetAttachment(
                            jobData?.userId,
                            jobData?.fileName,
                            jobData?.fileId
                          )
                        : images.company_image
                    }
                    className={`${isLoading & "skeleton-loading"}`}
                    alt={"Company-Image"}
                    style={{ width: "100px", height: "100px" }}
                    onError={(e) => {
                      e.target.src = images.company_image;
                    }}
                  />
                </div>
                <div style={{ marginLeft: "20px" }}>
                  <h2
                    style={{
                      color: useContent(
                        "NavBarBgColor",
                        "var(--primary-color)"
                      ),
                    }}
                    className={`${isLoading ? "skeleton-loading" : ""}`}
                  >
                    {jobData?.title}
                  </h2>
                  <div className="d-md-flex align-items-center">
                    <div className="d-md-flex align-items-center">
                      <icons.PiSuitcaseSimpleDuotone />
                      <span
                        className={`ms-2 ${
                          isLoading ? "skeleton-loading" : ""
                        }`}
                      >
                        {jobData?.jdCompany}
                      </span>
                    </div>
                    <div className="d-md-flex align-items-center ms-md-5">
                      <icons.CiLocationOn />
                      <span
                        className={`ms-2 ${
                          isLoading ? "skeleton-loading" : ""
                        }`}
                      >
                        {jobData?.jobLocation}
                      </span>
                    </div>
                    <div className="d-md-flex align-items-center ms-md-5">
                      <icons.MdOutlineWatchLater />
                      <span
                        className={`ms-2 ${
                          isLoading ? "skeleton-loading" : ""
                        }`}
                      >
                        {jobData?.jdType}
                      </span>
                    </div>
                  </div>
                  <div className="d-md-flex  align-items-start mt-3 ">
                    <div>
                      <div className="d-md-flex  align-items-center">
                        <icons.TbCategory
                          size={23}
                          style={{ color: "var(--primary-color)" }}
                        />
                        <span className="ms-2">
                          {jobData?.jdCategoryName
                            ? jobData?.jdCategoryName
                            : "-"}
                        </span>
                      </div>
                      <div className="">
                        <div
                          className="ps-4 fst-italic"
                          style={{ opacity: "0.8" }}
                        >
                          {jobData?.jdSubCategoryName
                            ? jobData?.jdSubCategoryName
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="d-md-flex align-items-center  ms-md-5">
                      <icons.LanguageIcon
                        size={23}
                        style={{ color: "var(--primary-color)" }}
                      />
                      <span className="ms-2">
                        {jobData?.externalSite ? jobData?.externalSite : "-"}
                      </span>
                    </div>
                    <div className="d-md-flex align-items-center ms-md-5">
                      <icons.MdOutlineVerifiedUser
                        size={23}
                        style={{ color: "var(--primary-color)" }}
                      />
                      <span className="ms-2">
                        {jobData?.experienceLevel
                          ? jobData?.experienceLevel
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="row">
                <div className="col-6">
                  <div className="btn btn-block btn-light btn-md">
                    <div
                      className="d-flex align-items-center"
                      style={{
                        color: useContent(
                          "NavBarBgColor",
                          "var(--primary-color)"
                        ),
                      }}
                    >
                      <icons.FaRegHeart />
                      <span className="ms-2">
                        {useContent("SaveJob", "nf Save Job")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  {/* Conditional rendering of ApplyPopup */}
                  {jobData && jobData.jdQuestionsList ? (
                    <ApplyPopup
                      jobdata={jobData}
                      allMandatorySkillsIncluded={allMandatorySkillsIncluded}
                      allSkills={allSkills}
                      convertDaysMin={convertDays}
                      convertDays={convertDays}
                      isLoading={isLoading}
                      mergedSkills={mergedSkills}
                    />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="row align-items-center mb-3 shadow-lg p-4">
            <div className="col-lg-12">
              <h3
                className="h5 d-flex align-items-center mb-4 fw-bold"
                style={{
                  color: useContent("NavBarBgColor", "var(--primary-color)"),
                }}
              >
                <span className="icon-align-left mr-3"></span>
                {useContent("SkillsRequired", "nf Skills Required")}
              </h3>

              {countOfCommonSkills > 0 ? (
                <div className="mb-4 ">
                  {countOfCommonSkills} out of {filteredSkillCountName.length}{" "}
                  skills matching your profile
                </div>
              ) : null}

              <div className="d-flex d-flex flex-nowrap">
                {jobData?.jdSkillsList
                  ?.filter((skill) => skill?.skill)
                  ?.map((skill) => {
                    // .......
                    const skillInAllSkills = allSkills.find(
                      (item) => item.skill === skill.skill
                    );
                    const isSkillInAllSkills = !!skillInAllSkills;
                    const skillAppliedExp = skillInAllSkills
                      ? Number(skillInAllSkills.skillAppliedExp)
                      : 0;
                    const yoeMin = Number(skill.yoeMin);
                    const yoeMax = Number(skill.yoeMax);
                    const isExpInRange =
                      (yoeMin === 0 && yoeMax === 0) ||
                      (skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax);
                    const highlightGreen = isSkillInAllSkills && isExpInRange;
                    const highlightYellow = isSkillInAllSkills && !isExpInRange;

                    return (
                      <div
                        key={skill.id}
                        className={`border border-4 rounded p-2 d-flex align-items-center text-center me-2 ${
                          highlightGreen
                            ? "border-success"
                            : highlightYellow
                            ? "border-warning"
                            : "none"
                        }`}
                        style={{ background: "none", color: "black" }}
                      >
                        {skill?.jdType === "Mandatory" && (
                          <div
                            style={{
                              color: navBarBgColor,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <icons.FaStar />
                          </div>
                        )}

                        <div
                          className={`ms-2 ${
                            isLoading ? "skeleton-loading" : ""
                          }`}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {skill.skill}
                        </div>
                        <div
                          className={`ms-2 ${
                            isLoading ? "skeleton-loading" : ""
                          }`}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {convertDaysMin(skill?.yoeMin, skill?.yoePhase)} -{" "}
                          {convertDays(skill?.yoeMax, skill?.yoePhase)}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="d-flex align-items-center text-center mt-4">
                <span
                  className="me-2 d-flex align-items-center"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  <icons.FaStar />
                </span>
                {useContent(
                  "TheseSkillsAreMandatory",
                  "nf These Skills are Mandatory"
                )}
              </div>
              <SkillsMatchingLegends />
            </div>
          </section>
          <section className="row">
            <article className="col-lg-8 shadow-lg p-4">
              <div className="mb-5">
                <h3
                  className="h5 d-flex align-items-center mb-4 fw-bold"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  <span className="icon-align-left mr-3"></span>
                  {useContent("JobDescriptionLabel", "nf Job Description")}
                </h3>
                <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                  {jobData?.description}
                </p>
              </div>
              <div className="mb-5">
                <h3
                  className="h5 d-flex align-items-center mb-4 fw-bold"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  <span className="icon-rocket mr-3"></span>
                  {useContent("Responsibilities", "nf Responsibilities")}
                </h3>
                <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                  {jobData?.responsibilities ? jobData?.responsibilities : "-"}
                </p>
              </div>

              <div className="mb-5">
                <h3
                  className="h5 d-flex align-items-center mb-4 fw-bold"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  <span className="icon-turned_in mr-3"></span>
                  {useContent("Benifits", "nf Benifits")}
                </h3>
                <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                  {jobData?.benefits ? jobData?.benefits : "-"}
                </p>
              </div>

              {/* ATTACHMENTS */}
              {jobData?.attachments?.length && (
                <div className="mb-5">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{
                      color: navBarBgColor,
                    }}
                  >
                    <span className="icon-turned_in mr-3"></span>
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Attachments"
                      ) || {}
                    ).mvalue || "nf Attachments"}
                  </h3>
                  <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                    {jobData?.attachments
                      ?.filter((att) => att?.id)
                      ?.map((attachmentDetails) => (
                        <React.Fragment>
                          {attachmentDetails?.fileName}&nbsp;
                          <a
                            href={DownloadAttachment(
                              attachmentDetails?.userId,
                              attachmentDetails?.fileName,
                              attachmentDetails?.fileId
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <icons.IoCloudDownloadOutline
                              className="mx-2 cursor-pointer"
                              style={{
                                color: navBarBgColor,
                                height: "16px",
                                width: "16px",
                              }}
                            />
                          </a>
                        </React.Fragment>
                      ))}
                  </p>
                </div>
              )}

              <div className="row mb-5">
                <div className="col-6">
                  <div className="btn btn-block btn-light btn-md">
                    <div
                      className="d-flex align-items-center"
                      style={{
                        color: useContent(
                          "NavBarBgColor",
                          "var(--primary-color)"
                        ),
                      }}
                    >
                      <icons.FaRegHeart />
                      <span className="ms-2">
                        {useContent("SaveJob", "nf Save Job")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  {jobData && jobData.jdQuestionsList ? (
                    <ApplyPopup
                      jobdata={jobData}
                      allMandatorySkillsIncluded={allMandatorySkillsIncluded}
                      allSkills={allSkills}
                      convertDaysMin={convertDays}
                      convertDays={convertDays}
                      isLoading={isLoading}
                      mergedSkills={mergedSkills}
                    />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
            </article>
            <article className="col-lg-4 mt-5 mt-md-0">
              <aside className="shadow-lg p-4  mb-3">
                <h3
                  className=" h5 mb-3 fw-bold"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  {useContent("JobSummary", "nf Job Summary")}
                </h3>
                <ul className="list-unstyled pl-3 mb-0">
                  <li className="mb-2">
                    <strong className="fw-bold">
                      {useContent("Vacancy", "nf Vacancy")}:
                    </strong>{" "}
                    <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                      {jobData?.openings}
                    </p>
                  </li>
                  <li className="mb-2">
                    <strong className="fw-bold">
                      {useContent("EmploymentStatus", "nf Employment Status")}:
                    </strong>{" "}
                    <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                      {jobData?.jdType}
                    </p>
                  </li>

                  <li className="mb-2">
                    <strong className="fw-bold">
                      {useContent("JobLocation", "nf Job Location")}:
                    </strong>{" "}
                    <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                      {jobData?.jobLocation}
                    </p>
                  </li>
                  <li className="mb-2">
                    <strong className="fw-bold">
                      {useContent("Salary", "nf Salary")}:
                    </strong>{" "}
                    <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                      {jobData?.salaryLow} - {jobData?.salaryHigh}{" "}
                      {jobData?.currency}
                    </p>
                  </li>

                  <li className="mb-2">
                    <strong className="fw-bold">
                      {useContent(
                        "ApplicationDeadline",
                        "nf Application Deadline"
                      )}
                      :
                    </strong>{" "}
                    {jobData?.deadline
                      ? new Date(parseInt(jobData?.deadline)).toDateString()
                      : " - "}
                  </li>
                </ul>
              </aside>

              <aside className="p-3 shadow-lg">
                <h3
                  className="mt-3 h5 pl-3 mb-3"
                  style={{
                    color: useContent("NavBarBgColor", "var(--primary-color)"),
                  }}
                >
                  {useContent("Share", "nf Share")}
                </h3>
                <div className="fs-1 text-black">
                  <a
                    href="#"
                    className="pt-3 pb-3 pe-3 ps-0"
                    style={{
                      color: useContent(
                        "NavBarBgColor",
                        "var(--primary-color)"
                      ),
                    }}
                  >
                    <icons.FaSquareFacebook />
                  </a>
                  <a
                    href="#"
                    className="pt-3 pb-3 pe-3 ps-0"
                    style={{
                      color: useContent(
                        "NavBarBgColor",
                        "var(--primary-color)"
                      ),
                    }}
                  >
                    <icons.FaSquareXTwitter />
                  </a>
                  <a
                    href="#"
                    className="pt-3 pb-3 pe-3 ps-0"
                    style={{
                      color: useContent(
                        "NavBarBgColor",
                        "var(--primary-color)"
                      ),
                    }}
                  >
                    <icons.FaLinkedin />
                  </a>
                </div>
              </aside>
            </article>
          </section>
        </section>
      </main>
    </React.Fragment>
  );
};

export default JobViewSo;
