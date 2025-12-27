import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { GetAllExternalLinksApi } from "../../../../api/Jd Category, Jd Exp, External sites/GetAllExternalLinksApi";
import { getAllCategoryApi } from "../../../../api/Jd Category, Jd Exp, External sites/getAllCategoryApi";

import CourseBasicInfo from "./CourseBasicInfo";
import PrerequisiteSkills from "./PrerequisiteSkills";
import SkillsAttainable from "./SkillsAttainable";
import CourseQuestions from "./CourseQuestions";
import CoursePreview from "./CoursePreview";
import { getCookie } from "../../../../config/cookieService";

const CreateCourse = () => {
  //Get Props Which Type  Create / Edit / Clone
  const location = useLocation();
  const { mode } = location?.state || {};
  const navigate = useNavigate();
  //Get Access Token from seesion storage
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };
  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const { externalLinks } = useSelector((state) => state.ExternalLinks);
  const { subCategories, categories } = useSelector((state) => state.JobCategories);
  const [isActivePreskill, setisActivePreskill] = useState(false);
  const userDetails = useSelector((state) => state.userProfile.data);
  const [profilePicObj, setProfilePicObj] = useState({});
  const selectedLanguage = useSelector((state) => state.language);
  const [isCourseLoading, setCourseLoading] = useState(false);
  const sCourse = useSelector((state) => state.myCourses.editCourse);
  const { id } = useSelector((state) => state.myCourses.editCourse);
  const {courseinfo,skills,saveStatus,deleteSkillInCreate} = useSelector((state) => state.createCourse);
  const dispatch = useDispatch();
  const [preRequisiteSkills, setPrerequisiteSkills] = useState([]);
  const [attainableSkills, setAttainableSkills] = useState([]); 

  const [isReady, setIsReady] = useState(false);
  
  const [selectedLocations, setSelectedLocations] = useState('');
  const [linkAttachment, setLinkAttachment] = useState([]);
  const [linkImage, setLinkImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState(false);
  const [isDirty, setisDirty] = useState(false);
  const [isPublishedLoader, setIsPublishedLoader] = useState(false);
  const [preAptainSkill,setpreAptainSkill]=useState({
    preSkill:0,
    aptainSkill:0
  })
  //Save Warring Data
 const {
      isModalOpen,
      handleConfirm,
      handleCancel,
      requestUiBlock,
    } = useUnsavedChangesPrompt(isDirty, []);
 

const handleConfirmClick = () => {
          //dispatch(emptyOpCreate());
          handleConfirm();
 }

  useEffect(()=>{
  
   if (sCourse && mode !=='create') { 
      let tcourseData ={...courseinfo,...sCourse};
        let languages = sCourse?.courseLanguage?.split(",")?.map((lan) => {
        return { label: lan, value: lan };
      });
      setSelectedLocations(sCourse?.location);


        if (sCourse?.attachmentFileNames) {
        const attachments = JSON.parse(sCourse?.attachmentFileNames);
        const files = attachments
          ?.filter((att) => att?.fileType?.endsWith("pdf"))
          ?.map((att) => {
            return att;
          });
        
  
        setLinkAttachment(files);
        const images = attachments
          ?.filter((att) => att?.fileType?.startsWith("image"))
          ?.map((att) => {
            return att;
          });
        setLinkImage(images);
        const imageUrl = GetAttachment(
          images[0]?.userId,
          images[0]?.fileName,
          images[0]?.fileId
        );
        setSelectedImage(imageUrl);
      }

    let tquesSave = (sCourse?.courseQuestions || []).map(ques => ({
      ...ques,
      question: ques.cqLabel,
      answer: { label:ques.cqType, value: ques.cqType },
      options: [{label:JSON.parse(ques.cqValues || "[]"),value:JSON.parse(ques.cqValues || "[]")}],
      required: ques.cqRequired =='No' ? false : true,
      rank:ques.cqOrder,
      isClone:(mode==='clone') 
    }));
    
    let CourseName=(mode==="clone")? ("Copy of " +sCourse?.courseName):sCourse?.courseName
    let tgetstartDate=(sCourse.courseStartingDate==null || sCourse.courseStartingDate==undefined )? undefined : timestampToYYYYMMDD(Number(sCourse.courseStartingDate));

    tcourseData={...tcourseData,courseName:CourseName, courseQuestions:tquesSave,courseLanguage:languages, courseStartingDate: tgetstartDate,"isBasicButton":true,isPreSkill:true,isAptainSkill:true,isQuestion:true}
 
if(mode==='clone'){
   tcourseData={...tcourseData,isBasicButton:false,isPreSkill:false,isAptainSkill:false,isQuestion:false}
}
        dispatch(setCourseInfo(tcourseData));
        let tskillSave=[]
        tskillSave['preSkill']=(sCourse?.preRequisiteSkillsList || [])?.map(skill => ({
              ...skill,             
              skill:skill.skillId,
              min:skill.yoeMin,
              max:skill.yoeMax,
              timeunit:skill.yoePhase,
              checked:skill.isMandatory,
              isClone:(mode==='clone')           
            }));

        tskillSave['abtainSkill']= (sCourse?.attainableSkillsList?? [])?.map(skill => ({
              ...skill,             
              skill:skill.skillId,
              max:skill.duration,
              timeunit:skill.durationPhase,
              isClone:(mode==='clone')              
            }));


            dispatch(setCreateCoursePrequestSkills(tskillSave));
            
            setpreAptainSkill({preSkill:(sCourse?.preRequisiteSkillsList || [])?.length?? 0,
                                aptainSkill:(sCourse?.attainableSkillsList || [])?.length?? 0})

            setIsReady(true);

    }else if(mode ==='create'){
        dispatch(setCourseInfo([]))
        dispatch(setCreateCoursePrequestSkills([]));
        setIsReady(true);       
    }
    if (externalLinks && externalLinks.length === 0){
                dispatch(GetAllExternalLinksApi());
            }
            if (categories && categories.length === 0) {
              dispatch(getAllCategoryApi())
            };

  },[sCourse,mode])

  useEffect(()=>{
const hasPreSkills = (skills["preSkill"]?.length ?? 0) > 0;
const hasAbtainSkills = (skills["abtainSkill"]?.length ?? 0) > 0;
const isCreateMode = mode === 'create';
const isEditMode = mode !== 'create';

const shouldShowBasicButton = courseinfo?.isBasicButton === false;
const shouldShowPreSkill = ((isCreateMode && hasPreSkills) || isEditMode) && courseinfo?.isPreSkill === false;
const shouldShowAbtainSkill = ((isCreateMode && hasAbtainSkills) || isEditMode) && courseinfo?.isAptainSkill === false;
const shouldShowQuestion = courseinfo?.isQuestion === false;

if (
  shouldShowBasicButton ||
  shouldShowPreSkill ||
  shouldShowAbtainSkill ||
  shouldShowQuestion
){
    setisDirty(true);
    }else{
      setisDirty(false);
    }
    
  },[skills["preSkill"],skills["abtainSkill"],courseinfo?.isBasicButton ,courseinfo?.isPreSkill ,courseinfo?.isAptainSkill,courseinfo?.isQuestion]);

 
  {
    /* Set Stepper Name */
  }
  const steperSteps = [
    {
      name: contentLabel("CourseDetails", "nf Course Details"),
      number: 1,
      Component: () => <div>step1</div>,
    },
    {
      name: contentLabel("PrerequsiteSkills", "nf Prerequsite Skills"),
      number: 2,
      Component: () => <div>step2</div>,
    },
    {
      name: contentLabel("SkillsAttainable", "nf Skills Attainable"),
      number: 3,

      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("CourseQuestions", "nf Course Questions"),
      number: 4,

      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("Preview", "nf Preview"),
      number: 5,

      Component: () => <div>step4</div>,
    },
  ];
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  function formatDate(date) {
    // Create a new Date object from the provided date string
    const formattedDate = date ? new Date(date) : new Date();

    // Get the individual components of the date (month, day, and year)
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(formattedDate.getDate()).padStart(2, "0");
    const year = formattedDate.getFullYear();

    // Return the formatted date string
    return `${month}/${day}/${year}`;
  }

   async function deleteElements(name, elements) {
      for (const ele of elements) {
        try {
          await DeleteApi(name, ele?.id);
          console.log(`Deleted prerequisite with ID: ${ele?.id}`);
        } catch (error) {
          console.error(`Error deleting prerequisite with ID: ${ele?.id}`, error);
        }
      }
    }
//Save Aad Edit loigc here
const handleSaveCourse = async (submitType,cardFrom) => {

    if (!validateForm()) {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    
    setpreAptainSkill({
      preSkill:skills['preSkill']?.length ?? 0,
      aptainSkill:skills['abtainSkill']?.length ?? 0
    })
    
    {/* All Value true does not call api as well when publish click course status only update */}
   
    if(submitType==="PUBLISH" && (courseinfo?.isBasicButton && courseinfo?.isPreSkill && courseinfo?.isAptainSkill && courseinfo?.isQuestion))
    {
    await EditApi("User Courses",((mode ==='clone' || mode ==='create') ? courseinfo?.courseId : id), {courseStatus: submitType});
    
    dispatch(fetchUserCourses());
    dispatch(setCreateCoursePrequestSkills([]));
    dispatch(setCreateCourseAptainquestSkills([]));
    dispatch(setCourseInfo([]))
    dispatch(setCourseQuestions([]));

    setSteps({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false
    });

    showSuccessToast(contentLabel("CourseAddedSuccessfully", "nf Course Added Successfully"));
    navigate(`/skilling-agency/my-courses`);
    return;
    }
    else if(courseinfo?.isBasicButton && courseinfo?.isPreSkill && courseinfo?.isAptainSkill && courseinfo?.isQuestion)
    {
    showSuccessToast(contentLabel("CourseAddedSuccessfully", "nf Course Added Successfully"));
    return;
    }

    setisDirty(false);

    const courseAttachment = [];
    const fileAttachment = linkAttachment?.map((attach) => {
      return attach;
    });
    if (fileAttachment) {
      courseAttachment.push(...fileAttachment);
    }
  
    if (linkImage[0]) {
      courseAttachment.push(linkImage[0]);
    }
    if (userDetails[0]?.profilePictureFileName?.length) {
      courseAttachment.push({
        ...profilePicObj,
        userId: userDetails[0]?.id,
        firstName: userDetails[0]?.firstName,
        lastName: userDetails[0]?.lastName,
        type: "AgencyImage",
      });
    }
    if(submitType==="PUBLISH"){
    setIsPublishedLoader(true);
    }else{
    setCourseLoading(true);
    }
    
    
  try {
      let course =null;
      let courseId = id; 
      const isMode=!(courseinfo?.isBasicButton||courseinfo?.isPreSkill||courseinfo?.isAptainSkill||courseinfo?.isQuestion) && (mode ==='clone' || mode ==='create');
     

        if(isMode){
           course = await createNewCourse("User Courses", {
              attachmentUrls: "Normal",
              userId: getCookie("userId"),
              courseName: courseinfo.courseName,          
              userCategory:courseinfo?.userCategory,
              userSubCategory: courseinfo?.userSubCategory,
              openings:courseinfo?.openings,
              externalSite:courseinfo?.externalSite,                      
              extSiteId: courseinfo?.extSiteId,
              userCourseType:courseinfo?.userCourseType,
              dateCreated: formatDate(),
              courseDescription: courseinfo?.courseDescription,
              mlanguage: selectedLanguage,
              courseLanguage: courseinfo?.courseLanguage?.map((lan) => lan.value).join(", "),
              courseStatus: submitType,
              continent: "Asia",
              region: "South Asia",
              country: "India",
              location: selectedLocations,
              price: courseinfo?.price?.toString(),
              currency: courseinfo?.currency,
              attachmentFileNames:
              courseAttachment?.length > 0 ? JSON?.stringify(courseAttachment) : "",              
              courseStartingDate:toYYYYMMDD(courseinfo?.courseStartingDate),
              durationNumber: courseinfo.durationNumber,
              durationPhase: courseinfo?.price?.toString() &&(courseinfo?.durationPhase ?  courseinfo?.durationPhase  :((
                            content[selectedLanguage].find(
                              (item) => item.elementLabel === "Weeks"
                            ) || {}
                          ).mvalue || "nf Weeks")),
              skillerName: courseinfo?.skillerName,
              skillerBio: courseinfo?.skillerBio,     
              prerequisiteSkills: "NA",
              skillsAttainable: "NA",
            });          
          courseId=course.data.id;
         
        }
        else
        {
          course = await EditApi("User Courses",((mode ==='clone' || mode ==='create') ? courseinfo?.courseId : id), {
              courseName: courseinfo.courseName,          
              userCategory:courseinfo?.userCategory,
              userSubCategory: courseinfo?.userSubCategory,
              openings:courseinfo?.openings,
              externalSite:courseinfo?.externalSite,                      
              extSiteId: courseinfo?.extSiteId,
              userCourseType:courseinfo?.userCourseType,
              courseDescription: courseinfo?.courseDescription,
              location: selectedLocations,
              courseLanguage: courseinfo?.courseLanguage?.map((lan) => lan.value).join(", "),
              durationNumber: courseinfo.durationNumber,
              durationPhase: courseinfo.durationPhase,
              skillerName: courseinfo?.skillerName,
              skillerBio: courseinfo?.skillerBio, 
              status: courseinfo.status,
              courseStatus: submitType,
              price: courseinfo?.price?.toString(),
              currency: courseinfo?.currency,
              courseStartingDate:toYYYYMMDD(courseinfo?.courseStartingDate),
              attachmentFileNames:
              courseAttachment?.length > 0 ? JSON?.stringify(courseAttachment) : "",
            });
         courseId=course.data.id;
        }
    const lang = getCookie("HLang");
    const userId = getCookie("userId");

const phasNew = skills['preSkill']?.some(skill => skill.isNew === true || (skill?.isClone));

// 1. Map new skills (only if `isNew === true`)
const pnewSkills = phasNew
  ? (skills['preSkill'] || [])?.filter(skill=>(skill.isNew === true  || (skill?.isClone))).map(({ id, ...rest }) => ({
      ...rest,
      skillId: rest.skill,
      yoeMin: rest.min,
      yoeMax: rest.max,
      yoePhase: rest.timeunit,
      isMandatory: rest.checked,
      userCourseId: courseId,
      mlanguage: lang,
      userId: userId,
    }))
  : [];

// 2. Map existing (non-new) skills — only in edit mode
const poldSkills = (mode === 'edit' || !isMode)
  ? (skills['preSkill'] || [])
      .filter(skill => skill.isNew !== true)
      .map(skill => ({
        skillId: skill.skill,
        yoeMin: skill.min,
        yoeMax: skill.max,
        yoePhase: skill.timeunit,
        isMandatory: skill.checked,
        mlanguage: lang,
        userId: userId,
        userCourseId: skill.userCourseId ?? courseId,
      }))
  : [];

// 3. Merge them into one array
const finalSkills = [...pnewSkills, ...poldSkills];


const ahasNew = skills['abtainSkill']?.some(skill => skill.isNew === true  || (skill?.isClone));

// 1. Map new skills (only if `isNew === true`)
const anewSkills = ahasNew
  ? (skills['abtainSkill'] || [])?.filter(skill=>skill.isNew === true || (skill?.isClone)).map(({ id, ...rest }) => ({
      ...rest,
        skillId: rest.skill,
        durationPhase: rest.timeunit,
        mlanguage: lang,
        userId: userId,
        duration: rest.max,
        userCourseId: courseId,
    }))
  : [];

// 2. Map existing (non-new) skills — only in edit mode
const aoldSkills = (mode === 'edit' || !isMode)
  ? (skills['abtainSkill'] || [])
      .filter(skill => skill.isNew !== true)
      .map(skill => ({
        skillId: skill.skill,
        durationPhase: skill.timeunit,
        mlanguage: lang,
        userId: skill.userId,
        duration: skill.max,
        userCourseId: courseId,
      }))
  : [];

// 3. Merge them into one array
const filteredCourseTopics = [...anewSkills, ...aoldSkills];

let finalSKillUpdate=skills;
  
  if (finalSkills?.length > 0) {
        let prerequsite = await axios.put(`${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
          finalSkills,
          { headers }
        );
        
       if(prerequsite?.data?.length > 0){ 
         finalSKillUpdate = {
            ...finalSKillUpdate,
            preSkill: (prerequsite?.data || [])?.map(skill => ({
              ...skill,             
              skill:skill.skillId,
              min:skill.yoeMin,
              max:skill.yoeMax,
              timeunit:skill.yoePhase,
              checked:skill.isMandatory,
            }))
          };
        }

      }

  if (filteredCourseTopics?.length > 0) {
        let skillsAttainables = await axios.put(
          `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
          filteredCourseTopics,
          { headers }
        );

         if(skillsAttainables?.data?.length > 0) {
          finalSKillUpdate = {
            ...finalSKillUpdate,
            abtainSkill: (skillsAttainables?.data ?? [])?.map(skill => ({
              ...skill,             
              skill:skill.skillId,
              max:skill.duration,
              timeunit:skill.durationPhase,
            }))
          };
        }
        
      }

let tquesSave = [];

// 1. Get new questions (to post)
const constNewQuestions = (mode === 'edit' || !isMode)
  ? (courseinfo?.courseQuestions || []).filter((question) => !question?.id?.includes("CQSTN") || (question?.isClone))
  : (courseinfo?.courseQuestions || []);

// 2. POST new questions
const postQuestions = constNewQuestions?.map(async (question, index) => {
  const optionValues = question?.options?.map((option) => option?.value);

  try {
    const questionRes = await PostApi("CQuestions", {
      cid: courseId,
      cqOrder: question.rank,
      cqValues: JSON.stringify(optionValues),
      cqType: question.answer.value,
      cqLabel: question.question,
      cqRequired: question.required ? "Yes" : "No",
    });

    const mapped = (( Array.isArray( questionRes?.data) ?  questionRes?.data : [questionRes?.data]) || []).map(ques => ({
      ...ques,
      question: ques.cqLabel,
      answer: { label: ques.cqType, value: ques.cqType },
      options: JSON.parse(ques.cqValues || "[]").map(opt => ({
        label: opt,
        value: opt
      })),
      required: ques.cqRequired === 'No' ? false : true,
      rank: ques.cqOrder
    }));

    tquesSave = [...tquesSave, ...mapped];

  } catch (err) {
    console.error("Error posting new questions:", err);
    throw err;
  }
});

await Promise.all(postQuestions);

// 3. Get edited questions (to update)
const constEditQuestions = (mode === 'edit' || !isMode)
  ? (courseinfo?.courseQuestions || []).filter(
      (question) => question?.id?.includes("CQSTN") && question?.isEdit === true
    )
  : [];

// 4. PUT edited questions
const postEditQuestions = constEditQuestions?.map(async (question, index) => {
  const optionValues = question?.options?.map((option) => option?.value);
  try {
    const questionRes = await EditApi("CQuestions", question.id, {
      cid: courseId,
      cqOrder: question.rank,
      cqValues: JSON.stringify(optionValues),
      cqType: question.answer.value,
      cqLabel: question.question,
      cqRequired: question.required ? "Yes" : "No",
    });

    const mapped = ((Array.isArray( questionRes?.data) ?  questionRes?.data : [questionRes?.data]) || []).map(ques => ({
      ...ques,
      question: ques.cqLabel,
      answer: { label: ques.cqType, value: ques.cqType },
      options: JSON.parse(ques.cqValues || "[]").map(opt => ({
        label: opt,
        value: opt
      })),
      required: ques.cqRequired === 'No' ? false : true,
      rank: ques.cqOrder
    }));

    tquesSave = [...tquesSave, ...mapped];

  } catch (err) {
    console.error("Error updating questions:", err);
    throw err;
  }
});

await Promise.all(postEditQuestions);

const constsetCourse = (courseinfo?.courseQuestions || []).filter((question) => question?.id?.includes("CQSTN") &&  question?.isEdit !== true && !question?.isClone)
tquesSave = [...tquesSave, ...constsetCourse];

{/* Delete Question Attainable and PreSkill */}
  if((mode === 'edit' || !isMode)){
      
        // Delete elements (Pre,Att,Que)
      const deletePreElements = [...(skills['preSkill'] ?? []).filter((obj1) =>!finalSkills?.some((obj2) => obj1?.id === obj2?.id))];

      const deleteAttElements = [...(skills['abtainSkill']?? []).filter((obj1) =>!filteredCourseTopics?.some((obj2) => obj1?.id === obj2?.id))];

      const deleteQueElements = (sCourse?.courseQuestions || []).filter(
        obj1 =>!courseinfo?.courseQuestions?.some(obj2 => obj1?.id === obj2?.id) && obj1?.id?.includes("CQSTN"));



        if (deletePreElements?.length > 0) {
          await deleteElements("UserCourse Prerequisite", deletePreElements);
        }
        if (deleteAttElements?.length > 0) {
          await deleteElements("UserCourse SkillsAttainable", deleteAttElements);
        }
        if (deleteQueElements?.length > 0) {
          await deleteElements("CQuestions", deleteQueElements);
        }

      }
  
  dispatch(setCreateCoursePrequestSkills(finalSKillUpdate));

  if(cardFrom==="BASIC"|| cardFrom==="PRESKILL"|| cardFrom==="APTAINSKILL"|| cardFrom==="QUESTION" || cardFrom==="PREVIEW"){
    dispatch(setCourseInfo({...courseinfo,isBasicButton:true,isPreSkill:true,isAptainSkill:true,isQuestion:true,isPreview:true, courseId:courseId,courseQuestions:tquesSave}));
  }else{
        dispatch(fetchUserCourses());
        dispatch(setCreateCoursePrequestSkills([]));
        dispatch(setCreateCourseAptainquestSkills([]));
        dispatch(setCourseInfo([]))

        dispatch(setCourseQuestions([]));

          setSteps({
          step1: false,
          step2: false,
          step3: false,
          step4: false,
          step5: false
        });

      navigate(`/skilling-agency/my-courses`);
  }

  if(submitType==="PUBLISH"){
  setIsPublishedLoader(false);
  }else{
  setCourseLoading(false);
  }

  showSuccessToast(contentLabel("CourseAddedSuccessfully", "nf Course Added Successfully"));
    } catch (error) {
      console.log(error);
      showErrorToast(
        contentLabel("SomethingWentWrong", "nf Something Went Wrong")
      );
      if(submitType==="PUBLISH"){
    setIsPublishedLoader(false);
    }else{
    setCourseLoading(false);
    }
    }
  };

  const validateForm = () => {
  const newErrors = {};

  if (!courseinfo?.courseName)
  newErrors.courseName = "Course Name is required.";    
  if (courseinfo?.courseDescription?.length > 1000)
  newErrors.courseDescription = "Course Description length exceeded.";
  if (courseinfo?.skillerBio?.length > 1000)
  newErrors.skillerBio = "Skiller Bio length exceeded.";
  if (courseinfo?.price && courseinfo?.price?.trim()!="" && !courseinfo?.currency){
  newErrors.skillerBio = "Choose the Currency.";
  }

  setErrors(newErrors);    
  return Object.keys(newErrors)?.length === 0;
  };

  const toYYYYMMDD=(input)=> {
  let date;

  // Handle numeric timestamp
  if (!isNaN(input)) {
  date = new Date(Number(input));
  } else if (typeof input === 'string') {
  // Format: DD-MM-YYYY
  const ddmmyyyyMatch = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
  const [_, day, month, year] = ddmmyyyyMatch;
  date = new Date(`${year}-${month}-${day}`);
  } else {
  // Normalize slashes to dashes (e.g., 2025/08/19 → 2025-08-19)
  const normalized = input.replace(/\//g, '-');
  date = new Date(normalized);
  }
  }

  if (!(date instanceof Date) || isNaN(date)) {
  return null;
  }

  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${month}/${day}/${year}`;
  };

  return (
    isReady &&<>
      {/*  Pop Up Model */}
      <div
        class="modal fade modal"
        id="save"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Save Changes?
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div className="d-flex gap-2 flex-column align-items-end ">
                <div>
                  {" "}
                  <span className="text-label">Clicking 'Save'</span> will
                  replace the existing file with the changes you've made. Are
                  you sure you want to proceed?
                </div>
                <div className="d-flex gap-2 ">
                  <button
                    className="btn py-1 px-2 m-0 text-label"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => handleSaveCourse()}
                  >
                    Save
                  </button>
                  <button
                    className="btn py-1 px-2 m-0 text-label"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  Card Stepper Start */}
      <div class="card p-4">
        <CreateStepper
          steps={steperSteps}
          activeSteps={steps}
          setActiveSteps={setSteps}
          setisActivePreskill={setisActivePreskill}
        />
      </div>

      {/*  Course Info Cards */}
      <div class="card p-4">
       {!steps.step1
      ?   <CourseBasicInfo
            isCourseLoading={isCourseLoading}
            setSteps={setSteps}
            handleSaveCourse={handleSaveCourse}
            setisActivePreskill={setisActivePreskill}
            selectedLocations={selectedLocations} setSelectedLocations={setSelectedLocations}
            linkAttachment={linkAttachment} setLinkAttachment={setLinkAttachment} 
            linkImage={linkImage} setLinkImage={setLinkImage}    
            setSelectedImage={setSelectedImage}
            setisDirty={setisDirty}
            externalLinks={externalLinks} subCategories={subCategories} categories={categories} 
          />
      : steps.step1 && !steps.step2
      ? <PrerequisiteSkills
            setisActivePreskill={setisActivePreskill}
            isCourseLoading={isCourseLoading}
            setSteps={setSteps}
            handleSaveCourse={handleSaveCourse}
            preRequisiteSkills={preRequisiteSkills} 
            setPrerequisiteSkills={setPrerequisiteSkills}
            isLength={preAptainSkill?.preSkill}
          />
      : steps.step1 && steps.step2 && !steps.step3
      ? <SkillsAttainable
            setisActivePreskill={setisActivePreskill}
            isCourseLoading={isCourseLoading}
            setSteps={setSteps}
            handleSaveCourse={handleSaveCourse}
            attainableSkills={attainableSkills}
            isLength={preAptainSkill?.aptainSkill}
            setAttainableSkills={setAttainableSkills}
          />
      : steps.step1 && steps.step2 && steps.step3 && !steps.step4
      ? <CourseQuestions isCourseLoading={isCourseLoading} pagemode={mode} setSteps = {setSteps} handleSaveCourse = {handleSaveCourse}  />
      : steps.step1 && steps.step2 && steps.step3 && steps.step4 && !steps.step5
      ? <CoursePreview isPublishedLoader={isPublishedLoader}  selectedImage={selectedImage} linkAttachment={linkAttachment}  isCourseLoading={isCourseLoading} selectedLocations={selectedLocations} setSteps={setSteps} handleSaveCourse = {handleSaveCourse}  />
      : <></>}
      </div>
      {/* Save Warning POPUP */}
             <SaveWarning
              isOpen={isModalOpen}
              onConfirm={handleConfirmClick}
              onCancel={handleCancel}
            />
    </>
  );
};

export default CreateCourse;
