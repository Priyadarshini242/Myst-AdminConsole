import React from "react";
import { useDispatch } from "react-redux";
import EditApi from "../../../api/editData/EditApi";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { icons } from "../../../constants";
import { useNavigate } from "react-router-dom";
import useContentLabel from "../../../hooks/useContentLabel";
import {
  setEditCourse,
  setSelectedCourse,
} from "../../../reducer/skilling agency/course data/courseDataSlice";
import { setCourseQuestions } from "../../../reducer/skilling agency/create course/createCourseSlice";
import {
  emptyCourseCreate,
  removeImageAttachment,
  removePdfAttachment,
  setAllCourseData,
  setCourseRemoteCheckBox,
  setCreateCourseAttainSkill,
  setCreateCoursePreSkills,
  setCreateCourseQuestions,
  setImageAttachmentForCreateCourse,
  setOriginalData,
  setPdfAttachmentForCreateCourse,
  setSaveStatus,
} from "../../../reducer/SkillingAgency/CreateCourse/CourseCreationSlice";
import { useSelector } from "react-redux";
import { timestampToUTCYMD } from "../../../components/helperFunctions/DateUtils";
import {
  convertDaysToPhase,
  convertToLabelValueArray,
} from "../../../components/SkillAvailer/helperFunction/conversion";
import { formValidate } from "../../../components/SkillingAgency/Create Course Components/Course Function/CreateCourseFunctions";

const CourseActions = ({ row, setRefresh }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contentLabel = useContentLabel();

  const getUserAttachment = useSelector((state) => state.getUserAttachment);
  const setCourseStatus = (form, id, status, toast) => {
    try {
      EditApi(form, id, { id: id, courseStatus: status }).then((res) => {
        console.log(res);
        showSuccessToast(`${toast}`);
        setRefresh((prev) => !prev);
        return res;
      });
    } catch (error) {
      showErrorToast("Operation Failed");
    }
  };

  const handleCourseDelete = (row) => {
    try {
      setCourseStatus(
        "User Courses",
        row.id,
        "ARCHIVE",
        "Course Deleted Successfully"
      );
    } catch (error) {
      showErrorToast("Operation Failed");
    }
  };

  const handleCoursePublish = (row) => {
    try {
      if (
        formValidate(
          contentLabel,
          "PUBLISH",
          row,
          row?.attainableSkillsList,
          row?.preRequisiteSkillsList
        )
      ) {
      }
      setCourseStatus(
        "User Courses",
        row.id,
        "PUBLISH",
        "Course Published Successfully"
      );
    } catch (error) {
      showErrorToast("Operation Failed");
    }
  };

  const handleCourseClose = (row) => {
    try {
      setCourseStatus(
        "User Courses",
        row.id,
        "CLOSED",
        "Course Closed Successfully"
      );
    } catch (error) {
      showErrorToast("Operation Failed");
    }
  };

  const handleEditCourse = async (data) => {
    ///clear all data before clone
    dispatch(emptyCourseCreate());

    let originalTempData = {};
    originalTempData.attachmentPdf = [];
    originalTempData.attachmentImage = [];
    if (data) {
      let attachmentImg = [];
      let attachmentPdf = [];
      try {
        if (
          getUserAttachment.userAttachmentData &&
          getUserAttachment.userAttachmentData.length > 0
        ) {
          getUserAttachment.userAttachmentData.forEach((attachment) => {
            if (
              attachment?.linkedId !== undefined &&
              data?.id !== undefined &&
              attachment.linkedId === data.id
            ) {
              if (attachment.fileTitle === "course img") {
                attachmentImg.push(attachment);
              } else if (attachment.fileTitle === "course pdf") {
                attachmentPdf.push(attachment);
              }
            }
          });

          //set attachment and update attachment Exists status

          if (
            attachmentImg !== undefined &&
            attachmentImg !== null &&
            attachmentImg.length > 0
          ) {
            dispatch(setImageAttachmentForCreateCourse(attachmentImg));
            originalTempData.attachmentImage = attachmentImg;
          } else {
            dispatch(removeImageAttachment());
          }

          if (
            attachmentPdf !== undefined &&
            attachmentPdf !== null &&
            attachmentPdf.length > 0
          ) {
            dispatch(setPdfAttachmentForCreateCourse(attachmentPdf));
            originalTempData.attachmentPdf = attachmentPdf;
          } else {
            dispatch(removePdfAttachment());
          }
        }
      } catch (error) {
        // console.log("atach error", error);
        attachmentImg = [];
        attachmentPdf = [];
      }
      // console.log("data row.original ", data);
      let courseStartDate = "";
      let location = [];
      let language = [];
      // deadline try catch
      try {
        courseStartDate = data.courseStartingDate
          ? timestampToUTCYMD(data.courseStartingDate)
          : "";
      } catch (error) {
        courseStartDate = "";
      }
      // location try catch
      try {
        location = data?.location
          ? convertToLabelValueArray(data?.location)
          : [];
        if (location !== undefined && location?.length > 0) {
          location.forEach((loc) => {
            if (loc !== undefined && loc?.value?.toLowerCase() === "remote") {
              dispatch(setCourseRemoteCheckBox(true));
            }
          });
        }
      } catch (error) {
        console.log("error ", error);
        location = [];
      }

      // language try catch
      try {
        language = data.courseLanguage
          ? convertToLabelValueArray(data.courseLanguage)
          : [];
      } catch (error) {
        location = [];
      }

      let copyData = {
        id: data.id,
        courseName: data?.courseName,
        courseDescription: data?.courseDescription
          ? data.courseDescription
          : "",
        userId: data?.userId ? data.userId : "",

        courseStartingDate: courseStartDate,
        courseLocation: location,
        courseLanguage: language,

        userCourseType:
          data?.userCourseType?.length > 0 ? data.userCourseType.trim() : "",
        externalSite: data?.externalSite ? data.externalSite : "",
        extSiteId: data?.extSiteId ? data.extSiteId : "",

        experience: data?.experience ? data.experience : "",
        jdExpLvlId: data?.jdExpLvlId ? data.jdExpLvlId : "",
        experienceLevel: data.experienceLevel ? data.experienceLevel : "",
        jdCatId: data?.jdCatId ? data.jdCatId.trim() : "",
        jdSubCatId: data?.jdSubCatId ? data.jdSubCatId.trim() : "",
        durationPhase: data?.durationPhase ? data.durationPhase : "",
        jdType: data.jdType ? data.jdType : "",
        jdsType: data.jdsType ? data.jdsType : "",
        durationNumber: data?.durationNumber ? data?.durationNumber : "",
        userCategory: data?.userCategory ? data.userCategory.trim() : "",
        userSubCategory: data?.userSubCategory
          ? data.userSubCategory.trim()
          : "",
        openings: data?.openings ? data.openings.trim() : "",
        price: data?.price ? data?.price?.toString() : "",
        currency: data.currency ? data.currency : "",
        mstatus: data?.mstatus ? data.mstatus : "",
        status: data?.status ? data.status : "",

        skillerBio: "",
        skillerName: "",

        courseFavorite: data?.courseFavorite ? data.courseFavorite : "No",
      };
      originalTempData = { ...originalTempData, ...copyData };
      originalTempData.skillsAttainable = [];
      originalTempData.skillsPreReq = [];
      originalTempData.questions = [];
      let skillsAttainable = [];
      let skillsPreReq = [];

      //skills pre requisite
      try {
        skillsPreReq = data?.preRequisiteSkillsList
          ? data.preRequisiteSkillsList
              .filter((skill) => skill.id)
              .map((skill) => {
                if (skill && skill.skill && skill?.skill?.length > 0) {
                  return {
                    checked:
                      skill?.isMandatory && skill?.isMandatory === "Yes"
                        ? true
                        : false,
                    max:
                      skill?.yoeMax && skill?.yoePhase
                        ? skill.yoeMax !== "0"
                          ? convertDaysToPhase(skill.yoeMax, skill.yoePhase)
                          : 0
                        : 0,
                    min:
                      skill.yoeMin && skill?.yoePhase
                        ? skill.yoeMin !== "0"
                          ? convertDaysToPhase(skill.yoeMin, skill.yoePhase)
                          : 0
                        : 0,
                    skillid: skill.skillId ? skill.skillId : "",
                    skill: skill.skill ? skill.skill : "",
                    timeunit: skill.yoePhase ? skill.yoePhase : "year",
                    id: skill.id,
                  };
                }
                return null;
              })
          : [];

        originalTempData.skillsPreReq = skillsPreReq;
        if (skillsPreReq.length > 0) {
          dispatch(setCreateCoursePreSkills(skillsPreReq));
        }
        // console.log("ssssssssk", skills)
      } catch (error) {
        skillsPreReq = [];
      }
      //skills skillsAttainable
      try {
        skillsAttainable = data?.attainableSkillsList
          ? data.attainableSkillsList
              .filter((skill) => skill.id)
              .map((skill) => {
                if (skill && skill.skill && skill?.skill?.length > 0) {
                  return {
                    max: skill?.duration ? skill.duration : 0,

                    skillid: skill.skillId ? skill.skillId : "",
                    skill: skill.skill ? skill.skill : "",
                    timeunit: skill?.durationPhase
                      ? skill?.durationPhase
                      : "year",
                    id: skill.id,
                  };
                }
                return null;
              })
          : [];

        originalTempData.skillsAttainable = skillsAttainable;
        if (skillsAttainable.length > 0) {
          dispatch(setCreateCourseAttainSkill(skillsAttainable));
        }
        // console.log("ssssssssk", skills)
      } catch (error) {
        skillsAttainable = [];
      }

      //questions try catch
      let questions = [];
      let i = 20;
      try {
        questions = data?.courseQuestions
          ? data?.courseQuestions.map((question) => {
              let options = [];
              try {
                if (question?.cqValues) {
                  let parsedValues = JSON.parse(question?.cqValues);
                  if (Array.isArray(parsedValues) && parsedValues.length > 0) {
                    options = parsedValues.map((option) => ({
                      label: option,
                      value: option,
                    }));
                  }
                }
              } catch (error) {
                // console.error("Error parsing jdvalues:", error);
                options = []; // Set options to an empty array if JSON parsing fails
              }

              return {
                ...question,
                typeOfQuestion: question?.cqType ? question.cqType : "",
                question: question?.cqLabel ? question.cqLabel : "",
                options: options && options.length > 0 ? options : [],
                id: question.id,
                required: question.cqRequired && question.cqRequired === "Yes",
              };
            })
          : [];
        originalTempData.questions = questions;
        // console.log("ssssssss", questions)
        dispatch(setCreateCourseQuestions(questions));
      } catch (error) {
        // console.error("Error processing questions:", error);
        questions = [];
      }
      dispatch(setAllCourseData(copyData));
      // console.log("originalTempData ", originalTempData);
      dispatch(setOriginalData(originalTempData));
      dispatch(setSaveStatus({ step: 1, status: true }));
      navigate("/skilling-agency/my-courses/Edit/Course-Details");
    }
  };

  const handleCopyLink = (row) => {
    if (!row?.original) return;

    const { userCourseType, id } = row.original;
    const baseUrl = window.location.origin;

    // Determine environment dev/stg/pro
    let env = "";
    if (baseUrl.includes("dev.myskillstree")) {
      env = "dev";
    } else if (baseUrl.includes("stg.myskillstree")) {
      env = "stg";
    }

    if (userCourseType === "Internal") {
      // Construct dynamic URL based on externalSite and env
      const externalUrl = `${baseUrl}/courseview/${id}`;

      navigator.clipboard.writeText(externalUrl);
      showSuccessToast(contentLabel("CopiedLink", "nf CopiedLink"));
    } else if (userCourseType === "External") {
      // Construct external job link
      const externalUrl = `${baseUrl}/courseview/${id}`;

      navigator.clipboard.writeText(externalUrl);
      showSuccessToast(contentLabel("CopiedLink", "nf CopiedLink"));
    }
  };

  const handleCloneCourse = async (data) => {
    ///clear all data before clone
    dispatch(emptyCourseCreate());

    let originalTempData = {};
    originalTempData.attachmentPdf = [];
    originalTempData.attachmentImage = [];
    if (data) {
      let attachmentImg = [];
      let attachmentPdf = [];
      try {
        if (
          getUserAttachment.userAttachmentData &&
          getUserAttachment.userAttachmentData.length > 0
        ) {
          getUserAttachment.userAttachmentData.forEach((attachment) => {
            if (
              attachment?.linkedId !== undefined &&
              data?.id !== undefined &&
              attachment.linkedId === data.id
            ) {
              if (attachment.fileTitle === "course img") {
                attachmentImg.push(attachment);
              } else if (attachment.fileTitle === "course pdf") {
                attachmentPdf.push(attachment);
              }
            }
          });

          //set attachment and update attachment Exists status

          if (
            attachmentImg !== undefined &&
            attachmentImg !== null &&
            attachmentImg.length > 0
          ) {
            dispatch(setImageAttachmentForCreateCourse(attachmentImg));
            originalTempData.attachmentImage = attachmentImg;
          } else {
            dispatch(removeImageAttachment());
          }

          if (
            attachmentPdf !== undefined &&
            attachmentPdf !== null &&
            attachmentPdf.length > 0
          ) {
            dispatch(setPdfAttachmentForCreateCourse(attachmentPdf));
            originalTempData.attachmentPdf = attachmentPdf;
          } else {
            dispatch(removePdfAttachment());
          }
        }
      } catch (error) {
        // console.log("atach error", error);
        attachmentImg = [];
        attachmentPdf = [];
      }
      // console.log("data row.original ", data);
      let courseStartDate = "";
      let location = [];
      let language = [];
      // deadline try catch
      try {
        courseStartDate = data.courseStartingDate
          ? timestampToUTCYMD(data.courseStartingDate)
          : "";
      } catch (error) {
        courseStartDate = "";
      }
      // location try catch
      try {
        location = data?.location
          ? convertToLabelValueArray(data?.location)
          : [];
        if (location !== undefined && location?.length > 0) {
          location.forEach((loc) => {
            if (loc !== undefined && loc?.value?.toLowerCase() === "remote") {
              dispatch(setCourseRemoteCheckBox(true));
            }
          });
        }
      } catch (error) {
        console.log("error ", error);
        location = [];
      }

      // language try catch
      try {
        language = data.courseLanguage
          ? convertToLabelValueArray(data.courseLanguage)
          : [];
      } catch (error) {
        location = [];
      }

      let copyData = {
        courseName: "Copy of " + data?.courseName,
        courseDescription: data?.courseDescription
          ? data.courseDescription
          : "",
        userId: data?.userId ? data.userId : "",

        courseStartingDate: courseStartDate,
        courseLocation: location,
        courseLanguage: language,

        userCourseType:
          data?.userCourseType?.length > 0 ? data.userCourseType.trim() : "",
        externalSite: data?.externalSite ? data.externalSite : "",
        extSiteId: data?.extSiteId ? data.extSiteId : "",

        experience: data?.experience ? data.experience : "",
        jdExpLvlId: data?.jdExpLvlId ? data.jdExpLvlId : "",
        experienceLevel: data.experienceLevel ? data.experienceLevel : "",
        jdCatId: data?.jdCatId ? data.jdCatId.trim() : "",
        jdSubCatId: data?.jdSubCatId ? data.jdSubCatId.trim() : "",
        durationPhase: data?.durationPhase ? data.durationPhase : "",
        jdType: data.jdType ? data.jdType : "",
        jdsType: data.jdsType ? data.jdsType : "",
        durationNumber: data?.durationNumber ? data?.durationNumber : "",
        userCategory: data?.userCategory ? data.userCategory.trim() : "",
        userSubCategory: data?.userSubCategory
          ? data.userSubCategory.trim()
          : "",
        openings: data?.openings ? data.openings.trim() : "",
        price: data?.price ? data?.price?.toString() : "",
        currency: data.currency ? data.currency : "",
        mstatus: data?.mstatus ? data.mstatus : "",
        status: data?.status ? data.status : "",

        skillerBio: "",
        skillerName: "",

        courseFavorite: data?.courseFavorite ? data.courseFavorite : "No",
      };
      originalTempData = { ...originalTempData, ...copyData };
      originalTempData.skillsAttainable = [];
      originalTempData.skillsPreReq = [];
      originalTempData.questions = [];
      let skillsAttainable = [];
      let skillsPreReq = [];

      //skills pre requisite
      try {
        skillsPreReq = data?.preRequisiteSkillsList
          ? data.preRequisiteSkillsList
              .filter((skill) => skill.id)
              .map((skill) => {
                if (skill && skill.skill && skill?.skill?.length > 0) {
                  return {
                    checked:
                      skill?.isMandatory && skill?.isMandatory === "Yes"
                        ? true
                        : false,
                    max:
                      skill?.yoeMax && skill?.yoePhase
                        ? skill.yoeMax !== "0"
                          ? convertDaysToPhase(skill.yoeMax, skill.yoePhase)
                          : 0
                        : 0,
                    min:
                      skill.yoeMin && skill?.yoePhase
                        ? skill.yoeMin !== "0"
                          ? convertDaysToPhase(skill.yoeMin, skill.yoePhase)
                          : 0
                        : 0,
                    skillid: skill.skillId ? skill.skillId : "",
                    skill: skill.skill ? skill.skill : "",
                    timeunit: skill.yoePhase ? skill.yoePhase : "year",
                    id: skill.id,
                  };
                }
                return null;
              })
          : [];

        originalTempData.skillsPreReq = skillsPreReq;
        if (skillsPreReq.length > 0) {
          dispatch(setCreateCoursePreSkills(skillsPreReq));
        }
        // console.log("ssssssssk", skills)
      } catch (error) {
        skillsPreReq = [];
      }
      //skills skillsAttainable
      try {
        skillsAttainable = data?.attainableSkillsList
          ? data.attainableSkillsList
              .filter((skill) => skill.id)
              .map((skill) => {
                if (skill && skill.skill && skill?.skill?.length > 0) {
                  return {
                    max: skill?.duration ? skill.duration : 0,

                    skillid: skill.skillId ? skill.skillId : "",
                    skill: skill.skill ? skill.skill : "",
                    timeunit: skill?.durationPhase
                      ? skill?.durationPhase
                      : "year",
                    id: skill.id,
                  };
                }
                return null;
              })
          : [];

        originalTempData.skillsAttainable = skillsAttainable;
        if (skillsAttainable.length > 0) {
          dispatch(setCreateCourseAttainSkill(skillsAttainable));
        }
        // console.log("ssssssssk", skills)
      } catch (error) {
        skillsAttainable = [];
      }

      //questions try catch
      let questions = [];
      let i = 20;
      try {
        questions = data?.courseQuestions
          ? data?.courseQuestions.map((question) => {
              let options = [];
              try {
                if (question?.cqValues) {
                  let parsedValues = JSON.parse(question?.cqValues);
                  if (Array.isArray(parsedValues) && parsedValues.length > 0) {
                    options = parsedValues.map((option) => ({
                      label: option,
                      value: option,
                    }));
                  }
                }
              } catch (error) {
                // console.error("Error parsing jdvalues:", error);
                options = []; // Set options to an empty array if JSON parsing fails
              }

              return {
                ...question,
                typeOfQuestion: question?.cqType ? question.cqType : "",
                question: question?.cqLabel ? question.cqLabel : "",
                options: options && options.length > 0 ? options : [],
                id: question.id,
                required: question.cqRequired && question.cqRequired === "Yes",
              };
            })
          : [];
        originalTempData.questions = questions;
        // console.log("ssssssss", questions)
        dispatch(setCreateCourseQuestions(questions));
      } catch (error) {
        // console.error("Error processing questions:", error);
        questions = [];
      }
      dispatch(setAllCourseData(copyData));
      // console.log("originalTempData ", originalTempData);
      dispatch(setOriginalData(originalTempData));
      dispatch(setSaveStatus({ step: 1, status: false }));
      navigate("/skilling-agency/my-courses/Create/Course-Details");
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center  mx-2 mt-2"
      style={{ cursor: "pointer" }}
    >
      {row.original?.courseStatus !== "PUBLISH" &&
        row.original?.courseStatus !== "CLOSED" && (
          <div
            className=""
            onClick={async () => {
              handleEditCourse(row?.original);
              // dispatch(setCreateOpportunityQuestions(row?.original?.courseQuestions))
              // dispatch(setEditCourse(row?.original))
              // if (row?.original?.courseQuestions?.length > 0) {
              //     const questions = row?.original?.courseQuestions?.map((question, i) => {
              //         const options = JSON.parse(question?.cqValues)?.map((opt) => ({ label: opt, value: opt }))
              //         return {
              //             question: question?.cqLabel,
              //             answer: { label: question?.cqType, value: question?.cqType },
              //             options,
              //             id: question?.id,
              //             required: question?.cqRequired === "Yes" ? true : false,
              //             rank: i + 1,
              //         }
              //     })
              //     dispatch(setCourseQuestions(questions))
              // }
              //  navigate('/skilling-agency/my-courses/edit-course',{ state: { mode: 'edit' } })
            }}
          >
            <div className=" d-flex gap-1">
              <p className="font-4" style={{ color: "black" }}>
                {contentLabel("Edit", "nf Edit")}
              </p>

              {/* <div style={{ marginLeft: "auto" }}>
                            <icons.ModeEditOutlineOutlinedIcon size={20} />
                        </div> */}
            </div>
          </div>
        )}
      {row.original?.courseStatus === "PUBLISH" && row.original?.courseUrl && (
        <div
          className=""
          onClick={() => {
            handleCopyLink(row);
          }}
        >
          <div className=" d-flex gap-1">
            <div className="">
              <p className="font-4" style={{ color: "black" }}>
                {contentLabel("CopyLink", "nf Copy Link")}
              </p>
            </div>
            {/* <div style={{ marginLeft: "auto" }}>
                            <MdContentCopy size={20} />
                        </div> */}
          </div>
        </div>
      )}
      {row.original?.courseStatus === "PUBLISH" && (
        <div className="" onClick={() => handleCourseClose(row.original)}>
          <div className=" d-flex gap-1">
            <p className="font-4" style={{ color: "black" }}>
              {contentLabel("Close", "nf Close")}
            </p>

            {/* <div style={{ marginLeft: "auto" }}>
                            <MdOutlineCancel size={20}  />
                        </div> */}
          </div>
        </div>
      )}
      {row.original?.courseStatus !== "PUBLISH" && (
        <div className="" onClick={() => handleCoursePublish(row.original)}>
          <div className=" d-flex gap-1">
            <p className="font-4" style={{ color: "black" }}>
              {contentLabel("Publish", "nf Publish")}
            </p>

            {/* <div style={{ marginLeft: "auto" }}>
                            <IoIosSend size={20} />
                        </div> */}
          </div>
        </div>
      )}

      {row.original?.courseStatus === "PUBLISH" && (
        <div
          onClick={() => {
            console.log(row.original);
            dispatch(setSelectedCourse(row.original));
            navigate(
              `/skilling-agency/candidate-management?id=${row.original.id}`
            );
          }}
        >
          <div className=" d-flex gap-1">
            <p className="font-4" style={{ color: "black" }}>
              {contentLabel("ManageCandidates", "nf Manage Candidates")}
            </p>

            {/* <div style={{ marginLeft: "auto" }}>
                            <icons.BsPersonLinesFill  />
                        </div> */}
          </div>
        </div>
      )}

      {row.original?.courseStatus === "CLOSED" && (
        <div
          onClick={() => {
            console.log(row.original);
            dispatch(setSelectedCourse(row.original));
            navigate(
              `/skilling-agency/candidate-management?id=${row.original.id}`
            );
          }}
        >
          <div className=" d-flex gap-1">
            <p className="font-4" style={{ color: "black" }}>
              {contentLabel("ManageCandidates", "nf Manage Candidates")}
            </p>

            {/* <div style={{ marginLeft: "auto" }}>
                            <icons.BsPersonLinesFill  />
                        </div> */}
          </div>
        </div>
      )}

      {/*  Adding Clone Login Here Start */}

      <div
        className=""
        onClick={() => {
          handleCloneCourse(row?.original);
        }}
      >
        <div className=" d-flex gap-1">
          <p className="font-4" style={{ color: "black" }}>
            {contentLabel("Clone", "nf Clone")}
          </p>
        </div>
      </div>

      <div className="" onClick={() => handleCourseDelete(row.original)}>
        <div className=" d-flex ">
          <div className="">
            <p className="font-4" style={{ color: "black" }}>
              {contentLabel("Delete", "nf Delete")}
            </p>
          </div>
          {/* <div style={{ marginLeft: "auto" }}>
                        <Delete  />
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default CourseActions;
