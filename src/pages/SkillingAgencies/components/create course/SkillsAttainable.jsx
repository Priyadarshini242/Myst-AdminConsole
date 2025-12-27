import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, useFetcher } from "react-router-dom";
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
import {
  setCourseQuestions,
  setCreateCoursePrequestSkills,
  setDeletePreSkillInCreate,
  setCreateCourseAptainquestSkills,
  setDeleteAptainSkillInCreate,
  setCourseInfo,
} from "../../../../reducer/skilling agency/create course/createCourseSlice";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import createNewCourse from "../../../../api/SkillingAgency/createNewCourse";
import useUnsavedChangesPrompt from "../../../../hooks/Save Warning/useUnsavedChangesPrompt";
import SaveWarning from "../../../../hooks/Save Warning/SaveWarning";
import CouresSkillComponent from "../Course Skill Component/CouresSkillComponent";
import { getSkillExceptionRecord } from "../../../../api/PostData/ExceptionAPI/getSkillExceptionRecord";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";

const SkillsAttainable = ({
  isLength,
  isCourseLoading,
  setSteps,
  handleSaveCourse,
  setisActivePreskill,
  attainableSkills,
  setAttainableSkills,
}) => {
  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const { courseinfo, skills, saveStatus, deleteSkillInCreate } = useSelector(
    (state) => state.createCourse
  );
  const selectedLanguage = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const [isDeletingCourseTopics, setIsDeletingCourseTopics] = useState(false);

  //handle topic delete
  const handleCourseTopicDelete = async (index, id) => {
    if (courseinfo?.id) {
      setIsDeletingCourseTopics(true);
      try {
        await DeleteApi("UserCourse SkillsAttainable", id);
        let topics = attainableSkills.filter((topic, i) => {
          return i !== index;
        });
        setAttainableSkills(topics);
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
      } finally {
        setIsDeletingCourseTopics(false);
      }
      return;
    } else {
      let topics = attainableSkills.filter((topic, i) => {
        return i !== index;
      });
      setAttainableSkills(topics);
    }
  };

  const inputMaxChange = (id, inputValue) => {
    let tskills = {
      ...skills,
      abtainSkill: skills["abtainSkill"]?.map((skill) => {
        if (skill?.id === id) {
          let skillData = { ...skill, max: inputValue };
          return skillData;
        }
        return skill;
      }),
    };
    dispatch(setCreateCoursePrequestSkills(tskills));
    dispatch(setCourseInfo({ ...courseinfo, isAptainSkill: false }));
  };

  const inputTimeUnitChange = (id, inputValue) => {
    let tskills = {
      ...skills,
      abtainSkill: skills["abtainSkill"]?.map((skill) => {
        if (skill?.id === id) {
          let skillData = { ...skill, timeunit: inputValue };
          return skillData;
        }
        return skill;
      }),
    };

    dispatch(setCreateCoursePrequestSkills(tskills));
    dispatch(setCourseInfo({ ...courseinfo, isAptainSkill: false }));
  };

  const deleteSkill = async (id) => {
    if (courseinfo?.id) {
      setIsDeletingCourseTopics(true);
      try {
        await DeleteApi("UserCourse SkillsAttainable", id);
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
      } finally {
        setIsDeletingCourseTopics(false);
      }
    }

    let tskills = {
      ...skills,
      abtainSkill: skills["abtainSkill"]?.filter((skill) => skill.id !== id),
    };
    dispatch(setCreateCoursePrequestSkills(tskills));
    let dskills = {
      ...skills,
      abtainSkill: skills["abtainSkill"]?.filter((skill) => skill.id === id),
    };
    dispatch(setDeletePreSkillInCreate([...deleteSkillInCreate, dskills]));
    dispatch(setCourseInfo({ ...courseinfo, isAptainSkill: false }));
  };

  useEffect(() => {
    if (
      (skills["abtainSkill"]?.length ?? 0) != isLength &&
      courseinfo?.isAptainSkill == true
    ) {
      dispatch(setCourseInfo({ ...courseinfo, isAptainSkill: false }));
    }
  }, [skills["abtainSkill"]]);

  return (
    <div>
      <div class="mb-3 w-75" style={{ position: "relative" }}>
        <div>
          <CouresSkillComponent isActiveCard={false} isOnboarding={false} />
        </div>
      </div>
      {(skills["abtainSkill"]?.length ?? 0 > 0) && (
        <div style={{ minHeight: "19.5rem" }}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">
                  {(
                    content[selectedLanguage].find(
                      (item) => item.elementLabel === "Skills/Topic"
                    ) || {}
                  ).mvalue || "nf Skills/Topic"}
                </th>

                <th>
                  {(
                    content[selectedLanguage].find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf ProjectDuration"}
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody>
              {skills["abtainSkill"]?.map((skill, index) => {
                return (
                  <tr key={skill.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{skill.skill}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <input
                          type="Number"
                          className="form-control ms-2"
                          min={Number(0)}
                          style={{
                            width: "60px",
                            height: "30px",
                          }}
                          value={skill.max}
                          onChange={(e) =>
                            inputMaxChange(skill.id, e.target.value)
                          }
                          onBlur={(e) => {
                            const value =
                              Number(skill?.max) || Number(e.target.value);
                            if (value < 0) {
                              inputMaxChange(skill?.id, 0);
                            }
                          }}
                        />
                        <select
                          style={{
                            width: "120px",
                            height: "30px",
                            border: "none",
                            background: "#f7f7f7",
                            outline: "none",
                          }}
                          value={skill.timeunit}
                          className="border ps-2 pb-1 ms-2  rounded"
                          onChange={(e) => {
                            //console.log(e.target.id);
                            inputTimeUnitChange(skill.id, e.target.value);
                          }}
                        >
                          <option id="year" value="year">
                            {(
                              content[selectedLanguage].find(
                                (item) => item.elementLabel === "Years"
                              ) || {}
                            ).mvalue || "nf year(s)"}
                          </option>
                          <option id="month" value="month">
                            {(
                              content[selectedLanguage].find(
                                (item) => item.elementLabel === "Months"
                              ) || {}
                            ).mvalue || "nf Month(s)"}
                          </option>
                          <option id="week" value="week">
                            {(
                              content[selectedLanguage].find(
                                (item) => item.elementLabel === "Weeks"
                              ) || {}
                            ).mvalue || "nf Week(s)"}
                          </option>
                        </select>
                      </div>
                    </td>

                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        deleteSkill(skill?.id);
                        handleCourseTopicDelete(index, false);
                      }}
                    >
                      <icons.IoClose />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Skills/Topic  back next save btn*/}
      <div class=" d-flex justify-content-between gap-2 ">
        <button
          class="btn btn-primary"
          onClick={() => {
            setSteps((prev) => {
              return { ...prev, step2: false };
            });
            setisActivePreskill(true);
          }}
        >
          {" "}
          {contentLabel("Back", "nf Back")}{" "}
        </button>

        <div className="d-flex gap-3">
          <button
            class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
            onClick={() => {
              handleSaveCourse("DRAFT", "APTAINSKILL");
            }}
            disabled={
              courseinfo?.isAptainSkill &&
              courseinfo?.isPreSkill &&
              courseinfo?.isBasicButton &&
              courseinfo?.isQuestion
            }
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
            class="btn btn-primary"
            onClick={() => {
              // if (courseTopics?.length > 0) {
              setSteps({
                step1: true,
                step2: true,
                step3: true,
              });
              // } else {
              //   showErrorToast(
              //     "PleaseFillAllRequiredFields",
              //     "nf Please fill all required fields"
              //   );
              // }
            }}
          >
            {" "}
            {contentLabel("Next", "nf Next")}{" "}
          </button>
        </div>
      </div>
    </div>
  );
};
export default SkillsAttainable;
