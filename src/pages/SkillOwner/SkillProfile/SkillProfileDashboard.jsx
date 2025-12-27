import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import RightSideBar from "../../../components/RightSideBar";
import ValidationForm from "../../../components/ValidationForm";
import Resume from "../../../components/Resume";
import Footer from "../../../components/Footer";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";

import { useSelector } from "react-redux";
import SkillAppliedSummary from "../../../components/SkillOwner/SkillsApplied/SkillAppliedSummary";
import SkillAppliedDetailed from "../../../components/SkillOwner/SkillsApplied/SkillAppliedDetailed";
import SkillAcquiredSummary from "../../../components/SkillOwner/SkillsAcquired/SkillAcquiredSummary";
import SkillAcquiredDetail from "../../../components/SkillOwner/SkillsAcquired/SkillAcquiredDetail";
import SortableList from "../../../components/SkillOwner/SkillsDragDrop/SortableList";
import { useDispatch } from "react-redux";
import { addNewSkillApplied } from "../../../reducer/skillProfile/SkillsAppliedSlice";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import ProjectForm from "../../../components/SkillOwner/Forms/ProjectForm";
import PremiumServicesOptions from "./../../../components/PremiumServicesOptions";
import { showWarningToast } from "../../../components/ToastNotification/showWarningToast";
import { fetchDataSkillsApplied } from "../../../api/fetchAllData/fetchDataSkillsApplied";
import { fetchDataSkillsAcquired } from "../../../api/fetchAllData/fetchDataSkillsAcquired";
import {
  addNewTopSkill,
  replaceTopSkillById,
} from "../../../reducer/mySkills/TopSkillSlice";
import PostApi from "../../../api/PostData/PostApi";
import {
  editAcquiredExp,
  editYoe,
  innitialSkillSelect,
  resetMySkill,
  setMySkill,
} from "../../../reducer/mySkills/SkillSelectedSlice";
import { FetchProjectHistory } from "../../../api/fetchAllData/FetchProjectHistory";
import { FetchOrganizationHistory } from "../../../api/fetchAllData/fetchOrganization";
import TrainingHistory from "../../../components/SkillOwner/Forms/TrainingForm";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import {
  addNewSkillAcquired,
  editSkillAcquired,
} from "../../../reducer/skillProfile/SkillsAcquiredSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import EditApi from "../../../api/editData/EditApi";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { DayDifferenceToDynamicView } from "../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import CertificationForm from "../../../components/SkillOwner/Forms/CertificationForm";
import EducationForm from "../../../components/SkillOwner/Forms/EducationForm";
import { debouncedSendRequest } from "../../../components/DebounceHelperFunction/debouncedSendRequest";
import { ThreeDots } from "react-loader-spinner";
import { fetchEducationHistory } from "../../../api/fetchAllData/fetchEducationHistory";
import SkillingForm from "../../../components/SkillOwner/Forms/SkillingForm";
import { fetchSkillingHistory } from "../../../api/fetchAllData/fetchSkillingHistory";
import { fetchCertificationHistory } from "../../../api/fetchAllData/fetchCertificationHistory";
import ConferencesForm from "../../../components/SkillOwner/Forms/ConferencesForm";
import { fetchConferencesHistory } from "../../../api/fetchAllData/fetchConferenceHistory";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import Demo from "./Demo";
import { fetchTrainingHistory } from "../../../api/fetchAllData/fetchTrainingHistory";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import { toTitleCase } from "../../../components/SkillOwner/HelperFunction/toTitleCase";
import { FaTimes } from "react-icons/fa";
import CreateSelectOccupation from "../../../components/SkillOwner/SelectComponent/CreateSelectOccupation";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import FindSkillByOccModal from "../NewUser/components/FindSkillByOccModal";
import ResumeTemplate from "../../template/Resume/ResumeTemplate";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import useContentLabel from "../../../hooks/useContentLabel";
import { getCookie } from '../../../config/cookieService';


// import DemoMulti from '../../../components/SkillOwner/DemoMulti';
const SkillProfileDashboard = () => {
  const scrollRef = useRef(null);
  const skillSuggestionRef = useRef(null);
  const contentLabel = useContentLabel();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        skillSuggestionRef.current &&
        !skillSuggestionRef.current.contains(event.target)
      ) {
        setSkillSuggestions({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [skillSuggestionRef]);

  // dropdown select
  const [selectedValue, setSelectedValue] = useState(0);
  // edit button
  const [editEnable, setEditEnable] = useState(false);
  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [summaryTab2, setsummaryTab2] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);
  const [DetailTab2, setDetailTab2] = useState(false);
  // clear input field
  const [isFocused, setIsFocused] = useState(false);
  // modal validation show hide
  const [Validation, setValidation] = useState(false);

  const [fileupload, setFileupload] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingTranSkillConf, setIsAddingTranSkillConf] = useState(false);

  // for adding skills to the dashboard
  const [SkillSuggestions, setSkillSuggestions] = useState(false);
  const [SkillValue, setSkillValue] = useState("");
  const [skillRecord, setSkillRecord] = useState({});
  const [skillAppliedYoe, setSkillAppliedYoe] = useState("");
  const [skillAcquiredYoe, setSkillAcquiredYoe] = useState("");
  const [suggestionLoader, setSuggestionLoader] = useState(false);
  const [isShowOccupationPopup, setIsShowOccupationPopup] = useState(false);

  /* GET CURRENT DATA FROM CHILD */
  const [childData, setChildData] = useState("");
  const [certChildData, setCertChildData] = useState("");
  const [trainingChildData, setTrainingChildData] = useState("");
  const [confChildData, setConfChildData] = useState("");
  const [skillingChildData, setSkillingChildData] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [isNewOccupation, setIsNewOccupation] = useState(false);
  const [isSavingOccupation, setIsSavingOccupation] = useState(false);
  const [isNewSkill, setIsNewSkill] = useState(false);

  useEffect(() => {}, [
    childData,
    certChildData,
    trainingChildData,
    confChildData,
    skillingChildData,
    selectedOccupation,
  ]);
  const handleChildData = (data) => {
    setChildData(data);
  };
  /* HANDLING TO GET CERT CHILD DATA */
  const handleCertChildData = (data) => {
    setCertChildData(data);
  };
  /* TO GET TRAINING CHILD DATA */
  const handleTrainingChildData = (data) => {
    setTrainingChildData(data);
  };
  /* TO GET CONF CHILD DATA */
  const handleConfChildData = (data) => {
    setConfChildData(data);
  };
  /* TO GET CONF CHILD DATA */
  const handleSkillingChildData = (data) => {
    setSkillingChildData(data);
  };

  // store imports

  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const SkillsApplied = useSelector((state) => state.SkillsApplied);
  const SkillsAcquired = useSelector((state) => state.SkillsAcquired);
  const topSkill = useSelector((state) => state.TopSkill);
  const SkillSelected = useSelector((state) => state.SkillSelected);
  const projectHistory = useSelector((state) => state.projectHistory);
  const skillingsHistory = useSelector((state) => state.skillingsHistory);
  const trainingHistory = useSelector((state) => state.trainingHistory);
  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const employmentHistory = useSelector((state) => state.employmentHistory);

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("skill selected ", SkillSelected);
  }, [SkillSelected]);

  // collect form values skills applied
  const initialState = {
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    organization: "",
    location: "",
    mtype: "",
    showHide: "Yes",
    recordHide: "No",
    validation: "No",
    blockChain: "No",
    mlanguage: selectedLanguage,
    orgIsnew: false,
    projIsnew: false,
    title: "", // skill name
    userSkill: "",
    userSkillsId: "",
    userId:getCookie("userId"),
    projectActivity: "",
    id: "",
    ticketids: [],
  };
  // initial state for skills acquired education
  const education = {
    mtype: "Education",
    source: "",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "true",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    insIsnew: false,
    id: "",
    userId:getCookie("userId"),
    institute: "",
    course: "",
    city: "",
    ticketids: [],
  };
  // initial state for skills acquired certification
  const certification = {
    mtype: "Certification",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "Yes",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    certificationName: "",
    organization: "",
    userId:getCookie("userId"),
    source: "",
    id: "",
    ticketids: [],
  };
  // initial state for skills acquired training, conf, skilling
  const training = {
    mtype: "Training",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "Yes",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    source: "",
    organization: "",
    userId:getCookie("userId"),
    id: "",
    ticketids: [],
  };
  // initial state for skills acquired training, conf, skilling
  const skilling = {
    mtype: "Skilling",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "Yes",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    source: "",
    organization: "",
    userId:getCookie("userId"),
    id: "",
    ticketids: [],
    skillingName: "",
  };

  const conferences = {
    mtype: "Conferences",
    title: "",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "Yes",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    source: "",
    organization: "",
    userId:getCookie("userId"),
    id: "",
    ticketids: [],
  };
  useEffect(() => {
    dispatch(fetchEducationHistory());

    if (skillingsHistory?.status === "idle") {
      dispatch(fetchSkillingHistory());
    }
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }
    if (trainingHistory?.status === "idle") {
      dispatch(fetchTrainingHistory());
    }
    if (conferenceHistory?.status === "idle") {
      dispatch(fetchConferencesHistory());
    }
  }, []);

  const [formValues, setFormValues] = useState(initialState); // project
  const [formvalues2, setFormValues2] = useState(education); //education
  const [formvalues3, setFormValues3] = useState(certification); //certification
  const [formvalues4, setFormValues4] = useState(training); //training
  const [formvalues6, setFormValues6] = useState(skilling); //skilling
  const [formvalues7, setFormValues7] = useState(conferences); //conferences
  const [others, setOthers] = useState(""); //others
  const [isAcquiredEdit, setIsAcquiredEdit] = useState(false);
  const [isformSubmit, setIsFormSubmit] = useState(false);
  // const [isTransSkillCertEdit, setIsTransSkillCertEdit] = useState(false);

  const handleAcquiredEdit = (data) => {
    setIsAcquiredEdit(true);
    if (data.mtype === "Certification") {
      document.getElementById("addModalBtn").click();
      setSelectedValue("2");
      setValidation(false);
      setFormValues2({ ...formvalues2, type: "Certification" });
      setFormValues3({
        ...formvalues3,
        organization: data.organization,
        location: data.location,
        fromDate: formatTimestampToDate(data.fromDate, "yyyy-mm-dd"),
        toDate: formatTimestampToDate(data.toDate, "yyyy-mm-dd"),
        briefDescriptions: data.briefDescriptions,
        certificationName: data.certificationName,
        id: data.id,
      });
    } else if (
      data.mtype === "Training" ||
      data.mtype === "Conferences" ||
      data.mtype === "Skilling"
    ) {
      document.getElementById("addModalBtn").click();
      setSelectedValue("2");
      setValidation(false);
      setFormValues2({ ...formvalues2, type: data.mtype });
      setFormValues4({
        ...formvalues4,
        type: data.mtype,
        source: data.source,
        organization: data.organization,
        location: data.location,
        fromDate: formatTimestampToDate(data.fromDate, "yyyy-mm-dd"),
        toDate: formatTimestampToDate(data.toDate, "yyyy-mm-dd"),
        briefDescriptions: data.briefDescriptions,
        id: data.id,
      });
    }
  };
  const handleSelectChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedValue(selectedOption);
  };
  const handleEdit = () => {
    setEditEnable(!editEnable);
  };
  const handleCancel = () => {
    // setSkillValue("");
    // dispatch(resetMySkill())
    setEditEnable(false);
  };
  const handleModalClose = () => {
    setSelectedValue(0);
    setValidation(false);
    setFileupload(false);
    setFormValues(initialState);
    setFormValues2(education);
    setFormValues3(certification);
    setFormValues4(training);
    setOthers("");
    setIsAcquiredEdit(false);
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  };
  const handleSummaryClick = (event) => {
    const target = document.getElementById("panelsStayOpen-collapseOne");
    target.classList.add("show");
    event.stopPropagation();
    setDetailTab1(false);
    setsummaryTab1(true);
  };
  const handleSummaryClick1 = (event) => {
    const target = document.getElementById("panelsStayOpen-collapseTwo");
    target.classList.add("show");
    event.stopPropagation();
    setDetailTab2(false);
    setsummaryTab2(true);
  };

  const handleDetailsSummary1 = (event) => {
    const target = document.getElementById("panelsStayOpen-collapseTwo");
    target.classList.add("show");
    event.stopPropagation();
    setsummaryTab2(false);
    setDetailTab2(true);
  };

  const handleAccordion1 = (event) => {
    if (summaryTab1 === false && DetailTab1 === false) {
      setsummaryTab1(true);
    } else {
      setsummaryTab1(false);
      setDetailTab1(false);
    }
    event.stopPropagation();
    const target = document.getElementById("panelsStayOpen-collapseOne");

    if (target.classList.contains("show")) {
      target.classList.remove("show");
    } else {
      target.classList.add("show");
    }
  };

  const handleAccordion2 = (event) => {
    if (summaryTab2 === false && DetailTab2 === false) {
      setsummaryTab2(true);
    } else {
      setsummaryTab2(false);
      setDetailTab2(false);
    }
    event.stopPropagation();

    const target = document.getElementById("panelsStayOpen-collapseTwo");
    if (target.classList.contains("show")) {
      target.classList.remove("show");
    } else {
      target.classList.add("show");
    }
  };

  const handleDetailsSummary = (event) => {
    const target = document.getElementById("panelsStayOpen-collapseOne");
    target.classList.add("show");
    event.stopPropagation();
    setsummaryTab1(false);
    setDetailTab1(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleValidateProject = () => {
    setValidation(true);
  };

  const handleValidationClose = () => {
    setValidation(false);
  };

  useEffect(() => {
    document.title = "Skill Profile";

    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(96vh - ${navbarHeight}px)`);
    }

    // call the skills applied and skills acquired api
    if (SkillsApplied.status === "idle") {
      dispatch(fetchDataSkillsApplied());
    }
    if (SkillsAcquired.status === "idle") {
      dispatch(fetchDataSkillsAcquired());
    }

    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }

    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }

    // calculate the yoe for skills applied and skills acquired
    if (SkillsApplied.status === "success") {
      let yoe = 0;
      SkillsApplied.data?.forEach((item) => {
        if (
          item.mlanguage === selectedLanguage &&
          SkillSelected.skillOccupation === item.title
        ) {
          let fromDate = formatTimestampToDate(item.fromDate);
          let toDate = formatTimestampToDate(item.toDate);
          let duration = calculateDaysDifference(fromDate, toDate);
          yoe = yoe + Number(duration);
        }
      });
      setSkillAppliedYoe(yoe);
    }

    if (SkillsAcquired.status === "success") {
      let yoe = 0;
      SkillsAcquired.data?.forEach((item) => {
        if (
          item.mlanguage === selectedLanguage &&
          SkillSelected.skillOccupation === item.title
        ) {
          let fromDate = formatTimestampToDate(item.fromDate);
          let toDate = formatTimestampToDate(item.toDate);
          let duration = calculateDaysDifference(fromDate, toDate);
          yoe = yoe + Number(duration);
        }
      });
      setSkillAcquiredYoe(yoe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    SkillsApplied.status,
    SkillsApplied.data,
    SkillSelected,
    selectedLanguage,
    SkillsAcquired.status,
    SkillsAcquired.data,
  ]);

  const [switchTab, setSwitchTab] = useState("");
  const handlePrint = () => {
    window.print();
  };

  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  // const handleSuggestionClick = (value) => {
  //     console.log("inni");
  //     if (value.skillOccupation === "No suggestions found") {
  //         setSkillValue("");
  //         setSkillSuggestions("");
  //     } else {
  //         setSkillValue(value.skillOccupation);
  //         setSkillRecord(value);
  //         setSkillSuggestions("");
  //     }
  // }

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

  const handleAddSkill = (SkillValue, skillRecord) => {
    if (skillRecord.skillOccupation === "No suggestions found") {
      setSkillValue("");
      setSkillSuggestions("");
      return;
    }

    setSkillValue(SkillValue);

    setSkillSuggestions("");
    if (SkillValue === "") {
      showWarningToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseEnterASkill"
          ) || {}
        ).mvalue || "Please Enter a skill"
      );
    }
    // check if the skill is already added in particular selected language
    else {
      const checkSkill = topSkill.data.find(
        (item) =>
          item.skillOccupation === SkillValue &&
          item.mlanguage === selectedLanguage
      );
      // if checkskill undefined then POST the data
      if (checkSkill === undefined) {
        const findRank = topSkill.data.filter(
          (item) => item.mlanguage === selectedLanguage
        );
        const newUserSkill = {
          title: SkillValue,
          skillOccupation: SkillValue,
          mlanguage: selectedLanguage,
          userRank: findRank.length + 1,
          yoe: "0",
          userId:getCookie("userId"),
          occupation: skillRecord.occupation,
          occupationId: skillRecord.occupationId,
          skill: skillRecord.skill,
          skillId: skillRecord.skillId,
          occupationId: skillRecord.occupationId,
          skillOccupationId: skillRecord.id,
        };

        // if already request is pending then return
        if (isAddingSkill) {
          return;
        }
        setIsAddingSkill(true);

        PostApi("User Skills", newUserSkill)
          .then((res) => {
            const data = res?.data;
            if (isNewSkill && !data?.occupationId) {
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

            dispatch(addNewTopSkill(res.data));
            dispatch(setMySkill(res.data));
            setSelectedOccupation(null);
            setIsNewSkill(false);
            setIsNewOccupation(false);
            setSkillValue("");
          })
          .catch((err) => {
            console.error(err);
            showErrorToast(
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SomethingWentWrong"
                ) || {}
              ).mvalue || "nf Something went wrong"
            );
          })
          .finally(() => {
            setIsAddingSkill(false);
            handleScroll();
          });
      } else {
        dispatch(setMySkill(checkSkill));
      }
    }
  };

  useEffect(() => {
    //  console.log(scrollRef.current);
    //         scrollRef.current.scrollIntoView({  block: 'end' });
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      const height = scrollRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollRef.current.scrollTop = maxScrollTop; // Adjust the value as needed
    }
  };

  const [isThreeCharacters, setIsThreeCharacters] = useState(false);
  const handleChangeSkill = (e) => {
    const inputValue = e.target.value;
    setSkillValue(inputValue);
    // if value greater than 2 then query the database and get the suggestions
    if (e.target.value.length > 2) {
      // debouncedSendRequest( user input ,selectedLanguage, usestateToSetSuggestions)
      setSuggestionLoader(true);
      debouncedSendRequest(
        e.target.value,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
      setIsThreeCharacters(true);
    } else {
      setSkillSuggestions([
        {
          skillOccupation:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "EnterAtleastCharacters"
              ) || {}
            ).mvalue || "nf Enter At least 3 Characters",
          id: 1,
          occupation: selectedLanguage,
        },
      ]);
      setIsThreeCharacters(false);
    }
  };

  const buttonRef = useRef(null);
  const handleSubmitDate = () => {
    dispatch(addNewSkillApplied(formValues));

    // before send data verify the skill is filled validation form sent to db if yes update validation to yes
  };

  const handleEditPopUp = (data) => {
    setSelectedValue("1");
    setValidation(false);
    setFileupload(false);
    setFormValues({
      projectTitle: data.projectTitle,
      fromDate: data.fromDate,
      toDate: data.toDate,
      duration: data.duration,
      briefDescription: data.briefDescription,
      organization: data.organization,
      location: data.location,
      type: data.type,
      showHide: data.showHide,
      validation: data.validation,
      blockChain: data.blockChain,
      languageMist: data.languageMist,
    });
    if (exampleModalRef.current) {
      exampleModalRef.current.click();
    }
  };

  const checkDuplicate = (form) => {
    var duplicate = false;

    form.title = form.title || form.certificationName || form.course;

    SkillsAcquired?.data?.map((skill) => {
      console.log(SkillSelected, skill.title);
      console.log(skill.source, form.organization);

      console.log(skill.mtype, formvalues2.type);
      if (
        SkillSelected.skillOccupation === skill.title &&
        skill.source === form.title &&
        skill.mtype === formvalues2.type
      ) {
        let fromDate = convertDateToMilliseconds(form.fromDate);
        let toDate = form.toDate
          ? convertDateToMilliseconds(FormatDateIntoPost(form.toDate))
          : Date.now();

        console.log(skill);

        console.log(fromDate, skill.fromDate);
        console.log(toDate, skill.toDate ? skill.toDate : Date.now());

        if (
          fromDate === skill.fromDate ||
          toDate === (skill.toDate ? skill.toDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= skill.fromDate &&
            fromDate <= (skill.toDate ? skill.toDate : Date.now())) || // User from date falls within existing date range
          (toDate >= skill.fromDate &&
            toDate <= (skill.toDate ? skill.toDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= skill.fromDate &&
            toDate >= (skill.toDate ? skill.toDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= skill.fromDate &&
            toDate >= skill.fromDate &&
            toDate <= (skill.toDate ? skill.toDate : Date.now())) || // Right-side overlap
          (toDate >= (skill.toDate ? skill.toDate : Date.now()) &&
            fromDate >= skill.fromDate &&
            fromDate <= (skill.toDate ? skill.toDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  const exampleModalRef = useRef(null);

  const handleSkillingSubmit = (close) => {
    let duplicate = checkDuplicate(formvalues6);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SkillAccquiredDateRange"
          ) || {}
        ).mvalue || "nf SkillAccquired already exist within the date range"
      );
      return;
    }

    setIsFormSubmit(true);

    if (!isAcquiredEdit) {
      if (isAddingTranSkillConf) {
        return;
      }
      setIsAddingTranSkillConf(true);
      /* TICKETS ID ARRAY */
      let ticketIdsArray = [];
      if (formvalues6.ticketids) {
        if (Array.isArray(formvalues6.ticketids)) {
          /* REMOVED FALSY VALUES LIKE NULL, UNDEFINED, "" */
          ticketIdsArray = formvalues6.ticketids.filter((ticketId) => ticketId);
        } else {
          ticketIdsArray.push(formvalues6.ticketids);
        }
      }
      if (skillingChildData["value"]?.id) {
        ticketIdsArray.push(skillingChildData["value"]?.id);
      }
      /* AVOID DUPLICATION */
      ticketIdsArray = Array.from(new Set(ticketIdsArray));

      PostApi("Skills Acquired", {
        // ...formvalues6, mtype: formvalues2.type, source:formvalues6.organization,
        // fromDate: FormatDateIntoPost(formvalues6.fromDate), toDate: FormatDateIntoPost(formvalues6.toDate)
        ...formvalues6,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        source: formvalues6.skillingName,
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
        fromDate: FormatDateIntoPost(formvalues6.fromDate),
        toDate: formvalues6.toDate
          ? FormatDateIntoPost(formvalues6.toDate)
          : "",
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues6.fromDate),
          formvalues6.toDate
            ? convertDateToMilliseconds(formvalues6.toDate)
            : Date.now()
        ),
        ticketids: ticketIdsArray,
      })
        .then((res) => {
          dispatch(
            addNewSkillAcquired({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SkillsAcquiredAddedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Added Successful"
          );
          setSkillingChildData("");

          if (close) {
            handleModalClose();
          }
          // after update into Myskill Experinece in DND
          const days = calculateDaysDifference(
            res.data.fromDate,
            res.data.toDate ? res.data.toDate : Date.now()
          );
          const totalDays = days + Number(SkillSelected.yoe);
          const totalExp =
            (SkillSelected.skillAcquiredExp
              ? Number(SkillSelected.skillAcquiredExp)
              : 0) + days;

          EditApi("User Skills", SkillSelected.id, {
            yoe: `${totalDays}`,
            skillAcquiredExp: `${totalExp}`,
          })
            .then((res) => {
              dispatch(
                replaceTopSkillById({
                  id: SkillSelected.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAcquiredExp(totalExp));
            })
            .catch((err) => {
              console.error(err);
            });

          // if (formvalues6.insIsnew) {
          //     PostApi('Skilling',
          //         {
          //             ...formvalues6, source: formvalues6.organization,
          //             startDate: FormatDateIntoPost(formvalues6.fromDate), endDate: formvalues6.toDate ? FormatDateIntoPost(formvalues6.toDate) : "" ,
          //             duration: calculateDaysDifference(convertDateToMilliseconds(formvalues6.fromDate), formvalues6.toDate ? convertDateToMilliseconds(formvalues6.toDate) : Date.now()),
          //             briefDescription:formvalues6.briefDescriptions
          //         }).then((res) => {
          //             // update redux store
          //             dispatch(fetchSkillingHistory());

          //         }).catch((err) => {
          //             console.log(err);
          //         })
          // }
          setFormValues6(skilling);
          setSelectedValue("0");

          setIsFormSubmit(false);
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );

          setIsFormSubmit(false);
        })
        .finally(() => {
          setIsAddingTranSkillConf(false);
        });
    } else {
      EditApi("Skills Acquired", formvalues6.id, {
        ...formvalues6,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        organization: formvalues6.source,
        fromDate: FormatDateIntoPost(formvalues6.fromDate),
        toDate: FormatDateIntoPost(formvalues6.toDate),
      })
        .then((res) => {
          dispatch(
            editSkillAcquired({ id: formvalues6.id, updatedData: res.data })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "SkillsAcquiredUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
        });
    }
  };

  const handleConferenceSubmit = (close) => {
    let duplicate = checkDuplicate(formvalues7);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SkillAccquiredDateRange"
          ) || {}
        ).mvalue || "nf SkillAccquired already exist within the date range"
      );
      return;
    }

    setIsFormSubmit(true);

    if (!isAcquiredEdit) {
      if (isAddingTranSkillConf) {
        return;
      }
      setIsAddingTranSkillConf(true);
      /* CONF TICKET IDS ARRAY INIT */
      let ticketIdsArray = [];
      if (formvalues7.ticketids) {
        if (Array.isArray(formvalues7.ticketids)) {
          /* FILTER OUT FALSY VALUES LIKE NULL, UNDEFINED, "" */
          ticketIdsArray = formvalues7.ticketids.filter((ticketId) => ticketId);
        } else {
          ticketIdsArray.push(formvalues7.ticketids);
        }
      }
      if (confChildData["value"]?.id) {
        ticketIdsArray.push(confChildData["value"]?.id);
      }
      /* AVOID DUPLICATION */
      ticketIdsArray = Array.from(new Set(ticketIdsArray));

      PostApi("Skills Acquired", {
        // ...formvalues6, mtype: formvalues2.type, source:formvalues6.organization,
        // fromDate: FormatDateIntoPost(formvalues6.fromDate), toDate: FormatDateIntoPost(formvalues6.toDate)
        ...formvalues7,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        source: formvalues7?.conferencesName,
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
        fromDate: FormatDateIntoPost(formvalues7.fromDate),
        toDate: formvalues7.toDate
          ? FormatDateIntoPost(formvalues7.toDate)
          : "",
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues7.fromDate),
          formvalues7.toDate
            ? convertDateToMilliseconds(formvalues7.toDate)
            : Date.now()
        ),
        ticketids: ticketIdsArray,
      })
        .then((res) => {
          dispatch(
            addNewSkillAcquired({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SkillsAcquiredAddedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Added Successful"
          );
          setConfChildData("");

          if (close) {
            handleModalClose();
          }
          // after update into Myskill Experinece in DND
          const days = calculateDaysDifference(
            res.data.fromDate,
            res.data.toDate ? res.data.toDate : Date.now()
          );
          const totalDays = days + Number(SkillSelected.yoe);
          const totalExp =
            (SkillSelected.skillAcquiredExp
              ? Number(SkillSelected.skillAcquiredExp)
              : 0) + days;

          EditApi("User Skills", SkillSelected.id, {
            yoe: `${totalDays}`,
            skillAcquiredExp: `${totalExp}`,
          })
            .then((res) => {
              dispatch(
                replaceTopSkillById({
                  id: SkillSelected.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAcquiredExp(totalExp));
            })
            .catch((err) => {
              console.error(err);
            });

          // if (formvalues7.insIsnew) {
          //     PostApi('Conferences',
          //         {
          //             ...formvalues7, source: formvalues7.organization,
          //             startDate: FormatDateIntoPost(formvalues7.fromDate), endDate: formvalues7.toDate ? FormatDateIntoPost(formvalues7.toDate) : "",
          //             duration: calculateDaysDifference(convertDateToMilliseconds(formvalues7.fromDate), formvalues7.toDate ? convertDateToMilliseconds(formvalues7.toDate) : Date.now()),
          //             briefDescription:formvalues7.briefDescriptions
          //         }).then((res) => {
          //             // dispatch(addNewConference({ ...res.data, fromDate: convertDateToMilliseconds(res.data.startDate), toDate: convertDateToMilliseconds(res.data.endDate) }))
          //             dispatch(fetchConferencesHistory());
          //             // update redux store

          //         }).catch((err) => {
          //             console.log(err);
          //         })
          // }
          setFormValues7(conferences);
          setSelectedValue("0");

          setIsFormSubmit(false);
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
          setIsFormSubmit(false);
        })
        .finally(() => {
          setIsAddingTranSkillConf(false);
        });
    } else {
      EditApi("Skills Acquired", formvalues7.id, {
        ...formvalues6,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        organization: formvalues7.source,
        fromDate: FormatDateIntoPost(formvalues7.fromDate),
        toDate: FormatDateIntoPost(formvalues7.toDate),
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
      })
        .then((res) => {
          dispatch(
            editSkillAcquired({ id: formvalues7.id, updatedData: res.data })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "SkillsAcquiredUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
        });
    }
  };

  const handleTranSkillConfSubmit = (close) => {
    let duplicate = checkDuplicate(formvalues4);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SkillAccquiredDateRange"
          ) || {}
        ).mvalue || "nf SkillAccquired already exist within the date range"
      );
      return;
    }

    setIsFormSubmit(true);

    if (!isAcquiredEdit) {
      if (isAddingTranSkillConf) {
        return;
      }
      setIsAddingTranSkillConf(true);
      /* INIT TICKETS ID ARRAY */
      let ticketIdsArray = [];
      if (formvalues4.ticketids) {
        if (Array.isArray(formvalues4.ticketids)) {
          /* REMOVED FALSY VALUES LIKE NULL, UNDEFINED, "" */
          ticketIdsArray = formvalues4.ticketids.filter((ticketId) => ticketId);
        } else {
          ticketIdsArray.push(formvalues4.ticketids);
        }
      }
      if (trainingChildData["value"]?.id) {
        ticketIdsArray.push(trainingChildData["value"]?.id);
      }
      /* AVOID DUPLICATION */
      ticketIdsArray = Array.from(new Set(ticketIdsArray));

      PostApi("Skills Acquired", {
        ...formvalues4,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        organization: formvalues4.organization,
        source: formvalues4.trainingName,
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
        fromDate: FormatDateIntoPost(formvalues4.fromDate),
        toDate: formvalues4.toDate
          ? FormatDateIntoPost(formvalues4.toDate)
          : "",
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues4.fromDate),
          formvalues4.toDate
            ? convertDateToMilliseconds(formvalues4.toDate)
            : Date.now()
        ),
        ticketids: ticketIdsArray,
      })
        .then((res) => {
          dispatch(
            addNewSkillAcquired({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SkillsAcquiredAddedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Added Successful"
          );
          setTrainingChildData("");

          if (close) {
            handleModalClose();
          }

          // after update into Myskill Experinece in DND
          const days = calculateDaysDifference(
            res.data.fromDate,
            res.data.toDate ? res.data.toDate : Date.now()
          );
          const totalDays = days + Number(SkillSelected.yoe);
          const totalExp =
            (SkillSelected.skillAcquiredExp
              ? Number(SkillSelected.skillAcquiredExp)
              : 0) + days;

          EditApi("User Skills", SkillSelected.id, {
            yoe: `${totalDays}`,
            skillAcquiredExp: `${totalExp}`,
          })
            .then((res) => {
              dispatch(
                replaceTopSkillById({
                  id: SkillSelected.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAcquiredExp(totalExp));
            })
            .catch((err) => {
              console.error(err);
            });

          // if (formvalues4.insIsnew) {
          //     PostApi("Training",
          //         {
          //             ...formvalues4, organization: formvalues4.organization, source: formvalues4.organization,
          //             startDate: FormatDateIntoPost(formvalues4.fromDate), endDate: formvalues4.toDate ? FormatDateIntoPost(formvalues4.toDate) : "",
          //             duration: calculateDaysDifference(convertDateToMilliseconds(formvalues4.fromDate), formvalues4.toDate ? convertDateToMilliseconds(formvalues4.toDate) : Date.now()),
          //             briefDescription:formvalues4.briefDescriptions

          //         }).then((res) => {
          //             // update redux store
          //             dispatch(fetchTrainingHistory());

          //         }).catch((err) => {
          //             console.log(err);
          //         })
          // }

          setFormValues4(training);
          setSelectedValue("0");

          setIsFormSubmit(false);
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
          setIsFormSubmit(false);
        })
        .finally(() => {
          setIsAddingTranSkillConf(false);
        });
    } else {
      EditApi("Skills Acquired", formvalues4.id, {
        ...formvalues4,
        title: SkillSelected.skillOccupation,
        mtype: formvalues2.type,
        organization: formvalues4.source,
        fromDate: FormatDateIntoPost(formvalues4.fromDate),
        toDate: FormatDateIntoPost(formvalues4.toDate),
      })
        .then((res) => {
          dispatch(
            editSkillAcquired({ id: formvalues4.id, updatedData: res.data })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "SkillsAcquiredUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
        });
    }
  };

  const handleCertificationSubmit = (close) => {
    let duplicate = checkDuplicate(formvalues3);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SkillAccquiredDateRange"
          ) || {}
        ).mvalue || "nf SkillAccquired already exist within the date range"
      );
      return;
    }

    setIsFormSubmit(true);
    // console.log(formvalues3);
    if (!isAcquiredEdit) {
      let ticketIdsArray = [];
      if (formvalues3.ticketids) {
        if (Array.isArray(formvalues3.ticketids)) {
          /* REMOVED FALSY VALUES LIKE NULL, UNDEFINED, "" */
          ticketIdsArray = formvalues3.ticketids.filter((ticketId) => ticketId);
        } else {
          ticketIdsArray.push(formvalues3.ticketids);
        }
      }
      if (certChildData["value"]?.id) {
        ticketIdsArray.push(certChildData["value"]?.id);
      }
      /* AVOID DUPLICATION */
      ticketIdsArray = Array.from(new Set(ticketIdsArray));

      PostApi("Skills Acquired", {
        ...formvalues3,
        title: SkillSelected.skillOccupation,
        source: formvalues3.certificationName,
        fromDate: FormatDateIntoPost(formvalues3.fromDate),
        toDate: formvalues3.toDate
          ? FormatDateIntoPost(formvalues3.toDate)
          : "",
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues3.fromDate),
          formvalues3.toDate
            ? convertDateToMilliseconds(formvalues3.toDate)
            : Date.now()
        ),
        ticketids: ticketIdsArray,
      })
        .then((res) => {
          dispatch(
            addNewSkillAcquired({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SkillsAcquiredAddedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Added Successful"
          );
          setCertChildData("");

          // after update into Myskill Experinece in DND
          const days = calculateDaysDifference(
            res.data.fromDate,
            res.data.toDate ? res.data.toDate : Date.now()
          );
          const totalDays = days + Number(SkillSelected.yoe);
          const totalExp =
            (SkillSelected.skillAcquiredExp
              ? Number(SkillSelected.skillAcquiredExp)
              : 0) + days;

          EditApi("User Skills", SkillSelected.id, {
            yoe: `${totalDays}`,
            skillAcquiredExp: `${totalExp}`,
          })
            .then((res) => {
              dispatch(
                replaceTopSkillById({
                  id: SkillSelected.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAcquiredExp(totalExp));
            })
            .catch((err) => {
              console.error(err);
            });

          // if (formvalues3.insIsnew) {

          //     PostApi("Certification History", {
          //         ...formvalues3, title: SkillSelected.userSkill, source: formvalues3.organization,
          //         startDate: FormatDateIntoPost(formvalues3.fromDate), endDate: formvalues3.toDate ? FormatDateIntoPost(formvalues3.toDate) : "",
          //         duration: calculateDaysDifference(convertDateToMilliseconds(formvalues3.fromDate), formvalues3.toDate ? convertDateToMilliseconds(formvalues3.toDate) : Date.now()),
          //         briefDescription: formvalues3.briefDescriptions
          //     }).then((res) => {

          //         // update certicate redux store
          //         dispatch(addNewCertification(res.data))
          //     }).catch((err) => {
          //         console.log(err);
          //     })
          // }
          setFormValues3(certification);
          setSelectedValue("0");

          setIsFormSubmit(false);
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
          setIsFormSubmit(false);
        })
        .finally(() => {
          setIsFormSubmit(false);
          if (close) {
            handleModalClose();
          }
        });
    } else {
      EditApi("Skills Acquired", formvalues3.id, {
        ...formvalues3,
        title: SkillSelected.skillOccupation,
        source: formvalues3.organization,
        fromDate: FormatDateIntoPost(formvalues3.fromDate),
        toDate: FormatDateIntoPost(formvalues3.toDate),
      })
        .then((res) => {
          dispatch(
            editSkillAcquired({ id: formvalues3.id, updatedData: res.data })
          );
          // dispatch(editYoe(res.data.yoe))
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "SkillsAcquiredUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
        });
    }
  };

  const handleEducationSubmit = (close) => {
    let duplicate = checkDuplicate(formvalues2);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SkillAccquiredDateRange"
          ) || {}
        ).mvalue || "nf SkillAccquired already exist within the date range"
      );
      return;
    }

    setIsFormSubmit(true);
    if (!isAcquiredEdit) {
      let ticketIdsArray = [];
      if (formvalues2.ticketids) {
        if (Array.isArray(formvalues2.ticketids)) {
          /* REMOVED FALSY VALUES LIKE NULL, UNDEFINED, "" */
          ticketIdsArray = formvalues2.ticketids.filter((ticketId) => ticketId);
        } else {
          ticketIdsArray.push(formvalues2.ticketids);
        }
      }

      if (childData["value"]?.id) {
        ticketIdsArray.push(childData["value"]?.id);
      }
      /* AVOID DUPLICATION */
      ticketIdsArray = Array.from(new Set(ticketIdsArray));

      PostApi("Skills Acquired", {
        ...formvalues2,
        title: SkillSelected.skillOccupation,
        organization: formvalues2.source,
        source: formvalues2.course,
        userSkillsId: SkillSelected?.id,
        userSkill: SkillSelected?.skillOccupation,
        fromDate: FormatDateIntoPost(formvalues2.fromDate),
        toDate: formvalues2.toDate
          ? FormatDateIntoPost(formvalues2.toDate)
          : "",
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues2.fromDate),
          formvalues2.toDate
            ? convertDateToMilliseconds(formvalues2.toDate)
            : Date.now()
        ),
        ticketids: ticketIdsArray,
      })
        .then((res) => {
          dispatch(
            addNewSkillAcquired({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SkillsAcquiredAddedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Added Successful"
          );
          setChildData("");

          // after update into Myskill Experinece in DND
          const days = calculateDaysDifference(
            res.data.fromDate,
            res.data.toDate ? res.data.toDate : Date.now()
          );
          const totalDays = days + Number(SkillSelected.yoe);
          const totalExp =
            (SkillSelected.skillAcquiredExp
              ? Number(SkillSelected.skillAcquiredExp)
              : 0) + days;

          EditApi("User Skills", SkillSelected.id, {
            yoe: `${totalDays}`,
            skillAcquiredExp: `${totalExp}`,
          })
            .then((res) => {
              dispatch(
                replaceTopSkillById({
                  id: SkillSelected.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAcquiredExp(totalExp));
            })
            .catch((err) => {
              console.error(err);
            });

          setFormValues2(education);
          setSelectedValue("0");

          setIsFormSubmit(false);
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
          setIsFormSubmit(false);
        })
        .finally(() => {
          if (close) {
            handleModalClose();
          }
        });
    } else {
      EditApi("Skills Acquired", formvalues2.id, {
        ...formvalues2,
        title: SkillSelected.skillOccupation,
        source: formvalues2.organization,
        fromDate: FormatDateIntoPost(formvalues2.fromDate),
        toDate: FormatDateIntoPost(formvalues2.toDate),
        duration: calculateDaysDifference(
          convertDateToMilliseconds(formvalues2.fromDate),
          formvalues2.toDate
            ? convertDateToMilliseconds(formvalues2.toDate)
            : Date.now()
        ),
      })
        .then((res) => {
          dispatch(
            editSkillAcquired({ id: formvalues2.id, updatedData: res.data })
          );
          // dispatch(editYoe(res.data.yoe))
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "SkillsAcquiredUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Skills Acquired Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
        })
        .catch((err) => {
          console.error(err);
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SomethingWentWrong"
              ) || {}
            ).mvalue || "nf Something went wrong"
          );
        });
    }
  };

  const handleSelectAcquired = (e) => {
    setFormValues2({ ...education, type: e.target.value });
    setFormValues4(training);
    setFormValues3(certification);
    setFormValues6(skilling);
    setFormValues7(conferences);
  };

  /* HANDLE SELECT APPLIED */
  const handleSelectApplied = (e) => {
    setFormValues({ ...initialState, mtype: e.target.value });
  };

  //select skill one by default
  useEffect(() => {
    dispatch(
      setMySkill(
        topSkill.data.filter((item) => item.mlanguage === selectedLanguage)[0]
      )
    );
  }, [topSkill.status]);

  /* FOR CREATING NEW SKILL */
  const handleCreateSkill = (skillName) => {
    setIsNewSkill(true);
    if (selectedOccupation) {
      const titleCaseSkillName = toTitleCase(skillName);
      const formattedSkillOccupation = `${titleCaseSkillName} || ${selectedOccupation?.label}`;
      const newSkill = {
        skill: titleCaseSkillName,
        occupation: selectedOccupation?.label,
        skillOccupation: formattedSkillOccupation,
      };
      setSkillSuggestions((prevSuggestions) => [...prevSuggestions, newSkill]);
    }
  };

  /* HANDLE OCCUPATION SAVE */
  const handleOccupationSave = () => {
    handleCreateSkill(SkillValue);
    setIsSavingOccupation(true);
    setIsShowOccupationPopup(false);
    /* RETURN TO FALSE */
    setIsSavingOccupation(false);
  };

  return (
    <div>
      <FindSkillByOccModal handleScroll={handleScroll} />

      <div className="d-print-none" style={{ direction: "ltr" }}>
        <div ref={navbarRef} id="yourNavbarId">
          <Navbar handlePdf={handlePrint}></Navbar>

          <hr className="p-0 m-0 " />
        </div>
        {/* <!-- Modal --> */}
        <div
          className="modal fade font-5 m-0 p-0 "
          style={{ margin: "0" }}
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex justify-content-between align-items-center  w-100  ">
                  {/* <h1 className="modal-title fs-5" id="exampleModalLabel">{(content[selectedLanguage]?.find(item => item.elementLabel === 'SkillName') || {}).mvalue || "not found"}</h1> */}
                  <i className=" me-2">
                    {" "}
                    <span className="text-danger ">*</span>{" "}
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "RequiredFields"
                      ) || {}
                    ).mvalue || "nf Required Fields"}
                  </i>
                </div>

                <button
                  type="button"
                  ref={buttonRef}
                  className="btn-close"
                  id="formClose"
                  onClick={handleModalClose}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body pb-0 mb-0  ">
                <div className=" pill-bg-color text-white p-1 px-2  rounded-pill ">
                  {SkillSelected.skillOccupation}
                </div>
                {/* form start */}
                <div className="my-3   ">
                  <select
                    className="form-select my-2  bg-body-tertiary font-5  "
                    aria-label="Default select example"
                    onChange={handleSelectChange}
                    value={selectedValue}
                    style={{ height: "32px" }}
                  >
                    <option
                      className="bg-body-tertiary"
                      value="0"
                      disabled
                      selected
                      hidden
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) =>
                            item.elementLabel ===
                            "SkillAcquiredOrAppliedThrough"
                        ) || {}
                      ).mvalue || "nf Skills Acquired Or Applied Through "}
                    </option>
                    <option className="bg-body-tertiary" value="1">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "ApplyingSkills"
                        ) || {}
                      ).mvalue || "nf Applying Skills"}
                    </option>
                    <option className="bg-body-tertiary" value="2">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "AcquiringSkills"
                        ) || {}
                      ).mvalue || "not Acquiring Skills"}
                    </option>
                  </select>

                  {/* form 1 */}
                  {selectedValue === "1" &&
                    Validation === false &&
                    fileupload === false && (
                      <div>
                        <select
                          className="form-select mb-3 bg-body-tertiary font-5 "
                          aria-label="Default select example"
                          name="type"
                          onChange={(e) => handleSelectApplied(e)}
                          defaultValue="0"
                          style={{ height: "32px" }}
                        >
                          <option
                            className="bg-body-tertiary"
                            value="0"
                            disabled
                            selected
                            hidden
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "HowYouAppliedSkill"
                              ) || {}
                            ).mvalue || "nf How did you APPLIED this skill"}
                          </option>
                          <option value="Own">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Own"
                              ) || {}
                            ).mvalue || "nf Own"}
                          </option>
                          <option value="Employment">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Employment"
                              ) || {}
                            ).mvalue || "nf Employment"}
                          </option>
                        </select>

                        {formValues?.mtype === "Own" && (
                          <React.Fragment>
                            <ProjectForm
                              formValues={formValues}
                              setFormValues={setFormValues}
                              setValidation={setValidation}
                              skillsApplied={SkillsApplied}
                              setFileupload={setFileupload}
                              handleModalClose={handleModalClose}
                              setSelectedValue={setSelectedValue}
                            />
                          </React.Fragment>
                        )}
                        {formValues?.mtype === "Employment" && (
                          <React.Fragment>
                            <ProjectForm
                              formValues={formValues}
                              setFormValues={setFormValues}
                              setValidation={setValidation}
                              skillsApplied={SkillsApplied}
                              setFileupload={setFileupload}
                              handleModalClose={handleModalClose}
                              setSelectedValue={setSelectedValue}
                            />
                          </React.Fragment>
                        )}
                      </div>
                    )}

                  {selectedValue === "2" && fileupload === false && (
                    <div>
                      <select
                        className="form-select mb-3 bg-body-tertiary font-5 "
                        aria-label="Default select example"
                        name="type"
                        onChange={(e) => handleSelectAcquired(e)}
                        value={formvalues2.type}
                        style={{ height: "32px" }}
                      >
                        <option
                          className="bg-body-tertiary"
                          value="0"
                          disabled
                          selected
                          hidden
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "HowYouAcquiredSkill"
                            ) || {}
                          ).mvalue || "nf How did you ACQUIRE this skill"}
                        </option>
                        <option value="Education">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Education"
                            ) || {}
                          ).mvalue || "nf Education"}
                        </option>
                        <option value="Certification">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Certifications"
                            ) || {}
                          ).mvalue || "nf Certifications"}
                        </option>
                        <option value="Training">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Training"
                            ) || {}
                          ).mvalue || "nf Training"}
                        </option>
                        <option value="Skilling">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Skilling"
                            ) || {}
                          ).mvalue || "nf Skilling"}
                        </option>
                        <option value="Conferences">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Conferences"
                            ) || {}
                          ).mvalue || "nf Conferences"}
                        </option>
                        {/* <option value="Others">Others</option> */}
                      </select>

                      {/* form 2 */}
                      {formvalues2.type === "Education" &&
                        Validation === false &&
                        fileupload === false && (
                          <EducationForm
                            isLoading={isformSubmit}
                            formvalues2={formvalues2}
                            setFormValues2={setFormValues2}
                            setValidation={setValidation}
                            setFileupload={setFileupload}
                            handleSubmit={handleEducationSubmit}
                            isAcquiredEdit={isAcquiredEdit}
                            sendEducationToParent={handleChildData}
                          />
                        )}

                      {formvalues2.type === "Education" &&
                        Validation === true && (
                          <ValidationForm
                            handleValidationClose={handleValidationClose}
                          />
                        )}

                      {/* form 3 */}
                      {formvalues2.type === "Certification" &&
                        Validation === false && (
                          <CertificationForm
                            isLoading={isformSubmit}
                            formvalues3={formvalues3}
                            setFormValues3={setFormValues3}
                            setValidation={setValidation}
                            setFileupload={setFileupload}
                            handleSubmit={handleCertificationSubmit}
                            isAcquiredEdit={isAcquiredEdit}
                            handleModalClose={handleModalClose}
                            sendCertToParent={handleCertChildData}
                          />
                        )}

                      {formvalues2.type === "Certification" &&
                        Validation === true && (
                          <ValidationForm
                            handleValidationClose={handleValidationClose}
                          />
                        )}

                      {formvalues2.type === "Skilling" &&
                        Validation === false && (
                          <SkillingForm
                            isLoading={isformSubmit}
                            formvalues6={formvalues6}
                            setFormValues6={setFormValues6}
                            setValidation={setValidation}
                            setFileupload={setFileupload}
                            handleSubmit={handleSkillingSubmit}
                            isAcquiredEdit={isAcquiredEdit}
                            handleModalClose={handleModalClose}
                            sendSkillingDataToParent={handleSkillingChildData}
                          />
                        )}

                      {formvalues2.type === "Skilling" &&
                        Validation === true && (
                          <ValidationForm
                            handleValidationClose={handleValidationClose}
                          />
                        )}

                      {formvalues2.type === "Conferences" &&
                        Validation === false && (
                          <ConferencesForm
                            isLoading={isformSubmit}
                            formvalues={formvalues7}
                            setFormValues={setFormValues7}
                            setValidation={setValidation}
                            setFileupload={setFileupload}
                            handleSubmit={handleConferenceSubmit}
                            isAcquiredEdit={isAcquiredEdit}
                            handleModalClose={handleModalClose}
                            sendconfToParent={handleConfChildData}
                          />
                        )}

                      {formvalues2.type === "Conferences" &&
                        Validation === true && (
                          <ValidationForm
                            handleValidationClose={handleValidationClose}
                          />
                        )}

                      {/* form 4,5,6 */}
                      {formvalues2.type === "Training" &&
                        Validation === false && (
                          <>
                            <TrainingHistory
                              isLoading={isformSubmit}
                              formvalues={formvalues4}
                              setFormValues={setFormValues4}
                              setValidation={setValidation}
                              setFileupload={setFileupload}
                              handleSubmit={handleTranSkillConfSubmit}
                              disabled={isAddingTranSkillConf}
                              isTransSkillCertEdit={isAcquiredEdit}
                              sendTrainingToParent={handleTrainingChildData}
                            />
                          </>
                        )}

                      {formvalues2.type === "Training" &&
                        Validation === true && (
                          <ValidationForm
                            handleValidationClose={handleValidationClose}
                          />
                        )}

                      {/* form 7  */}
                      {formvalues2.type === "Others" && (
                        <>
                          <div className="mt-1">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel ===
                                    "IfOthersPleaseSpecify"
                                ) || {}
                              ).mvalue || "nf If others please Specify "}
                            </label>
                            <input
                              type="text"
                              className="form-control bg-body-tertiary "
                              id="exampleFormControlInput1"
                              placeholder=""
                              value={others}
                              onChange={(e) => setOthers(e.target.value)}
                            />
                          </div>
                          <div className="modal-footer d-flex justify-content-end mt-1 my-0 py-0 pt-1   ">
                            <div className="d-flex gap-1 ">
                              <div data-bs-dismiss="modal">
                                <SecondaryBtn
                                  label={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Save&Close"
                                      ) || {}
                                    ).mvalue || "nf Save & Close"
                                  }
                                  backgroundColor="#F8F8E9"
                                  color="var(--primary-color)"
                                />
                              </div>
                              <SecondaryBtn
                                label={
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "AddSkill"
                                    ) || {}
                                  ).mvalue || "nf Add Skill"
                                }
                                onClick={handleSubmitDate}
                                backgroundColor="var(--primary-color)"
                                color="#fff"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ backgroundColor: "#", minHeight: "", height: "" }}
          className="container-fluid  h6  "
        >
          <div className="row  gap-0 ">
            <div className=" bg-white px-1 col-lg font-5 fixed-sidebar   rounded ">
              <div
                className="mt-2  rounded-top   "
                style={{
                  backgroundColor:
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "NavBarBgColor"
                      ) || {}
                    ).mvalue || "##000",
                }}
              >
                <div
                  className="text h6 text-center   "
                  style={{
                    padding: "8px 0 ",
                    color:
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "NavBarFontColor"
                        ) || {}
                      ).mvalue || "#FFF",
                  }}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "MySkills"
                    ) || {}
                  ).mvalue || "nf MySkills"}
                </div>
              </div>

              {isAddingSkill ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "38px" }}
                >
                  <ThreeDots width={"30"} height={"10"} />
                </div>
              ) : (
                <div
                  className="input-group mt-2 my-0 py-0  mx-1  "
                  style={{ height: "38px" }}
                >
                  <input
                    type="text"
                    placeholder={
                      isFocused
                        ? ""
                        : (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "AddSkill"
                            ) || {}
                          ).mvalue || "nf AddSkill"
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="form-control h-75  bg-body-tertiary font-6 me-2"
                    value={SkillValue}
                    onChange={(e) => handleChangeSkill(e)}
                  />
                  {/* <button className="input-group-text h-75 my-0 py-0  me-1  "
                                    style={{
                                        backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecBarBgColor') || {}).mvalue || 'var(--primary-color)',
                                        color: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecBarFontColor') || {}).mvalue || '#F7FFDD',
                                        borderStyle: "solid",
                                        height: "38px"
                                    }}
                                    disabled={isAddingSkill}
                                    onClick={handleAddSkill}> +</button> */}
                </div>
              )}

              <div className="d-flex   ">
                {suggestionLoader && (
                  <div
                    className="d-flex justify-content-center align-items-center w-100 mb-1"
                    style={{ height: "10px" }}
                  >
                    {" "}
                    <ThreeDots width={"30"} height={"10"} />{" "}
                  </div>
                )}
              </div>

              <div
                className=" m-0 p-0 text-underline d-flex justify-content-end align-items-center "
                style={{
                  zIndex: "10",
                  textDecoration: "Underline",
                  cursor: "pointer",
                }}
                data-bs-toggle="modal"
                data-bs-target="#pmodal"
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "FindskillsbyOccupation"
                  ) || {}
                ).mvalue || "nf Find skills by Occupation"}
              </div>

              {SkillSuggestions.length > 0 && !isShowOccupationPopup && (
                <div
                  ref={skillSuggestionRef}
                  className="dropdown-menu table-responsive d-flex  font-5     my-0 py-0 mx-1   "
                  style={{
                    maxHeight: "130px",
                    position: "absolute",
                    zIndex: 999,
                  }}
                >
                  <table className="table table-sm d-flex table-hover   px-0  mx-1  py-0    ">
                    <tbody className="font-5" style={{ width: "100%" }}>
                      {/* FOR CREATING NEW SKILL */}
                      {!SkillSuggestions.some(
                        (suggestion) =>
                          suggestion.skillOccupation === SkillValue
                      ) &&
                        isThreeCharacters &&
                        !suggestionLoader && (
                          <tr onClick={() => handleCreateSkill(SkillValue)}>
                            <td
                              style={{ cursor: "pointer" }}
                              onClick={() => setIsShowOccupationPopup(true)}
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Create"
                                ) || {}
                              ).mvalue || "nf Create"}{" "}
                              "{toTitleCase(SkillValue)}"
                            </td>
                          </tr>
                        )}

                      {SkillSuggestions.map((suggestion, index) => (
                        <tr
                          key={index}
                          onClick={() => {
                            // handleSuggestionClick(suggestion)
                            handleAddSkill(
                              suggestion.skillOccupation,
                              suggestion
                            );
                          }}
                          style={{
                            pointerEvents: `${
                              suggestion?.skillOccupation ===
                                "No suggestions found" ||
                              suggestion?.skillOccupation ===
                                "Enter atleast 3 characters"
                                ? "none"
                                : "auto"
                            }`,
                            cursor: `${
                              suggestion?.skillOccupation ===
                                "No suggestions found" ||
                              suggestion?.skillOccupation ===
                                "Enter atleast 3 characters"
                                ? "default"
                                : "pointer"
                            }`,
                          }}
                        >
                          <td className=" ">
                            {suggestion?.occupation &&
                              suggestion.skillOccupation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
                            onClick={() => setIsShowOccupationPopup(false)}
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
                                  (item) => item.elementLabel === "Save&Close"
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
                            onClick={() => setIsShowOccupationPopup(false)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}

              {/* <button onClick={()=>handleScroll()}>scroll</button> */}

              {/* <div className=' table-responsive d-flex  font-5 ' style={{ height: "153px" }} ref={scrollRef}> */}
              {topSkill.status === "loading" ? (
                <>
                  <div
                    class="d-flex justify-content-center align-items-center"
                    style={{ height: "180px" }}
                  >
                    <div
                      class="spinner-border"
                      style={{ width: "5rem", height: "5rem" }}
                      role="status"
                    >
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {topSkill?.data?.length === 0 ? (
                    <div
                      className=" table-responsive d-flex  font-5 "
                      style={{ height: "180px" }}
                    >
                      <div className="d-flex justify-content-center align-items-center h-100 w-100">
                        {/* <h4>Create Your First Course</h4> */}
                        <img
                          src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1710266618/61339543-skill_eevkrv.png"
                          alt=""
                          className="h-100 w-100"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="no-hover p-1 px-2 mb-0 w-100 d-flex justify-content-start align-items-center "
                        style={{ borderBottom: "1px solid gray" }}
                      >
                        <div style={{ width: "20%" }} className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Rank"
                            ) || {}
                          ).mvalue || "nf Rank"}
                        </div>
                        <div
                          className=" fw-bold text-center "
                          style={{ width: "70%" }}
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "SkillName"
                            ) || {}
                          ).mvalue || "nf SkillName"}
                        </div>
                        {/* <th className='text-center  w-100  ' style={{ minWidth: "100%" }}></th> */}
                      </div>

                      <div
                        className=" table-responsive d-flex  font-5 "
                        style={{ height: "153px" }}
                        ref={scrollRef}
                      >
                        <table className="table table-sm d-flex table-hover   ">
                          <tbody
                            className=""
                            style={{ minWidth: "97%", position: "relative" }}
                          >
                            <tr
                              className="no-hover remove-hover p-0"
                              style={{ height: "0px", display: "hidden" }}
                            >
                              <th style={{ width: "22%", height: "0" }}></th>
                              <th
                                className="text-center  w-100  "
                                style={{ minWidth: "100%", height: "0" }}
                              ></th>
                              <th
                                className="text-center  w-100  "
                                style={{ minWidth: "100%", height: "0" }}
                              ></th>
                            </tr>

                            <SortableList />
                            <tr
                              className="no-hover no-border"
                              style={{
                                height: "25px",
                                border: "none",
                                borderBottom: 0,
                              }}
                            >
                              <td className="p-0"></td>
                              <td className="p-0"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="px-2 py-2 font-6 ">
                        <i>
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel ===
                                "DragAndDropToReorderMyskills"
                            ) || {}
                          ).mvalue || "nf Drag And Drop To Reorder Myskills"}
                        </i>
                      </div>
                    </>
                  )}
                </>
              )}
              {/* </div> */}

              {/* premium services */}
              <PremiumServicesOptions setSwitchTab={setSwitchTab} />
              {/* <DemoMulti /> */}
            </div>

            <hr className="vr m-0 p-0" />

            <div
              className="col-lg-7   rounded bg-white  px-1 font-5 overflow-y-auto   "
              style={{ height: contentHeight }}
            >
              {/* change the middle content based on the tab selected main content , premium services , custom analytics */}

              {topSkill?.data?.length == 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100 w-100">
                  <h1>
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "WelcomeToMyST"
                      ) || {}
                    ).mvalue || "nf Welcome to MyST"}
                  </h1>
                </div>
              ) : (
                <>
                  {switchTab === "" && (
                    <>
                      {SkillsApplied.status === "loading" &&
                      SkillsAcquired.status === "loading" ? (
                        <>
                          <div
                            class="d-flex justify-content-center align-items-center"
                            style={{ height: contentHeight }}
                          >
                            <div
                              class="spinner-border"
                              style={{ width: "5rem", height: "5rem" }}
                              role="status"
                            >
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* nav bar for the table */}
                          <div
                            className="d-flex  align-items-center justify-content-between my-2  px-1  py-1   "
                            style={{ minHeight: "30px" }}
                          >
                            <div className="d-flex align-items-center ">
                              {SkillSelected.skillOccupation !== "" && (
                                <>
                                  <div
                                    style={{ height: "25px" }}
                                    className=" px-2 pt-1 font-5  border-0  rounded-pill px-2 pt-1 font-weight-bold"
                                  >
                                    <b>
                                      {(
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel === "Skill"
                                        ) || {}
                                      ).mvalue || "nf Skill"}{" "}
                                      :{" "}
                                    </b>
                                  </div>
                                  <div
                                    style={{
                                      height: "25px",
                                      backgroundColor:
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "NavBarBgColor"
                                          ) || {}
                                        ).mvalue || "##000",
                                      color:
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "NavBarFontColor"
                                          ) || {}
                                        ).mvalue || "##FFFF",
                                    }}
                                    className=" text-white rounded-pill px-2 pt-1 font-5   border-0  "
                                  >
                                    {" "}
                                    {SkillSelected.skillOccupation}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="d-flex gap-2 ">
                              {SkillSelected.skillOccupation !== "" && (
                                <>
                                  <div
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    id="addModalBtn"
                                  >
                                    <SecondaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "AddSkillButton"
                                          ) || {}
                                        ).mvalue || "nf Add"
                                      }
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                    />
                                  </div>

                                  {editEnable ? (
                                    <SecondaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "CancelSkillButton"
                                          ) || {}
                                        ).mvalue || "nf Cancel"
                                      }
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                      onClick={handleCancel}
                                    />
                                  ) : (
                                    <SecondaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "EditSkillButton"
                                          ) || {}
                                        ).mvalue || "nf Edit"
                                      }
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                      onClick={handleEdit}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* accordion two tables */}
                          <div
                            className="accordion     "
                            id="accordionPanelsStayOpenExample"
                          >
                            <div className="accordion-item border-0  mb-2 rounded-top  ">
                              <h2 className="accordion-header py-1  ">
                                <button
                                  className="accordion-button d-block d-lg-flex   py-2   justify-content-between "
                                  onClick={handleAccordion1}
                                  style={{
                                    backgroundColor:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarBgColor"
                                        ) || {}
                                      ).mvalue || "#0000",
                                    color:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarFontColor"
                                        ) || {}
                                      ).mvalue || "#F7FFDD",
                                  }}
                                  type="button"
                                  data-bs-toggle="collapse"
                                >
                                  <div
                                    className="    "
                                    style={{ minWidth: "50%" }}
                                  >
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel ===
                                          "SkillsAppliedTitle"
                                      ) || {}
                                    ).mvalue || "nf Skills Applied"}
                                  </div>
                                  <div style={{ minWidth: "25%" }}>
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Expirience"
                                      ) || {}
                                    ).mvalue || "nf Exp"}{" "}
                                    :{" "}
                                    {SkillSelected.skillAppliedExp
                                      ? DayDifferenceToDynamicView(
                                          SkillSelected.skillAppliedExp
                                        )
                                      : "0"}
                                  </div>
                                  <div className="d-flex gap-1  ">
                                    <PrimaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "SummaryView"
                                          ) || {}
                                        ).mvalue || "nfSummary View"
                                      }
                                      onClick={handleSummaryClick}
                                      statusTab={summaryTab1}
                                    />
                                    <PrimaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "DetailsView"
                                          ) || {}
                                        ).mvalue || "nfDetails View"
                                      }
                                      onClick={handleDetailsSummary}
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                      statusTab={DetailTab1}
                                    />
                                  </div>
                                </button>
                              </h2>
                              <div
                                id="panelsStayOpen-collapseOne"
                                className="accordion-collapse   collapse show"
                              >
                                <div>
                                  {summaryTab1 && (
                                    <div className="accordion-body my-0 py-0 ">
                                      <SkillAppliedSummary
                                        data={SkillsApplied}
                                        editEnable={editEnable}
                                      />
                                    </div>
                                  )}

                                  {DetailTab1 && (
                                    <div className="accordion-body  my-0 py-0">
                                      <SkillAppliedDetailed
                                        data={SkillsApplied}
                                        editEnable={editEnable}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="accordion-item border-0  mb-2 rounded-top ">
                              <h2 className="accordion-header py-1   ">
                                <button
                                  className="accordion-button d-block d-lg-flex   py-2   justify-content-between "
                                  onClick={handleAccordion2}
                                  style={{
                                    backgroundColor:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarBgColor"
                                        ) || {}
                                      ).mvalue || "##000",
                                    color:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarFontColor"
                                        ) || {}
                                      ).mvalue || "##FFFF",
                                  }}
                                  type="button"
                                  data-bs-toggle="collapse"
                                >
                                  <div
                                    className=" "
                                    style={{ minWidth: "50%" }}
                                  >
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel ===
                                          "SkillsAcquiredTitle"
                                      ) || {}
                                    ).mvalue || "nf SkillsAcquired"}
                                  </div>
                                  <div style={{ minWidth: "25%" }}>
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Expirience"
                                      ) || {}
                                    ).mvalue || "nf Exp"}{" "}
                                    :{" "}
                                    {SkillSelected.skillAcquiredExp
                                      ? DayDifferenceToDynamicView(
                                          SkillSelected.skillAcquiredExp
                                        )
                                      : "0"}
                                  </div>
                                  <div className="d-flex gap-1  ">
                                    <PrimaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "SummaryView"
                                          ) || {}
                                        ).mvalue || "nf Summary View"
                                      }
                                      onClick={handleSummaryClick1}
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                      statusTab={summaryTab2}
                                    />
                                    <PrimaryBtn
                                      label={
                                        (
                                          content[selectedLanguage]?.find(
                                            (item) =>
                                              item.elementLabel ===
                                              "DetailsView"
                                          ) || {}
                                        ).mvalue || "nf Details View"
                                      }
                                      onClick={handleDetailsSummary1}
                                      backgroundColor="#F7FFDD"
                                      color="var(--primary-color)"
                                      statusTab={DetailTab2}
                                    />
                                  </div>
                                </button>
                              </h2>
                              <div
                                id="panelsStayOpen-collapseTwo"
                                className="accordion-collapse collapse show"
                              >
                                <div>
                                  {summaryTab2 && (
                                    <div className="accordion-body  my-0 py-0">
                                      <SkillAcquiredSummary
                                        data={SkillsAcquired.data}
                                        editEnable={editEnable}
                                        edit={handleAcquiredEdit}
                                      />
                                    </div>
                                  )}
                                  {DetailTab2 && (
                                    <div className="accordion-body  my-0 py-0">
                                      <SkillAcquiredDetail
                                        data={SkillsAcquired.data}
                                        editEnable={editEnable}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* end two tables */}
                        </>
                      )}
                    </>
                  )}

                  {switchTab === "viewOpp" && (
                    <>
                      <ViewOpportunities />
                    </>
                  )}

                  {/* VIEW COURSES */}
                  {switchTab === "viewCourses" && (
                    <>
                      <ViewCourses />
                    </>
                  )}

                  {switchTab === "premium" && (
                    <>
                      <button
                        className="input-group-text  mt-2   ms-1 primary-green "
                        style={{
                          backgroundColor: "#",
                          color: "var(--primary-color)",
                          borderStyle: "solid",
                          borderColor: "",
                        }}
                        onClick={() => setSwitchTab("")}
                      >
                        back
                      </button>
                      <PremiumService />
                    </>
                  )}

                  {switchTab === "customAnalytics" && (
                    <>
                      <button
                        className="input-group-text  mt-2    ms-1 primary-green "
                        style={{
                          backgroundColor: "#",
                          color: "var(--primary-color)",
                          borderStyle: "solid",
                          borderColor: "",
                        }}
                        onClick={() => setSwitchTab("")}
                      >
                        back
                      </button>
                      <CustomAnalyticsPS />
                    </>
                  )}
                </>
              )}
            </div>

            <hr className="vr m-0 p-0" />

            <div className="col-lg   rounded bg-white px-1 font-5 fixed-sidebar">
              <RightSideBar />
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <div className=" d-none d-print-block  ">
        <ResumeTemplate />
      </div>
    </div>
  );
};

export default SkillProfileDashboard;
