import { getCookie } from '../../../config/cookieService';
import React, {useContext,useRef, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../../config/Properties";
import company_image from "../../../Images/skyline.png";
import { icons, images } from "../../../constants";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { useDispatch } from "react-redux";
import Loader from "../../../components/Loader";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import EditApi from "../../../api/editData/EditApi";
import { fetchUserCourses } from "../../../api/SkillingAgency/fetchUserCourses";
import PostApi from "../../../api/PostData/PostApi";
import axios from "axios";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import SkillSuggestionApi from "../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaStar } from "react-icons/fa";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import CreateStepper from "../../../components/Steppers/CreateStepper";
import useContentLabel from "../../../hooks/useContentLabel";
import { Col, Row } from "react-bootstrap";
import Gallery from "../../../components/molecules/Gallery/Gallery";
import Files from "../../../components/molecules/Files/Files";
import { GetAttachment } from "../../../api/Attachment  API/DownloadAttachmentApi";
import { MdOpenInNew, MdPlayCircleOutline } from "react-icons/md";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import GetAllLangApi from "../../../api/content/GetAllLangApi";
import CourseQuestions from "./create course/CourseQuestions";
import DeleteApi from "../../../api/DeleteData/DeleteApi";
import { setCourseQuestions,setCreateCoursePrequestSkills,setDeletePreSkillInCreate,setCreateCourseAptainquestSkills,setDeleteAptainSkillInCreate } from "../../../reducer/skilling agency/create course/createCourseSlice";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import BriefDescriptionTextArea from "../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { LIMITED_SPL_CHARS } from "../../../config/constant";
import createNewCourse from "../../../api/SkillingAgency/createNewCourse";
import useUnsavedChangesPrompt from "../../../hooks/Save Warning/useUnsavedChangesPrompt";
import SaveWarning from "../../../hooks/Save Warning/SaveWarning";
import CouresSkillComponent from "./Course Skill Component/CouresSkillComponent"
import { getSkillExceptionRecord } from "../../../api/PostData/ExceptionAPI/getSkillExceptionRecord"
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import { GetAllExternalLinksApi } from "../../../api/Jd Category, Jd Exp, External sites/GetAllExternalLinksApi";
import { getAllCategoryApi } from "../../../api/Jd Category, Jd Exp, External sites/getAllCategoryApi";


const CreateCourseInfo = () => {
  
  //Get Props Which Type  Create / Edit / Clone
  const location  = useLocation();
  const { mode } = location?.state || {}; 
 //Get Access Token from seesion storage
  const headers = {Authorization: "Bearer " + getCookie("token")};
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  const contentLabel = useContentLabel();
  const userDetails = useSelector((state) => state.userProfile.data);
  const [profilePicObj, setProfilePicObj] = useState({});
  const [isCourseLoading, setCourseLoading] = useState(false);
  const [isDirty, setisDirty] = useState(false);
  const[isActivePreskill,setisActivePreskill] = useState(false);

  const {
    myCoursesList: data,
    status,
    error,
  } = useSelector((state) => state.myCourses);
  
  
  const { questions,skills,saveStatus,deleteSkillInCreate,aptainskills,deleteAptainSkillInCreate} = useSelector((state) => state.createCourse);
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const regionalData = useSelector((state) => state.regionalData);

  //Component states
  const navigate = useNavigate();
  const [SkillSuggestions, setSkillSuggestions] = useState([]);

  //selected Course
  const { id } = useSelector((state) => state.myCourses.editCourse);
  const sCourse = useSelector((state) => state.myCourses.editCourse);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [currencyInput, setCurrencyInput] = useState("");

  //prerequisite Skills
  const [isDeletingPrerequisiteSkills, setIsDeletingPrerequisiteSkills] =
    useState(false);
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]); //for array
  const [skill, setSkill] = useState({
    //for modal
    applicationName: "UserCourse Prerequisite",
    skillId: "",
    isMandatory: "No",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
    userCourseId: id,
  });
    //skills Attainable
  const [isDeletingCourseTopics, setIsDeletingCourseTopics] = useState(false);
  const [courseTopics, setCourseTopics] = useState([]); //skills attainable array

 const { externalLinks } = useSelector((state) => state.ExternalLinks);
  const { subCategories, categories } = useSelector(
     (state) => state.JobCategories
   );
  
console.log("First Time Load",sCourse)
  const inputMinChange = (skillId, inputValue) => {    
    if(skills?.length<=0){
       setPrerequisiteSkills((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, yoeMin: inputValue };
          return skillData;
        }
        return skill;
      })
       })
    }

    dispatch(setCreateCoursePrequestSkills(
      skills.map((skill) => {        
        if (skill.skill === skillId||skill?.skillId === skillId) {           
          let skillData = { ...skill, min: inputValue };         
          return skillData;
        }
        return skill;
      })
    ));

    };

  const inputMaxChange = (skillId, inputValue) => {
  if(skills?.length<=0 && isActivePreskill){
       setPrerequisiteSkills((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, yoeMax: inputValue };
          return skillData;
        }
        return skill;
      })
       })
    }else if(skills?.length<=0 && !isActivePreskill){
        setCourseTopics((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, duration: inputValue };
          return skillData;
        }
        return skill;
      })
       })
    }

   dispatch(setCreateCoursePrequestSkills(
      skills.map((skill) => {
       if (skill.skill === skillId || skill?.skillId === skillId) {
         
          let skillData = { ...skill, max: inputValue };
          // if (saveStatus[1] === true) {
          //   skillData.isEdit = true;
          // }
          return skillData;
        }
        return skill;
      })
    ));
    };

  const inputTimeUnitChange = (skillId, inputValue) => {
     
  if(skills?.length<=0 && isActivePreskill){
       setPrerequisiteSkills((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, yoePhase: inputValue };
          return skillData;
        }
        return skill;
      })
       })
    }else if(skills?.length<=0 && !isActivePreskill){
        setCourseTopics((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, durationPhase: inputValue };
          return skillData;
        }
        return skill;
      })
       })
    }


        dispatch(setCreateCoursePrequestSkills(
          skills.map((skill) => {
            if (skill.skill === skillId) {
              let skillData = { ...skill, timeunit: inputValue };
              // if (saveStatus[1] === true) {
              //   skillData.isEdit = true;
              // }
              return skillData;
            }
            return skill;
          })
        ));
    
   };

  const toggleChecked = (skillId, event) => {
    if(skills?.length<=0 && isActivePreskill){
       setPrerequisiteSkills((prev = []) => {
       return prev.map((skill) => {
       if (skill?.skillId === skillId) {         
          let skillData = { ...skill, isMandatory: event.target.checked };
          return skillData;
        }
        return skill;
      })
       })
    }


          dispatch(setCreateCoursePrequestSkills(
            skills.map((skill) => {
              if (skill.skill === skillId) {      
                let skillData = { ...skill, [event.target.name]: event.target.checked };
                // if (saveStatus[1] === true) {
                //   skillData.isEdit = true;
                // }
                return skillData;
              }
              return skill;
            })
          ));
   };

        
  const deleteSkill = (skillId) => {           
            if (saveStatus[1] !== true) {            
              const delskill = skills.find((skill) => skill.id === skillId)
              const skillData = skills.filter((skill) => (skill.id !== skillId))

              if(isActivePreskill){
              dispatch(setDeletePreSkillInCreate([...deleteSkillInCreate, delskill]));        
              dispatch(setCreateCoursePrequestSkills(skillData));
              }else{
              dispatch(setDeleteAptainSkillInCreate([...deleteSkillInCreate, delskill]));        
              dispatch(setCreateCourseAptainquestSkills(skillData));
              }
            }
            else {
               if(isActivePreskill){
                 dispatch(setCreateCoursePrequestSkills(skills.filter((skill) => skill.id !== skillId)));
               }else{
                  dispatch(setCreateCourseAptainquestSkills(skills.filter((skill) => skill.id !== skillId)));
               }
            }
   };


 useEffect(() => {
  if (isActivePreskill) {
      const lang = getCookie("HLang");
      const userId =getCookie("userId");
  
      const updatedSkills = skills.map((skill) => ({
      skillId: skill?.skill,
      mlanguage: lang,
      userId: userId,
      occupation: skill?.occupation,
      skillIdValue: skill?.id,
      yoeMin: skill?.min,
      yoeMax: skill?.max,
      yoePhase: skill?.timeunit,
      isMandatory: skill?.checked,
      skill:skill?.id
    }));

    setPrerequisiteSkills((prev = []) => {
      const updatedMap = new Map();

      // First, add all previous items to the map
      prev.forEach(item => {
        updatedMap.set(item.skillId, { ...item });
      });

      // Then, update or insert with the new items
      updatedSkills.forEach(skill => {
        if (!skill.skillId) return;

        if (updatedMap.has(skill.skillId)) {
          // Merge/Update existing skill
          const existing = updatedMap.get(skill.skillId);
          updatedMap.set(skill.skillId, {
            ...existing,
            yoeMin: skill.yoeMin,
            yoeMax: skill.yoeMax,
            yoePhase: skill.yoePhase,
            isMandatory: skill.isMandatory,
          });
        } else {
          // Add new skill
          updatedMap.set(skill.skillId, skill);
        }
      });

      const finalSkills = Array.from(updatedMap.values());      
      return finalSkills;
    });
  }
  else if(!isActivePreskill && skills && skills?.length > 0)
    {    
      const lang = getCookie("HLang");
      const userId =getCookie("userId");
      
      const updatedSkills = skills
      ?.filter(skill => !skill?.isDelete) // Ignore deleted
      ?.map(skill => ({
        skillId: skill?.skill,
        isMandatory: "No",
        mlanguage: lang,
        userId: userId,
        occupation: skill?.occupation,
        skillIdValue: skill?.id,
        durationPhase: skill?.timeunit,
        duration: skill?.max,
        skill:skill?.id
      }));

      setCourseTopics((prev = []) => {
      const skillMap = new Map();

      // Add all existing topics to the map
      prev.forEach(topic => {
        skillMap.set(topic.skillId, { ...topic });
      });

      // Add or update with new topics
      updatedSkills.forEach(skill => {
        if (!skill.skillId) return;

        if (skillMap.has(skill.skillId)) {
          // Merge/update existing topic
          const existing = skillMap.get(skill.skillId);
          skillMap.set(skill.skillId, {
            ...existing,
            duration: skill.duration,
            durationPhase: skill.durationPhase,
            occupation: skill.occupation,
            mlanguage: skill.mlanguage,
            isMandatory: skill.isMandatory,
          });
        } else {
          // Add new
          skillMap.set(skill.skillId, skill);
        }
      });

  const mergedTopics = Array.from(skillMap.values());
  return mergedTopics;
      });
  }
  
}, [skills]);

useEffect(() => {
     const lang = getCookie("HLang");
      const userId =getCookie("userId");
      
      const updatedSkills = aptainskills
      ?.filter(skill => !skill?.isDelete) // Ignore deleted
      ?.map(skill => ({
        skillId: skill?.skill,
        isMandatory: "No",
        mlanguage: lang,
        userId: userId,
        occupation: skill?.occupation,
        skillIdValue: skill?.id,
        durationPhase: skill?.timeunit,
        duration: skill?.max,
        skill:skill?.id
      }));

      setCourseTopics((prev = []) => {
      const skillMap = new Map();

      // Add all existing topics to the map
      prev.forEach(topic => {
        skillMap.set(topic.skillId, { ...topic });
      });

      // Add or update with new topics
      updatedSkills.forEach(skill => {
        if (!skill.skillId) return;

        if (skillMap.has(skill.skillId)) {
          // Merge/update existing topic
          const existing = skillMap.get(skill.skillId);
          skillMap.set(skill.skillId, {
            ...existing,
            duration: skill.duration,
            durationPhase: skill.durationPhase,
            occupation: skill.occupation,
            mlanguage: skill.mlanguage,
            isMandatory: skill.isMandatory,
          });
        } else {
          // Add new
          skillMap.set(skill.skillId, skill);
        }
      });

  const mergedTopics = Array.from(skillMap.values());
  return mergedTopics;
      });  
},[aptainskills])



useEffect(()=>{ 
dispatch(setCreateCoursePrequestSkills([]));
  dispatch(setCreateCoursePrequestSkills([]));
 
},[isActivePreskill])
// useEffect(()=>{ 
//  if(isActivePreskill){
//   if(prerequisiteSkills?.length ?? 0> 0){
//   const tValues = prerequisiteSkills?.map(skill => ({
//   id: skill?.skill,
//   occupation: skill?.occupation,
//   timeunit: skill?.yoePhase,
//   max: skill?.yoeMax,
//   skill: skill?.skillId,
//   checked:skill?.isMandatory,
//   min:skill?.yoeMin
// })) || [];

//   dispatch(setCreateCoursePrequestSkills(...tValues));
//   dispatch(setCreateCoursePrequestSkills([]));
// }
//  }else{
//   if(courseTopics?.length ?? 0 >0){
//   const tValues =courseTopics?.map(skill => ({
//   id: skill?.skill,
//   occupation: skill?.occupation,
//   timeunit: skill?.durationPhase,
//   max: skill?.duration,
//   skill: skill?.skillId
// })) || [];
//   dispatch(setCreateCoursePrequestSkills(...tValues));
//   dispatch(setCreateCourseAptainquestSkills([]));
// }
//  }  
// },[isActivePreskill])


  const [topics, setTopics] = useState({
    //for modal
    applicationName: "UserCourse SkillsAttainable",
    skillId: "",
    duration: "",
    durationPhase: "Days",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
    userCourseId: id,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [coursePdf, setCoursePdf] = useState(null);

  const [courseStartingDate, setCourseStatingDate] = useState("");

  const [selectedLocations, setSelectedLocations] = useState('');
  const [online, setOnline] = useState(false);
 
  // COURSE LANGUGAES
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");
  const [filterLanguage, setFilterLanguage] = useState([]);
  const currentPath = useRef(location.pathname);

    const {
      isModalOpen,
      handleConfirm,
      handleCancel,
      requestUiBlock,
    } = useUnsavedChangesPrompt(isDirty, []);
 

      useEffect(() => {
       
      }, [isDirty])

       const handleConfirmClick = () => {
          //dispatch(emptyOpCreate());
          handleConfirm();
        }

  useEffect(() => {   
    GetAllLangApi().then((res) => {
      const data = res.data;
      setFilterLanguage(
        data?.map((item) => ({
          value: item.name,
          label: item.name,
        }))
      );
    });
  }, []);
 
  // Bind the value if it exists.
  useMemo(() => {
    if (sCourse && mode !=='create') {    
      setSelectedCourse({...sCourse,courseName:((mode ==='clone'? "Copy of ":"")+sCourse.courseName)});   

      setCourseStatingDate(
        timestampToYYYYMMDD(Number(sCourse.courseStartingDate))
      );

      //set languages
      let languages = sCourse?.courseLanguage?.split(",")?.map((lan) => {
        return { label: lan, value: lan };
      });
      setSelectedLanguages(languages);
      //set locations
      setSelectedLocations(sCourse?.location);
      
       setOnline(sCourse.location?.includes("Online"));
      //setSkills
      setPrerequisiteSkills(sCourse?.preRequisiteSkillsList);
    
      setCourseTopics(sCourse?.attainableSkillsList);
      setCurrencyInput(sCourse?.currency);
    }else{
       if (externalLinks && externalLinks.length === 0)
              dispatch(GetAllExternalLinksApi());
      if (categories && categories.length === 0) dispatch(getAllCategoryApi());
      
      dispatch(setCreateCoursePrequestSkills([]));
      dispatch(setCreateCourseAptainquestSkills([]));
    }


  }, [sCourse, status, selectedLanguage]);

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

   //handle prerequisite value change
  const handlePrerequisiteValueChange = (e, index, key) => {
    setPrerequisiteSkills((prevSkills) => {
      let updatedSkills = [...prevSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [key]:
          key === "exclude" || key === "isMandatory"
            ? e.target.checked
              ? "Yes"
              : "No"
            : e.target.value,
      };
      return updatedSkills;
    });
  };

  //handle prerequisite skill delete
  const handlePrerequisiteSkillDelete = async (index, id) => {
    if (id) {
   
      setIsDeletingPrerequisiteSkills(true);
      try {
        await DeleteApi("UserCourse Prerequisite", id);
        let skills = prerequisiteSkills?.filter((skill, i) => {
          return i !== index;
        });
        setPrerequisiteSkills(skills);
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
        
      } finally {
        setIsDeletingPrerequisiteSkills(false);
      }
      return;
    } else {
      let skills = prerequisiteSkills?.filter((skill, i) => {
        return i !== index;
      });
      setPrerequisiteSkills(skills);
    }
  };

  // auto suggestion for skill
  const handlePrerequsiteChangeSkill = async (e) => {
    const val = e.target.value;
    setSkill({ ...skill, skillId: e.target.value });

    // if value greater than 2 then query the database and get the suggestions
    if (val?.length > 2) {
      setSkillSuggestions([]);
      SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
       
        // check res data length if empty pass No suggestions found
        if (res.data?.length === 0) {
          setSkillSuggestions([{ noSkills: "No suggestions found" }]);
        } else {
          setSkillSuggestions(res.data);
        }
      });
    } else {
      setSkillSuggestions([]);
    }
  };

  //To select data from autosuggestion
  const handlePrerequsiteSuggestionClick = (value) => {
    
    if (prerequisiteSkills?.length > 0) {
      setPrerequisiteSkills([
        ...prerequisiteSkills,
        {
          skillId: value.skill,
          isMandatory: "No",
          mlanguage: getCookie("HLang"),
          userId:getCookie("userId"),
          userCourseId: id,
          occupationsRelated:value.occupationsRelated
        },
      ]);
    } else {
      setPrerequisiteSkills([
        {
          skillId: value.skill,
          isMandatory: "No",
          mlanguage: getCookie("HLang"),
          userId:getCookie("userId"),
          userCourseId: id,
          occupationsRelated:value.occupationsRelated
        },
      ]);
    }

    setSkill({
      skillId: "",
      isMandatory: "No",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      userCourseId: id,
      occupationsRelated:[]
    });

    setSkillSuggestions([]);
  };

  /////////////////////////////////////////////////////////////////////////skills attainable/////////////////////////////////////////////////
  //handle add topic
  const handleAddTopic = (e) => {
    e.preventDefault();

    if (SkillSuggestions[0].noSkills) {
      showErrorToast(
        contentLabel("NoSuggestionsFound", "nf No suggestions found")
      );
      return;
    }
    if (!SkillSuggestions[0].selected) {
      showErrorToast(
        contentLabel("PleaseSelectSkills", "nf Please Select Skills")
      );
      return;
    }
    // if (topics.skillId === "" && topics.duration === "") {
    //   showErrorToast(
    //     contentLabel(
    //       "PleaseFillAllRequiredFields",
    //       "nf Please fill all required fields"
    //     )
    //   );
    //   return;
    // }
    if (topics.skillId === "") {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    // if (topics.duration === "") {
    //   showErrorToast(
    //     contentLabel(
    //       "PleaseFillAllRequiredFields",
    //       "nf Please fill all required fields"
    //     )
    //   );
    //   return;
    // }

    setCourseTopics([...(courseTopics || [] ), { ...topics, userCourseId: id }]);
    setTopics({
      skillId: "",
      duration: "",
      durationPhase: "",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      userCourseId: id,
      occupationsRelated:""
    });
  };

  const handleSkillAttainableChangeSkill = (e) => {
    const val = e.target.value;
    setTopics({ ...topics, skillId: e.target.value?.split('||')[0] || '' });

    // if value greater than 2 then query the database and get the suggestions
    if (val?.length > 2) {
      setSkillSuggestions([]);
      SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
    
        // check res data length if empty pass No suggestions found
        if (res.data?.length === 0) {
          setSkillSuggestions([{ noSkills: "No suggestions found" }]);
        } else {
          setSkillSuggestions(res.data);
        }
      });
    } else {
      setSkillSuggestions([]);
    }
  };

  //To select data from autosuggestion
  const handleSkillsAttainableSuggestionClick = (value) => {
   

    setTopics({
      skillId: value.skill,
      duration: "",
      durationPhase: "",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      occupationsRelated:value.occupationsRelated
    });

    setSkillSuggestions([{ selected: true }]);
  };

  //handle topic value Change
  const handleCourseTopicValueChange = (e, index, key) => {
    setCourseTopics((prevTopics) => {
      let updatedTopics = [...prevTopics];
      updatedTopics[index] = { ...updatedTopics[index], [key]: e.target.value };
      return updatedTopics;
    });
  };

  //handle topic delete
  const handleCourseTopicDelete = async (index, id) => {
    if (id) {
  
      setIsDeletingCourseTopics(true);
      try {
        await DeleteApi("UserCourse SkillsAttainable", id);
        let topics = courseTopics.filter((topic, i) => {
          return i !== index;
        });
        setCourseTopics(topics);
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
       
      } finally {
        setIsDeletingCourseTopics(false);
      }
      return;
    } else {
      let topics = courseTopics.filter((topic, i) => {
        return i !== index;
      });
      setCourseTopics(topics);
    }
  };

  //handle topic delete
  const handleCourseSPreskillDelete = async (index, id) => {
    if (id) {
     
      setIsDeletingCourseTopics(true);
      try {
        await DeleteApi("UserCourse SkillsAttainable", id);
        let topics = courseTopics?.filter((topic, i) => {
          return i !== index;
        });
        setCourseTopics(topics);
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
        
      } finally {
        setIsDeletingCourseTopics(false);
      }
      return;
    } else {
      let topics = courseTopics?.filter((topic, i) => {
        return i !== index;
      });
      setCourseTopics(topics);
    }
  };

  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  function convertTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

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

  //POST API ERRORS
  const [errors, setErrors] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCourse?.courseName)
      newErrors.courseName = "Course Name is required.";    
    if (selectedCourse?.courseDescription?.length > 1000)
      newErrors.courseDescription = "Course Description length exceeded.";
    if (selectedCourse?.skillerBio?.length > 1000)
      newErrors.skillerBio = "Skiller Bio length exceeded.";
    
    setErrors(newErrors);    
    return Object.keys(newErrors)?.length === 0;
  };

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

  const handleExceptionForMaster = async (responseDatas, masterSkills, selectedLanguage) => {
      const userId = getCookie("userId")

      if (!masterSkills || masterSkills.length === 0 || !responseDatas || responseDatas.length === 0) return;
      const updatedArrayForException = masterSkills.map(item => {
          const match = responseDatas.find(skill => skill.skillOccupationId === item.id);
  
          return {
              mlanguage: selectedLanguage,
              masterTable: "skill",
              masterTableRecordID: item.id,
              module: "skill",
              userId: userId,
              candidateId: userId,
              content: item.skill,
              isUserPosted: !!match,
              ...(match && { relatedId: match.id }),
          };
      });
  
  
      
  
      // Loop and call APIs
      for (const record of updatedArrayForException) {
          try {
              const existing = await getSkillExceptionRecord(record.masterTableRecordID);
  
  
              if (existing?.data?.length > 0) {
                  // Record exists, call edit API
                  const currentRelatedIds = existing?.data[0]?.relatedIds || [];
  
                  // If already exists, no need to update
                  if (!currentRelatedIds.includes(record.relatedId)) {
                      const updatedRelatedIds = [...currentRelatedIds, record.relatedId].join("||");
  
                      const updatedBody = {
                          relatedIds: updatedRelatedIds,
                      };
  
                      await EditApi("Exceptions", existing?.data[0]?.id, updatedBody);
                  }
  
              } else {
                  // Record doesn't exist, call post API
                  await exceptionPOSTapi("Exceptions", { ...record, relatedIds: (record.relatedId || ""), });
              }
          } catch (error) {
              console.error(`Error processing record ${record.masterTableRecordID}:`, error);
          }
      }
  
  }

  const handleSaveCourse = async (submitType) => {
    setisActivePreskill(false);
    
    //check course details validation
    if (!validateForm()) {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
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

    setCourseLoading(true);
  try {
      let course =null;
        let courseId =id;
 
        if(mode ==='clone' || mode ==='create'){
           course = await createNewCourse("User Courses", {
              attachmentUrls: "Normal",
              userId:getCookie("userId"),
              courseName: selectedCourse.courseName,          
              userCategory:selectedCourse?.userCategory,
              userSubCategory: selectedCourse?.userSubCategory,
              openings:selectedCourse?.openings,
              externalSite:selectedCourse?.externalSite,                      
              extSiteId: selectedCourse?.extSiteId,
              userCourseType:selectedCourse?.userCourseType,
              dateCreated: formatDate(),
              courseDescription: selectedCourse.courseDescription,
              mlanguage: selectedLanguage,
              courseLanguage: selectedLanguages?.map((lan) => lan.value).join(", "),
              courseStatus: submitType,
              continent: "Asia",
              region: "South Asia",
              country: "India",
              location: selectedLocations,
              price: selectedCourse?.price?.toString(),
              currency: currencyInput,
              attachmentFileNames:
              courseAttachment?.length > 0 ? JSON?.stringify(courseAttachment) : "",
              courseStartingDate: FormatDateIntoPost(courseStartingDate),
              durationNumber: selectedCourse.durationNumber,
              durationPhase: selectedCourse.durationPhase,
              skillerName: selectedCourse?.skillerName,
              skillerBio: selectedCourse?.skillerBio,     
              prerequisiteSkills: "NA",
              skillsAttainable: "NA",
            });          
          courseId=course.data.id;
        }
  else
        {

      
         course = await EditApi("User Courses", id, {
            courseStatus: submitType,
            courseName: selectedCourse.courseName,
            userCategory:selectedCourse?.userCategory,
            userSubCategory: selectedCourse?.userSubCategory,
            openings:selectedCourse?.openings,
            externalSite:selectedCourse?.externalSite,                      
            extSiteId: selectedCourse?.extSiteId,
            userCourseType:selectedCourse?.userCourseType,
            courseDescription: selectedCourse.courseDescription,
            location: selectedLocations,
            courseLanguage: selectedLanguages?.map((lan) => lan.value)?.join(", "),
            courseStartingDate: FormatDateIntoPost(courseStartingDate),
            durationNumber: selectedCourse.durationNumber,
            durationPhase: selectedCourse.durationPhase,
            price: selectedCourse?.price?.toString(),
            status: selectedCourse.status,
            currency: currencyInput,
            skillerName: selectedCourse?.skillerName,
            skillerBio: selectedCourse?.skillerBio,
            attachmentFileNames:
            courseAttachment?.length > 0 ? JSON.stringify(courseAttachment) : "",
      });
        }

  const filteredPrerequisiteSkills = (mode === 'edit'
    ? prerequisiteSkills?.map(topic => ({
      ...topic,
      userCourseId: topic.userCourseId ?? courseId,
    }))
    : prerequisiteSkills?.map(({ id, ...rest }) => ({
        ...rest,
        userCourseId: courseId,
      })));

  const filteredCourseTopics =  (mode === 'edit'
    ? courseTopics?.map(topic => ({
      ...topic,
      userCourseId: topic.userCourseId ?? courseId,}))
    : courseTopics?.map(({ id, ...rest }) => ({
        ...rest,
        userCourseId: courseId,
      })));

 
  if (filteredPrerequisiteSkills?.length > 0) {
        let prerequsite = await axios.put(
          `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${sessionDecrypt(
            getCookie("token")
          )}`,
          filteredPrerequisiteSkills,
          { headers }
        );
        
      }

  if (filteredCourseTopics?.length > 0) {
        let skillsAttainables = await axios.put(
          `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
          filteredCourseTopics,
          { headers }
        );
        
      }

      // Posting questions
  const constNewQuestions = mode ==='edit'|| mode ==='create' ?  questions?.filter(
        (question) => !question?.id?.includes("CQSTN")
      ) : questions;

  const postQuestions = constNewQuestions?.map(async (question, index) => {
        
        const optionValues = question?.options?.map((option) => option?.value);

        try {
          const questionRes = await PostApi("CQuestions", {
            cid: courseId,
            cqOrder: index + 1,
            cqValues: JSON.stringify(optionValues),
            cqType: question.answer.value,
            cqLabel: question.question,
            cqRequired: question.required ? "Yes" : "No",
          });

          dispatch(setCourseQuestions([]));
          console.log(
            "Successfully posted to JQuestions table",
            questionRes.data
          );
        } catch (questionErr) {
          console.error("Error posting to JQuestions table", questionErr);
          throw questionErr;
        }
      });

  await Promise.all(postQuestions);

  if(mode==='edit'){
      // Delete elements (Pre,Att,Que)
    const deletePreElements = [
    ...(sCourse?.preRequisiteSkillsList ?? []).filter(
      (obj1) =>
        !filteredPrerequisiteSkills?.some(
          (obj2) => obj1?.skillId === obj2?.skillId
        )
    ),
    ];

      const deleteAttElements = [
        ...(sCourse?.attainableSkillsList?? []).filter(
          (obj1) =>
            !filteredCourseTopics?.some(
              (obj2) => obj1?.skillId === obj2?.skillId
            )
        ),
      ];

      const deleteQueElements = [
        ...(sCourse?.courseQuestions?? []).filter(
          (obj1) => !questions?.some((obj2) => obj1?.id === obj2?.id)
        ),
      ];

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

      dispatch(fetchUserCourses());
      dispatch(setCreateCoursePrequestSkills([]));
      dispatch(setCreateCourseAptainquestSkills([]));

      setCourseLoading(false);
      setSteps({
        step1: false,
        step2: false,
        step3: false,
        step4: false,
        step5: false
      });
      
      showSuccessToast(contentLabel("CourseAddedSuccessfully", "nf Course Added Successfully"));

      navigate(`/skilling-agency/my-courses`);
    } catch (error) {
      console.log(error);
      showErrorToast(
        contentLabel("SomethingWentWrong", "nf Something Went Wrong")
      );
      setCourseLoading(false);
    }
  };

  const isLoading = false;
  const navBarBgColor = "var(--primary-color)";

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



  const [linkImage, setLinkImage] = useState([]);
  const [openGallery, setOpenGallery] = useState(false);
  /* HANDLE GALLERY CLOSE */
  const handleGalleryClose = useCallback(() => {
    setOpenGallery(false);
  }, []);

  /* HANDLE GALLERY OPEN */
  const handleGalleryOpen = useCallback(() => {
    setOpenGallery(true);
  }, []);

  /* HANDLE SELECT IMAGE */
  const handleSelectImage = useCallback((image) => {
    
    setLinkImage([{ ...image }]);
    const imageUrl = GetAttachment(
      image?.userId,
      image?.fileName,
      image?.fileId
    );
    setSelectedImage(imageUrl);
  }, []);

  const [linkAttachment, setLinkAttachment] = useState([]);
  const [openFile, setOpenFile] = useState(false);
  /* HANDLE FILE CLOSE */
  const handleFileClose = useCallback(() => {
    setOpenFile(false);
  }, []);

  /* HANDLE FILE OPEN */
  const handleFileOpen = useCallback(() => {
    setOpenFile(true);
  }, []);
  /* HANDLE SELECT FILE */
  const handleSelectFile = useCallback((file) => {
    setLinkAttachment([{ ...file }]);
  }, []);

  // Image Uplaod
  useEffect(() => {
    if (selectedCourse?.attachmentFileNames) {
      const attachments = JSON.parse(selectedCourse?.attachmentFileNames);
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
  }, [selectedCourse]);

  if (isCourseLoading) {
    return <Loader />;
  }

  if (!selectedCourse) {
    return <></>;
  }
  if (!id && mode!=='create') {
    return (
      <>
        <h4>
          {contentLabel(
            "SelectACourseToViewData",
            "nf Select a course to view data"
          )}{" "}
        </h4>
      </>
    );
  }

  // COURSE INFORMATION FORM 
  return (
    <div>
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


      <Gallery
        title={contentLabel("ChooseCourseImage", "nf Choose Course Image")}
        openGallery={openGallery}
        handleGalleryClose={handleGalleryClose}
        handleSelectImage={handleSelectImage}
      />

      <Files
        title={contentLabel("ChooseCourseFile", "nf Choose Course File")}
        openFile={openFile}
        handleFileClose={handleFileClose}
        handleSelectFile={handleSelectFile}
      />

      <div class="card p-4">
        {/* <CreateStepper
          steps={steperSteps}
          activeSteps={steps}
          setActiveSteps={setSteps}
          setisActivePreskill={setisActivePreskill}
        /> */}
      </div>

      <div class="card p-4">
        {!steps.step1 && (
          <Row>
          <Col xl={6} className="mb-3">
                        <label className="form-label fw-bold">
                          {contentLabel(
                            "DoYouWantToListJdOnExternal",
                            "nf Do you want to list Jd on External sites?"
                          )}  
                        </label>
          
                        <Col className="d-flex gap-4 align-content-center">
                          {/* Yes == internal */}
                          <div className="d-flex gap-2 align-content-center">
                            <input
                              type="radio"
                              id="Internal"
                              name="fav_language"
                              value="Internal"
                              checked={selectedCourse?.userCourseType === "Internal"}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourse({
                                    ...selectedCourse,
                                    userCourseType: "Internal",
                                  });
                                }
                              }}
                              />
                            <label
                              className="form-label mb-0"
                              style={{ fontWeight: "500" }}
                              for="Internal"
                            >
                              {contentLabel("Yes", "nf Yes")}
                            </label>
                          </div>
          
                          {/* No == internal */}
                          <div className="d-flex gap-2 align-content-center">
                            <input
                              type="radio"
                              id="External"
                              name="fav_language"
                              value="External"
                              checked={selectedCourse?.userCourseType === "External"}
                               onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourse({
                                    ...selectedCourse,
                                    userCourseType: "External",
                                  });
                                }
                              }}
                            />
                            <label
                              className="form-label mb-0"
                              style={{ fontWeight: "500" }}
                              for="External"
                            >
                              {contentLabel("No", "nf No")}
                            </label>
                          </div>
                        </Col>
                      </Col>
          
            <Col xl={6} lg={6}>
              <div class="mb-2">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label fw-bold "
                >
                  {contentLabel("CourseName", "nf Course Name")}
                  <span className="text-danger"> *</span>
                </label>
                <input
                  type="text"
                  class="form-control "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("CourseName", "nf Course Name")}`}
                  value={selectedCourse.courseName}
                  onChange={(e) =>{
                    setSelectedCourse({
                      ...selectedCourse,
                      courseName: e.target.value,
                    })
                    setisDirty(true);
                  }
                  }
                />
              </div>
            </Col>
             <Col xl={6} className="mb-3">
                            <label className="form-label fw-bold">
                              {/* {contentLabel("ExternalSite", "nf External Site")}{" "} */}
                              {contentLabel("Website", "nf Website")}
                             
                               
                          
                            </label>
                            <select
                              className="form-select"
                              aria-label="Select..."
                             onChange={(e) => {
                    const selectedOption =
                      e.target.options[e.target.selectedIndex];
                    const selectedId = selectedOption.getAttribute("data-id");                   
                    setSelectedCourse({
                      ...selectedCourse,
                      extSiteId: selectedId,
                      externalSite: e.target.value,
                    })

                    // console.log(selectedId);  // Logs the id of the selected option
                  }}
                                                            style={{
                                border: "2px solid var(--primary-color)",
                              }}
                               value={selectedCourse.externalSite || ""}
                            >
                              <option value="" disabled>
                                {contentLabel("PleaseSelectSite", "nf Please Select Site")}{" "}
                              </option>
                               {Array.isArray(externalLinks) &&
                    externalLinks.map(
                      (Options, i) =>
                        Options.extSiteName && (
                          <option
                            key={i}
                            value={Options.extSiteName}
                            data-id={Options.id}
                          >
                            {Options.extSiteLabel}
                          </option>
                        )
                    )}
                            </select>
               </Col>
               <Col xl={6} className="mb-3">
                             <label className="form-label fw-bold">
                               {contentLabel("Category", "nf Category")}{" "}                             
                                                       
                             </label>
                             <select
                               className="form-select"
                               aria-label="Select Category"
                               
                              onChange={(e) => {
                          const selectedOption = e.target.options[e.target.selectedIndex];
                          const selectedId = selectedOption.getAttribute("data-id");

                            setSelectedCourse({
                                ...selectedCourse,
                                userCategory:e.target.value,
                                userSubCategory:selectedId,
                              })

                }}
                                 value={selectedCourse.userCategory || ""}
                               style={{
                                 border:
                                   "2px solid var(--primary-color)",
                               }}
                             >
                               <option value="" disabled>
                                 {contentLabel(
                                   "PleaseSelectCategory",
                                   "nf Please select a Category"
                                 )}
                               </option>
                                  {Array.isArray(categories) &&
                                  categories.map((Options, i) => {
                                    const isValidExternalSite =
                                      typeof selectedCourse.externalSite !== "string" ||
                                      selectedCourse.externalSite.trim().length === 0 ||
                                      selectedCourse.externalSite === Options.extSiteLabel;
                                    return (
                                      Options.categoryName &&
                                      isValidExternalSite && (
                                        <option
                                          key={i}
                                          value={Options.categoryName}
                                          data-id={Options.id}
                                        >
                                          {Options.categoryName}
                                        </option>
                                      )
                                    );
                      })}
                             </select>
                           </Col>
            <Col xl={12} lg={12}>
              <div class="mb-2">
                <label
                  for="exampleFormControlTextarea1 "
                  class="form-label text-label fw-bold"
                >
                  {contentLabel("Description", "nf Description")}
                 
                </label>
                <BriefDescriptionTextArea
                  class="form-control"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("Description", "nf Description")}`}
                  value={selectedCourse.courseDescription}
                  onChange={(e) =>
                    setSelectedCourse({
                      ...selectedCourse,
                      courseDescription: e.target.value,
                    })
                  }
                ></BriefDescriptionTextArea>
              </div>
            </Col>
            <Col xl={12} lg={12} className="mb-2">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label fw-bold "
              >
                {(
                  content[selectedLanguage].find(
                    (item) => item.elementLabel === "SkillerName"
                  ) || {}
                ).mvalue || "nf SkillerName"}
              </label>
              <input
                type="text"
                class="form-control "
                id="exampleFormControlInput1"
                placeholder={`${contentLabel(
                  "Enter",
                  "nf Enter"
                )} ${contentLabel("SkillerName", "nf Skiller Name")}`}
                value={selectedCourse?.skillerName}
                onChange={(e) =>
                  setSelectedCourse({
                    ...selectedCourse,
                    skillerName: e.target.value,
                  })
                }
              />
            </Col>
            <Col xl={12} lg={12} className="mb-2">
              <label
                for="exampleFormControlTextarea1 "
                class="form-label text-label fw-bold"
              >
                {" "}
                {(
                  content[selectedLanguage].find(
                    (item) => item.elementLabel === "SkillerBio"
                  ) || {}
                ).mvalue || "nf Skiller Bio"}
              </label>
              <BriefDescriptionTextArea
                class="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder={`${contentLabel(
                  "Enter",
                  "nf Enter"
                )} ${contentLabel("SkillerBio", "nf Skiller Bio")}`}
                value={selectedCourse?.skillerBio}
                onChange={(e) =>
                  setSelectedCourse({
                    ...selectedCourse,
                    skillerBio: e.target.value,
                  })
                }
              ></BriefDescriptionTextArea>
            </Col>
            <Col xl={4} lg={6} className="mb-2">
              <div class="mb-3">
                <label for="formFile form-label text-label " class="form-label fw-bold">
                  {(
                    content[selectedLanguage].find(
                      (item) => item.elementLabel === "CourseImage"
                    ) || {}
                  ).mvalue || "nf Course Image"}
                </label>
                <div className="relative" style={{ position: "relative" }}>
                  <div onClick={handleGalleryOpen}>
                    <input
                      class="form-control"
                      type="text"
                      id="formFile"
                      placeholder={contentLabel(
                        "NoImageSelected",
                        "nf No image selected"
                      )}
                      style={{ pointerEvents: "none" }}
                      value={linkImage[0]?.fileName || ""}
                    />
                  </div>
                  <div
                    style={{
                      color: "gray",
                      top: "9px",
                      right: "10px",
                      position: "absolute",
                      cursor: "pointer",
                    }}
                  >
                    <icons.FaTimes
                      onClick={() => {
                        
                        setLinkImage([]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
            <Col xl={4} lg={6} className="mb-2">
              <div class="mb-3">
                <label for="formFile form-label text-label " class="form-label fw-bold">
                  {(
                    content[selectedLanguage].find(
                      (item) => item.elementLabel === "CoursePdf"
                    ) || {}
                  ).mvalue || "nf Course Pdf"}
                </label>
                <div className="relative" style={{ position: "relative" }}>
                  <div onClick={handleFileOpen}>
                    <input
                      class="form-control"
                      type="text"
                      id="formFile"
                      placeholder={contentLabel(
                        "NoFileSelected",
                        "nf No file selected"
                      )}
                      style={{ pointerEvents: "none" }}
                      value={linkAttachment[0]?.fileName || ""}
                    />
                  </div>
                  <div
                    style={{
                      color: "gray",
                      top: "9px",
                      right: "10px",
                      position: "absolute",
                      cursor: "pointer",
                    }}
                  >
                    <icons.FaTimes
                      onClick={() => {
                        
                        setLinkAttachment([]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>            
            <Col xl={4} lg={6}>
              <div className="mb-4">
                <label for="location" class="form-label text-label fw-bold">
                  {contentLabel("Languages", "nf Languages")}
                </label>

                <div style={{}}>
                  <CreatableSelect
                    isMulti
                     onKeyDown={(e) => {
                                    if (LIMITED_SPL_CHARS.includes(e.key)) {
                                      e.preventDefault();
                                      showErrorToast(
                                        contentLabel(
                                          "SpecialCharNotAllowed",
                                          "nf Special Characters Not Allowed"
                                        )
                                      );
                                    }
                                  }}
                    placeholder={"Add Location and Press Enter"}
                    options={filterLanguage}
                    components={components}
                    inputValue={languageInput}
                    onInputChange={(newValue) => setLanguageInput(newValue)}
                    isClearable
                    isValidNewOption={() => false}
                    onChange={(newValue) => {
                      
                      setSelectedLanguages(newValue);
                    }}
                    value={selectedLanguages}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: "#f5f5f5",
                        primary: "var(--primary-color)",
                        primary50: "#f5f5f5",
                      },
                    })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        width: "100%",
                        border:
                          state.isFocused || state.isActive
                            ? "1px solid var(--primary-color)"
                            : "1px solid #ced4da", // Customize bottom border style
                        boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
                        ":hover": {
                          // border: error.language ? '2px solid #d9534f' : ''
                        },
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        padding: "0.325rem 0.75rem",
                        borderRadius: "var(--bs-border-radius)",
                      }),
                    }}
                  />
                </div>
              </div>
            </Col>
            <Col xl={4} lg={6}>
              <div className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label m-0 p-0 fw-bold"
                >
                  {contentLabel("CourseStartDate", "nf Course Start Date")}
                </label>
                <input
                  type="date"
                  class="form-control "
                  id="exampleFormControlInput1"
                  defaultValue={convertTimestampToDate(
                    Number(selectedCourse.courseStartingDate)
                  )}
                  onChange={(e) => setCourseStatingDate(e.target.value)}
                />
              </div>
            </Col>
            <Col xl={4} lg={6}>
              <div className="mb-4">
             
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label m-0 p-0 fw-bold"
                >
                  {contentLabel("CoursePrice", "nf Course Price")}
                </label>
                 <div className="d-flex gap-3">
                <input
                  type="number"
                  class="form-control  "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel( "Enter","nf Enter" )} ${contentLabel("CoursePrice", "nf Course Price")}`}
                  value={selectedCourse.price}
                  onChange={(e) =>
                    setSelectedCourse({
                      ...selectedCourse,
                      price: e.target.value,
                    })
                  }
                />
                 <CreatableSelect isClearable
                                     onKeyDown={(e) => {
                                                    if (LIMITED_SPL_CHARS.includes(e.key)) {
                                                      e.preventDefault();
                                                      showErrorToast(
                                                        contentLabel(
                                                          "SpecialCharNotAllowed",
                                                          "nf Special Characters Not Allowed"
                                                        )
                                                      );
                                                    }
                                                  }}
                                    options={[
                                      { value: "INR", label: "INR" },
                                      { value: "USD", label: "USD" },
                                    ]}
                                    placeholder={"Currency"}
                                    isValidNewOption={() => false}
                                    onChange={(newValue) => {
                                      
                                      if (newValue) {
                                        setCurrencyInput(newValue.value);
                                      } else {
                                        setCurrencyInput("");
                                      }
                                    }}
                                    value={{ label: currencyInput, value: currencyInput }}
                                    theme={(theme) => ({
                                      ...theme,
                                      colors: {
                                        ...theme.colors,
                                        primary25: "#f5f5f5",
                                        primary: "var(--primary-color)",
                                        primary50: "#f5f5f5",
                                      },
                                    })}
                                    styles={{
                                      control: (provided, state) => ({
                                        ...provided,
                                        width: "12rem",
                                        border:
                                          state.isFocused || state.isActive
                                            ? "1px solid var(--primary-color)"
                                            : "1px solid #ced4da", // Customize bottom border style
                                        boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
                                        ":hover": {
                                          border: error ? "2px solid #d9534f" : "",
                                        },
                                      }),
                                      valueContainer: (provided) => ({
                                        ...provided,
                                        padding: "0.325rem 0.75rem",
                                        borderRadius: "var(--bs-border-radius)",
                                      }),
                                    }}
                                  />
              </div>
              </div>
            </Col>
            <Col xl={4} lg={6}>
              <div class="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label m-0 p-0 fw-bold"
                >
                  {contentLabel("CourseDuration", "nf Course Duration")}
                </label>
                <div class="input-group ">
                  <input
                    type="number"
                    class="form-control"
                    id="exampleFormControlInput1"
                    value={selectedCourse.durationNumber}
                    onChange={(e) =>
                      setSelectedCourse({
                        ...selectedCourse,
                        durationNumber: e.target.value,
                      })
                    }
                  />
                  <select
                    class="form-select form-select-md"
                    aria-label=".form-select-lg example"
                    value={selectedCourse.durationPhase}
                    onChange={(e) =>
                      setSelectedCourse({
                        ...selectedCourse,
                        durationPhase: e.target.value,
                      })
                    }
                  >
                    <option value="Hours">
                      {" "}
                      {(
                        content[selectedLanguage].find(
                          (item) => item.elementLabel === "Hours"
                        ) || {}
                      ).mvalue || "nf Hours"}
                    </option>
                    <option value="Days">
                      {(
                        content[selectedLanguage].find(
                          (item) => item.elementLabel === "Days"
                        ) || {}
                      ).mvalue || "nf Days"}
                    </option>
                    <option value="Weeks">
                      {(
                        content[selectedLanguage].find(
                          (item) => item.elementLabel === "Weeks"
                        ) || {}
                      ).mvalue || "nf Weeks"}
                    </option>
                    <option value="Months" selected>
                      {(
                        content[selectedLanguage].find(
                          (item) => item.elementLabel === "Months"
                        ) || {}
                      ).mvalue || "nf Months"}
                    </option>
                    <option value="Years">
                      {(
                        content[selectedLanguage].find(
                          (item) => item.elementLabel === "Years"
                        ) || {}
                      ).mvalue || "nf Years"}
                    </option>
                  </select>
                </div>
              </div>
            </Col>
            <Col xl={6} lg={6}>
              <div className="mb-4">
                <div
                  className="d-flex justify-content-between "
                  style={{ position: "relative" }}
                >
                  <label
                    htmlFor="locationInput"
                    className="form-label text-label fw-bold"
                  >
                    {contentLabel("Location", "nf Location")}
                  </label>
                  <div className="d-flex align-items-center justify-align-content">
                    <input
                      id="onlineCheckbox"
                      className="ms-2"
                      type="checkbox"
                      name="online"
                      checked={selectedLocations?.includes("Online")}
                      onChange={(e) => {
                        setOnline(!online);
                      }}
                    />
                    <label htmlFor="onlineCheckbox" className="ms-1 fw-bold">
                      {contentLabel("Online", "nf Online")}
                    </label>
                  </div>
                </div>
                <MultiSelect
                  viewLocation={selectedLocations}
                  setLocationData={setSelectedLocations}
                  onlineStatus={online}
                />
              </div>
            </Col>
              <Col xl={4} lg={6}>
              <div className="mb-4">
             
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label m-0 p-0 fw-bold"
                >
                  {contentLabel("NumberOfOpenings", "nf Number Of Openings")}
                </label>
                 <div className="d-flex gap-3">
                <input
                  type="number"
                  class="form-control  "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel( "Enter","nf Number Of Openings" )} ${contentLabel("NumberOfOpenings", "nf Number Of Openings")}`}
                  value={selectedCourse.Openings}
                  onChange={(e) =>
                    setSelectedCourse({
                      ...selectedCourse,
                      Openings: e.target.value,
                    })
                  }
                  
                />
                </div>
            </div></Col>
            
            <Col xl={12}>
              <div className=" d-flex justify-content-end">
              <div className="d-flex gap-3">
                 <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      handleSaveCourse("DRAFT");
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
                  class="btn btn-primary"
                  onClick={() => {
                    if (validateForm()) {
                      setSteps((prev) => {
                        return { ...prev, step1: true };
                      });
                      setisActivePreskill(true);
                    } else {
                      showErrorToast(
                        contentLabel(
                          "PleaseFillAllRequiredFields",
                          "nf Please fill all required fields"
                        )
                      );
                    }
                  }}
                >
                  {contentLabel("Next", "nf Next")}{" "}
                 </button>
                </div>
              </div>
            </Col>

             
          </Row>
        )}
{/* Prerequisite Skills UI */}
        {steps.step1 && !steps.step2 && (
          <div>
            <div class="mb-3 w-75" style={{ position: "relative" }}>
            <div>   
            <CouresSkillComponent setIsAddOpen={() => console.log("first")} isOnboarding={false} />
            </div>
            </div>
            <div>
                {prerequisiteSkills?.length !== 0 ? (
                              <>
                                {/* <span className="text-secondary ">
                                  <i>
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "SelectTheCheckbox"
                                      ) || {}
                                    ).mvalue ||
                                      "nf *select the checkbox to make the skill mandatory"}
                                  </i>
                                </span> */}
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
                                      {prerequisiteSkills?.map((skill, index) => {
                                        return (
                                          <tr key={skill?.skillId}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{skill.skillId}</td> 
                                              <td>
                                <div className="d-flex align-items-center">
                                  <label className="d-flex align-items-center">
                                    {contentLabel("From", "nf From")}
                                  </label>
                                  <input
                                    type="Number"
                                    className="form-control ms-2"
                                    min={0}
                                    max={Number(skill?.yoeMax)}
                                    style={{
                                      width: "60px",
                                      height: "30px",
                                    }}
                                    value={skill.yoeMin}
                                    onChange={(e) =>
                                      inputMinChange(
                                        skill.skillId,
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) => {
                                      const value = Number(e.target.value);
                                      if (value > skill.yoeMax) {
                                        inputMaxChange(skill.skillId, skill.yoeMin);
                                      }
                                    }}
                                  />
                                  <label className="ms-2 d-flex align-items-center">
                                    {contentLabel("To", "nf To")}
                                  </label>
                                  <input
                                    type="Number"
                                    className="form-control ms-2"
                                    min={Number(skill.yoeMin)}
                                    style={{
                                      width: "60px",
                                      height: "30px",
                                    }}
                                    value={skill.yoeMax}
                                    onChange={(e) =>
                                      inputMaxChange(
                                        skill.skillId,
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) => {
                                      const value = Number(skill?.yoeMax) || Number(e.target.value);
                                      if (value < skill?.yoeMin) {
                                        inputMaxChange(skill?.skillId, skill?.yoeMin);
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
                                    value={skill.yoePhase}
                                    className="border ps-2 pb-1 ms-2  rounded"
                                    onChange={(e) => {
                                      
                                      inputTimeUnitChange(
                                        skill.skillId,
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
                                                  checked={(String(skill?.isMandatory)?.toLowerCase() === 'true')}
                                                  onChange={(e) =>
                                                    toggleChecked(skill.skillId, e)
                                                  }
                                                />
                                              </td>            
                                              <td
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>{ deleteSkill(skill.skillIdValue);
                                                handlePrerequisiteSkillDelete(index,false)}}>
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
                      handleSaveCourse("DRAFT");
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
        )}
{/* Skills/Topic */}
        {steps.step1 && steps.step2 && !steps.step3 && (
          <div>
           <div class="mb-3 w-75" style={{ position: "relative" }}>
            <div>   
            <CouresSkillComponent setIsAddOpen={() => console.log("first")} isOnboarding={false} />
            </div>
            </div>
            <div style={{ minHeight: "19.5rem" }}>             
                <table className="table table-hover">
                                   <thead>
                                     <tr>
                                       <th scope="col">#</th>
                                       <th scope="col">
                                        {(
                        content[selectedLanguage].find((item) => item.elementLabel === "Skills/Topic" ) || {} ).mvalue || "nf Skills/Topic"}
                                       </th>                                 
             
                                       <th>
                                       {(
                        content[selectedLanguage].find((item) => item.elementLabel === "ProjectDuration") || {}).mvalue || "nf ProjectDuration"}
                                       </th>
                                                    
                                       <th></th>
                                     </tr>
                                   </thead>
                                   <tbody>
                                     {courseTopics?.map((skill, index) => {
                                      
                                       return (
                                         <tr key={skill.skillId}>
                                           <th scope="row">{index + 1}</th>
                                           <td>{skill.skillId}</td> 
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
                                                 value={skill.duration}
                                                 onChange={(e) =>
                                                   inputMaxChange(
                                                     skill.skillId,
                                                     e.target.value
                                                   )
                                                 }
                                                 onBlur={(e) => {
                                                   const value = Number(skill?.duration) || Number(e.target.value);
                                                   if (value < 0) {
                                                     inputMaxChange(skill?.skillId, 0);
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
                                                 value={skill.durationPhase}
                                                 className="border ps-2 pb-1 ms-2  rounded"
                                                 onChange={(e) => {
                                                   //console.log(e.target.id);
                                                   inputTimeUnitChange(
                                                     skill.skillId,
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
             
                                           <td
                                             style={{ cursor: "pointer" }}
                                             onClick={() => {deleteSkill(skill.skillIdValue) 
                                              handleCourseTopicDelete(index, false)}
                                             }
                                           >
                                             <icons.IoClose />
                                           </td>
                                         </tr>
                                       );
                                     })}
                                   </tbody>
                 </table>
            </div>
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
                      handleSaveCourse("DRAFT");
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
        )}

        {steps.step1 && steps.step2 && steps.step3 && !steps.step4 && (
          <CourseQuestions setSteps = {setSteps} handleSaveCourse = {handleSaveCourse}  />
        )}

        {steps.step1 &&
          steps.step2 &&
          steps.step3 &&
          steps.step4 &&
          !steps.step5 && (
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
                        {selectedCourse?.courseName}
                      </h2>

                      <div className="d-md-flex align-items-center mt-3">
                      {courseStartingDate &&  <div className="d-md-flex  align-items-center">
                          <icons.BusinessCenterOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{courseStartingDate}</span>
                        </div>}
                        {selectedLocations && (selectedLocations||'')?.toString().trim()!=""  &&<div className="d-md-flex align-items-center  ms-md-5">
                          <icons.FmdGoodOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{selectedLocations}</span>
                        </div>}
                       {selectedCourse?.durationNumber && (selectedCourse?.durationNumber||'')?.toString().trim()!="" &&  <div className="d-md-flex align-items-center ms-md-5">
                          <icons.AccessTimeOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">
                            {selectedCourse?.durationNumber}&nbsp;
                            {selectedCourse?.durationPhase}
                          </span>
                        </div>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {((selectedCourse?.courseDescription && (selectedCourse?.courseDescription||'')?.toString().trim()!="")) && <section
                className="row"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <article className="col-lg-12  p-4">
                  <div className="mb-4">
                    <h3
                      className="h5 d-flex align-items-center mb-4 fw-bold"
                      style={{ color: navBarBgColor }}
                    >
                      {contentLabel("Description", "nf Description")}
                    </h3>
                    <p className={`${isLoading ? "skeleton-loading" : ""} `}>
                      {selectedCourse?.courseDescription}
                    </p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                  </div>

                  <div className="mb-2 d-flex gap-3">
                    {selectedCourse?.skillerName && selectedCourse?.skillerName?.trim()=="" &&    ( <strong className="fw-bold">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerName"
                        ) || {}
                      ).mvalue || "nf Skiller Name"}
                      :
                    </strong>)}
                    {selectedCourse?.skillerName}
                  </div>

                  <div className="mb-2 ">
                {selectedCourse?.skillerBio && selectedCourse?.skillerBio?.trim()=="" &&    (<span className="fw-bold me-3">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerBio"
                        ) || {}
                      ).mvalue || "nf Skiller Bio"}
                      :
                    </span>)}
                    {selectedCourse?.skillerBio}
                  </div>
                </article>
              </section>} 
 
              {/* Skills Attainable */}
              <section
                className="row   p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
               {((selectedCourse?.skillerName && selectedCourse?.skillerName?.trim()!="") ||(selectedCourse?.skillerName && selectedCourse?.skillerName?.trim()!="")) &&  <div className="col-lg-6 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}
                  >
                    {contentLabel("SkillsAttainable", "nf Skills Attainable")}
                  </h3>
                   <table class="table">
                    <thead>
                      <tr style={{ border: "white" }}>
                        {/* <th className='p-1' scope="col">#</th> */}
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
                      {courseTopics.map((topic, index) => {
                        return (
                          <tr style={{ border: "white" }}>
                            {/* <td className='p-1' scope="col">{index + 1}</td> */}
                            <td className="p-1 w-75" scope="col">
                              {topic.skillId}
                            </td>
                            <td className="p-1  w-25" scope="col">
                              {topic.duration} {topic.durationPhase}
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
                    {selectedLanguages && selectedLanguages.map(lan => lan.value).join(", ").length > 0  && <li className="mb-2 d-flex gap-3">
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
                          {selectedLanguages?.map((lan) => lan.value).join(", ")}
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
                    {(selectedCourse?.price && selectedCourse?.price?.trim()=="") &&  <li className="mb-2 d-flex gap-3">
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
                          {selectedCourse?.price}&nbsp;
                          {selectedCourse?.currencyInput}
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
                                      href={GetAttachment(
                                         getCookie("userId"),
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
                     
                      {courseStartingDate && <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseStartDate"
                            ) || {}
                          ).mvalue || "nf Course Start Date"}
                          :
                        </strong>
                        {courseStartingDate}
                      </li>}
                    </ul>
                  </aside>
                </article>
              </section> 

            {/* PrerequisiteSkills */}          
               {(prerequisiteSkills && prerequisiteSkills?.length  > 0) && <section
                className="row align-items-center  p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}>
                <div className="col-lg-12 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}>
                   {contentLabel("Prerequisite", "nf Prerequisite")}
                  </h3>

                  <div className="d-flex flex-wrap gap-3">
                    {prerequisiteSkills?.map((skill, i) => {
                      return (
                        <div
                          key={i}
                          className={`border border-4 rounded p-2 d-flex align-items-center text-center me-2`}
                          style={{ background: "none", color: "black" }}
                        >
                          {skill.mandatory && (
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
                            {skill?.skillId}
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
  
              {/* Button Save Publish and Back */}
              <div class=" d-flex justify-content-between gap-2 pt-4">
                <button
                  class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step3: false };
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
                      handleSaveCourse("DRAFT");
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
                      handleSaveCourse("PUBLISH");
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
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Publish"
                      ) || {}
                    ).mvalue || "nf Publish"}{" "}
                  </button>
                </div>
              </div>

            </section>
          )}
      </div>
       {/* Save Warning POPUP */}
       <SaveWarning
        isOpen={isModalOpen}
        onConfirm={handleConfirmClick}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateCourseInfo;
