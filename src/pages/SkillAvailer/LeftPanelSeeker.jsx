import React, { useEffect, useRef, useState } from "react";
import SecondaryBtn from "../../components/Buttons/SecondaryBtn";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import CreateSelectInRequirements from "../../components/SkillAvailer/CreateSelectInRequirements";
import { useDispatch } from "react-redux";
import { showWarningToast } from "../../components/ToastNotification/showWarningToast";
import { fetchUsersBasedOnSkillSearch } from "../../api/SkillSeeker/fetchUsersBasedOnSkillSearch";
import { fetchUsersBasedPreAbtainOnSkillSearch } from "../../api/SkillSeeker/fetchUsersBasedPreAbtainOnSkillSearch";
import {
  emptyMyReqSkills,
  setMyReqSkills,
} from "../../reducer/SkillSeeker/SkillBasedSearch/MyRequirementSkillSlice";
import {
  emptyMyRefinedSkills,
  setMyRefinedLocations,
  setMyRefinedSkills,
} from "../../reducer/SkillSeeker/SkillBasedSearch/RefMyRequirementsSkillSlice";
import { ThreeDots } from "react-loader-spinner";
import { debouncedSendRequest } from "../../components/DebounceHelperFunction/debouncedSendRequest";
import {
  emptySkillSearchResult,
  setSkillsInSearch,
  updateSearchMode,
  updateSelectedMode,
} from "../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice";
import { daysConvertor } from "../../components/SkillAvailer/DaysConvertorsFunc";
import RefMySkillCard from "../../components/SkillAvailer/SeekerSearchComponents/SkillAndRequirementBox/RefMySkillCard";
import MyRequirementSkillSection from "../../components/SkillAvailer/SeekerSearchComponents/MyRequirementComponent/MyRequirementSkillSection";
import SaveSearchModal from "../../components/SkillAvailer/Popup Modal/SaveSearchModal";
import { showSuccessToast } from "../../components/ToastNotification/showSuccessToast";
import PostApiJds from "../../api/PostData/PostApiJd";
import useContentLabel from "../../hooks/useContentLabel";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import PostApi from "../../api/PostData/PostApi";
import createNewCourse from "../../api/SkillingAgency/createNewCourse";
import { FormatDateIntoPost } from "../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { formatTimestampToDate } from "../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import createPrerequisiteSkills from "../../api/SkillingAgency/createPrerequisiteSkills";
import { timestampToYYYYMMDD } from "../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import DeleteApi from "../../api/DeleteData/DeleteApi";
import {
  setSelectedCourse,
  setSelectedCourseWithData,
} from "../../reducer/skilling agency/search/AgencySavedSearchSlice";
import { fetchAgencySavedSearch } from "../../api/SkillingAgency/fetchAgencySavedSearch";
import { setSelectedJd } from "../../reducer/SkillSeeker/SkillBasedSearch/SavedSearchSlice";
import EditApi from "../../api/editData/EditApi";
import { convertDaysToPhase } from "../../components/SkillAvailer/helperFunction/conversion";
import { GetJdSkillAndQnWithId } from "../../api/SkillSeeker/job detail/GetJdSkillAndQnWithId";
import { unwrapResult } from "@reduxjs/toolkit";
import { fetchUserCourses } from "../../api/SkillingAgency/fetchUserCourses";
import { fetchCourse } from "../../api/SkillSeeker/course detail/fetchCourseDetail";
import {
  sessionDecrypt,
  sessionEncrypt,
} from "../../config/encrypt/encryptData";
import CustomButton from "./../../components/atoms/Buttons/CustomButton";
import { getCookie } from "../../config/cookieService";
import OccupationModal from "../../components/SkillAvailer/OccupationModal";
import createSkillsAttainable from "../../api/SkillingAgency/createSkillsAttainable";

const LeftPanelSeeker = ({ contentHeight, hideSearchBox }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contentLabel = useContentLabel();
  const { pathname, search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const skillSuggestionRef = useRef(null);
  const { selectedCourse } = useSelector((state) => state.agencySavedSearch);
  const { SelectedJd } = useSelector((state) => state.SavedSearchSlice);

  //store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  //search results
  const { searchMode, selectedMode } = useSelector(
    (state) => state.SkillBasedResult
  );
  //my requiremnet
  const MyRequirement = useSelector((state) => state.MyRequirement);
  //refine my req
  const RefMyRequirements = useSelector((state) => state.RefMyRequirements);
  //Regional country Data
  const regionalData = useSelector((state) => state.regionalData);

  // Compare the refinedLocations and  jobLocation  return t/f if they are different
  const changeInLocation = (() => {
    // Check if locationsInRefined is available and contains locations
    const refinedLocations =
      RefMyRequirements?.locationsInRefined?.length > 0
        ? RefMyRequirements.locationsInRefined
            .map((data) => data.value)
            .join(", ")
        : ""; // If no locations found, use empty string for comparison

    // Get jobLocation from SelectedJd, fallback to empty string if not present
    const jobLocation = SelectedJd?.jobLocation || "";

    // Compare the two and return true if they are different
    return refinedLocations !== jobLocation;
  })();

  //auto hides popups
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        skillSuggestionRef.current &&
        !skillSuggestionRef.current.contains(event.target)
      ) {
        setSkillSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [skillSuggestionRef]);

  useEffect(() => {
    const isReloaded = sessionStorage.getItem("isReloaded");

    if (isReloaded) {
      // If this is not the first load, navigate to a different route
      if (getCookie("USER_ROLE") === "R3") {
        navigate("/skilling-agency/Skill-Search/Access-Database"); // Replace with your desired route
      } else if (getCookie("USER_ROLE") === "R2") {
        navigate("/skill-seeker/Skill-Search/Database-Access"); // Replace with your desired route
      }
      //Add code for seeker
    } else {
      // Set the flag in session storage to indicate the page has been loaded
      sessionStorage.setItem("isReloaded", sessionEncrypt("true"));
    }

    // Cleanup function to reset the flag if needed (optional)
    return () => {
      // Uncomment the following line if you want to reset the state on component unmount
      sessionStorage.removeItem("isReloaded");
    };
  }, [navigate]);

  const setSearchMode = (data) => {
    dispatch(updateSearchMode(data));
  };
  const setSelectedMode = (data) => {
    dispatch(updateSelectedMode(data));
  };

  useEffect(() => {
    // console.log(
    //   "RefMyRequirements.locationsInRefined ",
    //   RefMyRequirements.locationsInRefined
    // );
  }, [RefMyRequirements.locationsInRefined]);

  //occupation skills list right bar
  const [occupationRightBox, setOccupationRightBox] = useState([]);
  const [suggestionLoader, setSuggestionLoader] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [exportOptions, setExportOptions] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [skillObj, setSkillObj] = useState({});

  //my reqirements section open close
  const [collapsedMRSection, setCollapsedMRSection] = useState(false);
  const [collapseRefineAccordian, setCollapseRefineAccordian] = useState(true);
  //Suggestions inside skill search
  const [SkillSuggestions, setSkillSuggestions] = useState(false);

  //Handle Save Loading
  const [saveLoading, setSaveLoading] = useState(false);

  //showSave btn
  const [showSave, setShowSave] = useState(false);

  //my req add skill

  //To select data from autosuggestion
  const handleAddASkillSg = (jobTitle) => {
    //  dispatch(fetchCountryRegional());
    //console.log("ee ", jobTitle);
    if (
      !MyRequirement?.skillsInMyReq?.some(
        (skill) => skill.skillOccupation === jobTitle.skill
      )
    ) {
      if (jobTitle) {
        dispatch(
          setMyReqSkills([
            ...MyRequirement?.skillsInMyReq,
            {
              ...jobTitle,
              skillOccupation: jobTitle.skill,
              experienceReq: false,
              minExp: 0,
              maxExp: 0,
              range: "year",
              required: false,
              validated: false,
              TopSkill: false,
              edit: false,

              show: true,
              label: jobTitle.skill,
              value: jobTitle.skill,
            },
          ])
        );

        setJobTitle("");
        setSkillObj({});
        setSkillSuggestions([]);
      } else {
        showWarningToast(
          contentLabel("NoSkillsAvailable", "nf No Skills Available")
        );
      }
    } else {
      showWarningToast(
        contentLabel("SkillAlreadyExists", "nf Skill already exists")
      );
    }
  };

  // auto suggestion for skill
  const handleChangeSkill = (e) => {
    const val = e.target.value;
    setJobTitle(val);
    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setSkillSuggestions([]);
      setSuggestionLoader(true);
      debouncedSendRequest(
        e.target.value,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
    } else {
      setSkillSuggestions([]);
    }
  };

  //api body upadter for my req
  const apiBodyUpdate = () => {
    return new Promise((resolve) => {
      // const mandatorySkills = [];
      // const optionalSkills = [];
      const skills = [];
      let isMandatoryFlag = false;
      //const location = [];
      if (searchMode === 2)
        MyRequirement?.skillsInMyReq?.forEach((skill) => {
          isMandatoryFlag = true;
          if (skill.show === true) {
            skills.push(skill.label);
            isMandatoryFlag = true;
          }
        });
      else {
        MyRequirement?.skillsInMyReq?.map((skill) => {
          // if (skill.show === true) {
          skills.push(skill.label);

          // }
        });
        //after clicking search  in quick search mode,  make all skills show set to true
        // dispatch(setMyReqSkills(MyRequirement?.skillsInMyReq?.map((item, i) => { return { ...item, show: true } })));
      }

      const bod = {
        skills: skills,
        isMandatoryFlag: isMandatoryFlag,
      };
      resolve(bod);
    });
  };

  //api body upadter for my req
  const apiBodyPreAbtainUpdate = () => {
    return new Promise((resolve) => {
      // const mandatorySkills = [];
      // const optionalSkills = [];
      console.log("MyRequired Skillls", MyRequirement, RefMyRequirements);
      const skills = [];
      const notSkills = [];
      let isMandatoryFlag = false;
      //const location = [];
      if (searchMode === 2)
        MyRequirement?.skillsInMyReq?.forEach((skill) => {
          isMandatoryFlag = true;
          if (skill.show === true) {
            if (skill.isAptain) notSkills.push(skill.label);
            else skills.push(skill.label);

            isMandatoryFlag = true;
          }
        });
      else {
        MyRequirement?.skillsInMyReq?.map((skill) => {
          // if (skill.show === true) {
          if (skill.isAptain) notSkills.push(skill.label);
          else skills.push(skill.label);

          // }
        });
        //after clicking search  in quick search mode,  make all skills show set to true
        // dispatch(setMyReqSkills(MyRequirement?.skillsInMyReq?.map((item, i) => { return { ...item, show: true } })));
      }

      const bod = {
        skills: skills,
        notSkills: notSkills,
        isMandatoryFlag: isMandatoryFlag,
      };
      resolve(bod);
    });
  };
  //api body upadter for refine my req
  const apiBodyUpdateForRef = () => {
    return new Promise((resolve) => {
      const mandatorySkills = [];
      const optionalSkills = [];
      const location = [];
      const skills = [];
      const notSkills = []; // 👈 new array
      let isMandatoryFlag = false;
      if (selectedMode === 2)
        RefMyRequirements?.skillsInRefined?.forEach((skill) => {
          if (skill.show === true) {
            isMandatoryFlag = true;

            if (skill.isAptain) {
              // 👈 treat as NOT skill
              notSkills.push(skill.skillOccupation);
            } else {
              skills.push({
                skill: skill.skillOccupation,
                topRank: skill.TopSkill ? "Yes" : "No",
                validated: skill.validated ? "Yes" : "No",
                exp_req: skill.experienceReq ? "Yes" : "No",
                exp_min: daysConvertor(skill.range, skill.minExp),
                exp_max: daysConvertor(skill.range, skill.maxExp),
              });
            }
          }
        });
      else {
        RefMyRequirements?.skillsInRefined?.forEach((skill) => {
          if (skill.show === true) {
            if (skill.isAptain) {
              notSkills.push(skill.skillOccupation);
            } else {
              skills.push({
                skill: skill.skillOccupation,
                topRank: skill.TopSkill ? "Yes" : "No",
                validated: skill.validated ? "Yes" : "No",
                exp_req: skill.experienceReq ? "Yes" : "No",
                exp_min: daysConvertor(skill.range, skill.minExp),
                exp_max: daysConvertor(skill.range, skill.maxExp),
              });
            }
          }
        });
      }

      RefMyRequirements?.locationsInRefined?.forEach((loc) => {
        location.push(loc.value);
      });
      const bod = {
        // mandatorySkills: mandatorySkills,
        // optionalSkills: optionalSkills,
        skills: skills,
        notSkills: notSkills, // 👈 include in API body
        isMandatoryFlag: isMandatoryFlag,
        location: location,
      };
      //    console.log("bod ", bod);
      resolve(bod);
    });
  };

  //function copies my req skill list to refine skill list
  const copyMyReqSkillsToRefine = () => {
    //const updatedSkillFilterRef = MyRequirement?.skillsInMyReq?.filter(item => item.isAptain !== true).map(
    const updatedSkillFilterRef = MyRequirement?.skillsInMyReq?.map(
      (skill) => ({
        ...skill,
        value: skill.skillOccupation,
        label: skill.skillOccupation,
        show: searchMode === 1 ? true : skill.show,
        // Add other properties as needed

        ...(skill.isAptain && {
          TopSkill: false,
          topSkill: "No",
          maxExp: 0,
          minExp: 0,
          validated: false,
          skillValidation: "No",
          isMandatory: "No",
          experienceReq: false,
          yoeMax: "0",
          yoeMin: "0",
        }),
      })
    );
    const updatedLocationFilterRef = MyRequirement?.MyRequirement?.map(
      (location) => ({
        value: location.value,
        label: location.value,
        show: true,
        // Add other properties as needed
      })
    );

    // dispatch(setMyRefinedLocations(updatedLocationFilterRef || []));
    dispatch(setMyRefinedSkills(updatedSkillFilterRef));
    dispatch(setSkillsInSearch(updatedSkillFilterRef));
  };

  //clicking on search button
  const handleSkillSearch = async () => {
    // console.log(regionalData?.listOfCountries);
    let bod = {
      body: "",
      title: "getUserIdsBasedOnSkills",
      start: 0,
      size: 50,
      sortField: "createdTime",
      sortOrder: "desc",
    };
    if (MyRequirement?.skillsInMyReq?.length === 0) {
      showWarningToast(
        contentLabel("PleaseEnterASkill", "nf Please enter a Skill")
      );
      return;
    }
    try {
      bod.body = await apiBodyPreAbtainUpdate();

      //api caller
      dispatch(fetchUsersBasedPreAbtainOnSkillSearch(bod)).then((res) => {
        const collapseTwo = document.getElementById(
          "panelsStayOpen-collapseTwo"
        );

        setCollapsedMRSection(true);
        setCollapseRefineAccordian(false);
        copyMyReqSkillsToRefine(); // copies my req skills to refine my requiremnets

        collapseTwo.classList.remove("collapse");
        collapseTwo.classList.add("show");
        setSelectedMode(searchMode);
        hideSearchBox();
      });
    } catch (error) {
      console.error("Error:", error);
      hideSearchBox();
    }
  };
  const experienceMismatchChecker = (array) => {
    for (let a = 0; a < array.length; a++) {
      let skilly = array[a];
      // console.log("---------------skily", skilly.minExp > skilly.maxExp);
      // console.log("---------------skily", skilly);
      if (skilly.experienceReq) {
        if (skilly.minExp > skilly.maxExp) {
          // console.log("breaked ", skilly.minExp > skilly.maxExp);
          return false;
        }
      }
    }

    return true;
  };
  // go button handler
  const handleGo = async () => {
    let bod = {
      body: "",
      title: "getUserIdsBasedOnSkillsWithConditions",
      start: 1,
      size: 50,
      sortField: "createdTime",
      sortOrder: "desc",
    };
    //checking for any experience mismatch in the skill requirments
    if (experienceMismatchChecker(RefMyRequirements.skillsInRefined)) {
      try {
        // convert the ui skills to api supported json body
        bod.body = await apiBodyUpdateForRef();

        //api caller
        dispatch(fetchUsersBasedOnSkillSearch(bod)).then((res) => {
          dispatch(
            setSkillsInSearch(
              RefMyRequirements?.skillsInRefined?.map((skill) => ({
                ...skill,
                value: skill.skillOccupation,
                label: skill.skillOccupation,
                // Add other properties as needed
              }))
            )
          );
          hideSearchBox();
        });
      } catch (error) {
        console.error("Error:", error);
        hideSearchBox();
      }
    } else {
      showWarningToast(
        contentLabel("ExperienceMismatch", "nf Experience mismatch")
      );
    }
  };

  useEffect(() => {
    if (queryParams.get("Saved")) {
      // console.log("ref my req ", RefMyRequirements?.skillsInRefined);
      // Check if there are post elements (new skills not in JdSkills)
      const hasPostElements =
        RefMyRequirements?.skillsInRefined?.some(
          (obj1) =>
            !SelectedJd?.JdSkills?.some(
              (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
            )
        ) || false;

      // Check if there are delete elements (skills in JdSkills but not in skillsInRefined)
      const hasDeleteElements =
        SelectedJd?.JdSkills?.some(
          (obj1) =>
            !RefMyRequirements?.skillsInRefined?.some(
              (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
            )
        ) || false;

      // Check if there are edited elements (skills that exist in both and have isEdit set to true)
      const hasEditedElements =
        RefMyRequirements?.skillsInRefined?.some(
          (obj1) =>
            SelectedJd?.JdSkills?.some(
              (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
            ) && obj1?.isEdit
        ) || false;
      // Check if there is change in location

      const locationChange = changeInLocation;
      // If there is a change, set the state to true

      // Set show button to true if any of the conditions are true
      if (
        hasPostElements ||
        hasDeleteElements ||
        hasEditedElements ||
        locationChange
      ) {
        setShowSave(true);
      } else {
        setShowSave(false); // Optionally reset to false if no changes are detected
      }

      // console.log("change In Locaion:", locationChange);
      // console.log("Has Post Elements:", hasPostElements);
      // console.log("Has Delete Elements:", hasDeleteElements);
      // console.log("Has Edited Elements:", hasEditedElements);
    }
  }, [RefMyRequirements]);

  useEffect(() => {
    console.log("my req ", MyRequirement);
  }, [MyRequirement]);

  useEffect(() => {
    console.log("ref my req ", RefMyRequirements);
  }, [RefMyRequirements]);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Initialize checkbox state based on RefMyRequirements.locationsInRefined
    if (RefMyRequirements?.locationsInRefined) {
      const remoteLabelIndex = RefMyRequirements.locationsInRefined.findIndex(
        (location) => location.label === "Remote"
      );
      setIsChecked(remoteLabelIndex !== -1);
    }
  }, [RefMyRequirements]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    //  console.log("Remote--- ", checked);

    if (checked) {
      const remoteLabelIndex = RefMyRequirements?.locationsInRefined?.findIndex(
        (location) => location.label === "Remote"
      );
      //console.log("Remote ", remoteLabelIndex);
      if (remoteLabelIndex === -1) {
        dispatch(
          setMyRefinedLocations([
            ...(RefMyRequirements.locationsInRefined || []),
            { value: "Remote", label: "Remote" },
          ])
        );
      } else {
        dispatch(
          setMyRefinedLocations([
            ...(RefMyRequirements.locationsInRefined || []),
            { value: "Remote", label: "Remote" },
          ])
        );
      }
    } else {
      const onlineRemover = RefMyRequirements?.locationsInRefined?.filter(
        (location) => location.label !== "Remote"
      );
      //console.log("Online remove ", onlineRemover);
      dispatch(setMyRefinedLocations(onlineRemover));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleRemoveListOfMyReqSkill = (e) => {
    // console.log(e.target.id);
    // remove from list of skills

    //setRefineSkillFilter(RefineSkillFilter.map((item, i) => i === parseInt(e.target.id) ? { ...item, show: !item.show } : item));

    dispatch(
      setMyRefinedSkills(
        MyRequirement?.skillsInMyReq?.map((item, i) =>
          i === parseInt(e.target.id) ? { ...item, show: !item.show } : item
        )
      )
    );
  };

  //occupation skill populate

  const occSkillPopulate = () => {
    if (MyRequirement?.skillsInMyReq?.length > 0) {
      setOccupationRightBox(MyRequirement?.skillsInMyReq);
    }
  };
  const navigateTo = () => {
    navigate("/skill-seeker/Opportunities");
  };

  //Save Search Modal State and Functions
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [postLoading, setPostLoading] = useState(false); // postLoading

  const handleClose = () => {
    setModalOpen(false);
  };

  const formValidate = (data) => {
    // Check mandatory fields
    const mandatoryFields = ["title", "description"];

    for (let field of mandatoryFields) {
      if (!data[field] || data[field].toString().trim() === "") {
        // console.log(`${field} is required`);
        return false;
      }
    }

    // if (skills && !skills.length > 0) {
    //     console.log('no skills added');
    //     return false;
    // }

    return true;
  };

  const handlePost = async (data) => {
    // console.log({
    //   ...data,
    //   numSkills: RefMyRequirements?.skillsInRefined
    //     ? RefMyRequirements?.skillsInRefined.length
    //     : 0,
    //   jdsType: "SEARCH",
    //   userId:getCookie("userId"),
    //   // jobLocation: data.jobLocation && data.jobLocation.map(data => data.value).join(", "),
    //   mlanguage: getCookie("HLang"),
    // });

    const postBody = {
      numSkills: RefMyRequirements?.skillsInRefined
        ? RefMyRequirements?.skillsInRefined.length
        : 0,
      jdsType: "SEARCH",
      userId: getCookie("userId"),
      // jobLocation: data.jobLocation && data.jobLocation.map(data => data.value).join(", "),
      mlanguage: getCookie("HLang"),
      description: data.description.length > 0 ? data.description : "-",
      title: data.title,
      jobLocation:
        RefMyRequirements.hasOwnProperty("locationsInRefined") &&
        RefMyRequirements.locationsInRefined.length > 0
          ? RefMyRequirements.locationsInRefined
              .map((data) => data.value)
              .join(", ")
          : "",
    };

    if (formValidate(postBody) || true) {
      try {
        let savedSearchTemp = {};
        let skillsTemp = [];
        setPostLoading(true);
        let res = await PostApiJds("sendJd", postBody);
        // console.log(res);

        // console.log("JD posted successfully", res.data);
        // console.log("JD posted successfully", postBody);

        // Show success toast for JD posting
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SearchSaved"
            ) || {}
          ).mvalue || "nf Search Saved"
        );
        savedSearchTemp = res.data;
        const newId = res.data.id;

        //         // Posting skills
        const postSkills = RefMyRequirements?.skillsInRefined?.map(
          async (obj) => {
            try {
              const secondRes = await PostApi("JDSkills", {
                topSkill: obj.TopSkill ? "Yes" : "No",
                occupation: obj.occupation,
                skillOccupationId: obj.occupationId,
                skill: obj.skill,
                jdType: "Optional",
                skillValidation: obj.validated === true ? "Yes" : "No",
                topFive: obj.topSkill === true ? "Yes" : "No",
                yoePhase: obj.range,
                skillOccupation: obj.skillOccupation,
                jid: newId,
                yoeMax: daysConvertor(obj.range, obj.maxExp),
                yoeMin: daysConvertor(obj.range, obj.minExp),
              });

              console.log(
                "Successfully posted to JDSkills table",
                secondRes.data
              );
              skillsTemp.push(secondRes.data);
            } catch (secondErr) {
              console.error("Error posting to JDSkills table", secondErr);
              throw secondErr;
            }
          }
        );

        await Promise.all(postSkills);

        //         // Show success or error toast for skills posting

        //         showSuccessToast((
        //             content[selectedLanguage]?.find(
        //                 (item) => item.elementLabel === "SkillsPostedSuccessfully"
        //             ) || {}
        //         ).mvalue || "nf Skills Posted Successfully");

        //         // Final cleanup
        setPostLoading(false);
        savedSearchTemp["JdSkills"] = skillsTemp;
        // console.log(savedSearchTemp);
        dispatch(setSelectedJd(savedSearchTemp));
        navigate(
          `/skill-seeker/Skill-Search/Database-Access?Title=${
            savedSearchTemp.title
          }&Id=${savedSearchTemp.id}&Saved=${true}`
        );
        handleClear();
        handleClose();
      } catch (err) {
        // console.log(err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "Something went wrong"
        );
        setPostLoading(false);
      }
    } else {
      showErrorToast(
        contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields")
      );
    }
  };
  const handleSaveAsForSeeker = async () => {
    // console.log({
    //     id: queryParams.get("Id"),
    //     numSkills: RefMyRequirements?.skillsInRefined ? RefMyRequirements?.skillsInRefined.length : 0,
    //     userId:getCookie("userId"),
    //     mlanguage:getCookie("HLang"),
    //     jobLocation: RefMyRequirements.locationsInRefined
    //         && RefMyRequirements.locationsInRefined.length > 0
    //         && RefMyRequirements.locationsInRefined.map(data => data.value).join(", "),
    // });

    // Find elements in RefMyRequirements.skillsInRefined that are not in SelectedJd.JdSkills
    const postElements =
      RefMyRequirements?.skillsInRefined?.filter(
        (obj1) =>
          !SelectedJd?.JdSkills?.some(
            (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
          )
      ) || [];

    // Find elements in SelectedJd.JdSkills that are not in RefMyRequirements.skillsInRefined
    const deleteElements =
      SelectedJd?.JdSkills?.filter(
        (obj1) =>
          !RefMyRequirements?.skillsInRefined?.some(
            (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
          )
      ) || [];
    const editedElements =
      RefMyRequirements?.skillsInRefined
        ?.filter((obj1) =>
          SelectedJd?.JdSkills?.some(
            (obj2) => obj1?.skillOccupation === obj2?.skillOccupation
          )
        )
        .filter((obj) => obj.hasOwnProperty("isEdit") && obj.isEdit) || [];

    const locationChange = changeInLocation;

    // console.log(locationChange);
    // console.log(postElements);
    // console.log(deleteElements);
    // console.log(editedElements);

    const putBody = {
      id: queryParams.get("Id"),
      numSkills: RefMyRequirements?.skillsInRefined
        ? RefMyRequirements?.skillsInRefined.length
        : 0,
      userId: getCookie("userId"),
      mlanguage: getCookie("HLang"),
      jobLocation:
        (RefMyRequirements.locationsInRefined &&
          RefMyRequirements.locationsInRefined.length > 0 &&
          RefMyRequirements.locationsInRefined
            .map((data) => data.value)
            .join(", ")) ||
        " ",
    };

    if (queryParams.get("Id")) {
      try {
        setSaveLoading(true);
        // let res = await PostApiJds("sendJd", putBody);
        let res = await EditApi("JDS", putBody.id, putBody);

        // console.log("search saved successfully", res.data);

        const newId = putBody.id;

        // Posting skills
        const postSkills = postElements?.map(async (obj) => {
          // console.log("Processing skill:", obj, "Skill ID:", obj.skillid);
          try {
            const secondRes = await PostApi("JDSkills", {
              topSkill: obj.TopSkill ? "Yes" : "No",
              occupation: obj.occupation,
              skillOccupationId: obj.occupationId,
              skill: obj.skill,
              jdType: "Optional",
              skillValidation: obj.validated === true ? "Yes" : "No",
              topFive: obj.TopSkill === true ? "Yes" : "No",
              yoePhase: obj.range,
              skillOccupation: obj.skillOccupation,
              jid: newId,
              yoeMax: daysConvertor(obj.range, obj.maxExp),
              yoeMin: daysConvertor(obj.range, obj.minExp),
            });

            console.log(
              "Successfully posted to JDSkills table",
              secondRes.data
            );
          } catch (secondErr) {
            console.error("Error posting to JDSkills table", secondErr);
            throw secondErr;
          }
        });
        await Promise.all(postSkills);

        const editedSkills = editedElements?.map(async (obj) => {
          try {
            const secondRes = await EditApi("JDSkills", obj.id, {
              occupation: obj.occupation,
              yoeMin: daysConvertor(obj.yoePhase, obj.minExp),
              skillOccupationId: obj.occupationId,
              yoeMax: daysConvertor(obj.yoePhase, obj.maxExp),
              skill: obj.skill,
              jdType: obj.checked ? "Mandatory" : "Optional",
              skillValidation: obj.validated === true ? "Yes" : "No",
              topSkill: obj.TopSkill ? "Yes" : "No",
              yoePhase: obj.yoePhase,
              skillOccupation: obj.skillOccupation,
            });
            console.log(
              "Successfully Edited from JDSkills table",
              secondRes.data
            );
          } catch (secondErr) {
            console.error("Error posting to JDSkills table", secondErr);
            throw secondErr;
          }
        });

        await Promise.all(editedSkills);

        const deletedSkills = deleteElements?.map(async (obj) => {
          try {
            const secondRes = await DeleteApi("JDSkills", obj.id);
            console.log(
              "Successfully Deleted from JDSkills table",
              secondRes.data
            );
          } catch (secondErr) {
            console.error("Error posting to JDSkills table", secondErr);
            throw secondErr;
          }
        });

        await Promise.all(deletedSkills);

        const actionResult = await dispatch(GetJdSkillAndQnWithId(newId));
        const jdSkillData = unwrapResult(actionResult); // Unwrap the result

        // console.log("unwrapResult ", jdSkillData);

        if (jdSkillData?.jdSkillsList?.length) {
          let skillProccesingForReqBox = jdSkillData.jdSkillsList.map(
            (data) => ({
              ...data,
              experienceReq: data.yoeMin !== "0" && data.yoeMax !== "0",
              minExp: convertDaysToPhase(data.yoeMin, data.yoePhase),
              maxExp: convertDaysToPhase(data.yoeMax, data.yoePhase),
              range: data.yoePhase,
              required: false,
              validated:
                data.hasOwnProperty("skillValidation") &&
                data.skillValidation === "Yes",
              TopSkill:
                data.hasOwnProperty("topSkill") && data.topSkill === "Yes",
              edit: false,
              show: true,
              label: data.skillOccupation,
              value: data.skillOccupation,
              skillOccupation: data.skillOccupation,
            })
          );
          dispatch(setMyReqSkills(skillProccesingForReqBox));
          dispatch(setMyRefinedSkills(skillProccesingForReqBox));
        }

        // Show success or error toast for questions posting
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Saved"
            ) || {}
          ).mvalue || "nf Saved"
        );

        // Final cleanup
        setSaveLoading(false);
        handleClear();
      } catch (err) {
        console.log(err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "Something went wrong"
        );
        setSaveLoading(false);
      }
    } else {
      // showErrorToast(contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields"))
    }
  };

  const handlePostForAgency = async (data) => {
    console.log(RefMyRequirements);

    const postBody = {
      numSkills: RefMyRequirements?.skillsInRefined
        ? RefMyRequirements?.skillsInRefined.length
        : 0,
      attachmentUrls: "Search",
      userId: getCookie("userId"),
      mlanguage: getCookie("HLang"),
      courseName: data?.title?.trim() || "-",
      courseDescription:
        data.description.length > 0 ? data?.description?.trim() : "-",
      courseLanguage: "-",
      courseStatus: "DRAFT",
      location:
        RefMyRequirements?.locationsInRefined
          ?.map((loc) => loc.label)
          .join(", ") || "-",
      price: `-`,
      currency: "-",
      courseStartingDate: FormatDateIntoPost(
        timestampToYYYYMMDD(new Date().getMilliseconds())
      ),
      durationNumber: 0,
      durationPhase: "-",
      skillerName: "-",
      skillerBio: "-",
      prerequisiteSkills: "NA",
      skillsAttainable: "NA",
    };

    if (formValidate(postBody) || true) {
      try {
        setPostLoading(true);
        let res = await createNewCourse("User Courses", postBody);
        // console.log("course posted successfully", res.data);
        // Show success toast for JD posting
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "RecordCreated"
            ) || {}
          ).mvalue || "nf Record Created"
        );

        const newId = res.data.id;

        // Posting prerequisite skills
        const postSkills = RefMyRequirements?.skillsInRefined
          ?.filter((obj) => !obj.isAptain)
          ?.map(async (obj) => {
            try {
              const secondRes = await createPrerequisiteSkills([
                {
                  skillId: obj.skillOccupation,
                  isMandatory: obj?.show === true ? "Yes" : "No",
                  mlanguage: getCookie("HLang"),
                  userId: getCookie("userId"),
                  userCourseId: newId,
                  skillValidation: obj.validated === true ? "Yes" : "No",
                  topSkill: obj.TopSkill === true ? "Yes" : "No",
                  yoePhase: obj.range,
                  skillOccupation: obj.skillOccupation,
                  yoeMax: daysConvertor(obj.range, obj.maxExp),
                  yoeMin: daysConvertor(obj.range, obj.minExp),
                },
              ]);

              console.log(
                "Successfully posted to prerequisiteSkills table",
                secondRes.data
              );
            } catch (secondErr) {
              console.error(
                "Error posting to prerequisiteSkills table",
                secondErr
              );
              throw secondErr;
            }
          });
        await Promise.all(postSkills);

        // Posting prerequisite skills
        const postSkillsAttainable = RefMyRequirements?.skillsInRefined
          ?.filter((obj) => obj.isAptain)
          ?.map(async (obj) => {
            try {
              const secondRes = await createSkillsAttainable([
                {
                  skillId: obj.skillOccupation,
                  mlanguage: getCookie("HLang"),
                  userId: getCookie("userId"),
                  userCourseId: newId,
                  skillOccupation: obj.skillOccupation,
                },
              ]);

              console.log(
                "Successfully posted to Skills Attainable table",
                secondRes.data
              );
            } catch (secondErr) {
              console.error(
                "Error posting to Skills Attainable table",
                secondErr
              );
              throw secondErr;
            }
          });
        await Promise.all(postSkillsAttainable);

        setPostLoading(false);
        handleClear();
        handleClose();
      } catch (err) {
        console.log(err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "Something went wrong"
        );
        setPostLoading(false);
      }
    } else {
      showErrorToast(
        contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields")
      );
    }
  };

  const handleSaveSearchForAgency = async () => {
    const prerequisiteSkills = RefMyRequirements?.skillsInRefined?.filter(
      (skill) => !skill?.isAptain
    );
    const attainableSkills = RefMyRequirements?.skillsInRefined?.filter(
      (skill) => skill?.isAptain
    );

    /////////////////////////////////PREREQUISITE SKILL/////////////////////////////////////////////////////
    const prerequisiteSkillsPostAndEdit = prerequisiteSkills?.map((obj1) => {
      const matched = selectedCourse?.preRequisiteSkillsList?.find(
        (obj2) => obj1?.skillOccupation === obj2?.skillId
      );
      return matched
        ? {
            skillId: obj1.skillOccupation,
            isMandatory: obj1?.show === true ? "Yes" : "No",
            mlanguage: getCookie("HLang"),
            userId: getCookie("userId"),
            userCourseId: queryParams.get("courseId"),
            skillValidation: obj1.validated === true ? "Yes" : "No",
            topSkill: obj1.TopSkill === true ? "Yes" : "No",
            yoePhase: obj1.range,
            skillOccupation: obj1.skillOccupation,
            yoeMax: daysConvertor(obj1.range, obj1.maxExp),
            yoeMin: daysConvertor(obj1.range, obj1.minExp),
            id: matched.id, // include id only if found
          }
        : {
            skillId: obj1.skillOccupation,
            isMandatory: obj1?.show === true ? "Yes" : "No",
            mlanguage: getCookie("HLang"),
            userId: getCookie("userId"),
            userCourseId: queryParams.get("courseId"),
            skillValidation: obj1.validated === true ? "Yes" : "No",
            topSkill: obj1.TopSkill === true ? "Yes" : "No",
            yoePhase: obj1.range,
            skillOccupation: obj1.skillOccupation,
            yoeMax: daysConvertor(obj1.range, obj1.maxExp),
            yoeMin: daysConvertor(obj1.range, obj1.minExp),
          }; // no id key if not found
    });

    const prerequisiteSkillsDelete = [
      ...(selectedCourse?.preRequisiteSkillsList?.filter(
        (obj1) =>
          !prerequisiteSkills?.some(
            (obj2) => obj1?.skillId === obj2?.skillOccupation
          )
      ) || []),
    ];

    console.log("reff", RefMyRequirements?.skillsInRefined);
    console.log("postElements", prerequisiteSkillsPostAndEdit);
    console.log("deleteElements", prerequisiteSkillsDelete);

    /////////////////////////////////SKILLS ATTAINABLE/////////////////////////////////////////////////////
    const attainableSkillsPostAndEdit = attainableSkills?.map((obj1) => {
      const matched = selectedCourse?.attainableSkillsList?.find(
        (obj2) => obj1?.skillOccupation === obj2?.skillId
      );
      return matched
        ? {
            skillId: obj1.skillOccupation,
            mlanguage: getCookie("HLang"),
            userId: getCookie("userId"),
            userCourseId: queryParams.get("courseId"),
            skillOccupation: obj1.skillOccupation,
            id: matched.id, // include id only if found
          }
        : {
            skillId: obj1.skillOccupation,
            mlanguage: getCookie("HLang"),
            userId: getCookie("userId"),
            userCourseId: queryParams.get("courseId"),
            skillOccupation: obj1.skillOccupation,
          }; // no id key if not found
    });

    const attainableSkillsDelete = [
      ...(selectedCourse?.attainableSkillsList?.filter(
        (obj1) =>
          !attainableSkills?.some(
            (obj2) => obj1?.skillId === obj2?.skillOccupation
          )
      ) || []),
    ];

    console.log("reff", RefMyRequirements?.skillsInRefined);
    console.log("postElements", attainableSkillsPostAndEdit);
    console.log("deleteElements", attainableSkillsDelete);

    ////////////////////////////////////////API CALLS////////////////////////////
    try {
      setSaveLoading(true);

      //prerequisite post and edit
      if (prerequisiteSkillsPostAndEdit?.length > 0) {
        try {
          const secondRes = await createPrerequisiteSkills(
            prerequisiteSkillsPostAndEdit
          );
          console.log(
            "Successfully posted to prerequisiteSkills table",
            secondRes.data
          );
        } catch (secondErr) {
          console.error("Error posting to prerequisiteSkills table", secondErr);
          throw secondErr;
        }
      }
      //prerequisite delete
      if (prerequisiteSkillsDelete?.length > 0) {
        const deleteSkills = prerequisiteSkillsDelete?.map(async (obj) => {
          try {
            const secondRes = await DeleteApi(
              "UserCourse Prerequisite",
              obj.id
            );
            console.log(
              "Successfully deleted prerequisiteSkills",
              secondRes.data
            );
          } catch (secondErr) {
            console.error("Error posting to prerequisiteSkills", secondErr);
            throw secondErr;
          }
        });
        await Promise.all(deleteSkills);
      }

      //attainable post and edit
      if (attainableSkillsPostAndEdit?.length > 0) {
        try {
          const secondRes = await createSkillsAttainable(
            attainableSkillsPostAndEdit
          );
          console.log(
            "Successfully posted to attainableSkills table",
            secondRes.data
          );
        } catch (secondErr) {
          console.error("Error posting to attainableSkills table", secondErr);
          throw secondErr;
        }
      }
      //prerequisite delete
      if (attainableSkillsDelete?.length > 0) {
        const deleteSkills = attainableSkillsDelete?.map(async (obj) => {
          try {
            const secondRes = await DeleteApi(
              "UserCourse SkillsAttainable",
              obj.id
            );
            console.log(
              "Successfully deleted attainableSkills",
              secondRes.data
            );
          } catch (secondErr) {
            console.error("Error posting to attainableSkills", secondErr);
            throw secondErr;
          }
        });
        await Promise.all(deleteSkills);
      }

      const editPayload = RefMyRequirements?.locationsInRefined?.map(
        (location) => location?.value?.trim() || ""
      );
      const editCourse = EditApi("User Courses", queryParams?.get("courseId"), {
        location: !!editPayload.length ? editPayload?.join(",") : null,
      });

      const updatedCourse = await fetchCourse(selectedCourse?.id);

      dispatch(
        setSelectedCourseWithData({
          ...updatedCourse?.data,
          preRequisiteSkillsList: updatedCourse?.data?.preRequest?.filter(
            (pre) => pre?.id
          ),
          attainableSkillsList: updatedCourse?.data?.attaiable?.filter(
            (att) => att?.id
          ),
        })
      );

      // Show success or error toast for questions posting
      showSuccessToast(contentLabel("Saved", "nf Saved"));
      // Final cleanup
      setSaveLoading(false);
      handleClear();
    } catch (err) {
      console.log(err);
      showErrorToast(
        contentLabel("SomethingWentWrong", "nf Something Went Wrong")
      );
      setSaveLoading(false);
    }
  };

  const handleClear = () => {
    // dispatch(emptyOpCreate());
  };

  useEffect(() => {
    if (queryParams.get("Saved")) {
      setCollapseRefineAccordian(false);
      setCollapsedMRSection(true);
    } else {
      setCollapseRefineAccordian(true);
      setCollapsedMRSection(false);
    }
  }, [queryParams.get("Saved")]);

  return (
    <div
      className=" px-1 col-lg font-5 "
      style={
        {
          // minHeight: 'var(--cardBodyWithB)'
          // height:'100vh'
          // height:'100%'
        }
      }
    >
      <OccupationModal />
      {/* Save Search Modal */}
      <SaveSearchModal
        PostLoading={postLoading}
        open={modalOpen}
        handleClose={handleClose}
        handlePost={
          pathname.includes("skilling-agency")
            ? handlePostForAgency
            : handlePost
        }
      />

      {/* {
                Object.keys(jdStore.SelectedJd).length > 1 && queryParams.get("jId") &&
                <div className='d-flex mb-1 mt-1 ms-2  ' >
                    <FaAngleLeft size={22} />  <p className='  text-decoration-underline fw-bold me-1 ' onClick={navigateTo} >My Opportunities</p>   <FaAngleLeft size={22} /> <p className='ms-1  text-decoration-underline fw-bold' onClick={navigateTo}  > {jdStore.SelectedJd.title} </p>
                </div>
            }
            {
                queryParams.get("courseId") && queryParams.get("courseName") &&
                <div className='d-flex mb-1 mt-1 ms-2  '>
                    <FaAngleLeft size={22} />  <p className='  text-decoration-underline fw-bold me-1 ' onClick={() => navigate('/skilling-agency/my-courses')} >My Courses</p>   <FaAngleLeft size={22} /> <p className='ms-1  text-decoration-underline fw-bold' onClick={() => navigate('/skilling-agency/my-courses')}> {queryParams.get("courseName")} </p>
                </div>
            } */}

      <div
        class="accordion accordion-flush mb-5 mt-2"
        id="accordionPanelsStayOpenExample"
      >
        <div class="accordion-item  card ">
          <div class="text-center">
            <h2 class="accordion-header  text-center ">
              <button
                class="accordion-button  font-5  text-center d-flex"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseOne"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseOne"
                onClick={() => setCollapsedMRSection(false)}
                style={{
                  borderBottom: "solid #DCDCDC 1px",
                  backgroundColor: "#ffff",
                  color: "#000",
                  // backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#fff",
                  // color: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarFontColor') || {}).mvalue || "#000"
                }}
              >
                <label>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "MyRequirements"
                    ) || {}
                  ).mvalue || "nf My Requirements"}
                </label>
              </button>
            </h2>
          </div>

          {/* Version 2 new one */}
          <div
            id="panelsStayOpen-collapseOne"
            class={
              collapsedMRSection
                ? "accordion-collapse collapse"
                : "accordion-collapse show"
            }
            style={{ overflow: "hidden", backgroundColor: "#FFFF" }}
          >
            <div
              class="accordion-body px-0 "
              style={{
                top: "0px",
                backgroundColor: "#FFFF",
                marginLeft: "1rem",
                marginRight: "0.5rem",
              }}
            >
              <>
                <div style={{ position: "relative", width: "100%" }}>
                  <div className="input-group" style={{ height: "40px" }}>
                    <input
                      className="form-control h-75 bg-body-tertiary font-6"
                      type="text"
                      placeholder={
                        isFocused
                          ? ""
                          : (
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "EnterASkillAndClick+"
                              ) || {}
                            ).mvalue || "Enter a Skill and click +"
                      }
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onChange={handleChangeSkill}
                      value={jobTitle}
                    />
                  </div>

                  {/* Suggestion Loader */}
                  {suggestionLoader && (
                    <div className="d-flex mt-1">
                      <ThreeDots width={"30"} height={"10"} />
                    </div>
                  )}

                  {/* Skill suggestion dropdown */}
                  {Array.isArray(SkillSuggestions) &&
                  SkillSuggestions.length > 0 &&
                  !SkillSuggestions[0].dontSelect ? (
                    <div
                      ref={skillSuggestionRef}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 999,
                        maxHeight: "130px",
                        overflowY: "auto",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "0",
                        marginTop: "4px",
                      }}
                    >
                      <table
                        className="table table-sm"
                        style={{
                          margin: 0,
                          width: "100%",
                        }}
                      >
                        <tbody>
                          {SkillSuggestions.map((suggestion, index) => (
                            <tr
                              key={index}
                              onClick={() => handleAddASkillSg(suggestion)}
                              style={{ cursor: "pointer" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f2f2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "white")
                              }
                            >
                              <td style={{ padding: "8px" }}>
                                {suggestion.skill}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    Array.isArray(SkillSuggestions) &&
                    SkillSuggestions.length > 0 &&
                    SkillSuggestions[0]?.dontSelect && (
                      <div
                        ref={skillSuggestionRef}
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 999,
                          maxHeight: "130px",
                          overflowY: "auto",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "0",
                          marginTop: "4px",
                        }}
                      >
                        <table
                          className="table table-sm"
                          style={{
                            margin: 0,
                            width: "100%",
                          }}
                        >
                          <tbody>
                            <tr
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f2f2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "white")
                              }
                            >
                              <td style={{ padding: "8px" }}>
                                {contentLabel(
                                  "NoSkillsAvailable",
                                  "nf No Skills Available "
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>

                {/* occupation btn */}
                <div className="d-flex mb-2 font-5 ">
                  <div className="d-flex justify-content-end w-100 ">
                    <div
                      className=""
                      style={{ textDecoration: "underline" }}
                      onClick={occSkillPopulate}
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "AddSkillsBasedOcc"
                        ) || {}
                      ).mvalue || "nf Add skills based on occupation"}
                    </div>
                  </div>
                </div>

                <MyRequirementSkillSection />

                <div className=" d-flex " style={{ marginTop: "10px" }}>
                  <div
                    className=" d-flex "
                    style={{
                      marginRight: "auto",
                      gap: "2.8rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      <input
                        type="radio"
                        className="form-check-input"
                        id="1"
                        name="1"
                        value="1"
                        checked={searchMode === 1 ? true : false}
                        onClick={() => setSearchMode(1)}
                      ></input>{" "}
                      <label for="QuickSearch">
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Optional"
                          ) || {}
                        ).mvalue || "nf Optional"}
                      </label>
                    </span>
                    <span>
                      <input
                        type="radio"
                        className="form-check-input"
                        id="2"
                        name="2"
                        value="2"
                        checked={searchMode === 2 ? true : false}
                        onClick={() => setSearchMode(2)}
                      ></input>{" "}
                      <label for="ExactSearch">
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Mandatory"
                          ) || {}
                        ).mvalue || "nf Mandatory"}
                      </label>
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div className="flex-end" style={{ marginLeft: "auto" }}>
                    <CustomButton
                      title={
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Search"
                          ) || {}
                        ).mvalue || "nf Search"
                      }
                      onClick={handleSkillSearch}
                    />
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>

        {/* Refine my requirement */}
        <div class="accordion-item   card">
          <h2 class="accordion-header ">
            <button
              class=" accordion-button collapsed  font-5"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseTwo"
              aria-expanded="false"
              aria-controls="panelsStayOpen-collapseTwo"
              onClick={() =>
                setCollapseRefineAccordian(!collapseRefineAccordian)
              }
              style={{
                borderBottom: "solid #DCDCDC 1px",
                backgroundColor: "#ffff",
                color: "#000",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                // backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000",
                //  color: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarFontColor') || {}).mvalue || "#fff"
              }}
            >
              <label>
                {" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "RefineMyReq"
                  ) || {}
                ).mvalue || "nf Refine My Requirement"}
              </label>
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseTwo"
            class={
              collapseRefineAccordian
                ? "accordion-collapse collapse"
                : "accordion-collapse show"
            }
          >
            <div
              class="accordion-body font-5"
              style={{
                backgroundColor: "#FFFF",
              }}
            >
              {/* && RefMyRequirements?.skillsInRefined?.filter(item => item.isAptain !== true)?.length !== 0 */}
              {MyRequirement?.skillsInMyReq?.length !== 0 && (
                <div className="mx-1 ">
                  <div
                    className="mb-2 "
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <label for="exampleFormControlInput1" class="form-label">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Skills"
                        ) || {}
                      ).mvalue || "nf Skills"}
                    </label>
                    <div
                      className="d-flex  mb-2 "
                      style={{
                        fontSize: "12px",
                        color: "var(--primary-color)",
                        fontWeight: "600",
                      }}
                    >
                      <div className="d-flex justify-content-center align-items-center ">
                        <i
                          class="fa fa-star me-1"
                          type="checkbox"
                          style={{ borderColor: "var(--primary-color)" }}
                        />
                        <label for="show">
                          {contentLabel(
                            "CheckForSkillMandatory",
                            "nf Check to make Skill mandatory"
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="mx-0 mb-2 d-flex ms-1 me-2 fw-bold  d-flex flex-column justify-content-center align-items-lg-start">
                      {/* RefMyRequirements?.skillsInRefined?.filter(item => item.isAptain !== true) */}
                      {RefMyRequirements?.skillsInRefined?.map(
                        (skill, index) => (
                          // skill.show === true && (
                          //   <RefMySkillCard skill={skill} index={index} />
                          // )
                          <RefMySkillCard skill={skill} index={index} />
                        )
                      )}
                    </div>
                  </div>

                  <div
                    class="mb-5  mx-1 d-flex  flex-column "
                    style={{ height: "40px" }}
                  >
                    <div className="d-flex ">
                      <div class="mb-1 ">
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Locations"
                          ) || {}
                        ).mvalue || "nf Locations"}
                      </div>
                      <div
                        className="align-items-center d-flex"
                        style={{ marginLeft: "auto" }}
                      >
                        <input
                          type="checkbox"
                          id="remoteCheckbox"
                          checked={isChecked}
                          onChange={handleCheckboxChange}
                        />

                        <label className="mx-2 font-weight-5 ">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Remote"
                            ) || {}
                          ).mvalue || "nf Remote"}
                        </label>
                      </div>
                    </div>
                    <div style={{ marginLeft: "1rem" }}>
                      <CreateSelectInRequirements />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between  ">
                    <div
                      className=" d-flex gap-3"
                      style={{
                        marginRight: "auto",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        <input
                          type="radio"
                          className="form-check-input"
                          id="3"
                          name="3"
                          value="3"
                          checked={searchMode === 1 ? true : false}
                          onClick={() => setSearchMode(1)}
                        ></input>{" "}
                        <label for="QuickSearch">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "QuickSearch"
                            ) || {}
                          ).mvalue || "nf Quick Search"}
                        </label>
                      </span>
                      <span>
                        <input
                          type="radio"
                          className="form-check-input"
                          id="4"
                          name="4"
                          value="4"
                          checked={searchMode === 2 ? true : false}
                          onClick={() => setSearchMode(2)}
                        ></input>{" "}
                        <label for="ExactSearch">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "ExactSearch"
                            ) || {}
                          ).mvalue || "nf Exact Search"}
                        </label>
                      </span>
                    </div>
                  </div>
                  <div
                    style={{}}
                    className="d-flex justify-content-between mt-3 "
                  >
                    <div className="">
                      <CustomButton
                        title={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Go"
                            ) || {}
                          ).mvalue || "Go"
                        }
                        onClick={handleGo}
                      />
                    </div>

                    <div className="mb-1 gap-2 d-flex ">
                      {queryParams.get("Saved") && showSave && (
                        <CustomButton
                          disabled={saveLoading}
                          onClick={() =>
                            pathname.includes("skilling-agency")
                              ? handleSaveSearchForAgency()
                              : handleSaveAsForSeeker()
                          }
                          title={contentLabel("Save", "nf Save")}
                        />
                      )}

                      <CustomButton
                        onClick={() => setModalOpen(true)}
                        title={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "SaveAs"
                            ) || {}
                          ).mvalue || "nf Save As"
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftPanelSeeker;
