
import React, {useContext,useRef, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../../../config/Properties";

import { icons, images } from "../../../../constants";
import SecondaryBtn from "../../../../components/Buttons/SecondaryBtn";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { useDispatch } from "react-redux";
import Loader from "../../../../components/Loader";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import EditApi from "../../../../api/editData/EditApi";
import { fetchUserCourses } from "../../../../api/SkillingAgency/fetchUserCourses";
import PostApi from "../../../../api/PostData/PostApi";
import axios from "axios";
import MultiSelect from "../../../../components/SkillOwner/SelectComponent/MultiSelect";
import SkillSuggestionApi from "../../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaStar } from "react-icons/fa";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import CreateStepper from "../../../../components/Steppers/CreateStepper";
import useContentLabel from "../../../../hooks/useContentLabel";
import { Col, Row } from "react-bootstrap";
import Gallery from "../../../../components/molecules/Gallery/Gallery";
import Files from "../../../../components/molecules/Files/Files";
import { GetAttachment } from "../../../../api/Attachment  API/DownloadAttachmentApi";
import { MdOpenInNew, MdPlayCircleOutline } from "react-icons/md";
import LazyLoadingImageComponent from "../../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import GetAllLangApi from "../../../../api/content/GetAllLangApi";
import DeleteApi from "../../../../api/DeleteData/DeleteApi";
import { setCourseQuestions,setCreateCoursePrequestSkills,setDeletePreSkillInCreate,setCreateCourseAptainquestSkills,setDeleteAptainSkillInCreate,setCourseInfo } from "../../../../reducer/skilling agency/create course/createCourseSlice";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import createNewCourse from "../../../../api/SkillingAgency/createNewCourse";
import useUnsavedChangesPrompt from "../../../../hooks/Save Warning/useUnsavedChangesPrompt";
import SaveWarning from "../../../../hooks/Save Warning/SaveWarning";
import CouresSkillComponent from "../Course Skill Component/CouresSkillComponent"
import { getSkillExceptionRecord } from "../../../../api/PostData/ExceptionAPI/getSkillExceptionRecord"
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import SkillSeekerSearchArea from "../../../../components/SkillAvailer/SeekerSearchComponents/SkillSeekerSearchArea";
import CourseQuestionsComponent  from "./CourseQuestionsComponent";
import { getCookie } from "../../../../config/cookieService";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";

const CoursePreview =({isPublishedLoader,selectedImage,linkAttachment,isCourseLoading,selectedLocations,setSteps, handleSaveCourse})=>{
     const contentLabel = useContentLabel();
     const content = useSelector((state) => state.content);
     const selectedLanguage = useSelector((state) => state.language);
     const userDetails = useSelector((state) => state.userProfile.data);
     const dispatch = useDispatch();
     const [filterLanguage, setFilterLanguage] = useState([]);
     const isLoading = false;
     const navBarBgColor = "var(--primary-color)";
     const [profilePicObj, setProfilePicObj] = useState({});
     const {courseinfo,skills,saveStatus,deleteSkillInCreate} = useSelector((state) => state.createCourse);
     const { regionalData } = useSelector((state) => state);
     console.log("Question Preview Page",skills['preSkill']); 

   function splitStringToObject(str) {
    try {
      const parts = str.split("||")?.map((part) => part?.trim());
      const obj = {};
      parts?.forEach((part) => {
        const [key, value] = part.split("=")?.map((item) => item?.trim());
        obj[key] = value;
      });
      return obj;
    } catch (error) {
      console.error("Error occurred while parsing the string:", error.message);
      return {}; /* RETURN EMPTY OBJECT INCASE OF FAILURE */
    }
  }

      useEffect(() => {
        if (userDetails[0]?.profilePictureFileName) {
          setProfilePicObj(
            splitStringToObject(userDetails[0]?.profilePictureFileName)
          );
        }
      }, [userDetails[0]?.id]);


      console.log("Pre Skill",skills['preSkill'])
    return (
          <section>
              <section
                className="row"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <div className="col-lg-12  p-4">
                  <div className="d-flex align-items-center">
                    <div
                      className={`border p-1 d-inline-block rounded ${
                        isLoading && "skeleton-loading"
                      }`}
                    >    <LazyLoadingImageComponent
                        src={selectedImage || images.company_image}
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
                        style={{ color: navBarBgColor }}
                        className={`${isLoading ? "skeleton-loading" : ""}`}
                      >
                        {courseinfo?.courseName}
                      </h2>

                      <div className="d-md-flex align-items-center mt-3">
                      {courseinfo?.courseStartingDate &&  <div className="d-md-flex  align-items-center">
                        <DateRangeOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{   formatTimestampToDate(
                              courseinfo?.courseStartingDate,
                              regionalData?.selectedCountry?.dateFormat
                          )}</span>
                        </div>}
                        {selectedLocations && (selectedLocations||'')?.toString().trim()!=""  &&<div className="d-md-flex align-items-center  ms-md-5">
                          <icons.FmdGoodOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{selectedLocations}</span>
                        </div>}
                       {courseinfo?.durationNumber && (courseinfo?.durationNumber||'')?.toString().trim()!="" &&  <div className="d-md-flex align-items-center ms-md-5">
                          <icons.AccessTimeOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">
                            {courseinfo?.durationNumber}&nbsp;
                            {courseinfo?.durationPhase}
                          </span>
                        </div>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {(courseinfo?.courseDescription || courseinfo?.skillerName ||courseinfo?.skillerBio) && <section
                className="row"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <article className="col-lg-12  p-4">
                {courseinfo?.courseDescription &&  <div className="mb-4">
                    <h3
                      className="h5 d-flex align-items-center mb-4 fw-bold"
                      style={{ color: navBarBgColor }}
                    >
                      {contentLabel("Description", "nf Description")}
                    </h3>
                    <p className={`${isLoading ? "skeleton-loading" : ""} `}>
                      {courseinfo?.courseDescription}
                    </p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                  </div>}

                  <div className="mb-2 d-flex gap-3">
                    {courseinfo?.skillerName &&    ( <strong className="fw-bold">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerName"
                        ) || {}
                      ).mvalue || "nf Skiller Name"}
                      :
                    </strong>)}
                    {courseinfo?.skillerName}
                  </div>

                  <div className="mb-2 ">
                {courseinfo?.skillerBio && (<span className="fw-bold me-3">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerBio"
                        ) || {}
                      ).mvalue || "nf Skiller Bio"}
                      :
                    </span>)}
                    {courseinfo?.skillerBio}
                  </div>
                </article>
              </section>} 
 
              {/* Skills Attainable */}
              <section
                className="row   p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
               {((skills['abtainSkill']?? [])?.length>0) &&  <div className="col-lg-6 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}
                  >
                    {contentLabel("SkillsAttainable", "nf Skills Attainable")}
                  </h3>
                   <table class="table">
                    <thead>
                      <tr style={{ border: "white" }}>
                       
                        <th className="p-1 w-75" scope="col">
                          {(
                            content[selectedLanguage].find(
                              (item) => item.elementLabel === "Skills/Topic"
                            ) || {}
                          ).mvalue || "nf Skills/Topic"}
                        </th>
                        <th className="p-1 w-25" scope="col">
                          {(
                            content[selectedLanguage].find(
                              (item) => item.elementLabel === "ProjectDuration"
                            ) || {}
                          ).mvalue || "nf ProjectDuration"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(skills['abtainSkill']?? []).map((topic, index) => {
                        return (
                          <tr style={{ border: "white" }}>
                           
                            <td className="p-1 w-75" scope="col">
                              {topic.skill}
                            </td>
                            <td className="p-1  w-25" scope="col">
                              {topic.max} {topic.timeunit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
                <article
                  className="col-lg-6 "
                  style={{ borderLeft: "2px solid var(--light-color)" }}
                >
                  <aside className="">
                    <h3
                      className=" h5 mb-4 fw-bold"
                      style={{ color: navBarBgColor }}
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "CourseSummary"
                        ) || {}
                      ).mvalue || "nf Course Summary"}
                    </h3>
                    <ul className="list-unstyled pl-3 mb-0">
                    {courseinfo?.courseLanguage && (courseinfo?.courseLanguage||[])?.map(lan => lan.value)?.join(", ").length > 0  && <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseLanguage"
                            ) || {}
                          ).mvalue || "nf Course Language"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {(courseinfo?.courseLanguage||[])?.map((lan) => lan.value)?.join(", ")}
                        </p>
                      </li>}

                   {(selectedLocations && selectedLocations?.trim()!="") && <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseLocation"
                            ) || {}
                          ).mvalue || "nf CourseLocation"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {selectedLocations}
                        </p>
                      </li>}
                    {(courseinfo?.price && courseinfo?.price?.trim()=="") &&  <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CoursePrice"
                            ) || {}
                          ).mvalue || "nf Course Price"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {courseinfo?.price}&nbsp;
                          {courseinfo?.currencyInput}
                        </p>
                      </li>}
                      {linkAttachment?.length > 0 && (
                        <li className="mb-2 d-flex gap-3">
                          <strong className="fw-bold">
                            {(
                              content[selectedLanguage].find(
                                (item) => item.elementLabel === "CoursePdf"
                              ) || {}
                            ).mvalue || "nf Course Pdf"}
                            :
                          </strong>
                          <p
                            className={`${
                              isLoading ? "skeleton-loading" : ""
                            } mb-0`}
                          >
                            {linkAttachment?.map((attachment) => {
                              return (
                                <div className="d-flex ">
                                  <div>{attachment?.fileName}</div>
                                  <div>
                                    <a
                                      rel="noreferrer"
                                      href={GetAttachment( getCookie("userId"),
                                        attachment?.fileName,
                                        attachment?.fileId
                                      )}
                                      target="_blank"
                                    >
                                      {!attachment?.fileName?.endsWith(
                                        ".mp4"
                                      ) ? (
                                        <MdOpenInNew
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      ) : (
                                        <MdPlayCircleOutline
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      )}
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </p>
                        </li>
                      )}

                      {userDetails[0]?.profilePictureFileName && (
                        <li className="mb-2 d-flex gap-3">
                          <strong className="fw-bold">
                            {(
                              content[selectedLanguage].find(
                                (item) => item.elementLabel === "Agency"
                              ) || {}
                            ).mvalue || "nf Agency"}
                            :
                          </strong>{" "}
                          <p
                            className={`${
                              isLoading ? "skeleton-loading" : ""
                            } mb-0`}
                          >
                            <div className="d-flex ">
                              <div>
                                {userDetails[0]?.firstName}{" "}
                                {userDetails[0]?.lastName}
                              </div>
                              <div>
                                <a
                                  rel="noreferrer"
                                  href={GetAttachment(
                                    userDetails[0]?.id,
                                    profilePicObj?.fileName,
                                    profilePicObj?.fileId
                                  )}
                                  target="_blank"
                                >
                                  <MdOpenInNew
                                    className="ms-2"
                                    style={{
                                      color: "var(--primary-color)",
                                      height: "16px",
                                      width: "16px",
                                    }}
                                  />
                                </a>
                              </div>
                            </div>
                          </p>
                        </li>
                      )}
                     
                      {courseinfo?.courseStartingDate && <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseStartDate"
                            ) || {}
                          ).mvalue || "nf Course Start Date"}
                          :
                        </strong>
                                                {  
              formatTimestampToDate(
                courseinfo?.courseStartingDate,
                regionalData?.selectedCountry?.dateFormat
            )}
                      </li>}
                    </ul>
                  </aside>
                </article>
              </section> 

            {/* PrerequisiteSkills */}          
               {(skills['preSkill'] && skills['preSkill']?.length  > 0) && <section
                className="row align-items-center  p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}>
                <div className="col-lg-12 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}>
                   {contentLabel("Prerequisite", "nf Prerequisite")}
                  </h3>

                  <div className="d-flex flex-wrap gap-3">
                    {skills['preSkill']?.map((skill, i) => {
                      return (
                        <div
                          key={i}
                          className={`border border-4 rounded p-2 d-flex align-items-center text-center me-2`}
                          style={{ background: "none", color: "black" }}
                        >
                          {(skill.checked && (skill?.checked?.toLowerCase()==="true" || skill?.checked?.toLowerCase()==='yes')) && (
                            <div
                              style={{
                                color: navBarBgColor,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FaStar />
                            </div>
                          )}

                          <div
                            className={`ms-2`}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {`${skill?.skill} ${skill?.min}-${skill?.max} ${skill?.timeunit}`}
                          </div>
                          <div
                            className={`ms-2 ${
                              isLoading ? "skeleton-loading" : ""
                            }`}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className={`rounded p-2 px-2 d-flex gap-2 align-items-center text-center mt-3 border border-4 border-white
                  }`}
                    style={{ background: "none", color: "black" }}
                  >
                    <span
                      className="d-flex align-items-center"
                      style={{ color: navBarBgColor }}
                    >
                      <FaStar />
                    </span>
                    {contentLabel(
                      "TheseSkillsAreMandatory",
                      "nf These Skills Are Mandatory"
                    )}
                  </div>
                </div>
              </section>} 
  
            {(courseinfo?.courseQuestions && courseinfo?.courseQuestions?.length  > 0) && <section
                className="row align-items-center  p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}>
                <div className="col-lg-12 p-0">
                 <h3
                class="h5 d-flex align-items-center mb-4 fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <span class="icon-turned_in mr-3"></span>{" "}
                {contentLabel("Questions", "nf Questions")}
              </h3>

                  <div className="flex-wrap gap-3">
                   {courseinfo?.courseQuestions?.map((que) => (
                <CourseQuestionsComponent
                  id={que?.id || que?.jid}
                  label={que?.question || que?.qnLabel || que?.label}
                  required={
                    que?.required ||
                    (que.hasOwnProperty("required") && que?.required === true
                      ? "Yes"
                      : "No")
                  }
                  type={
                    que?.typeOfQuestion ||
                    que?.jdType ||
                    (que.hasOwnProperty("answer") &&
                      que?.answer.hasOwnProperty("value") &&
                      que?.answer?.value) ||
                    (que.hasOwnProperty("answer") && que?.answer)
                  }
                  values={
                    que?.options && Array.isArray(que?.options) ?
                      que?.options?.map((options) => options?.value) : que?.jdvalues ?
                        JSON.parse(que?.jdvalues) : [] || []
                  }
                />
              ))}
                  </div>
                 
                </div>
              </section>} 

              {/* Button Save Publish and Back */}
              <div class=" d-flex justify-content-between gap-2 pt-4">
                <button
                  class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step4: false };
                    });
                  }}
                >
                  {(
                    content[selectedLanguage].find(
                      (item) => item.elementLabel === "Back"
                    ) || {}
                  ).mvalue || "nf Back"}{" "}
                </button>

                <div className="d-flex gap-3">
                  <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      handleSaveCourse("DRAFT","PREVIEW");
                    }}
                  >
                    {isCourseLoading && (
                      <div
                        class="spinner-border spinner-border spinner-border-sm text-light me-2"
                        role="status"
                      >
                        <span class="sr-only">Loading...</span>
                      </div>
                    )}
                    {contentLabel("Save", "nf Save")}
                  </button>

                  <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      handleSaveCourse("PUBLISH","");
                    }}
                  >
                    {isPublishedLoader && (
                      <div
                        class="spinner-border spinner-border spinner-border-sm text-light me-2"
                        role="status"
                      >
                        <span class="sr-only">Loading...</span>
                      </div>
                    )}
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Publish"
                      ) || {}
                    ).mvalue || "nf Publish"}{" "}
                  </button>
                </div>
              </div>

            </section>
    );  
}
export default CoursePreview;