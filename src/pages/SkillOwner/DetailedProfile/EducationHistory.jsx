import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import { useSelector } from "react-redux";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import EducationSummary from "../../../components/SkillOwner/DetailedProfile/EducationSummary";
import EducationDetail from "../../../components/SkillOwner/DetailedProfile/EducationDetail";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import PostApi from "../../../api/PostData/PostApi";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { fetchEducationHistory } from "../../../api/fetchAllData/fetchEducationHistory";
import { useDispatch } from "react-redux";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import { timestampToYYYYMMDD } from "./../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import SmallLoader from "../../../components/SkillAvailer/SmallLoader";
import { showWarningToast } from "./../../../components/ToastNotification/showWarningToast";
import { debouncedApiRequest } from "../../../components/DebounceHelperFunction/debouncedApiRequest";
import educationInstitutionApi from "../../../api/searchSuggestionAPIs/educationInstitutionApi";
import CreateSelectInstitution from "../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { ThreeDots } from "react-loader-spinner";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import CreatableSelectForDeg from "../../../components/CreatableSelectForDeg";
import CreatableSelect from "react-select/creatable";
import degreeSearchSuggestions from "../../../api/searchSuggestionAPIs/degreeSearchSuggestions";
import { components, DropdownIndicatorProps } from "react-select";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { toTitleCase } from "../../../components/SkillOwner/HelperFunction/toTitleCase";
import EditApi from "../../../api/editData/EditApi";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../../config/constant";
import useContentLabel from "../../../hooks/useContentLabel";
import { getCookie } from '../../../config/cookieService';


const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <></>
    </components.DropdownIndicator>
  );
};

const IndicatorSeparator = (innerProps) => {
  return <></>;
};

const EducationHistory = () => {
  const buttonRef = useRef(null);
  const [onGoing, setOnGoing] = useState(false);
  const educationHistory = useSelector((state) => state.educationHistory);
  /* STORE IMPORTS */
  const { regionalData } = useSelector((state) => state);
  const dispatch = useDispatch();
  const contentLabel = useContentLabel();

  const [editEnable, setEditEnable] = useState(false);
  const [switchTab, setSwitchTab] = useState("");

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);

  const [location, setLocation] = useState("");
  const [online, setOnline] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isNewEducationDegree, setIsNewEducationDegree] = useState(false);
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);

  const handleInsParentToChild = (val) => {
    setIsCustomInstitution(val);
  };

  let innistalState = {
    institute: "",
    InstituteShowHide: "Yes",
    startDate: "",
    endDate: "",
    course: "",
    location: "",
    briefDescriptions: "",
    userId:getCookie("userId"),
    mlanguage: getCookie("HLang"),
  };

  const [newEducation, setNewEducation] = useState(innistalState);

  useEffect(() => {
    dispatch(fetchEducationHistory());
    console.log("eddd ", educationHistory);
  }, []);

  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  const handleEdit = () => {
    setEditEnable(!editEnable);
  };

  const handleAccordion1 = (event) => {
    if (summaryTab1 === false && DetailTab1 === false) {
      setsummaryTab1(true);
      console.log("set sum 1");
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

  const handleDetailsSummary = (event) => {
    event.stopPropagation();
    setsummaryTab1(false);
    setDetailTab1(true);
  };

  const handleSummaryClick = (event) => {
    event.stopPropagation();
    setDetailTab1(false);
    setsummaryTab1(true);
  };

  const handlePdf = () => {
    window.print();
  };

  const handleValidateProject = () => {
    setValidation(true);
  };

  const handleValidationClose = () => {
    setValidation(false);
  };
  const toggleOnline = () => {
    setOnline(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  // modal validation show hide
  const [Validation, setValidation] = useState(false);
  const actualBtnRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleModalClose = () => {
    setValidation(false);
  };

  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  useEffect(() => {
    console.log(newEducation, "New Education console");
    console.log(location);
  }, [newEducation]);

  const checkDuplicate = () => {
    console.log(educationHistory);
    var duplicate = false;

    educationHistory?.data?.map((edu) => {
      if (
        edu.course === newEducation.course &&
        edu.institute === newEducation.institute
      ) {
        console.log(edu);
        console.log(newEducation);

        let fromDate = convertDateToMilliseconds(newEducation.startDate);
        let toDate = newEducation.endDate
          ? convertDateToMilliseconds(newEducation.endDate)
          : Date.now();

        console.log(fromDate, edu.startDate);
        console.log(toDate, edu.endDate ? edu.endDate : Date.now());
        console.log(Date.now());

        if (
          fromDate === edu.startDate ||
          toDate === (edu.endDate ? edu.endDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= edu.startDate &&
            fromDate <= (edu.endDate ? edu.endDate : Date.now())) || // User from date falls within existing date range
          (toDate >= edu.startDate &&
            toDate <= (edu.endDate ? edu.endDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= edu.startDate &&
            toDate >= (edu.endDate ? edu.endDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= edu.startDate &&
            toDate >= edu.startDate &&
            toDate <= (edu.endDate ? edu.endDate : Date.now())) || // Right-side overlap
          (toDate >= (edu.endDate ? edu.endDate : Date.now()) &&
            fromDate >= edu.startDate &&
            fromDate <= (edu.endDate ? edu.endDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  const handleAddNewEducation = (close) => {
    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "EducationAlreadyExistDate"
          ) || {}
        ).mvalue || "nf Education already exist in within the date range"
      );
      return;
    }

    setIsAddingEducation(true);
    if (
      newEducation.course.length === 0 &&
      newEducation.institute.length === 0 &&
      newEducation.location.length === 0
    ) {
      showWarningToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "FillRequiredFieldSubmit"
          ) || {}
        ).mvalue || "nf Fill required field and submit"
      );
      setIsAddingEducation(false);
      return;
    }

    PostApi("Education History", {
      ...newEducation,
      startDate: FormatDateIntoPost(newEducation.startDate),
      location: location,
      endDate: newEducation.endDate
        ? FormatDateIntoPost(newEducation.endDate)
        : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(newEducation.startDate),
        newEducation.endDate
          ? convertDateToMilliseconds(newEducation.endDate)
          : Date.now()
      ),
    })
      .then((res) => {
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "EducationAddedSuccessful"
            ) || {}
          ).mvalue || "nf Education Added Successful"
        );
        console.log(res, "Datatata");
        const data = res?.data;
        /* CREATE NEW RECORD OF DEGREE IN MASTER INCASE OF NEW DEGREE ENTERED */
        if (isNewEducationDegree) {
          handleInsertNewDegree(
            data?.course,
            data?.mlanguage,
            data?.applicationName,
            data?.course,
            data?.id
          );
        }
        if (isCustomInstitution) {
          handleInsertNewInstitution(
            data?.institute,
            data?.mlanguage,
            data?.applicationName,
            data?.institute,
            data?.id
          );
        }

        dispatch(fetchEducationHistory());
        setNewEducation(innistalState);
        setLocation("");
        setOnGoing(false);

        if (close && buttonRef.current) {
          buttonRef.current.click();
        }
        setIsAddingEducation(false);
        setIsNewEducationDegree(false);
        setIsCustomInstitution(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "nf Something went wrong"
        );
        setIsAddingEducation(false);
      });
  };
  // const institutionAddClickForSave = () => {
  //     setLoaderOnForAdd(true);
  //     if (newEducation.course.length === 0 && newEducation.institute.length === 0 && newEducation.location.length === 0) {
  //         showWarningToast("Fill required field and submit");
  //         setLoaderOnForAdd(false);
  //         return;
  //     }

  //     PostApi("Education History", {
  //         ...newEducation, startDate: FormatDateIntoPost(newEducation.startDate), location: location,
  //         endDate: FormatDateIntoPost(newEducation.endDate)
  //     }).then((res) => {
  //         showSuccessToast("Education Added Successful");
  //         dispatch(fetchEducationHistory());
  //         setLoaderOnForAdd(false);
  //     }).catch((err) => {
  //         console.log(err);
  //         showErrorToast("Something went wrong");
  //         setLoaderOnForAdd(false);
  //     })
  // }

  //Api institution data
  const [institutionApiData, setInstitutionApiData] = useState([]);
  const [insConvertedToSelect, setInsConvertedToSelect] = useState([]);
  const [insSearch, setInsSearch] = useState("");
  const [eduApiLoader, setEduApiLoader] = useState(false);

  /* HANDLE CREATING NEW DEGREE IN MASTER */
  const handleInsertNewDegree = async (
    newCourseName,
    lang,
    moduleName,
    contentName,
    itemId
  ) => {
    const payload = {
      combined: newCourseName,
      mlanguage: lang,
      educationStatus: "W",
    };
    try {
      const res = await exceptionPOSTapi("Educational Degrees", payload);
      const data = res?.data;

      handleDegreeExceptions(
        data?.applicationName,
        data?.id,
        moduleName,
        contentName,
        itemId
      );
    } catch (error) {
      console.error("Error inserting new degree name: ", error);
    }
  };

  /* HANDLE CREATING NEW INSTITUTION NAME IN MASTER TABLE */
  const handleInsertNewInstitution = async (
    newInstName,
    lang,
    moduleName,
    contentName,
    itemId
  ) => {
    const payload = {
      institutionName: newInstName,
      mlanguage: lang,
      educationStatus: "W",
    };
    try {
      const res = await exceptionPOSTapi("Educational Institutions", payload);
      const data = res?.data;

      handleInstituteExceptions(
        data?.applicationName,
        data?.id,
        moduleName,
        contentName,
        itemId
      );
    } catch (error) {
      console.error("Error inserting new institution name: ", error);
    }
  };

  /* HANDLE DEGREE EXCEPTION */
  const handleDegreeExceptions = async (
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

  /* HANDLE INSTITUTE EXCEPTION */
  const handleInstituteExceptions = async (
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

  useEffect(() => {
    if (insSearch.length > 1 && insSearch !== " ") {
      setEduApiLoader(true);
      debouncedApiRequest(
        educationInstitutionApi,
        insSearch,
        selectedLanguage,
        setInstitutionApiData,
        setEduApiLoader
      );
    } else {
      setInsConvertedToSelect([]);
    }
  }, [insSearch]);

  useEffect(() => {
    if (institutionApiData.length > 0) {
      const data = institutionApiData.map((item) => {
        // Create a new object to hold the existing fields and the new fields
        const newItem = {
          ...item, // Spread the existing fields
          value: item.institutionName, // Add new field 1 with a default value
          label: item.institutionName, // Add new field 2 with a default value
          // Add new field 3 with a default value
        };
        return newItem;
      });
      setInsConvertedToSelect(data);
    }
  }, [institutionApiData]);

  ///for degree suggestions
  const [degData, setDegData] = useState([]);
  const [degreeSuggestionsData, setDegreeSuggestionsData] = useState([]);
  const [degSuggestionLoader, setDegSuggestionLoader] = useState(false);
  const [degSearchValue, setDegSearchValue] = useState("");
  const [selectedDeg, setSelectedDeg] = useState("");

  const degSearch = (e) => {
    if (e.length > 0) {
      setDegData([]);
      setDegSuggestionLoader(true);
      debouncedApiRequest(
        degreeSearchSuggestions,
        e,
        selectedLanguage,
        setDegreeSuggestionsData,
        setDegSuggestionLoader
      );
    } else {
      setDegData([]);
    }
  };

  useEffect(() => {
    if (
      degreeSuggestionsData.length > 0 &&
      degreeSuggestionsData[0].skillOccupation !== "No suggestions found"
    ) {
      const data = degreeSuggestionsData?.map((item) => {
        // Create a new object to hold the existing fields and the new fields
        const newItem = {
          ...item, // Spread the existing fields
          value: item.combined, // Add new field 1 with a default value
          label: item.combined, // Add new field 2 with a default value
          // Add new field 3 with a default value
        };
        return newItem;
      });
      setDegData(data);
    }
  }, [degreeSuggestionsData]);

  /* HANDLE DEGREE NAME CHANGE */
  const handleDegreeChange = (selectedOption) => {
    if (selectedOption) {
      /* CHECKING FOR THE ENTERED DEGREE VALUE PRESENT IN DB */
      const isExistingDegree = degData.some(
        (degree) => degree.label === selectedOption.label
      );

      if (!isExistingDegree) {
        /* FOR USER ENTERED VALUE */
        setNewEducation({
          ...newEducation,
          course: toTitleCase(selectedOption.label),
        });
        setIsNewEducationDegree(true);
      } else {
        /* FOR THE DEGREE VALUES IN DB */
        setNewEducation({ ...newEducation, course: selectedOption.label });
      }
    } else {
      setNewEducation({ ...newEducation, course: "" });
      setDegData([]);
    }
  };

  return (
    <>
      <div className="d-print-none">
        {/* <!-- Modal --> */}
        <div
          className="modal fade font-5 m-0 p-0 "
          style={{ margin: "0" }}
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex justify-content-between align-items-center  w-100  ">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    {" "}
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "EducationHistory"
                      ) || {}
                    ).mvalue || "nf Education History"}
                  </h1>
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
                  className="btn-close"
                  onClick={handleModalClose}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="mclose"
                  ref={buttonRef}
                ></button>
              </div>
              <div className="modal-body ">
                {/* form start */}
                <div className="   ">
                  {!Validation && (
                    <div className=" ">
                      {/* <div class="mb-2 ">
                                            <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CourseDegree') || {}).mvalue || "nf CourseDegree"}<span className='text-danger' > *</span></label>
                                            <input type="text" style={{ height: "32px" }} class="form-control bg-body-tertiary h-75 "
                                                id="" placeholder="" value={newEducation.course} onChange={(e) => setNewEducation({ ...newEducation, course: e.target.value })} />
                                        </div> */}
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          Course<span className="text-danger">*</span>
                        </label>
                        <CreatableSelect
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
                          components={{ DropdownIndicator, IndicatorSeparator }}
                          onInputChange={(e) => {
                            setDegSearchValue(e);
                            degSearch(e);
                          }}
                          onChange={handleDegreeChange}
                          isClearable
                          options={degData}
                          isValidNewOption={() => degSearchValue && true}
                          value={
                            newEducation.course
                              ? {
                                  label: newEducation.course,
                                  value: newEducation.course,
                                }
                              : null
                          }
                        />

                        {degSuggestionLoader && (
                          <div
                            style={{
                              transform: "translate(365px,-24px)",
                              width: "50px",
                            }}
                          >
                            <ThreeDots width={"30"} height={"10"} />
                          </div>
                        )}
                      </div>
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel ===
                                "InstituteCollegeUniversity"
                            ) || {}
                          ).mvalue || "nf InstituteCollegeUNiverSity"}
                          <span className="text-danger"> *</span>
                        </label>
                        <CreateSelectInstitution
                          setInsSearch={setInsSearch}
                          insSearch={insSearch}
                          insConvertedToSelect={insConvertedToSelect}
                          formvalues={newEducation}
                          setFormValues={setNewEducation}
                          formName={"institute"}
                          showDropdown={false}
                          formType={"Education"}
                          handleInsParentToChild={handleInsParentToChild}
                        />
                        {eduApiLoader && (
                          <div
                            style={{
                              transform: "translate(365px,-24px)",
                              width: "50px",
                            }}
                          >
                            <ThreeDots width={"30"} height={"10"} />
                          </div>
                        )}
                        {/* <input type="text" style={{ height: "32px" }} class="form-control bg-body-tertiary h-75 " id="" placeholder=""
                                                onChange={(e) => setNewEducation({ ...newEducation, institute: e.target.value })}
                                            /> */}
                      </div>

                      <div className="d-flex my-2  w-100   ">
                        <div className=" h-75 w-100  ">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label "
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "InstituteStartDate"
                              ) || {}
                            ).mvalue || "nf InstituteStartDate"}{" "}
                            <span className="text-danger">*</span>
                          </label>
                          {/* <input onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })} max={timestampToYYYYMMDD(Date.now())} value={newEducation.startDate} type="date" style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" /> */}
                          <DatePicker
                            style={{ height: "32px" }}
                            maxDate={timestampToYYYYMMDD(Date.now())}
                            className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                            id="exampleFormControlInput1"
                            onChange={(e) =>
                              setNewEducation({
                                ...newEducation,
                                startDate: e
                                  ? timestampToYYYYMMDD(new Date(e).getTime())
                                  : null,
                              })
                            }
                            toggleCalendarOnIconClick
                            selected={
                              newEducation?.startDate
                                ? newEducation?.startDate
                                : null
                            }
                            dateFormat={formatDateInputType(
                              regionalData?.selectedCountry?.dateFormat
                            )}
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            placeholderText={
                              regionalData?.selectedCountry?.dateFormat
                            }
                            onBlur={() => {}}
                          />
                        </div>

                        <div className=" ms-2 h-75 w-100  ">
                          <div>
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label bg-body-tertiary"
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "InstituteEndDate"
                                ) || {}
                              ).mvalue || "nf InstituteEndDate"}
                            </label>
                            {/* <input type="date" style={{ height: "32px" }} max={timestampToYYYYMMDD(Date.now())} min={newEducation.startDate ? newEducation.startDate : ""} name='endDate'  {...onGoing.instituteEndDate && { disabled: true }} className={onGoing.instituteEndDate ? "form-control bg-body-tertiary h-75 text-secondary  " : "form-control bg-body-tertiary h-75 "}
                                                        id="exampleFormControlInput1" onChange={(e) => setNewEducation({ ...newEducation, [e.target.name]: e.target.value })} value={newEducation.endDate} /> */}
                            <DatePicker
                              id="exampleFormControlInput1"
                              style={{ height: "32px" }}
                              className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                              minDate={
                                newEducation?.startDate
                                  ? newEducation?.startDate
                                  : ""
                              }
                              maxDate={timestampToYYYYMMDD(Date.now())}
                              onChange={(e) =>
                                setNewEducation({
                                  ...newEducation,
                                  endDate: e
                                    ? timestampToYYYYMMDD(new Date(e).getTime())
                                    : null,
                                })
                              }
                              toggleCalendarOnIconClick
                              selected={
                                newEducation?.endDate
                                  ? newEducation?.endDate
                                  : null
                              }
                              dateFormat={formatDateInputType(
                                regionalData?.selectedCountry?.dateFormat
                              )}
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={100}
                              placeholderText={
                                regionalData?.selectedCountry?.dateFormat
                              }
                              disabled={onGoing?.instituteEndDate}
                              onBlur={() => {}}
                            />
                          </div>
                          <div
                            className={
                              onGoing.instituteEndDate
                                ? "d-flex ms-1 align-items-center font-6 text-secondary   "
                                : "d-flex ms-1 align-items-center font-6 text-secondary "
                            }
                          >
                            <label
                              htmlFor="exampleFormControlInput1"
                              className=""
                            >
                              Current Education
                            </label>
                            <input
                              className="ms-2 "
                              type="checkbox"
                              name="instituteEndDate"
                              checked={onGoing?.instituteEndDate}
                              onChange={(e) => {
                                setOnGoing({
                                  ...onGoing,
                                  [e.target.name]: e.target.checked,
                                });
                                if (e.target.checked) {
                                  setNewEducation({
                                    ...newEducation,
                                    endDate: "",
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="my-2">
                        <div class="my-2 ">
                          <div className="d-flex ">
                            <label
                              for="exampleFormControlInput1"
                              class="form-label"
                            >
                              Location
                            </label>
                            <div
                              className="align-content-center "
                              style={{ marginLeft: "auto" }}
                            >
                              <input
                                type="checkbox"
                                className="me-2"
                                checked={location.includes("Online")}
                                onClick={(e) => setOnline(!online)}
                              />
                              Online
                            </div>
                          </div>

                          <MultiSelect
                            setLocationData={setLocation}
                            viewLocation={location}
                            onlineStatus={online}
                          />
                        </div>
                      </div>

                      <div className="my-2 ">
                        <label
                          htmlFor="exampleFormControlTextarea1"
                          className="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ProjectBriefDescription"
                            ) || {}
                          ).mvalue || "nf ProjectBriefDescription"}{" "}
                        </label>
                        <textarea
                          className="form-control bg-body-tertiary"
                          id="exampleFormControlTextarea1"
                          rows="2"
                          name="briefDescriptions"
                          value={newEducation.briefDescriptions}
                          onChange={(e) =>
                            setNewEducation({
                              ...newEducation,
                              [e.target.name]: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      {/* <div className="d-flex justify-content-between align-items-baseline   ">
                                            <div>


                                            </div>
                                            <div>
                                                <div>
                                                    <input type="file" id='fileChoose'  ref={actualBtnRef} hidden onChange={handleFileChange} />
                                                    <label htmlFor="fileChoose" className="btn btn-success font-5  ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'AttachRelatedDocuments') || {}).mvalue || "nf AttachRelatedDocuments"}</label>
                                                </div>
                                                <div id="file-chosen" class="form-text">{fileName}</div>
                                            </div>


                                        </div> */}
                    </div>
                  )}

                  {Validation === true && (
                    <div className="ms-2  me-2  border  px-1 py-1  ">
                      <div className="d-flex justify-content-between align-items-center ">
                        <h3 className="modal-title fs-5" id="exampleModalLabel">
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ProjectValidationDetail"
                            ) || {}
                          ).mvalue || "nf ProjectValidationDetial"}
                        </h3>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleValidationClose}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="my-2  ">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label "
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Validation"
                            ) || {}
                          ).mvalue || "nf Validation"}{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          className="form-control bg-body-tertiary h-75 "
                          id="exampleFormControlInput1"
                        />
                      </div>

                      <div>
                        <label htmlFor="" className="form-label mt-2  ">
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel ===
                                "ProjectValidatorRelationship"
                            ) || {}
                          ).mvalue || "nf ProjectValidatorRelationship"}{" "}
                          <span className="text-danger">*</span>
                        </label>
                      </div>
                      <table>
                        <tr>
                          <td>
                            <div class="form-check form-check-inline   ">
                              <input
                                class="form-check-input bg-body-tertiary  "
                                type="radio"
                                name="relationship"
                                id="relationship1"
                                value="HOD"
                              />
                              <label
                                class="form-check-label"
                                for="relationship1"
                              >
                                Administrative Office
                              </label>
                            </div>
                          </td>
                          <td>
                            <div class="form-check form-check-inline  ">
                              <input
                                class="form-check-input bg-body-tertiary  "
                                type="radio"
                                name="relationship"
                                id="relationship2"
                                value="Teaching Staff"
                              />
                              <label
                                class="form-check-label"
                                for="relationship2"
                              >
                                Teaching Staff
                              </label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div class="form-check form-check-inline  ">
                              <input
                                class="form-check-input bg-body-tertiary  "
                                type="radio"
                                name="relationship"
                                id="relationship3"
                                value="Non Teaching staff"
                              />
                              <label
                                class="form-check-label"
                                for="relationship3"
                              >
                                Non Teaching staff{" "}
                              </label>
                            </div>
                          </td>
                          <td>
                            <div class="form-check form-check-inline  ">
                              <input
                                class="form-check-input bg-body-tertiary  "
                                type="radio"
                                name="relationship"
                                id="relationship5"
                                value="Friend"
                              />
                              <label
                                class="form-check-label"
                                for="relationship5"
                              >
                                Friend{" "}
                              </label>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <div class="form-check form-check-inline mb-2   ">
                        <input
                          class="form-check-input bg-body-tertiary  "
                          type="radio"
                          name="relationship"
                          id="relationship4"
                          value="Other Person"
                        />
                        <label class="form-check-label" for="relationship4">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Others"
                            ) || {}
                          ).mvalue || "nf Others"}{" "}
                        </label>
                      </div>

                      <div class="mb-2  ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "EmailId"
                            ) || {}
                          ).mvalue || "nf EmailId"}{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                        />
                      </div>
                      <div class="my-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "MobileNo"
                            ) || {}
                          ).mvalue || "nf mobileNo"}
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                        />
                      </div>
                      <div className="my-2 ">
                        <label
                          htmlFor="exampleFormControlTextarea1"
                          className="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Remarks"
                            ) || {}
                          ).mvalue || "nf Remarks"}
                        </label>
                        <textarea
                          className="form-control bg-body-tertiary"
                          id="exampleFormControlTextarea1"
                          rows="2"
                        ></textarea>
                      </div>

                      <div className="d-flex justify-content-end align-items-center mb-1  ">
                        <button
                          type="button"
                          className="text-white border-0 px-2 py-1 rounded   pill-bg-color  font-5"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Validate"
                            ) || {}
                          ).mvalue || "nf Validate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end  ">
                <SecondaryBtnLoader
                  label={
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Save"
                      ) || {}
                    ).mvalue || "Save"
                  }
                  onClick={() => handleAddNewEducation(false)}
                  backgroundColor="#F8F8E9"
                  color="var(--primary-color)"
                  loading={isAddingEducation}
                />
                <SecondaryBtnLoader
                  label={
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Save&Close"
                      ) || {}
                    ).mvalue || "Save & Close"
                  }
                  Active={true}
                  onClick={() => handleAddNewEducation(true)}
                  backgroundColor="var(--primary-color)"
                  color="#F8F8E9"
                  loading={isAddingEducation}
                />

                {/* <div className='d-flex'>
                                    {loaderOnForClose ?
                                        <div className="btn  me-2 font-5" style={{ backgroundColor: "#EFF5DC", color: "var(--primary-color)", width: "4rem" }}>
                                            <SmallLoader height={"1rem"} width={"1rem"} color={"var(--primary-color)"} />
                                        </div>
                                        :
                                        <button type="button" className="btn  me-2 font-5" style={{ backgroundColor: "#EFF5DC", color: "var(--primary-color)" }}
                                            data-bs-dismiss="modal" onClick={institutionAddClickForClose}>
                                            {(content[selectedLanguage]?.find(item => item.elementLabel === 'SaveAndClose') || {}).mvalue || "nf SaveAndClose"}
                                        </button>}

                                    {loaderOnForAdd ?
                                        <div style={{ backgroundColor: "var(--primary-color)", width: "4rem" }}>
                                            <SmallLoader height={"1rem"} width={"1rem"} color={"#EFF5DC"} />
                                        </div>
                                        :
                                        <button type="button" className="btn text-white font-5"
                                            style={{ backgroundColor: "var(--primary-color)" }} onClick={institutionAddClickForSave} >
                                            {(content[selectedLanguage]?.find(item => item.elementLabel === 'AddSkillButton') || {}).mvalue || "nf AddSkillButton"}</button>}

                                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div ref={navbarRef} id="yourNavbarId">
          <Navbar handlePdf={handlePdf}></Navbar>
        </div>

        <hr className="p-0 m-0 " />

        <div
          style={{ backgroundColor: "#", minHeight: "", height: "" }}
          className="container-fluid  h6 "
        >
          <div className="row  gap-0 ">
            <div className=" bg-white px-1 col-md font-5 fixed-sidebar   rounded ">
              <div>
                <DetailedPofileNavbar />
              </div>
              <div>
                <PremiumServicesOptions setSwitchTab={setSwitchTab} />
              </div>
            </div>

            <hr className="vr m-0 p-0" />

            <div
              className="col-md-7  rounded bg-white  px-1 font-5   "
              style={{ overflowY: "auto", height: contentHeight }}
            >
              {switchTab === "" && (
                <>
                  <div className="d-md-flex align-items-center justify-content-between my-1 px-1   ">
                    <div className="d-flex align-items-center "></div>
                    <div className="py-1 d-flex gap-1">
                      <div
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        <SecondaryBtn
                          label={
                            (
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "AddSkillButton"
                              ) || {}
                            ).mvalue || "nf AddsKillButton"
                          }
                          backgroundColor="#F7FFDD"
                          color="var(--primary-color)"
                        />
                      </div>
                      <SecondaryBtn
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "EditSkillButton"
                            ) || {}
                          ).mvalue || "nf EditSkillButton"
                        }
                        backgroundColor="#F7FFDD"
                        color="var(--primary-color)"
                        onClick={handleEdit}
                      />
                    </div>
                  </div>

                  {/* accordion one table */}
                  <div
                    className="accordion   "
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item border-0  mb-2 rounded-top  ">
                      <h2 className="accordion-header  py-1 ">
                        <button
                          className="accordion-button flex justify-content-between py-2 "
                          onClick={handleAccordion1}
                          style={{
                            backgroundColor:
                              (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "NavBarBgColor"
                                ) || {}
                              ).mvalue || "var(--primary-color)",
                            color:
                              (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "NavBarFontColor"
                                ) || {}
                              ).mvalue || "#F7FFDD",
                            direction:
                              (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Direction"
                                ) || {}
                              ).mvalue || "ltr",
                          }}
                          type="button"
                          data-bs-toggle="collapse"
                        >
                          <div className="w-75 ">
                            {" "}
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "EducationHistory"
                              ) || {}
                            ).mvalue || "nf Education History"}
                          </div>
                          <div className="d-flex gap-1">
                            <PrimaryBtn
                              label={
                                (
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "SummaryView"
                                  ) || {}
                                ).mvalue || "nf SummaryView"
                              }
                              onClick={handleSummaryClick}
                              backgroundColor="#F8F8E9"
                              color="var(--primary-color)"
                              statusTab={summaryTab1}
                            />
                            <PrimaryBtn
                              label={
                                (
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "DetailsView"
                                  ) || {}
                                ).mvalue || "nf DetailsView"
                              }
                              onClick={handleDetailsSummary}
                              backgroundColor="#F8F8E9"
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
                        {summaryTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <div className="table-responsive ">
                              <EducationSummary
                                data={educationHistory}
                                editEnable={editEnable}
                              />
                            </div>
                            {/* table end */}
                          </div>
                        )}
                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <EducationDetail
                              data={educationHistory}
                              editEnable={editEnable}
                            />
                            {/* table end */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* VIEW OPPORTUNITIES */}
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
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Back"
                      ) || {}
                    ).mvalue || "nf Back"}
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
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Back"
                      ) || {}
                    ).mvalue || "nf Back"}
                  </button>
                  <CustomAnalyticsPS />
                </>
              )}
              {/* end one table */}
            </div>
            {/* </div> */}

            <hr className="vr m-0 p-0" />

            <div className="col-md  rounded bg-white px-1 font-5 fixed-sidebar">
              <RightSideBar />
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <div className="d-none d-print-block  ">
        <DetailedResume />
      </div>
    </>
  );
};

export default EducationHistory;
