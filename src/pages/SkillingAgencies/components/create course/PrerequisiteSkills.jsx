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
import {CouresQuestionsComponent} from "./CourseQuestionsComponent";
const PrerequisiteSkills =({isLength,isCourseLoading,setSteps,handleSaveCourse,setisActivePreskill,setPrerequisiteSkills,preRequisiteSkills})=>{
      
      const contentLabel = useContentLabel();
      const content = useSelector((state) => state.content);
      const {courseinfo,skills,saveStatus,deleteSkillInCreate} = useSelector((state) => state.createCourse);
      const selectedLanguage = useSelector((state) => state.language);
      const dispatch = useDispatch();
   
     //prerequisite Skills
     const [isDeletingPrerequisiteSkills, setIsDeletingPrerequisiteSkills] =useState(false);


      const handlePrerequisiteSkillDelete = async (index, id) => {
          if (courseinfo?.id) {         
            setIsDeletingPrerequisiteSkills(true);
            try {
              await DeleteApi("UserCourse Prerequisite", id);
              let tskills = preRequisiteSkills?.filter((skill, i) => {
                return i !== index;
              });
               setPrerequisiteSkills(tskills);    
            } catch (error) {
              showErrorToast(
                contentLabel("SomethingWentWrong", "nf Something Went Wrong")
              );
              
            } finally {
              setIsDeletingPrerequisiteSkills(false);
            }
            return;
          } else {
            let skills = preRequisiteSkills?.filter((skill, i) => {
              return i !== index;
            });
            setPrerequisiteSkills(skills);            
          }
        };

       const inputMinChange = (id, inputValue) => {     
        let tskills = {...skills,preSkill:skills['preSkill']?.map((skill) => {        
           if (skill.skill === id || skill?.id === id) {           
             let skillData = { ...skill, min: inputValue };         
             return skillData;
           }
           return skill;
         })}
       dispatch(setCreateCoursePrequestSkills(tskills)); 
       dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))
        }
   
      const inputMaxChange = (id, inputValue) => {        
        let tskills = {...skills,preSkill: skills['preSkill']?.map((skill) => {
             if (skill.skill === id || skill?.id === id) {               
                let skillData = { ...skill, max: inputValue };
                return skillData;
              }
              return skill;
            })}
         dispatch(setCreateCoursePrequestSkills(tskills));
        dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))
       }
      
      
      const inputTimeUnitChange = (id, inputValue) => {        
       
                let tskills = {...skills,preSkill:skills['preSkill']?.map((skill) => {
                  if (skill.id === id) {
                    let skillData = { ...skill, timeunit: inputValue };
                    return skillData;
                  }
                  return skill;
                })}; 

              dispatch(setCreateCoursePrequestSkills(tskills));
              dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))          
       };
      
      const toggleChecked = (id, event) => {      
            let tskills = {...skills,preSkill: skills['preSkill']?.map((skill) => {
                   if (skill.id === id) {      
                     let skillData = { ...skill, [event.target.name]: event.target.checked };
                     return skillData;
                   }
                   return skill;
                 })};
               dispatch(setCreateCoursePrequestSkills(tskills )); 
              dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))    
       }
     
        
             
 const deleteSkill = async(id) => { 
           if (courseinfo?.id) {         
            setIsDeletingPrerequisiteSkills(true);
            try {
              await DeleteApi("UserCourse Prerequisite", id);             
              } catch (error) {
              showErrorToast( contentLabel("SomethingWentWrong", "nf Something Went Wrong"));
            } finally {
              setIsDeletingPrerequisiteSkills(false);
            }         
          }      

  let tskills = {...skills,preSkill: skills['preSkill']?.filter((skill) => skill.id !== id)};
  dispatch(setCreateCoursePrequestSkills(tskills));
  let dskills=  {...skills,preSkill: skills['preSkill']?.filter((skill) => skill.id === id)};
  dispatch(setDeletePreSkillInCreate([...deleteSkillInCreate, dskills]));

  dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))
        };

      useEffect(()=>{
      console.log("isPreSkill",skills['preSkill']?.length,isLength,(skills['preSkill']?.length ?? 0) != isLength)

        if(((skills['preSkill']?.length ?? 0) != isLength) && (courseinfo?.isPreSkill==true)){
            dispatch(setCourseInfo({...courseinfo,isPreSkill:false}))
                            }
                        },[skills['preSkill']])
    return (
           <div>
            <div class="mb-3 w-75" style={{ position: "relative" }}>
            <div>   
            <CouresSkillComponent isActiveCard={true} isOnboarding={false} />
            </div>
            </div>
            <div>
                {skills['preSkill']?.length ?? 0 !== 0 ? (
                              <>                              
                                <Col className="mb-3 d-flex flex-wrap w-100">
                                  <table className="table table-hover">
                                    <thead>
                                      <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">
                                          {contentLabel(
                                            "SkillName",
                                            "nf Skill Name"
                                          )}
                                        </th>
                                        <th>
                                          {contentLabel(
                                            "Experience",
                                            "nf Experience"
                                          )}
                                        </th>
                                        <th scope="col">
                                          {contentLabel(
                                            "Mandartory",
                                            "nf Mandartory"
                                          )}
                                        </th>              
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {skills['preSkill'].map((skill, index) => {
                                        return (
                                          <tr key={skill?.id}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{skill.skill}</td> 
                                              <td>
                                <div className="d-flex align-items-center">
                                  <label className="d-flex align-items-center">
                                    {contentLabel("From", "nf From")}
                                  </label>
                                  <input
                                    type="Number"
                                    className="form-control ms-2"
                                    min={0}
                                    max={Number(skill?.max)}
                                    style={{
                                      width: "60px",
                                      height: "30px",
                                    }}
                                    value={skill.min}
                                    onChange={(e) =>
                                      inputMinChange(
                                        skill.id,
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) => {
                                      const value = Number(e.target.value);
                                      if (value >  skill.max) {
                                        inputMaxChange(skill.id, skill.min);
                                      }
                                    }}
                                  />
                                  <label className="ms-2 d-flex align-items-center">
                                    {contentLabel("To", "nf To")}
                                  </label>
                                  <input
                                    type="Number"
                                    className="form-control ms-2"
                                    min={Number(skill.min)}
                                    style={{
                                      width: "60px",
                                      height: "30px",
                                    }}
                                    value={skill.max}
                                    onChange={(e) =>{
                                    const value =Number(e.target.value);
                                     console.log(value >  Number(skill.min), value,skill.min)
                                      if (value >  Number(skill.min)) {
                                        inputMaxChange(skill.id, value);
                                      }else{
                                      inputMaxChange(
                                        skill.id,
                                        skill.min
                                      )}
                                      }  
                                    }
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
                                      inputTimeUnitChange(
                                        skill.id,
                                        e.target.value
                                      );
                                    }}
                                  >
                                    <option id="year" value="year">
                                      {(
                                        content[
                                          selectedLanguage
                                        ].find(
                                          (item) =>
                                            item.elementLabel ===
                                            "Years"
                                        ) || {}
                                      ).mvalue || "nf year(s)"}
                                    </option>
                                    <option id="month" value="month">
                                      {(
                                        content[
                                          selectedLanguage
                                        ].find(
                                          (item) =>
                                            item.elementLabel ===
                                            "Months"
                                        ) || {}
                                      ).mvalue || "nf Month(s)"}
                                    </option>
                                    <option id="week" value="week">
                                      {(
                                        content[
                                          selectedLanguage
                                        ].find(
                                          (item) =>
                                            item.elementLabel ===
                                            "Weeks"
                                        ) || {}
                                      ).mvalue || "nf Week(s)"}
                                    </option>
                                  </select>
                                   </div>
                                              </td>
                                              <td>
                                                <input
                                                  type="checkbox"
                                                  style={{
                                                    width: "40px",
                                                    height: "20px",
                                                  }}
                                                  name="checked"
                                                  checked={(String(skill?.checked)?.toLowerCase() === 'true')}
                                                  onChange={(e) =>
                                                    toggleChecked(skill.id, e)
                                                  }
                                                />
                                              </td>            
                                              <td
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>{ deleteSkill(skill.id);
                                                //handlePrerequisiteSkillDelete(index,false)
                                                }}>
                                                <icons.IoClose />
                                              </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </Col>
                              </>
                            ) : null}

            </div>
            <div class="d-flex justify-content-between gap-2 ">
              <button
                class="btn btn-primary  "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step1: false };
                  });
                  setisActivePreskill(false);
                }}
              >
                {" "}
                {contentLabel("Back", "nf Back")}{" "}
              </button>

              <div className="d-flex gap-3">
                <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      handleSaveCourse("DRAFT","PRESKILL");
                    }}
                    disabled={courseinfo?.isPreSkill && (courseinfo?.isBasicButton && courseinfo?.isAptainSkill && courseinfo?.isQuestion)}
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
                class="btn btn-primary "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step2: true };
                  });
                  setisActivePreskill(false)
                }}
              >
                {contentLabel("Next", "nf Next")}
              </button>
              </div>
            </div> 
          </div>
        
    );  
}

function areArraysEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i], b = arr2[i];
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (let key in a) {
      if (a[key] !== b[key]) return false;
    }
  }
  return true;
}

export default PrerequisiteSkills;