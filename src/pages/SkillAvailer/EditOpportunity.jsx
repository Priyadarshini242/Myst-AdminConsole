import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import CustomButton from "../../components/atoms/Buttons/CustomButton";
import Files from "../../components/molecules/Files/Files";
import useContentLabel from "../../hooks/useContentLabel";
import { useDispatch } from "react-redux";
import CreateStepper from "../../components/Steppers/CreateStepper";
import {
  emptyOpEdit,
  removeAttachment,
  setAttachment,
  setData,
  setLoading,
  setLocation,
  setOldAttachments,
  setOpportunityQuestions,
  setOpportunitySkills,
  setOriginalDataInEdit,
  setRemoteCheckBoxForEdit,
} from "../../reducer/SkillSeeker/JdData/OpportunityEditSlice";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import icons from "./../../constants/icons";
import CustomCheckbox from "../../components/atoms/Buttons/CheckBox";
import MultiSelectRemote from "../../components/SkillOwner/HelperFunction/MultiSelectRemote";
import { timestampToYYYYMMDD } from "../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { formatDateInputType } from "../../components/SkillOwner/HelperFunction/FormatDateInputType";
import BriefDescriptionTextArea from "../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { ThreeDots } from "react-loader-spinner";
import SkillSuggestionApi from "../../api/skillOwner/mySkill/SkillSuggestionApi";
import { debouncedSendRequest } from "../../components/DebounceHelperFunction/debouncedSendRequest";
import CreatableSelect from "react-select/creatable";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import OpportunityPreviewPageTemplate from "../../components/SkillAvailer/JDRelatedComponents/OpportunityPreviewPageTemplate";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import PostApi from "../../api/PostData/PostApi";
import { showSuccessToast } from "../../components/ToastNotification/showSuccessToast";
import EditApi from "../../api/editData/EditApi";
import { FormatDateIntoPost } from "../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { daysConvertor } from "../../components/SkillAvailer/DaysConvertorsFunc";
import { fetchUserAttachment } from "../../reducer/attachments/getUserAttachmentSlice";
import DeleteApi from "./../../api/DeleteData/DeleteApi";
import { size } from "lodash";
import { attachLogoToCompany } from "../../reducer/SkillSeeker/JdData/UserCompanyDataSlice";
import { GetCompanyListByUserId } from "../../api/SkillSeeker/GetCompanyListByUserId";
import { sessionDecrypt } from "../../config/encrypt/encryptData";
import DatePickerWidget from "../../components/molecules/Date/DatePickerWidget";
import { getAllCategoryApi } from "../../api/Jd Category, Jd Exp, External sites/getAllCategoryApi";
import { getAllSubCategoryApi } from "../../api/Jd Category, Jd Exp, External sites/getAllSubCategoryApi";
import { GetAllExternalLinksApi } from "../../api/Jd Category, Jd Exp, External sites/GetAllExternalLinksApi";
import { getJdExperienceLevelApi } from "../../api/Jd Category, Jd Exp, External sites/getJdExperienceLevelApi";
import Dropdown1 from "../../components/atoms/Dropdown/Dropdown1";
import CreateSelectOccupation from "../../components/SkillOwner/SelectComponent/CreateSelectOccupation";
import { exceptionPOSTapi } from "../../api/PostData/exceptionsPOSTapi";
import { fetchOccupationMaster } from "../../reducer/masterTables/occupationSlice";
import { LIMITED_SPL_CHARS } from "../../config/constant";
import { timestampToUTCYMD } from "../../components/helperFunctions/DateUtils";
import { compareFieldsOnly } from "../../components/helperFunctions/CompareTwoObjects";
import { fetchEmpType } from "../../reducer/emp type/empTypeSlice";
import { getCookie } from '../../config/cookieService';


const EditOpportunity = () => {

  const [modalVisible, setModalVisible] = useState(false);

  const contentLabel = useContentLabel();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownRefOcc = useRef(null);

  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const regionalData = useSelector((state) => state.regionalData);
  const {
    data,
    remoteCheckBox,
    attachment,
    questions,
    skills,
    postLoading,
    attachmentAdded,
    oldAttachment, originalDataInEdit
  } = useSelector((state) => state.OpportunityEdit);
  const { CompanyList } = useSelector((state) => state.UserCompanyDataSlice);
  const {
    getUserAttachment: { userAttachmentData },
  } = useSelector((state) => state);
  const { subCategories, categories } = useSelector(
    (state) => state.JobCategories
  );
  const { data: emptype, status: emptypeStatus } = useSelector(
    (state) => state.emptype
  );
  //Api callers 
  useEffect(() => {
    const actions = [
      { status: emptypeStatus, action: fetchEmpType }
    ];

    actions.forEach(({ status, action }) => {
      if (status === "idle") {
        dispatch(action());
      }
    });
  }, [
    dispatch,
    emptypeStatus,
  ]);


  const [filterCurrency, setFilterCurrency] = useState([]);
  useEffect(() => {
    if (regionalData?.listOfCountries) {
      const uniqueCurrencies = Array.from(
        new Set(regionalData?.listOfCountries?.map((item) => item?.currency))
      )?.map((currency) => ({
        value: currency,
        label: currency,
      })) || [];

      setFilterCurrency(uniqueCurrencies);
    }
  }, [regionalData]);

  const { externalLinks } = useSelector((state) => state.ExternalLinks);

  const { exprieinceLevelData } = useSelector(
    (state) => state.JdExperienceLevel
  );
  const { data: occupationMasterData, status: occupationmasterStatus } = useSelector((state) => state.occupationRedux);

  const skillIdRef = useRef("");

  const [userCompany, setUserCompany] = useState({});
  const [isSkillSuggestionOpen, setIsSkillSuggestionOpen] = useState(false);
  const [isOccupationSuggestionOpen, setIsOccupationSuggestionOpen] = useState(false);
  const [skillDropdownWidth, setSkillDropdownWidth] = useState("auto");
  const [isShowOccupationPopup, setIsShowOccupationPopup] = useState(false);
  const [isSavingOccupation, setIsSavingOccupation] = useState(false);
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [isNewOccupation, setIsNewOccupation] = useState(false);
  const [categoryDetail, setCategoryDetail] = useState({});
  const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);

  const handleCategoryDetailChange = useCallback((category) => {
    setCategoryDetail(category);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsSkillSuggestionOpen(false);
    }
    if (dropdownRefOcc.current && !dropdownRefOcc.current.contains(event.target)) {
      setIsOccupationSuggestionOpen(false);
      handleClearInputocc();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  //Component states

  /* HANDLE SELECT FILE */
  const handleSelectFile = useCallback((file) => {
    addAttachment([{ ...file }]);
  }, []);

  const addAttachment = (data) => {
    // console.log(data);
    dispatch(setAttachment(data));
  };

  useEffect(() => {
    if (occupationmasterStatus === "idle") {
      dispatch(fetchOccupationMaster());
    }
  }, [dispatch, occupationmasterStatus]);

  useEffect(() => {
    const fetchCompanyList = () => {
      dispatch(GetCompanyListByUserId())
        .then(() => {
          return dispatch(fetchUserAttachment());
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    fetchCompanyList();
    if (categories && categories.length === 0) dispatch(getAllCategoryApi());
    if (subCategories && subCategories.length === 0)
      dispatch(getAllSubCategoryApi());
    if (externalLinks && externalLinks.length === 0)
      dispatch(GetAllExternalLinksApi());
    if (exprieinceLevelData && exprieinceLevelData.length === 0)
      dispatch(getJdExperienceLevelApi());
  }, [dispatch]);
  useEffect(() => {
    const fetchCompanyList = async () => {
      if (userAttachmentData && userAttachmentData.length > 0) {
        dispatch(attachLogoToCompany(userAttachmentData));
      }
    };

    fetchCompanyList();
    if (userAttachmentData && userAttachmentData.length > 0) {
      const linkedAttachment = userAttachmentData.filter((atch) => {
        if (atch.linkedId === data.id) {
          return atch;
        }
      });
      // console.log("lnked attachment for jd ", linkedAttachment);

      dispatch(setOldAttachments(linkedAttachment));
      dispatch(setOriginalDataInEdit({ ...originalDataInEdit, attachment: linkedAttachment }));
    }
  }, [userAttachmentData]);

  useEffect(() => { }, []);
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const typeOptions = [
    {
      value: "FullTime",
      label: contentLabel("FullTime", "nf Full-Time"),
    },
    {
      value: "PartTime",
      label: contentLabel("PartTime", "nf Part-Time"),
    },
    {
      value: "Internship",
      label: contentLabel("Internship", "nf Internship"),
    },
  ];


  const steperSteps = [
    {
      name: contentLabel("OpportunityDefinition", "nf Opportunity Definition"),
      number: 1,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Definition",
      Component: () => <div>step1</div>,
    },
    {
      name: contentLabel(
        "OpportunityDescription",
        "nf Opportunity Description"
      ),
      number: 2,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Description",
      Component: () => <div>step2</div>,
    },
    {
      name: contentLabel("CandidateRequirement", "nf Candidate Requirement"),
      number: 3,
      link: "/skill-seeker/Opportunities/Create/Candidate-Requirement",
      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("ScreeningQuestion", "nf Screening Question"),
      number: 4,
      link: "/skill-seeker/Opportunities/Create/Screening-Question",
      Component: () => <div>step4</div>,
    },
    {
      name: contentLabel("PublishStep", "nf Publish Step"),
      number: 5,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Preview",
      Component: () => <div>step5</div>,
    },
  ];

  //Opportunity Definition

  const [openFile, setOpenFile] = useState(false);

  const handleFileClose = useCallback(() => {
    setOpenFile(false);
  }, []);
  /* HANDLE GALLERY CLOSE */

  useEffect(() => {
    console.log(" EDIT FORM DATA ", data);
  }, [data]);
  useEffect(() => {
    console.log("EDITFORM question ", questions);
  }, [questions]);
  useEffect(() => {
    console.log("EDIT FORM skills ", skills);
  }, [skills]);
  useEffect(() => {
    console.log("EDIT FORM attachment ", attachment);
    console.log("EDIT FORM oldAttachment ", oldAttachment);
  }, [attachment]);
  useEffect(() => {
    console.log("EDIT FORM originalDataInEdit ", originalDataInEdit);
  }, [originalDataInEdit]);

  //functions

  const handleSelectChange = (e) => {
    const selectedOrganization = e.target.value;

    const company = CompanyList.find(
      (company) => company.userOrganization === selectedOrganization
    );
    setUserCompany(company);

    const userCompanyTemp = userCompany || {}; // Assuming userCompanyState is defined elsewhere

    // Prepare the JSON object based on jdType
    let res;
    handleChange("jdCompany", company.userOrganization);
    handleChange("userCompaniesId", company.id);
    const companyId = userCompanyTemp.id || ""; // Use userCompany.id if available
    const jdCompany = userCompanyTemp.userOrganization || ""; // Use userCompany.name if available
  };

  const handleRemoveCompany = () => {
    handleChange("jdCompany", " ");
    handleChange("userCompaniesId", " ");
  };

  const handleCheckboxChange = (e) => {
    // setIsCheckedRemote(!isCheckedRemote);
    const status = e.target.checked;
    // console.log("e ", status);
    dispatch(setRemoteCheckBoxForEdit(status));

    if (status) {
      if (!containsValueInArrOfobj(data.jobLocation, "Remote")) {
        // console.log("trgi when no Remote and  ", status);
        let tempArr = data.jobLocation ? [...data.jobLocation] : [];
        tempArr.push({ label: "Remote", value: "Remote" });
        // console.log(tempArr);
        dispatch(setLocation(tempArr));
      }
    } else {
      if (containsValueInArrOfobj(data.jobLocation, "Remote")) {
        // console.log("trgi when  Remote and  ", status);
        // Create a new array without modifying the original one
        let tempArr = data.jobLocation.filter(
          (location) => location.value !== "Remote"
        );
        dispatch(setLocation(tempArr));
      }
    }
  };

  const untickRemoteCheckBox = (e) => {
    dispatch(setRemoteCheckBoxForEdit(false));
  };

  const delAttachment = () => {
    dispatch(removeAttachment());
  };

  const handlTypeChange = (newValue) => {
    handleChange("jdType", newValue.target.value);
    // console.log(newValue.target.value);
  };

  const handleCurrencyChange = (newValue) => {
    handleChange("currency", newValue?.value);
  };

  const handleChange = (fieldName, value) => {
    dispatch(setData({ fieldName: fieldName, value: value }));
  };

  const containsValueInArrOfobj = (arr, substring) => {
    // console.log(arr);

    return arr.some((obj) => obj.value === substring);
  };

  const handleFileOpen = useCallback(() => {
    setOpenFile(true);
  }, []);

  // Candidate Requirement

  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedOcc, setIsFocusedOcc] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [isCheckedRemote, setIsCheckedRemote] = useState(false);
  const [skillArray, setSkillArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [SkillValue, setSkillValue] = useState("");
  const [occupationValue, setOccupationValue] = useState("");
  const [occupationName, setOccupationName] = useState("");
  const [SkillSuggestions, setSkillSuggestions] = useState([]);
  const [occupationSuggestion, setoccupationSuggestion] = useState([]);
  const [isThreeCharacters, setIsThreeCharacters] = useState(false);
  const [isThreeCharactersOcc, setIsThreeCharactersOcc] = useState(false);
  const [loaderOcuppationSkill, setLoaderOccupationSkill] = useState(false);
  const [occupationFiltredData, setOccupationFiltredData] = useState([]);

  //loaders
  const [suggestionLoader, setSuggestionLoader] = useState(false);
  const [suggestionLoaderOcc, setSuggestionLoaderOcc] = useState(false);

  useEffect(() => {
    if (inputRef?.current && SkillValue?.length) {
      setSkillDropdownWidth(`${inputRef?.current?.offsetWidth}px`);
    }

    const handleResize = () => {
      if (inputRef?.current && SkillValue?.length) {
        setSkillDropdownWidth(`${inputRef?.current?.offsetWidth}px`);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [SkillValue]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  const handleFocusocc = () => {
    setIsFocusedOcc(true);
  };
  const handleBlurocc = () => {
    setIsFocusedOcc(false);
  };

  const handleChangeSkill = (e) => {
    const inputValue = e.target.value;
    setSkillValue(inputValue);
    // console.log(inputValue);
    if (inputValue.length > 2) {
      setSuggestionLoader(true);
      debouncedSendRequest(
        inputValue,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
      setIsThreeCharacters(true);
    } else {
      setSkillSuggestions([
        {
          skillOccupation: contentLabel(
            "EnterAtleastCharacters",
            "nf Enter Atleast 3 Characters"
          ),
          id: 1,
          occupation: contentLabel(
            "EnterAtleastCharacters",
            "nf Enter Atleast 3 Characters"
          ),
          dontSelect: true,
        },
      ]);
      setIsThreeCharacters(false);
    }
  };

  // const handleChangeOccupation = (e) => {
  //   const inputValue = e.target.value;
  //   setOccupationValue(inputValue);

  //   if (inputValue.length > 2) {
  //     setSuggestionLoaderOcc(true);
  //     SkillSuggestionApi(inputValue, selectedLanguage, "occupation")
  //       .then((res) => {
  //         //console.log(res.data);f
  //         // check res data length if empty pass No suggestions found
  //         if (res.data.length === 0) {
  //           setoccupationSuggestion([
  //             {
  //               occupation: contentLabel(
  //                 "NoSuggestionsFound",
  //                 "nf No Suggestions Found"
  //               ),
  //               dontSelect: true,
  //             },
  //           ]);
  //         } else {
  //           setoccupationSuggestion(
  //             res.data.filter(
  //               (tag, index, array) =>
  //                 array.findIndex((t) => t.occupation === tag.occupation) ===
  //                 index
  //             )
  //           );
  //         }
  //         setSuggestionLoaderOcc(false);
  //       })
  //       .catch((err) => {
  //         setSuggestionLoaderOcc(false);
  //         console.log(err);
  //       });
  //     setIsThreeCharactersOcc(true);
  //   } else {
  //     setoccupationSuggestion([
  //       {
  //         skillOccupation: contentLabel(
  //           "EnterAtleastCharacters",
  //           "nf Enter Atleast 3 Characters"
  //         ),
  //         id: 1,
  //         occupation: contentLabel(
  //           "EnterAtleastCharacters",
  //           "nf Enter Atleast 3 Characters"
  //         ),
  //         dontSelect: true,
  //       },
  //     ]);
  //     setIsThreeCharactersOcc(false);
  //   }
  // };

  const handleChangeOccupation = (e) => {
    const inputValue = e.target.value;
    setOccupationValue(inputValue);

    if (inputValue?.length > 0) {
      setSuggestionLoaderOcc(true);

      const filteredData = occupationMasterData?.filter((item) =>
        item?.occupationName?.toLowerCase()?.includes(inputValue?.toLowerCase())
      );


      if (filteredData?.length === 0) {
        setoccupationSuggestion([]);
      } else {
        setoccupationSuggestion(
          filteredData?.filter(
            (tag, index, array) =>
              array?.findIndex((t) => t?.occupationName === tag?.occupationName) === index
          )
        );
      }

      setSuggestionLoaderOcc(false);
      setIsThreeCharactersOcc(true);
    } else {
      setoccupationSuggestion([]);
      setIsThreeCharactersOcc(false);
    }
  };

  const handleSelectOption = (selectedSkill) => {
    // console.log("selected skill ", selectedSkill);
    setSkillValue(selectedSkill);

    setSkillSuggestions([]);
  };
  const handleClearInput = () => {
    setSkillValue("");

    setSkillSuggestions([]);
  };
  const handleClearInputocc = () => {
    setOccupationValue("");
    setOccupationName("");
    setSearchTerm("");
    setOccupationFiltredData([]);
    setoccupationSuggestion([]);
    setIsCustomSkill(false);
  };

  const handleSelectOptionOcc = (selectedSkill) => {
    setOccupationValue(selectedSkill);
    setOccupationName(selectedSkill);
    handleOcuupationfilterData(selectedSkill);

    setoccupationSuggestion([]);
  };

  const handleOcuupationfilterData = async (selectedSkill) => {
    setLoaderOccupationSkill(true);
    try {
      const res = await SkillSuggestionApi(
        selectedSkill,
        selectedLanguage,
        "occupation"
      );
      const matchingRecords = res.data.filter(
        (record) => record.occupation === selectedSkill
      );
      setOccupationFiltredData(matchingRecords);
    } catch (error) {
      console.error("Error fetching skill suggestion data:", error);
    } finally {
      setLoaderOccupationSkill(false); // End loading
    }
  };

  const skillOcc = `${SkillValue} || ${selectedOccupation?.label}`;

  /* HANDLE CREATING NEW SKILL IN MASTER */
  const handleInsertNewSkill = useCallback(
    async (
      newSkillName,
      occupationNameData,
      skillOccupationNameData,
      lang,
      moduleName,
      contentName,
      occupationId
    ) => {
      const payload = {
        skill: newSkillName,
        occupation: occupationNameData,
        skillOccupation: skillOccupationNameData,
        mlanguage: lang,
        occupationId: occupationId,
        skillCategory: categoryDetail?.categoryName && isNewOccupation ? categoryDetail?.categoryName : "",
        redirectToParentTenant: true,
        mstatus: "W",
      };
      try {
        const res = await exceptionPOSTapi("skill", payload);
        const data = res?.data;
        skillIdRef.current = data?.id;

        handleSkillExceptions(
          data?.applicationName,
          data?.id,
          moduleName,
          contentName,
          data?.id
        );
        handleModalClose();
      } catch (error) {
        console.error("Error inserting new skill: ", error);
      }
    },
    [categoryDetail?.categoryName, isNewOccupation]
  );

  const handleInsertNewOccupation = useCallback(
    async (
      occupationNameData,
      lang,
    ) => {
      const payload = {
        occupationName: occupationNameData,
        categoryId: categoryDetail?.id ? categoryDetail?.id : "",
        categoryName: categoryDetail?.categoryName && isNewOccupation ? categoryDetail?.categoryName : "",
        mlanguage: lang,
        redirectToParentTenant: true,
        status: "W",
      };
      try {
        const res = await exceptionPOSTapi("Occupations", payload);
        const data = res?.data;

        handleOccupationExceptions(
          data?.applicationName,
          data?.id,
          "Occupations",
          occupationNameData,
          data?.id
        );

        handleInsertNewSkill(SkillValue,
          selectedOccupation?.label,
          skillOcc,
          getCookie("HLang"),
          "skill",
          SkillValue,
          data?.id
        );
        dispatch(fetchOccupationMaster());
        handleModalClose();
      } catch (error) {
        console.error("Error inserting new occupation: ", error);
      }
    },
    [categoryDetail?.id, categoryDetail?.categoryName, handleInsertNewSkill, SkillValue, selectedOccupation?.label, skillOcc, isNewOccupation, dispatch]
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

  const handleAddNewSkill = async () => {
    try {
      if (SkillValue === "") return;

      setIsAddingNewSkill(true);

      if (isCustomSkill && !isNewOccupation) {
        try {
          await handleInsertNewSkill(
            SkillValue,
            selectedOccupation?.label,
            skillOcc,
            getCookie("HLang"),
            "skill",
            SkillValue,
            selectedOccupation?.occupationId
          );
        } catch (error) {
          console.error("Error occured during exception handling in skill", error);
        }
      } else if (isCustomSkill && isNewOccupation) {
        try {
          await handleInsertNewOccupation(
            selectedOccupation?.label,
            getCookie("HLang")
          );
        } catch (error) {
          console.error("Error occured during skill & occupation exception", error);
        }
      }

      dispatch(
        setOpportunitySkills([
          ...skills,
          {
            skill: selectedSkill?.skill ? selectedSkill?.skill : SkillValue,
            skillOccupation: selectedSkill?.skillOccupation ? selectedSkill?.skillOccupation : skillOcc,
            occupation: selectedSkill?.occupation ? selectedSkill?.occupation : selectedOccupation?.label,
            checked: false,
            id: crypto.randomUUID(),
            skillid: selectedSkill?.id ? selectedSkill?.id : skillIdRef.current,
            min: "0",
            max: "0",
            timeunit: "year",
            isNew: true,
          },
        ])
      );

      setSkillValue("");
      setSelectedSkill(null);
      skillIdRef.current = "";
      setSkillSuggestions([]);
    } catch (error) {
      console.error("Error adding new skill", error);
    } finally {
      setIsAddingNewSkill(false);
    }
  };

  const inputMinChange = (skillId, inputValue) => {
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId)
            return { ...skill, min: inputValue, isEdit: true };

          return skill;
        })
      )
    );
  };

  const inputMaxChange = (skillId, inputValue) => {
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId)
            return { ...skill, max: inputValue, isEdit: true };

          return skill;
        })
      )
    );
  };

  const inputTimeUnitChange = (skillId, inputValue) => {
    // console.log("input unit ", inputValue);
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId)
            return { ...skill, timeunit: inputValue, isEdit: true };

          return skill;
        })
      )
    );
  };

  const deleteSkill = (skillId) => {
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId) return { ...skill, isDelete: true };

          return skill;
        })
      )
    );
  };
  const addSkill = (skillId) => {
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId) return { ...skill, isDelete: false };

          return skill;
        })
      )
    );
  };

  const toggleChecked = (skillId, event) => {
    dispatch(
      setOpportunitySkills(
        skills.map((skill) => {
          if (skill.id === skillId)
            return {
              ...skill,
              [event.target.name]: event.target.checked,
              isEdit: true,
            };

          return skill;
        })
      )
    );
  };

  //handle Screening Questions
  const queOptions = [
    {
      value: "",
      label: contentLabel("PleaseSelectAType", "nf Please select a type"),
      disabled: true,
    },
    {
      value: "Options",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Options"
          ) || {}
        ).mvalue || "nf Options",
    },
    {
      value: "Text",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Text"
          ) || {}
        ).mvalue || "nf Text",
    },
    {
      value: "Number",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Number"
          ) || {}
        ).mvalue || "nf Number",
    },
  ];

  const components = {
    DropdownIndicator: null,
  };
  const createOption = (label) => ({
    label,
    value: label,
  });

  const [question, setQuestion] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  // question options......
  const [inputValue, setInputValue] = useState("");
  const [optionArray, setOptionArray] = useState([]);

  const handleOpportunityQuestion = (value) => {
    dispatch(setOpportunityQuestions(value));
  };

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setOptionArray((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleAnswerChange = (e) => {
    const newValue = e?.target?.value;
    setSelectedAnswer(newValue);
  };

  const handleAddQuestion = () => {
    // if (
    //   question.trim() === "" ||
    //   selectedAnswer === "" ||
    //   ((selectedAnswer?.label
    //     ? selectedAnswer?.label
    //     : selectedAnswer === "Options" || selectedAnswer?.label
    //       ? selectedAnswer?.label
    //       : selectedAnswer === "nf Options") &&
    //     optionArray.length === 0)
    // ) {
    //   return;
    // }
    if (
      question.trim() === "" ||
      selectedAnswer.trim() === "" ||
      ((selectedAnswer === "Options" || selectedAnswer === "nf Options") &&
        optionArray.length === 0)
    ) {
      return;
    }

    handleOpportunityQuestion([
      ...questions,
      {
        question: question,
        typeOfQuestion: selectedAnswer,
        options: [...optionArray],
        id: crypto.randomUUID(),
        required: false,
        rank: questions.length + 1,
        isNew: true,
      },
    ]);
    // setQuestionArray((currentValue) => {
    //   return [
    //     ...currentValue,
    //     {
    //       question: question,
    //       typeOfQuestion: selectedAnswer,
    //       options: [...optionArray],
    //       id: crypto.randomUUID(),
    //       required: false,
    //       rank: currentValue.length + 1,
    //     },
    //   ];
    // });
    setQuestion(" ");

    setSelectedAnswer("");

    setOptionArray([]);
  };

  const deleteQuestion = (questionId) => {
    handleOpportunityQuestion(
      questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            isDelete: true,
          };
        }
        return question; // Return unchanged question if id doesn't match
      })
    );
  };

  const undoDelete = (questionId) => {
    handleOpportunityQuestion(
      questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            isDelete: false,
          };
        }
        return question; // Return unchanged question if id doesn't match
      })
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(questions);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Update the rank
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    handleOpportunityQuestion(updatedItems);
  };

  const renderText = (text, maxLength = 30) => {
    if (text.length > maxLength) {
      return <span>{text}</span>;
    } else {
      return (
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            width: "100%",
            verticalAlign: "top",
          }}
        >
          {text}
        </span>
      );
    }
  };

  const toggleRequired = (questionId, checked) => {
    handleOpportunityQuestion(
      questions.map((que) => {
        if (que.id === questionId)
          return { ...que, required: checked, isEdit: true };
        return que;
      })
    );
  };

  const handleClose = () => {
    navigate("/skill-seeker/Opportunities");
  };

  const formValidate = (submitType) => {
    if (submitType === "DRAFT" && (data?.title && data?.title?.toString().trim() !== "")) {
      return true
    }

    // Check mandatory fields
    const mandatoryFields = [
      //defination
      "jdsType",
      data?.jdsType !== 'External' && "extSiteId",
      data?.jdsType !== 'External' && "externalSite",
      "jdCatId",
      "jdCategoryName",
      "title",
      "jdType",
      "jdCompany",
      "userCompaniesId",
      "openings",
      "salaryLow",
      "salaryHigh",
      "salaryTimeFrame",
      "currency",
      // description
      "description",
      "responsibilities",
      "benefits",
      //exp
      "jdExpLvlId",
      "experienceLevel"
    ].filter(Boolean);

    for (let field of mandatoryFields) {
      if (!data[field] || data[field].toString().trim() === "") {
        // console.log(`${field} is required`);
        return false;
      }
    }

    if (skills && !skills.length > 0) {
      // console.log("no skills added");
      return false;
    }

    return true;
  };

  const handlePost = async (submitType) => {

    //if all skills removed
    if (skills?.filter((skill) => !skill?.isDelete).length === 0 && !submitType === "DRAFT") {
      showErrorToast(
        contentLabel("PleaseFillRequiredSkills", "nf Please fill required skills")
      );
      return;
    }


    // console.log({
    //   ...data,
    //   numSkills: skills ? skills.length : 0,
    //   mstatus: submitType,
    //   userId:getCookie("userId"),
    //   jobLocation:
    //     data.jobLocation &&
    //     data.jobLocation.map((data) => data.value).join(", "),
    //   mlanguage: getCookie("HLang"),
    // });
    let ticketids = data && data.hasOwnProperty("userCompaniesId") && data.userCompaniesId.length > 0 ? [`${data.userCompaniesId}`] : [];
    const postBody = {
      ...data,
      ticketids: ticketids,
      numSkills: skills && Array.isArray(skills) && skills.length > 0 ? skills.filter(sk => (!sk?.hasOwnProperty("isDelete") || sk?.isDelete === false)).length : 0,
      mstatus: submitType,
      status: submitType,
      userId:getCookie("userId"),
      jobLocation:
        data.jobLocation && Array.isArray(data.jobLocation) && data.jobLocation.length > 0 ?
          data.jobLocation.map((data) => data.value).join(", ") : "",
      mlanguage: getCookie("HLang"),
      deadline: data.deadline ? FormatDateIntoPost(data.deadline) : "",
      description: data.description.length > 0 ? data.description : "-",
    };
    const id = postBody.id;

    const keysToRemove = [
      "createdTime", "id", "JdSkills",
      // "version",'ticketNumber','tenantId', 'coreType',
      //  'createdBy',
      //  'expired',
      //  'modifiedBy',
      'modifiedTime',
      //  'status'
    ];

    keysToRemove.forEach(key => delete postBody[key]);

    if (postBody.hasOwnProperty("Questions")) {
      delete postBody.Questions;
    }
    if (formValidate(submitType)) {
      try {
        dispatch(setLoading(true));
        // let res = await PostApiJds("sendJd", postBody);
        // let res = await EditApi("JDS", id, {jobLocation:postBody?.jobLocation});
        let res = await EditApi("JDS", id, postBody);

        // console.log(res);
        //handling attachmentss

        //s1. if old attachment exists and attachmentAdded is true then delete old post new atachment
        //s2. if old attachment exists and attachmentAdded is false then delete old
        //s3. if old attachment not exists and attachmentAdded is true then post new atachment
        //s4. if old attachment not exists and attachmentAdded is false then do nothing

        //s1. if old attachment exists and attachmentAdded is true then delete old post new atachment

        //delete old and post new
        if (originalDataInEdit?.attachment &&
          Array.isArray(originalDataInEdit)
          && originalDataInEdit?.attachment.length > 0 && attachmentAdded) {
          const deletePromises = originalDataInEdit?.attachment.map((atch) =>
            DeleteApi("Attachment Map", atch.id)
          );
          await Promise.all(deletePromises);
          if (res.data && res.data.id && attachment && attachment.length > 0) {
            await handleAttachmentMapping({
              ...attachment[0],
              resId: res.data.id,
            });
          }
          //delete old only
        } else if (
          originalDataInEdit?.attachment &&
          originalDataInEdit?.attachment.length > 0 &&
          !attachmentAdded
        ) {
          const deletePromises = originalDataInEdit?.attachment.map((atch) =>
            DeleteApi("Attachment Map", atch.id)
          );
          await Promise.all(deletePromises);
        }
        //post new  only
        else if (
          !(originalDataInEdit?.attachment && originalDataInEdit?.attachment.length > 0) &&
          attachmentAdded
        ) {
          if (res.data && res.data.id && attachment && attachment.length > 0) {
            await handleAttachmentMapping({
              ...attachment[0],
              resId: res.data.id,
            });
          }
        }
        await dispatch(fetchUserAttachment());
        // console.log("JD posted successfully", res.data);

        // Show success toast for JD posting
        // showSuccessToast(
        //     (
        //         content[selectedLanguage]?.find(
        //             (item) => item.elementLabel === "OpportunityEditedSuccess"
        //         ) || {}
        //     ).mvalue || "nf Opportunity Edited Success"
        // );


        // Posting skills
        const postSkills = skills.map(async (obj) => {
          // console.log("Processing skill:", obj, "Skill ID:", obj.skillid);

          try {
            if (obj.hasOwnProperty("isNew") && obj.isNew) {
              if (obj.hasOwnProperty("isDelete") && obj.isDelete) {
                // console.log("New Skill but Deleted ");
              } else {
                // console.log("New Skill posted ");
                const secondRes = await PostApi("JDSkills", {
                  occupation: obj.occupation,
                  yoeMin: daysConvertor(obj.timeunit, obj.min),
                  skillOccupationId: obj.occupationId,
                  yoeMax: daysConvertor(obj.timeunit, obj.max),
                  skill: obj.skill,
                  jdType: obj.checked ? "Mandatory" : "Optional",
                  jdValidated: obj.validated === true ? "Yes" : "No",
                  topFive: obj.topSkill === true ? "Yes" : "No",
                  yoePhase: obj.timeunit,
                  skillOccupation: obj.skillOccupation,
                  jid: id,
                });
                // console.log(
                //   "Successfully posted to JDSkills table",
                //   secondRes.data
                // );
              }
            } else if (obj.hasOwnProperty("isDelete") && obj.isDelete) {
              // console.log("OLd Skill Delete ");
              const secondRes = await DeleteApi("JDSkills", obj.id);
              // console.log(
              //   "Successfully Deleted from JDSkills table",
              //   secondRes.data
              // );
            } else if (obj.hasOwnProperty("isEdit") && obj.isEdit) {
              // console.log("OLd Skill Edit ");
              const secondRes = await EditApi("JDSkills", obj.id, {
                occupation: obj.occupation,
                yoeMin: daysConvertor(obj.timeunit, obj.min),
                skillOccupationId: obj.occupationId,
                yoeMax: daysConvertor(obj.timeunit, obj.max),
                skill: obj.skill,
                jdType: obj.checked ? "Mandatory" : "Optional",
                jdValidated: obj.validated === true ? "Yes" : "No",
                topFive: obj.topSkill === true ? "Yes" : "No",
                yoePhase: obj.timeunit,
                skillOccupation: obj.skillOccupation,
              });
              // console.log(
              //   "Successfully Deleted from JDSkills table",
              //   secondRes.data
              // );
            }
          } catch (secondErr) {
            console.error("Error posting to JDSkills table", secondErr);
            throw secondErr;
          }
        });

        await Promise.all(postSkills);

        // Show success or error toast for skills posting
        // showSuccessToast((
        //     content[selectedLanguage]?.find(
        //         (item) => item.elementLabel === "SkillsPostedSuccessfully"
        //     ) || {}
        // ).mvalue || "nf Skills Posted Successfully");

        // Posting questions

        const postQuestions = questions.map(async (question) => {
          // console.log(
          //   "Processing question:",
          //   question.question,
          //   "Question ID:",
          //   question.id
          // );
          const optionValues = question && Array.isArray(question?.options) ? question.options.map((option) => option.value) : [];
          try {
            if (question.hasOwnProperty("isNew") && question.isNew) {
              if (question.hasOwnProperty("isDelete") && question.isDelete) {
                // console.log("New Question but Deleted ");
              } else {
                // console.log("New Question posted ");
                const questionRes = await PostApi("JQuestions", {
                  jid: id,
                  jdsOrder: question.rank,
                  jdvalues: optionValues && Array.isArray(optionValues) && optionValues.length > 0 ? JSON.stringify(optionValues) : "",
                  jdType: question.typeOfQuestion,
                  qnLabel: question.question,
                  jdRequired: question.required ? "Yes" : "No",
                });

                // console.log(
                //   "Successfully posted to JQuestions table",
                //   questionRes.data
                // );
              }
            } else if (
              question.hasOwnProperty("isDelete") &&
              question.isDelete
            ) {
              // console.log("OLd Questions Delete ");
              const secondRes = await DeleteApi("JQuestions", question.id);
              // console.log(
              //   "Successfully Deleted from question table",
              //   secondRes.data
              // );
            } else if (question.hasOwnProperty("isEdit") && question.isEdit) {
              // console.log("OLd Skill Edit ");
              const secondRes = await EditApi("JQuestions", question.id, {
                jid: id,
                jdsOrder: question.rank,
                jdvalues: optionValues && Array.isArray(optionValues) && optionValues.length > 0 ? JSON.stringify(optionValues) : "",
                jdType: question.typeOfQuestion,
                qnLabel: question.question,
                jdRequired: question.required ? "Yes" : "No",
              });
              // console.log(
              //   "Successfully Deleted from JQuestions table",
              //   secondRes.data
              // );
            }
          } catch (secondErr) {
            console.error("Error posting to JQuestions table", secondErr);
            throw secondErr;
          }
        });

        await Promise.all(postQuestions);

        // Show success or error toast for questions posting
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "OpportunityEditedSuccess"
            ) || {}
          ).mvalue || "nf Opportunity Edited Success"
        );

        // Final cleanup
        dispatch(setLoading(false));
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
        dispatch(setLoading(false));
      }
    } else {
      showErrorToast(
        submitType === "DRAFT" ? contentLabel("TitleCannotBeEmpty", "nf Title cannot be empty") : contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields")
      );
    }
  };

  const handleAttachmentMapping = async (data) => {
    const attachmentData = {
      fileId: data.fileId,
      fileName: data.fileName,
      fileTitle: data.fileTitle,
      linkedApplicationName: "JDS",
      linkedId: data.resId,
      roleName: getCookie("USER_ROLE"),
    };

    try {
      const res = await PostApi("Attachment Map", attachmentData);
      await dispatch(fetchUserAttachment());
      return res.data;
      // console.log(res);
    } catch (error) {
      console.error("Attachment Mapping Failed:", error);
      throw error;
    }
  };

  const handleClear = () => {
    dispatch(emptyOpEdit());
  };

  /* HANDLE OCCUPATION SAVE */
  const handleOccupationSave = () => {
    handleSelectOption(SkillValue);
    setIsSavingOccupation(true);
    setIsShowOccupationPopup(false);
    /* RETURN TO FALSE */
    setIsSavingOccupation(false);
  };

  const handleModalClose = () => {
    setIsShowOccupationPopup(false);
    setSelectedOccupation(null);
    setCategoryDetail({});
    setIsNewOccupation(false);
    setSkillValue("");
    setIsCustomSkill(false);
  }

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    handleChangeOccupation({ target: { value } });
    setIsOccupationSuggestionOpen(true)
  };


  if (!data?.id) {
    navigate('/skill-seeker/Opportunities');
    return (

      <Card className="d-flex justify-content-center align-items-center" style={{ height: '75vh' }} >
        {contentLabel("ClickJdToViewData", "nf CLICK A JD TO VIEW DATA")}
      </Card>
    )
  }



  const handleSaveFunction = async (submitType) => {

    //if all skills removed
    // if (skills?.filter((skill) => !skill?.isDelete).length === 0 && !submitType === "DRAFT") {
    //   showErrorToast(
    //     contentLabel("PleaseFillRequiredSkills", "nf Please fill required skills")
    //   );
    //   return;
    // }


    // console.log({
    //   ...data,
    //   numSkills: skills ? skills.length : 0,
    //   mstatus: submitType,
    //   userId:getCookie("userId"),
    //   jobLocation:
    //     data.jobLocation &&
    //     data.jobLocation.map((data) => data.value).join(", "),
    //   mlanguage: getCookie("HLang"),
    // });
    let ticketids = data && data.hasOwnProperty("userCompaniesId") && data.userCompaniesId.length > 0 ? [`${data.userCompaniesId}`] : [];
    const postBody = {
      ...data,
      ticketids: ticketids,
      numSkills: skills && Array.isArray(skills) && skills.length > 0 ? skills.filter(sk => (!sk?.hasOwnProperty("isDelete") || sk?.isDelete === false)).length : 0,
      mstatus: submitType,
      status: submitType,
      userId:getCookie("userId"),
      jobLocation:
        data.jobLocation && Array.isArray(data.jobLocation) && data.jobLocation.length > 0 ?
          data.jobLocation.map((data) => data.value).join(", ") : "",
      mlanguage: getCookie("HLang"),
      deadline: data.deadline ? FormatDateIntoPost(data.deadline) : "",
      description: data.description.length > 0 ? data.description : "-",
    };
    const id = postBody.id;

    const keysToRemove = [
      "createdTime", "id", "JdSkills",
      // "version",'ticketNumber','tenantId', 'coreType',
      //  'createdBy',
      //  'expired',
      //  'modifiedBy',
      'modifiedTime',
      //  'status'
    ];

    keysToRemove.forEach(key => delete postBody[key]);
    setSaving(true);
    if (postBody.hasOwnProperty("Questions")) {
      delete postBody.Questions;
    }
    if (formValidate(submitType)) {
      try {

        // dispatch(setLoading(true));
        // let res = await PostApiJds("sendJd", postBody);
        // let res = await EditApi("JDS", id, {jobLocation:postBody?.jobLocation});
        let res = await EditApi("JDS", id, postBody);
        dispatch(setOriginalDataInEdit({ ...originalDataInEdit, ...data }));
        // console.log(res);
        //handling attachmentss
        let originalDateTemp = {
          originalDataInEdit, ...data,
        }
        //s1. if old attachment exists and attachmentAdded is true then delete old post new atachment
        //s2. if old attachment exists and attachmentAdded is false then delete old
        //s3. if old attachment not exists and attachmentAdded is true then post new atachment
        //s4. if old attachment not exists and attachmentAdded is false then do nothing

        //s1. if old attachment exists and attachmentAdded is true then delete old post new atachment

        //delete old and post new
        if (originalDataInEdit?.attachment && originalDataInEdit?.attachment.length > 0 && attachmentAdded) {
          const deletePromises = originalDataInEdit?.attachment.map((atch) =>
            DeleteApi("Attachment Map", atch.id)
          );

          await Promise.all(deletePromises);
          originalDateTemp.attachment = [];

          if (res.data && res.data.id && attachment && attachment.length > 0) {
            const atch = await handleAttachmentMapping({
              ...attachment[0],
              resId: res.data.id,
            });
            originalDateTemp.attachment = [atch];
          }
          //delete old only
        } else if (
          originalDataInEdit.attachment &&
          oldAttachment.length > 0 &&
          !attachmentAdded
        ) {
          const deletePromises = originalDataInEdit?.attachment.map((atch) =>
            DeleteApi("Attachment Map", atch.id)
          );
          await Promise.all(deletePromises);
          originalDateTemp.attachment = [];
        }
        //post new  only
        else if (
          !(originalDataInEdit.attachment &&
            Array.isArray(originalDataInEdit.attachment) &&
            originalDataInEdit.attachment.length > 0) &&
          attachmentAdded
        ) {
          if (res.data && res.data.id && attachment && attachment.length > 0) {
            const atch = await handleAttachmentMapping({
              ...attachment[0],
              resId: res.data.id,
            });
            originalDateTemp.attachment = [atch];
          }
        }
        await dispatch(fetchUserAttachment());
        // console.log("JD posted successfully", res.data);

        // Show success toast for JD posting
        // showSuccessToast(
        //     (
        //         content[selectedLanguage]?.find(
        //             (item) => item.elementLabel === "OpportunityEditedSuccess"
        //         ) || {}
        //     ).mvalue || "nf Opportunity Edited Success"
        // );


        // Posting skills
        if (skills && skills.length > 0) {
          let tempSkillInEdit = [];

          const postSkills = skills.map(async (obj) => {
            // console.log("Processing skill:", obj, "Skill ID:", obj.skillid);

            try {
              if (obj.hasOwnProperty("isNew") && obj.isNew) {
                if (obj.hasOwnProperty("isDelete") && obj.isDelete) {
                  // console.log("New Skill but Deleted ");
                } else {
                  // console.log("New Skill posted ");
                  const secondRes = await PostApi("JDSkills", {
                    occupation: obj.occupation,
                    yoeMin: daysConvertor(obj.timeunit, obj.min),
                    skillOccupationId: obj.occupationId,
                    yoeMax: daysConvertor(obj.timeunit, obj.max),
                    skill: obj.skill,
                    jdType: obj.checked ? "Mandatory" : "Optional",
                    jdValidated: obj.validated === true ? "Yes" : "No",
                    topFive: obj.topSkill === true ? "Yes" : "No",
                    yoePhase: obj.timeunit,
                    skillOccupation: obj.skillOccupation,
                    jid: id,
                  });
                  tempSkillInEdit.push({ ...obj, id: secondRes.data.id, isNew: false, isEdit: false });
                  // console.log(
                  //   "Successfully posted to JDSkills table",
                  //   secondRes.data
                  // );
                }
              } else if (obj.hasOwnProperty("isDelete") && obj.isDelete) {
                // console.log("OLd Skill Delete ");
                const secondRes = await DeleteApi("JDSkills", obj.id);
                // console.log(
                //   "Successfully Deleted from JDSkills table",
                //   secondRes.data
                // );
              } else if (obj.hasOwnProperty("isEdit") && obj.isEdit) {
                // console.log("OLd Skill Edit ");
                const secondRes = await EditApi("JDSkills", obj.id, {
                  occupation: obj.occupation,
                  yoeMin: daysConvertor(obj.timeunit, obj.min),
                  skillOccupationId: obj.occupationId,
                  yoeMax: daysConvertor(obj.timeunit, obj.max),
                  skill: obj.skill,
                  jdType: obj.checked ? "Mandatory" : "Optional",
                  jdValidated: obj.validated === true ? "Yes" : "No",
                  topFive: obj.topSkill === true ? "Yes" : "No",
                  yoePhase: obj.timeunit,
                  skillOccupation: obj.skillOccupation,
                });
                tempSkillInEdit.push({ ...obj, id: secondRes.data.id, isNew: false, isEdit: false });
                // console.log(
                //   "Successfully Deleted from JDSkills table",
                //   secondRes.data
                // );
              } else {
                tempSkillInEdit.push({ ...obj, isNew: false, isEdit: false });
              }
            } catch (secondErr) {
              console.error("Error posting to JDSkills table", secondErr);
              throw secondErr;
            }
          });

          await Promise.all(postSkills);
          console.log("postSkills ", tempSkillInEdit)
          // setCreateOpportunitySkills
          if (tempSkillInEdit.length > 0) {
            dispatch(
              setOpportunitySkills(tempSkillInEdit)
            );
          } else {
            dispatch(
              setOpportunitySkills([]));
          }
          originalDateTemp.skills = tempSkillInEdit && tempSkillInEdit.length > 0 ? tempSkillInEdit : [];
        }

        // Show success or error toast for skills posting
        // showSuccessToast((
        //     content[selectedLanguage]?.find(
        //         (item) => item.elementLabel === "SkillsPostedSuccessfully"
        //     ) || {}
        // ).mvalue || "nf Skills Posted Successfully");

        // Posting questions

        if (questions && questions.length > 0) {
          let tempQuestionInEdit = [];
          const postQuestions = questions.map(async (question) => {
            // console.log(
            //   "Processing question:",
            //   question.question,
            //   "Question ID:",
            //   question.id
            // );
            const optionValues = question && Array.isArray(question?.options) ? question.options.map((option) => option.value) : [];
            try {
              if (question.hasOwnProperty("isNew") && question.isNew) {
                if (question.hasOwnProperty("isDelete") && question.isDelete) {
                  // console.log("New Question but Deleted ");
                } else {
                  // console.log("New Question posted ");
                  const questionRes = await PostApi("JQuestions", {
                    jid: id,
                    jdsOrder: question.rank,
                    jdvalues: optionValues && Array.isArray(optionValues) && optionValues.length > 0 ? JSON.stringify(optionValues) : "",
                    jdType: question.typeOfQuestion,
                    qnLabel: question.question,
                    jdRequired: question.required ? "Yes" : "No",
                  });
                  tempQuestionInEdit.push({ ...question, id: questionRes.data.id, isNew: false, isEdit: false });
                  // console.log(
                  //   "Successfully posted to JQuestions table",
                  //   questionRes.data
                  // );
                }
              } else if (
                question.hasOwnProperty("isDelete") &&
                question.isDelete
              ) {
                // console.log("OLd Questions Delete ");
                const secondRes = await DeleteApi("JQuestions", question.id);
                // console.log(
                //   "Successfully Deleted from question table",
                //   secondRes.data
                // );
              } else if (question.hasOwnProperty("isEdit") && question.isEdit) {
                // console.log("OLd Skill Edit ");
                const secondRes = await EditApi("JQuestions", question.id, {
                  jid: id,
                  jdsOrder: question.rank,
                  jdvalues: optionValues && Array.isArray(optionValues) && optionValues.length > 0 ? JSON.stringify(optionValues) : "",
                  jdType: question.typeOfQuestion,
                  qnLabel: question.question,
                  jdRequired: question.required ? "Yes" : "No",
                });
                tempQuestionInEdit.push({ ...question, id: secondRes.data.id, isNew: false, isEdit: false });
                // console.log(
                //   "Successfully Deleted from JQuestions table",
                //   secondRes.data
                // );
              } else {
                tempQuestionInEdit.push({ ...question, isNew: false, isEdit: false });
              }
            } catch (secondErr) {
              console.error("Error posting to JQuestions table", secondErr);
              throw secondErr;
            }
          });
          await Promise.all(postQuestions);

          if (tempQuestionInEdit.length > 0)
            dispatch(setOpportunityQuestions(tempQuestionInEdit));
          else dispatch(setOpportunityQuestions([]));
          originalDateTemp.questions = tempQuestionInEdit && tempQuestionInEdit.length > 0 ? tempQuestionInEdit : [];
        }

        dispatch(setOriginalDataInEdit(originalDateTemp));

        // Show success or error toast for questions posting
        // Show success toast for JD posting
        showSuccessToast(contentLabel("OpportunitySaved", "nf Opportunity Saved"));
        setSaving(false);
        // Final cleanup
        // dispatch(setLoading(false));
        // handleClear();
        // handleClose();
      } catch (err) {
        console.log(err);
        setSaving(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "Something went wrong"
        );
        // dispatch(setLoading(false));
      } finally {
        setSaving(false);
      }
    } else {
      setSaving(false);
      showErrorToast(
        submitType === "DRAFT" ? contentLabel("TitleCannotBeEmpty", "nf Title cannot be empty") : contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields")
      );
    }
  };


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
                  // onClick={() => handleSaveCourse()}
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

      <Modal
        show={modalVisible}
        onHide={() => setModalVisible(false)}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        style={{ zIndex: '999999999' }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <h6>
              {contentLabel('AreYouSure', 'nf AreYouSure')} ?
            </h6>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {contentLabel('AreYouSureText', 'nf Once published this opportunity cannot be edited. Do you wish to proceed?')}

          </p>
        </Modal.Body>
        <Modal.Footer>
          <div className=" d-flex justify-content-end mb-2">
            <button className="btn btn-secondary mx-2" onClick={() => setModalVisible(false)}
              disabled={postLoading}>

              {contentLabel("No", "nf No")}
            </button>
            <button className="btn btn-primary mx-2"
              onClick={() => handlePost("PUBLISH")}
              disabled={postLoading}
            >
              {contentLabel("Yes", "nf Yes")}
            </button>

          </div>
        </Modal.Footer>
      </Modal>

      <Files
        docOnlyUpload={true}
        title={contentLabel("ChooseCourseFile", "nf Choose Course File")}
        openFile={openFile}
        handleFileClose={handleFileClose}
        handleSelectFile={handleSelectFile}
      />

      <div class="card p-4">
        <CreateStepper
          steps={steperSteps}
          activeSteps={steps}
          setActiveSteps={setSteps}
        />
      </div>

      <div className="card d-flex ">
        {
          // Step 0 Opportunity Definintion
          !steps.step1 && (
            <div className="m-sm-5 m-2 ">
              <form>
                {/* Opportunity Type internal or external */}
                <Row>
                  <Col xl={6} className="mb-3">
                    <label className="form-label fw-bold">
                      {contentLabel(
                        "DoYouWantToListJdOnExternal",
                        "nf Do you want to list Jd on External sites?"
                      )}
                      <span className="text-danger">*</span>
                    </label>

                    <Col className="d-flex gap-4 align-content-center">
                      <div className="d-flex gap-2 align-items-baseline">
                        <input
                          type="radio"
                          id="Internal"
                          name="fav_language"
                          value="Internal"
                          checked={data.jdsType === "Internal"}
                          onChange={(e) => {
                            e.target.checked && handleChange("jdsType", "Internal")
                            e.target.checked && handleChange("jdSubCatId", "");
                            e.target.checked && handleChange("jdSubCategoryName", "");
                            e.target.checked && handleChange("jdCatId", "");
                            e.target.checked && handleChange("jdCategoryName", "");
                          }
                          }
                        />
                        <label
                          className="form-label"
                          style={{ fontWeight: "500" }}
                          for="Internal"
                        >
                          {contentLabel("Yes", "nf Yes")}
                        </label>
                      </div>
                      <div className="d-flex gap-2 align-items-baseline">
                        <input
                          type="radio"
                          id="External"
                          name="fav_language"
                          value="External"
                          onChange={(e) => {
                            e.target.checked && handleChange("jdsType", "External");
                            e.target.checked && handleChange("extSiteId", "");
                            e.target.checked && handleChange("externalSite", "");
                            e.target.checked && handleChange("jdSubCatId", "");
                            e.target.checked && handleChange("jdSubCategoryName", "");
                            e.target.checked && handleChange("jdCatId", "");
                            e.target.checked && handleChange("jdCategoryName", "");
                          }}
                          checked={data.jdsType === "External"}
                        />
                        <label
                          className="form-label"
                          style={{ fontWeight: "500" }}
                          for="External"
                        >
                          {contentLabel("No", "nf No")}
                        </label>
                      </div>
                    </Col>
                  </Col>

                  <Col xl={6} className="mb-3">
                    <label className="form-label fw-bold">
                      {contentLabel("Attachment", "nf Attachment")}
                    </label>
                    <div className="relative" style={{ position: "relative" }}>
                      <div onClick={handleFileOpen}>
                        <input
                          class="form-control"
                          type="text"
                          id="formFile"
                          placeholder={contentLabel(
                            "NoFileSelected",
                            "nf No File Selected"
                          )}
                          style={{ pointerEvents: "none" }}
                          value={attachment?.[0]?.fileName || ""}
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
                            // console.log("triggered");
                            delAttachment();
                          }}
                        />
                      </div>
                    </div>
                    <Col className="d-flex gap-5 align-content-center">
                      <Files
                        docOnlyUpload={true}
                        title={
                          contentLabel("AddAttachment", "nf Add Attachment") +
                          " -   " +
                          contentLabel("FileNotePdf", "FileNotePdf")
                        }
                        openFile={openFile}
                        handleFileClose={handleFileClose}
                        handleSelectFile={handleSelectFile}
                      />
                    </Col>
                  </Col>
                </Row>
                {/* External link   */}

                <Row>
                  {data?.jdsType === "Internal" && (
                    <Col xl={6} className="mb-3">
                      <label className="form-label fw-bold">
                        {/* {contentLabel("ExternalSite", "nf External Site")}{" "} */}
                        {contentLabel("Website", "nf Website")}
                        {data.jdsType === "Internal" && (
                          <span className="text-danger"> *</span>
                        )}
                      </label>
                      <select
                        className="form-select"
                        aria-label="Select..."
                        onChange={(e) => {
                          const selectedOption =
                            e.target.options[e.target.selectedIndex];
                          const selectedId =
                            selectedOption.getAttribute("data-id");
                          handleChange("extSiteId", selectedId);
                          handleChange("externalSite", e.target.value);
                          handleChange("jdSubCatId", "");
                          handleChange("jdSubCategoryName", "");
                          handleChange("jdCatId", "");
                          handleChange("jdCategoryName", "");

                          // console.log(selectedId); // Logs the id of the selected option
                        }}
                        value={data.externalSite || ""}
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
                  )}
                  {/* Category   */}
                  <Col xl={6} className="mb-3">
                    <label className="form-label fw-bold">
                      {contentLabel("Category", "nf Category")}{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <select
                      className="form-select"
                      aria-label="Select Category"
                      disabled={
                        (!data || data?.jdsType === "Internal") &&
                        (typeof data?.extSiteId !== "string" || data?.extSiteId.trim().length === 0) &&
                        (typeof data?.externalSite !== "string" || data?.externalSite.trim().length === 0)
                      }
                      onChange={(e) => {
                        const selectedOption =
                          e.target.options[e.target.selectedIndex];
                        const selectedId =
                          selectedOption.getAttribute("data-id");
                        handleChange("jdSubCatId", "");
                        handleChange("jdSubCategoryName", "");
                        handleChange("jdCatId", selectedId);
                        handleChange("jdCategoryName", e.target.value);

                        // console.log(selectedId); // Logs the id of the selected option
                      }}
                      // defaultValue={data.jdCategoryName}
                      value={data.jdCategoryName || ""}
                    >
                      <option value="" disabled>
                        {contentLabel(
                          "PleaseSelectCategory",
                          "nf Please select a Category"
                        )}
                      </option>
                      {Array.isArray(categories) &&
                        categories.map(
                          (Options, i) => {
                            const isValidExternalSite =
                              typeof data.externalSite !== "string" ||
                              data.externalSite.trim().length === 0 ||
                              data.externalSite === Options.extSiteLabel;
                            return Options.categoryName &&
                              isValidExternalSite &&
                              (
                                <option key={i} value={Options.categoryName} data-id={Options.id}>
                                  {Options.categoryName}
                                </option>
                              )
                          }
                        )}
                    </select>
                  </Col>
                </Row>

                {/* Category and subcategory   */}
                {/* <Row className="mt-2"> */}

                {/* Sub Category */}
                {/* <Col
                    xl={6}
                    className="mb-3"
                    style={{
                      opacity: data?.jdCatId && data?.jdCatId.length === 0 ? "0.5" : "1",
                      pointerEvents: data?.jdCatId && data?.jdCatId.length === 0 ? "none" : "auto",
                    }}
                  >
                    <label className="form-label fw-bold">
                      {contentLabel("SubCategory", "nf SubCategory")}{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <select
                      className="form-select"
                      aria-label="Select Sub Category"
                      onChange={(e) => {
                        const selectedOption = e.target.options[e.target.selectedIndex];
                        const selectedId = selectedOption.getAttribute("data-id");

                        handleChange("jdSubCatId", selectedId);
                        handleChange("jdSubCategoryName", e.target.value);

                        console.log("Selected SubCategory ID: ", selectedId); // Debugging log
                      }}
                      value={data.jdSubCategoryName || ""}
                      disabled={!data?.jdCatId}
                    >
                      <option value="" disabled>
                        {contentLabel("PleaseSelectType", "nf Please Select Type")}{" "}
                      </option>
                      {data && data.jdCatId &&
                        Array.isArray(subCategories) &&
                        subCategories
                          .filter((subCategory) => subCategory.jdCatId === data.jdCatId)
                          .map((subCategory, i) => (
                            <option key={i} data-id={subCategory.id} value={subCategory.subCategoryName}>
                              {subCategory.subCategoryName}
                            </option>
                          ))}
                    </select>
                  </Col> */}
                {/* </Row> */}

                {/* Opportunity Title */}

                <Col className="mb-3">
                  <label className="form-label fw-bold">
                    {contentLabel("Tittle", "nf Tittle")}{" "}
                    <span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={data.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </Col>

                <Row>
                  {/* Work Tpye */}
                  <Col xl={6} className="mb-3">
                    <label className="form-label fw-bold">
                      {contentLabel("Type", "nf Type")}{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <select
                      className="form-select"
                      aria-label="Select..."
                      onChange={handlTypeChange}
                      value={data.jdType || ""}
                    >
                      <option value="" disabled>
                        {contentLabel("PleaseSelectType", "nf Please Select Type")}{" "}
                      </option>
                      {Array.isArray(emptype) &&
                        emptype
                          .slice() // clone to avoid mutating original array
                          .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)).map(
                            (Options, i) =>
                              Options.empLabel && (
                                <option key={i} value={Options.empLabel}>
                                  {Options.empLabel}
                                </option>
                              )
                          )}
                      {/* {Array.isArray(typeOptions) &&
                        typeOptions.map(
                          (Options, i) =>
                            Options.value && (
                              <option key={i} value={Options.value}>
                                {Options.label}
                              </option>
                            )
                        )} */}
                    </select>
                  </Col>

                  {/* Company */}
                  <Col xl={6} className="mb-3">
                    <div className="d-flex gap-3">
                      <label className="form-label fw-bold">
                        {contentLabel("Company", "nf Company")}{" "} <span className="text-danger"> *</span>
                      </label>

                      {data.jdCompany && data.jdCompany.length > 1 && (
                        <div
                          className="cursor-pointer fst-italic"
                          onClick={handleRemoveCompany}
                        >
                          {contentLabel("RemoveCompany", "nf Remove Company")}{" "}
                          <icons.IoClose size={20} className="me-1" />
                        </div>
                      )}
                    </div>

                    <Col>
                      <select
                        className="form-select"
                        aria-label="Select company"
                        onChange={handleSelectChange}
                        value={data.jdCompany || ""}
                      >
                        <option value="">
                          {contentLabel(
                            "SelectACompany",
                            "nf Select A Company"
                          )}
                        </option>
                        {Array.isArray(CompanyList) &&
                          CompanyList.map(
                            (company, i) =>
                              company.userOrganization && (
                                <option
                                  key={i}
                                  value={company.userOrganization}
                                >
                                  {company.userOrganization}
                                </option>
                              )
                          )}
                      </select>
                    </Col>
                  </Col>
                </Row>

                <Row className="row">
                  <Col xl={6} className="mb-3">
                    {/* location */}
                    <div>
                      <div className="d-flex justify-content-between">
                        <label
                          className="form-label"
                          style={{ fontWeight: "bold" }}
                        >
                          {contentLabel("Location", "nf Location")}
                        </label>
                        <div className="form-check d-flex align-items-center">
                          <CustomCheckbox
                            checked={remoteCheckBox}
                            onChange={(e) => handleCheckboxChange(e)}
                          />
                          &nbsp;
                          <label
                            className="form-check-label"
                            for="flexCheckChecked"
                          >
                            {contentLabel("Remote", "nf Remote")}
                          </label>
                        </div>
                      </div>

                      <div>
                        <MultiSelectRemote
                          handleRadioOff={untickRemoteCheckBox}
                          viewLocation={data.jobLocation} // Redux data
                          setLocationData={(location) =>
                            dispatch(setLocation(location))
                          } // Dispatch function
                        />
                      </div>
                    </div>
                  </Col>

                  <Col xl={6} className="mb-3">
                    <label
                      className="form-label"
                      style={{ fontWeight: "bold" }}
                    >
                      {/* {contentLabel("Openings", "nf Openings")}{" "} */}
                      {contentLabel("NumberOfOpenings", "nf Number of openings")}{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0"
                      min={"0"}
                      value={data.openings || ""}
                      onChange={(e) =>
                        handleChange("openings", e.target.value)
                      }
                    />
                  </Col>
                </Row>

                <Row className="row">
                  <Col xl={6} className="col mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                      style={{ fontWeight: "bold" }}
                    >
                      {contentLabel(
                        "ApplicationDeadline",
                        "nf ApplicationDeadline"
                      )}{" "}
                    </label>

                    <DatePickerWidget
                      // showIcon
                      toggleCalendarOnIconClick
                      selected={data.deadline || null}
                      onChange={(e) => {
                        if (e) {
                          // console.log(
                          //   timestampToYYYYMMDD(new Date(e).getTime())
                          // );
                          handleChange(
                            "deadline",
                            timestampToUTCYMD(new Date(e).getTime())
                          );
                        } else {
                          handleChange(
                            "deadline",
                            ''
                          );
                        }
                      }}
                      dateFormat={formatDateInputType(
                        getCookie("dateFormat")
                      )}
                      placeholderText={getCookie("dateFormat")}
                      className={`form-control w-100 h-75 px-2 `}
                      showYearDropdown
                      scrollableYearDropdown
                      // showMonthDropdown
                      // scrollableMonthDropdown
                      yearDropdownItemNumber={100}
                    />
                  </Col>

                  <Col xl={6} className=" mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label d-flex justify-content-between"
                      style={{ fontWeight: "bold" }}
                    >
                      <div>
                        {contentLabel("Salary", "nf Salary")}{" "}
                        <span className="text-danger"> *</span>
                      </div>
                      <div>
                        <input type="checkbox" className="me-2" checked={data?.hideSalary === 'Yes' ? true : false} onChange={(e) => {
                          const value = e.target.checked ? 'Yes' : 'No'
                          handleChange("hideSalary", value)
                        }
                        } />
                        {contentLabel("HideSalary", "nf Hide Salary")}{" "}
                      </div>
                    </label>
                    <div className="row">
                      <Col lg={3} className="col d-flex align-items-center pe-md-1 mb-2">
                        <h6 className="me-2">
                          {contentLabel("Low", "nf low")}
                        </h6>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="eg 123.45"
                          value={data.salaryLow || ""}
                          onChange={(e) => {
                            // Convert number input to string and handle the change
                            const value = e.target.value;
                            handleChange("salaryLow", value);
                          }}
                        />
                      </Col>
                      <Col lg={3} className="col d-flex align-items-center px-md-1 mb-2">
                        <h6 className="me-2">
                          {contentLabel("High", "nf High")}
                        </h6>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="eg 123.45"
                          value={data.salaryHigh || ""}
                          onChange={(e) => {
                            // Convert number input to string and handle the change
                            const value = e.target.value;
                            handleChange("salaryHigh", value);
                          }}
                        ></input>
                      </Col>

                      <Col lg={3} className="px-md-1 mb-2">
                        {/* <label
                      for="exampleFormControlInput1"
                      class="form-label text-label   "
                    >
                      {contentLabel('Duration', 'nf Duration')}
                      <span className="text-danger"> *</span>
                    </label> */}
                        <div class="input-group ">
                          <select
                            class="form-select form-select-md"
                            aria-label=".form-select-lg example"
                            value={data.salaryTimeFrame || ""}
                            // defaultValue={data.salaryTimeFrame}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleChange("salaryTimeFrame", value);
                            }}
                          >
                            <option value="" disabled >
                              {contentLabel("SelectPhase", "nf Select Phase")}
                            </option>
                            <option value="Per Day">
                              {contentLabel("PerDay", "nf Per Day")}
                            </option>
                            <option value="Per Hour">
                              {contentLabel("PerHour", "nf Per Hour")}
                            </option>
                            <option value="Per Week">
                              {contentLabel("PerWeek", "nf Per Week")}
                            </option>
                            <option value="Per Month" >
                              {contentLabel("PerMonth", "nf Per Month")}
                            </option>
                            <option value="Per Year">
                              {contentLabel("PerYear", "nf Per Year")}
                            </option>
                          </select>
                        </div>
                      </Col>



                      <Col lg={3} className="col px-md-1">
                        <CreatableSelect
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }
                          }
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
                          isClearable
                          options={filterCurrency}
                          placeholder={"Currency"}
                          isValidNewOption={() => false}
                          onChange={handleCurrencyChange}
                          value={data?.currency ? { label: data?.currency, value: data?.currency } : null}
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
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: "0.325rem 0.75rem",
                              borderRadius: "var(--bs-border-radius)",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              maxHeight: "90px", // Set max height of dropdown
                              overflowY: "auto", // Enable vertical scrolling if needed
                            }),
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: "90px", // Limit height of the dropdown list
                              overflowY: "auto", // Add scrolling when items exceed max height
                            }),
                          }}


                        />
                      </Col>

                    </div>
                  </Col>
                </Row>
              </form>

              <div class=" d-flex justify-content-between gap-2 ">
                <div>
                </div>
                <div className="move-right-end d-flex gap-2">
                  <div>
                    <button
                      class="btn btn-primary "
                      disabled={saving || !compareFieldsOnly(originalDataInEdit, data, skills, questions, attachment)}
                      onClick={() => {
                        handleSaveFunction("DRAFT")
                      }}
                    >
                      {contentLabel("Save", "nf Save")}
                    </button>
                  </div>
                  <div>
                    <button
                      class="btn btn-primary "
                      onClick={() => {
                        setSteps((prev) => {
                          return { ...prev, step1: true, step2: false };
                        });
                      }}
                    >
                      {contentLabel("Next", "nf Next")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {
          // Step 1 Opportunity Description

          steps.step1 && !steps.step2 && (
            <div className="m-sm-5 m-2">
              <form>
                <Col xs={12}>
                  <Col className="mb-3">
                    <BriefDescriptionTextArea
                      isRequired={true}
                      isBold={true}
                      label={contentLabel(
                        "JobDescriptionLabel",
                        "nf Job Description Label"
                      )}
                      limit={3000}
                      row={6}
                      id={12}
                      name={"Description"}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      value={data.description || ''}
                    />
                  </Col>
                </Col>

                <Col className="mt-2">
                  <div className="mb-3">
                    <BriefDescriptionTextArea
                      isRequired={true}
                      isBold={true}
                      label={contentLabel(
                        "Responsiblities",
                        "nf Responsiblities"
                      )}
                      limit={3000}
                      row={6}
                      id={12}
                      name={"responsibilities"}
                      onChange={(e) =>
                        handleChange("responsibilities", e.target.value)
                      }
                      value={data.responsibilities || ''}
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="mb-3">
                    <BriefDescriptionTextArea
                      isRequired={true}
                      isBold={true}
                      label={contentLabel("Benefits", "nf Benefits")}
                      limit={3000}
                      row={6}
                      id={12}
                      name={"benefits"}
                      onChange={(e) => handleChange("benefits", e.target.value)}
                      value={data.benefits || ""}
                    />
                  </div>
                </Col>
              </form>

              <div>
                <div class=" d-flex justify-content-between gap-2 ">
                  <button
                    class="btn btn-primary  "
                    onClick={() => {
                      setSteps((prev) => {
                        return { ...prev, step1: false };
                      });
                    }}
                  >
                    {" "}
                    {contentLabel("Back", "nf Back")}{" "}
                  </button>
                  <div className="move-right-end d-flex gap-2">
                    <div>
                      <button
                        disabled={saving || !compareFieldsOnly(originalDataInEdit, data, skills, questions, attachment)}
                        class="btn btn-primary "
                        onClick={() => {
                          handleSaveFunction("DRAFT")
                        }}
                      >
                        {contentLabel("Save", "nf Save")}
                      </button>
                    </div>
                    <div>
                      <button
                        class="btn btn-primary "
                        onClick={() => {
                          setSteps((prev) => {
                            return {
                              ...prev,
                              step1: true,
                              step2: true,
                              step3: false,
                            };
                          });
                        }}
                      >
                        {contentLabel("Next", "nf Next")}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )
        }

        {
          // Step 2 Opportunity Candidate Requirement

          steps.step1 && steps.step2 && !steps.step3 && (
            <div className="m-sm-5 m-2 ">
              <form>
                <Row>
                  <Col xl={6} className="mb-4">
                    <label className="form-label fw-bold">
                      {contentLabel("ExperienceLevel", "nf Experience Level")}{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <select
                      className="form-select"
                      aria-label="Select..."
                      onChange={(e) => {
                        const selectedOption =
                          e.target.options[e.target.selectedIndex];
                        const selectedId =
                          selectedOption.getAttribute("data-id");
                        handleChange("jdExpLvlId", selectedId);
                        handleChange("experienceLevel", e.target.value);

                        // console.log(selectedId); // Logs the id of the selected option
                      }}
                      // defaultValue={data.experienceLevel}
                      value={data.experienceLevel || ""}
                    >
                      <option value="" disabled>
                        {contentLabel(
                          "PleaseSelectAnExp",
                          "nf Please select an experience level"
                        )}{" "}
                      </option>
                      {Array.isArray(exprieinceLevelData) &&
                        exprieinceLevelData.map(
                          (Options, i) =>
                            Options.expLevelName && (
                              <option
                                key={i}
                                value={Options.expLevelName}
                                data-id={Options.id}
                              >
                                {Options.expLevelName}
                              </option>
                            )
                        )}
                    </select>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className="mt-2 mb-3">
                    <Col className="d-flex justify-content-between fs-6 fw-bold mb-0">
                      <Card.Subtitle
                        style={{ color: "#57712" }}
                        className="fw-bold"
                      >
                        {contentLabel(
                          "RequiredSkills",
                          "nf Required Skills"
                        )}
                        <span className="text-danger"> *</span>
                      </Card.Subtitle>
                    </Col>
                    <hr className='mt-0 mb-0' />
                  </Col>

                  <Col xs={12} sm={6} >
                    <Col className="mb-3">
                      <label
                        for="exampleFormControlInput1"
                        className="form-label"
                        style={{ fontWeight: "bold" }}
                      >
                        {contentLabel(
                          "FindSkillsByOccupation",
                          "nf Find Skills By Occupation"
                        )}
                      </label>

                      <div className="custom-dropdown1">
                        <div
                          className="dropdown-toggle1 form-control"
                          style={{ border: 'none' }}
                          onClick={() => setIsOpen(!isOpen)}
                          role="button"
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                        >
                          <div className='d-flex justify-content-between align-items-center'>
                            {occupationValue || contentLabel("PleaseSelectOccupation", "nf Please select a Occupation")}
                            <icons.FaChevronDown className='downarrow-icon-custom' />
                          </div>
                        </div>

                        {isOpen && (

                          <ul className="dropdown-menu1 m-0 shadow"
                            style={{
                              position: "absolute",
                              bottom: "100%",
                              left: 0,
                              zIndex: 1000,
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              backgroundColor: "#fff",
                            }}
                            ref={dropdownRefOcc}>
                            <Col className="d-flex align-items-center position-relative">
                              <input
                                type="text"
                                placeholder={
                                  isFocused
                                    ? ""
                                    : contentLabel(
                                      "EnterOccupation",
                                      "nf Enter Occupation"
                                    )
                                }
                                onFocus={handleFocusocc}
                                onBlur={handleBlurocc}
                                className="form-control mx-2 my-2"
                                value={occupationValue}
                                onChange={(e) => { handleChangeOccupation(e); setIsOccupationSuggestionOpen(true) }}
                                style={{ overflowX: "hidden" }}
                              />
                              {suggestionLoaderOcc && (
                                <div
                                  className=" position-absolute end-0 "
                                  style={{
                                    marginRight: "50px",
                                    width: "50px",
                                    zIndex: "999",
                                  }}
                                >
                                  <ThreeDots width={"30"} height={"10"} className='p-0 m-0' />
                                </div>
                              )}
                              {/* Occupation suggestions */}
                              {occupationValue && occupationSuggestion.length > 0 && isOccupationSuggestionOpen && (
                                <Col
                                  ref={dropdownRefOcc}
                                  className="dropdown-menu d-block postion-absolute top-0 p-0"
                                  style={{
                                    height: "200px",
                                    overflowY: "scroll",
                                    overflowX: "hidden",
                                    // borderRadius: "8px",
                                    border: 'none',
                                    marginTop: '3.5rem',

                                    width: "100%",
                                  }}
                                >
                                  {occupationSuggestion.map((skillRecord, index) => (
                                    <a
                                      className="dropdown-item d-flex justify-content-between align-items-center p-2 px-3 m-0"
                                      key={index}
                                      onClick={() => {
                                        if (!skillRecord.hasOwnProperty("dontSelect"))
                                          handleSelectOptionOcc(
                                            skillRecord.occupationName
                                          );
                                      }}
                                      style={{
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        borderRadius: '0px !important'
                                      }}
                                    >
                                      {skillRecord.occupationName}
                                      <icons.FaAngleRight />
                                    </a>
                                  ))}
                                </Col>
                              )}
                            </Col>

                            {!occupationSuggestion.length > 0 && (
                              <>
                                {Array.isArray(occupationMasterData) && occupationMasterData.length > 0 ? (
                                  occupationMasterData.map(
                                    (Options, i) =>
                                      Options?.occupationName && (
                                        <li
                                          key={i}
                                          className="dropdown-item1"
                                          onClick={() => handleSelect(Options.occupationName)}
                                        >
                                          {Options.occupationName}
                                        </li>
                                      )
                                  )
                                ) : (
                                  <li className="dropdown-item1">
                                    {contentLabel("NoOptionsAvailable", "nf No options available")}
                                  </li>
                                )}
                              </>
                            )}
                          </ul>
                        )}
                      </div>

                      {/* Skills list of occupation */}
                      {occupationName && (
                        <Col ref={dropdownRefOcc} className="" style={{ position: "relative" }}>
                          <Col className="dropdown-menu d-block postion-absolute p-0 "
                            style={{
                              // top:'0%',
                              // position: "absolute",
                              bottom: "0%",
                              marginBottom: '2.55rem',
                              // left: 0,
                              // zIndex: 1000,
                              // border: "1px solid #ccc",
                              // borderRadius: "4px",
                              // backgroundColor: "#fff",
                              height: "200px",
                              width: "100%",
                            }}
                          >
                            {/* <Col
                        style={{
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          height: "28px",
                        }}
                        className="d-flex justify-content-center w-auto"
                      >
                        {contentLabel("AddTheSkills", "nf Add The Skills")}
                      </Col> */}

                            <Col
                              className="px-2 py-1 mt-1 position-relative"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                              }}
                            >
                              <input
                                placeholder={contentLabel(
                                  "SearchForSkills",
                                  "nf Search For Skills"
                                )}
                                className="w-100 mb-1 form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              {occupationValue && (
                                <button
                                  className="btn btn-clear position-absolute"
                                  style={{
                                    right: "1.5rem",
                                    top: "45%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    padding: "0",
                                    cursor: "pointer",
                                  }}
                                  onClick={handleClearInputocc}
                                >
                                  <icons.FaTimes />
                                </button>
                              )}
                            </Col>

                            {/* Listing of Skills */}
                            <Col
                              className="overflow-x-hidden overflow-y-auto "
                              style={{ height: "70%" }}
                            >
                              {loaderOcuppationSkill && (
                                <div className="">
                                  <div
                                    className="d-flex justify-content-center align-items-center  h-100"
                                  // style={{ height: "180px" }}
                                  >
                                    <div
                                      className="spinner-border"
                                      style={{
                                        width: "2rem",
                                        height: "2rem",

                                      }}
                                      role="status"
                                    >
                                      <span className="visually-hidden">
                                        {contentLabel("Loading", "nf Loading")}{" "}
                                        ...
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <table className="w-100  table-Opportunities table-hover">
                                <tbody>
                                  {occupationFiltredData
                                    ?.filter((occu) =>
                                      occu.skill
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase())
                                    )
                                    .map((occu) => {
                                      return (
                                        <tr key={occu.id}
                                          className='cursor-pointer seeker-skills-tr '>
                                          <td style={{ padding: "0 1rem" }}>{occu.skill}</td>
                                          <td
                                            className="d-flex justify-content-end"
                                            onClick={() => {
                                              if (
                                                skillArray.some(
                                                  (skill) =>
                                                    skill.skillOccupation ===
                                                    occu.skillOccupation
                                                )
                                              )
                                                return;

                                              dispatch(
                                                setOpportunitySkills([
                                                  ...skills,
                                                  {
                                                    skill: occu.skill,
                                                    skillOccupation:
                                                      occu.skillOccupation,
                                                    occupation: occu.occupation,
                                                    checked: false,
                                                    id: crypto.randomUUID(),
                                                    skillid: occu.id,
                                                    min: "0",
                                                    max: "0",
                                                    timeunit: "year",
                                                    isNew: true,
                                                  },
                                                ])
                                              );

                                              //remove skill from suggestion list
                                              setOccupationFiltredData(
                                                occupationFiltredData.filter(
                                                  (skillData) =>
                                                    skillData.skill.toLowerCase() !==
                                                    occu.skill.toLowerCase()
                                                )
                                              );
                                            }}
                                          >
                                            <span
                                              className=" fs-3 text-primary-color cursor-pointer"
                                              style={{ padding: "0 1rem" }}
                                            >
                                              <icons.IoIosAddCircle />
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </Col>
                          </Col>
                        </Col>
                      )}
                    </Col>
                  </Col>

                  {/* <Col xs={12} sm={6} className="">
                    <Col className="mb-3">
                      <label
                        for="exampleFormControlInput1"
                        className="form-label fw-bold"
                      >
                        {contentLabel(
                          "FindSkillsByName",
                          "nf Find Skills By Name"
                        )}
                      </label>

                      <Col className="w-100 d-flex align-items-center justify-content-between position-relative"
                        style={{ position: 'relative' }}
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder={
                            isFocused
                              ? ""
                              : contentLabel("PleaseEnterASkill", "nf Please enter a skill")
                          }
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          className="form-control "
                          value={selectedOccupation === null ? SkillValue : `${SkillValue} | | ${selectedOccupation?.label}`}
                          onChange={(e) => { handleChangeSkill(e); setIsSkillSuggestionOpen(true) }}
                          onClick={() => {
                            if (selectedOccupation) {
                              handleModalClose();
                            }
                          }}
                        />

                        {SkillValue && (
                          <>
                            <button
                              className="btn btn-clear position-absolute end-0 "
                              onClick={() => { handleClearInput(); handleModalClose(); }}
                            >
                              <icons.FaTimes />
                            </button>
                          </>
                        )}

                        {SkillValue && isSkillSuggestionOpen && (
                          <Col
                            ref={dropdownRef}
                            className="dropdown-menu d-block  top shadow"
                            style={{
                              position: "absolute",
                              bottom: "2.6rem",
                              height: "200px",
                              overflowY: "scroll",
                              overflowX: "hidden",
                              borderRadius: "3px",
                              // borderTopLeftRadius:'0px',
                              // borderTopRightRadius:'0px',
                              zIndex: "999",
                              width: skillDropdownWidth,
                            }}
                          >

                            {
                              suggestionLoader && (
                                <div
                                  className="d-flex justify-content-center align-items-center h-100"
                                >
                                  <div
                                    className="spinner-border"
                                    style={{
                                      width: "2rem",
                                      height: "2rem",

                                    }}
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      {contentLabel("Loading", "nf Loading")} ...
                                    </span>
                                  </div>
                                </div>

                              )
                            }
                            {!suggestionLoader && SkillSuggestions.length > 0 && SkillSuggestions.map((skillRecord, index) => (
                              <a
                                className="dropdown-item d-flex justify-content-between align-items-center p-2 px-3 m-0"
                                key={index}
                                onClick={() => {
                                  if (!skillRecord.hasOwnProperty("dontSelect")) {
                                    setSelectedSkill(skillRecord);
                                    console.log("sill record ", skillRecord);
                                    // setSelectedSkillId(skillRecord.id);
                                    // setSelectedOccupation(skillRecord.occupation);
                                    // setSkillName(skillRecord.skill);
                                    handleSelectOption(skillRecord.skillOccupation);
                                    setIsCustomSkill(false);
                                    setIsSkillSuggestionOpen(false);
                                  }
                                }}
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "none",
                                }}
                              >
                                {skillRecord.skillOccupation}
                                {
                                  !skillRecord.hasOwnProperty("dontSelect") &&
                                  <icons.FaAngleRight />
                                }
                              </a>
                            ))}

                            CREATE NEW SKILL
                            {!suggestionLoader && SkillValue?.length > 2 && (
                              <a
                                className="dropdown-item d-flex justify-content-between p-2 align-items-center px-3 m-0"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  setSelectedSkill(SkillValue);
                                  handleSelectOption(SkillValue);
                                  setIsShowOccupationPopup(true);
                                  setIsCustomSkill(true);
                                }}
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  paddingTop: "8px",
                                }}
                              >
                                {`${contentLabel('Create', 'nf Create')} "${SkillValue}"`}
                                <icons.FaAngleRight />
                              </a>
                            )}
                          </Col>
                        )}

                      </Col>

                      OCCUPATION POPUP
                      {isShowOccupationPopup && (
                        <React.Fragment>
                          <div
                            style={{
                              position: "fixed",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              zIndex: 1040,
                            }}
                          ></div>
                          <div
                            className="modal"
                            tabindex="-1"
                            role="dialog"
                            style={{ display: "block" }}
                          >
                            <div
                              className="modal-dialog"
                              role="document"
                              style={{ marginTop: "5rem" }}
                            >
                              <div className="modal-content" style={{ backgroundColor: "var(--PalateWhite)" }}>
                                <div className="modal-header">
                                  <h5 className="modal-title fw-bold">
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "EnterOccupation"
                                      ) || {}
                                    ).mvalue || "nf Enter Occupation"}
                                  </h5>
                                  <button
                                    type="button"
                                    className="close"
                                    style={{ border: "none", backgroundColor: "var(--PalateWhite)" }}
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={handleModalClose}
                                  >
                                    <span aria-hidden="true">
                                      <icons.CloseIcon />
                                    </span>
                                  </button>
                                </div>
                                <div class="modal-body">
                                  <CreateSelectOccupation
                                    occupationData={setSelectedOccupation}
                                    isNewOccupation={isNewOccupation}
                                    setIsNewOccupation={setIsNewOccupation}
                                    isSeeker={true}
                                    categoryDetail={categoryDetail}
                                    handleCategoryDetailChange={handleCategoryDetailChange}
                                  />
                                </div>
                                <div class="modal-footer border-top-0">
                                  <CustomButton
                                    title={
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) => item.elementLabel === "Save&Close"
                                        ) || {}
                                      ).mvalue || "nf Save & Close"
                                    }
                                    onClick={handleOccupationSave}
                                    disabled={isSavingOccupation || !selectedOccupation || (isNewOccupation && !categoryDetail?.categoryName)}
                                  />
                                  <CustomButton
                                    title={
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) => item.elementLabel === "Close"
                                        ) || {}
                                      ).mvalue || "nf Close"
                                    }
                                    data-dismiss="modal"
                                    onClick={handleModalClose}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      )}

                      <Col className="d-flex justify-content-end">
                        <Button
                          variant="primary"
                          onClick={handleAddNewSkill}
                          className="mt-2   "
                          style={{
                            color: "#F7FFDD",
                            border: "none",
                            zIndex: "988",
                          }}
                          disabled={isAddingNewSkill}
                        >
                          {contentLabel("Add", "nf Add")}
                        </Button>
                      </Col>
                    </Col>
                  </Col> */}

                  <Col xs={12} sm={6}></Col>
                  <Col xs={12} className="my-3" style={{ overflowY: "hidden" }}>
                    {skills.length !== 0 ? (
                      <>
                        <span className="text-secondary ">
                          <i>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "SelectTheCheckbox"
                              ) || {}
                            ).mvalue ||
                              "nf *select the checkbox to make the skill mandatory"}
                          </i>
                        </span>
                        <Col className="mb-3 d-flex flex-wrap w-100">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">
                                  {contentLabel("SkillName", "nf Skill Name")}
                                </th>
                                <th scope="col">
                                  {contentLabel("Occupation", "nf Occupation")}
                                </th>

                                <th>
                                  {contentLabel("Experience", "nf Experience")}
                                </th>
                                <th scope="col">
                                  {contentLabel("Mandartory", "nf Mandartory")}
                                </th>

                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {skills.map((skill, index) => {
                                return (
                                  <tr
                                    style={{
                                      opacity:
                                        skill.hasOwnProperty("isDelete") &&
                                          skill.isDelete
                                          ? "60%"
                                          : "",
                                    }}
                                    key={skill.id}
                                  >
                                    <th scope="row">{index + 1}</th>
                                    <td>{skill.skill}</td>
                                    <td>{skill.occupation}</td>

                                    <td>
                                      <div className="d-flex align-items-top">
                                        <label className="d-flex align-items-center">
                                          {contentLabel("From", "nf From")}
                                        </label>
                                        <input
                                          type="Number"
                                          className="form-control ms-1"
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
                                            if (value > skill.max) {
                                              inputMaxChange(skill.id, skill.min);
                                            }
                                          }}
                                        />
                                        <label className="ms-2 d-flex align-items-center">
                                          {contentLabel("To", "nf To")}
                                        </label>
                                        <input
                                          type="Number"
                                          className="form-control ms-1"
                                          min={Number(skill?.min)}
                                          style={{
                                            width: "60px",
                                            height: "30px",
                                          }}
                                          value={skill.max}
                                          onChange={(e) =>
                                            inputMaxChange(
                                              skill.id,
                                              e.target.value
                                            )
                                          }
                                          onBlur={(e) => {
                                            const value = Number(skill?.max) || Number(e.target.value);
                                            if (value < skill?.min) {
                                              inputMaxChange(skill?.id, skill?.min);
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
                                            // console.log(e.target.id);
                                            inputTimeUnitChange(
                                              skill.id,
                                              e.target.value
                                            );
                                          }}
                                        >
                                          <option id="year" value="year">
                                            {(
                                              content[selectedLanguage]?.find(
                                                (item) =>
                                                  item.elementLabel === "Years"
                                              ) || {}
                                            ).mvalue || "nf year(s)"}
                                          </option>
                                          <option id="month" value="month">
                                            {(
                                              content[selectedLanguage]?.find(
                                                (item) =>
                                                  item.elementLabel === "Months"
                                              ) || {}
                                            ).mvalue || "nf Month(s)"}
                                          </option>
                                          <option id="week" value="week">
                                            {(
                                              content[selectedLanguage]?.find(
                                                (item) =>
                                                  item.elementLabel === "Weeks"
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
                                        checked={skill.checked}
                                        onChange={(e) =>
                                          toggleChecked(skill.id, e)
                                        }
                                      />
                                    </td>

                                    {skill.hasOwnProperty("isDelete") &&
                                      skill.isDelete ? (
                                      <td
                                        style={{ cursor: "pointer" }}
                                        onClick={() => addSkill(skill.id)}
                                      >
                                        <icons.AddOutlinedIcon />
                                      </td>
                                    ) : (
                                      <td
                                        style={{ cursor: "pointer" }}
                                        onClick={() => deleteSkill(skill.id)}
                                      >
                                        <icons.IoClose size={20} />
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </Col>
                      </>
                    ) : null}
                  </Col>
                </Row>
              </form>

              <div class=" d-flex justify-content-between gap-2 mt-5">
                <button
                  class="btn btn-primary"
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step2: false };
                    });
                  }}
                >
                  {" "}
                  {contentLabel("Back", "nf Back")}{" "}
                </button>
                <div className="move-right-end d-flex gap-2">
                  <div>
                    <button
                      disabled={saving || !compareFieldsOnly(originalDataInEdit, data, skills, questions, attachment)}
                      class="btn btn-primary "
                      onClick={() => {
                        handleSaveFunction("DRAFT")
                      }}
                    >
                      {contentLabel("Save", "nf Save")}
                    </button>
                  </div>
                  <button
                    class="btn btn-primary"
                    onClick={() => {
                      setSteps({
                        step1: true,
                        step2: true,
                        step3: true,
                        step4: false,
                      });
                    }}
                  >
                    {" "}
                    {contentLabel("Next", "nf Next")}{" "}
                  </button>
                </div>

              </div>
            </div>
          )
        }

        {
          // step 3  Screening question

          steps.step1 && steps.step2 && steps.step3 && !steps.step4 && (
            <div className="m-sm-5 m-2 ">
              <form>
                <Row className="row">
                  <Col xs={12}>
                    <h6 className="fs-6 fw-bold">
                      {contentLabel("Questions", "nf Questions")}
                    </h6>
                    <hr />
                  </Col>

                  <Col xs={12} className="mt-2">
                    <div className="mb-3">
                      <label
                        className="form-label fw-bold"
                        style={{ fontWeight: "bold" }}
                      >
                        {contentLabel("Question", "nf Question")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                    </div>
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold" }}
                      >
                        {contentLabel("AnswerType", "nf Answer Type")}
                      </label>
                      {/* <CreatableSelect
                        isClearable
                        options={queOptions}
                        value={selectedAnswer}
                        onChange={handleAnswerChange}
                      /> */}
                      <Dropdown1
                        controlId={"answerType"}
                        noLabel={true}
                        options={queOptions}
                        value={
                          queOptions.find(
                            (option) => option?.value === selectedAnswer
                          )?.value || ""
                        }
                        onChange={handleAnswerChange}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div
                      className={`mb-3 ${!selectedAnswer ||
                        !(
                          selectedAnswer === "Options" ||
                          selectedAnswer?.startsWith("nf Options")
                        )
                        ? "d-none"
                        : ""
                        }`}
                    >
                      <label
                        className="form-label fw-bold"
                        style={{ fontWeight: "bold" }}
                      >
                        {contentLabel("Options", "nf Options")}
                      </label>
                      <CreatableSelect
                        components={components}
                        inputValue={inputValue}
                        isClearable
                        isMulti
                        menuIsOpen={false}
                        onChange={(newValue) => setOptionArray(newValue)}
                        onInputChange={(newValue) => setInputValue(newValue)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "TypeOptions"
                            ) || {}
                          ).mvalue || "nf Type options and press enter..."
                        }
                        value={optionArray}
                      />
                    </div>
                  </Col>

                  <div className="col-12 d-flex justify-content-end">
                    <div className="mb-3">
                      <Button
                        disabled={(
                          question.trim() === "" ||
                          selectedAnswer.trim() === "" ||
                          ((selectedAnswer === "Options" || selectedAnswer === "nf Options") &&
                            optionArray.length === 0)
                        ) ? true : false}
                        variant="primary"
                        onClick={handleAddQuestion}
                        style={{
                          backgroundColor: "var(--primary-color)",
                          border: "none",
                        }}
                      >
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "AddQuestion"
                          ) || {}
                        ).mvalue || "nf Add Question"}
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`col-12 ${questions && questions.length === 0 ? "d-none" : ""
                      }`}
                  >
                    <span className="text-secondary ">
                      <i>
                        {(
                          content[selectedLanguage]?.find(
                            (item) =>
                              item.elementLabel === "DragAndDropQuestion"
                          ) || {}
                        ).mvalue ||
                          "nf *Drag and drop to reorder your questions "}
                      </i>
                    </span>
                    <div className="mb-3">
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                          {(provided) => (
                            <table
                              className="table table-hover"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              <thead>
                                <tr>
                                  <th scope="col">#</th>
                                  <th scope="col">
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Question"
                                      ) || {}
                                    ).mvalue || "nf Question"}
                                  </th>
                                  <th scope="col">
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "AnswerType"
                                      ) || {}
                                    ).mvalue || "nf Answer Type"}
                                  </th>
                                  <th scope="col">
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Options"
                                      ) || {}
                                    ).mvalue || "nf Options"}
                                  </th>
                                  <th scope="col">
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Required"
                                      ) || {}
                                    ).mvalue || "nf Required"}
                                  </th>
                                  <th scope="col"></th>
                                </tr>
                              </thead>
                              <tbody>

                                {questions.slice().sort((a, b) => (+a.rank || 0) - (+b.rank || 0)).map((obj, index) => (
                                  <Draggable
                                    key={obj.id}
                                    draggableId={obj.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                          border: snapshot.isDragging
                                            ? "2px solid var(--primary-color)"
                                            : "inherit",
                                          opacity:
                                            obj.hasOwnProperty("isDelete") &&
                                              obj.isDelete
                                              ? "60%"
                                              : "",
                                        }}
                                      >
                                        {/* {console.log("OBJ OBJ", obj)} */}
                                        <th
                                          scope="row"
                                          style={{
                                            width: "60px",
                                          }}
                                        >
                                          {obj.rank}
                                        </th>
                                        <td
                                          style={{
                                            width: "340px",
                                          }}
                                          className="wrap-text"
                                        >
                                          {obj.question}
                                        </td>
                                        <td
                                          style={{
                                            width: "200px",
                                          }}
                                          className="wrap-text"
                                        >
                                          {obj?.typeOfQuestion || obj.jdType}
                                        </td>
                                        <td
                                          style={{
                                            width: "360px",
                                          }}
                                          className="wrap-text"
                                        >
                                          {obj.options
                                            .map((option) => option.label)
                                            .join(", ")}
                                        </td>
                                        <td
                                          style={{
                                            width: "200px",
                                          }}
                                          className="wrap-text"
                                        >
                                          <input
                                            type="checkbox"
                                            style={{
                                              width: "40px",
                                              height: "20px",
                                            }}
                                            checked={obj.required}
                                            onChange={(e) =>
                                              toggleRequired(
                                                obj.id,
                                                e.target.checked
                                              )
                                            }
                                          />
                                        </td>
                                        {obj.hasOwnProperty("isDelete") &&
                                          obj.isDelete ? (
                                          <td
                                            onClick={() => undoDelete(obj.id)}
                                            style={{
                                              cursor: "pointer",
                                              width: "40px",
                                            }}
                                            className="wrap-text"
                                          >
                                            <icons.AddOutlinedIcon />
                                          </td>
                                        ) : (
                                          <td
                                            onClick={() =>
                                              deleteQuestion(obj.id)
                                            }
                                            style={{
                                              cursor: "pointer",
                                              width: "40px",
                                            }}
                                            className="wrap-text"
                                          >
                                            <icons.DeleteOutlineOutlinedIcon />
                                          </td>
                                        )}
                                      </tr>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </tbody>
                            </table>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </Row>
              </form>
              <div class=" d-flex justify-content-between gap-2 mt-5">
                <button
                  class="btn btn-primary"
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step3: false };
                    });
                  }}
                >
                  {" "}
                  {contentLabel("Back", "nf Back")}{" "}
                </button>
                <div className="move-right-end d-flex gap-2">
                  <div>
                    <button
                      class="btn btn-primary "
                      disabled={saving || !compareFieldsOnly(originalDataInEdit, data, skills, questions, attachment)}
                      onClick={() => {
                        handleSaveFunction("DRAFT")
                      }}
                    >
                      {contentLabel("Save", "nf Save")}
                    </button>
                  </div>
                  <button
                    class="btn btn-primary"
                    onClick={() => {
                      setSteps({
                        step1: true,
                        step2: true,
                        step3: true,
                        step4: true,
                      });
                    }}
                  >
                    {" "}
                    {contentLabel("Next", "nf Next")}{" "}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {
          // step 4  Screening question

          steps.step1 && steps.step2 && steps.step3 && steps.step4 && (
            <div className="m-sm-5 m-2 ">
              <OpportunityPreviewPageTemplate
                data={data}
                skills={skills}
                questions={questions?.filter(
                  (qn) =>
                    !qn.hasOwnProperty("isDelete") || qn.isDelete === false
                )}
                showCompany={true}
              />
              <div className="d-flex justify-content-between mt-5">
                <button
                  class="btn btn-primary"
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step4: false };
                    });
                  }}
                >
                  {" "}
                  {contentLabel("Back", "nf Back")}
                </button>

                <div className="d-flex justify-content-between gap-3">
                  <Button
                    variant="primary"
                    className="btn-md"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      border: "none",
                    }}
                    onClick={() => {
                      handlePost("DRAFT");
                    }}
                    disabled={postLoading}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Save"
                      ) || {}
                    ).mvalue || "nf save"}
                  </Button>
                  <Button
                    variant="primary"
                    className="btn-md"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      border: "none",
                    }}
                    // onClick={() => {
                    //   handlePost("PUBLISH");
                    // }}
                    onClick={() => {
                      if (formValidate("PUBLISH")) {
                        setModalVisible(true)
                      } else {
                        showErrorToast(contentLabel("MissingMandatoryFields", "nf MissingMandatoryFields"))
                      }
                    }
                    }
                    disabled={postLoading}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Publish"
                      ) || {}
                    ).mvalue || "nf Publish"}
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default EditOpportunity;