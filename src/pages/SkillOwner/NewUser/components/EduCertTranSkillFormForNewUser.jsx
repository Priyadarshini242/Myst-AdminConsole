import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEducationHistory } from "../../../../api/fetchAllData/fetchEducationHistory";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import PostApi from "../../../../api/PostData/PostApi";
import { showWarningToast } from "../../../../components/ToastNotification/showWarningToast";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { debouncedApiRequest } from "../../../../components/DebounceHelperFunction/debouncedApiRequest";
import degreeSearchSuggestions from "../../../../api/searchSuggestionAPIs/degreeSearchSuggestions";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import educationInstitutionApi from "../../../../api/searchSuggestionAPIs/educationInstitutionApi";
import { toTitleCase } from "../../../../components/SkillOwner/HelperFunction/toTitleCase";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import CreateSelectInstitution from "../../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { ThreeDots } from "react-loader-spinner";

import CreatableSelect from "react-select/creatable";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import TableLoaders from "../../../../components/CustomLoader/TableLoaders";
import { DayDifferenceToDynamicView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { setDeleteDetailedProfileData } from "../../../../reducer/delete/deleteDetailedProfileSlice";
import DeleteFormDetailedProfile from "../../../../components/DeleteFormDetailedProfile";
import Cert from "./Cert";
import Tran from "./Tran";
import Ski from "./Ski";
import Conf from "./Conf";
import { fetchCertificationHistory } from "../../../../api/fetchAllData/fetchCertificationHistory";
import { fetchConferencesHistory } from "../../../../api/fetchAllData/fetchConferenceHistory";
import { fetchSkillingHistory } from "../../../../api/fetchAllData/fetchSkillingHistory";
import { fetchTrainingHistory } from "../../../../api/fetchAllData/fetchTrainingHistory";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import DialogButton from "../../../../components/Buttons/DialogButton";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const EduCertTranSkillFormForNewUser = ({ setSelectedField }) => {
  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const regionalData = useSelector((state) => state.regionalData);

  const [acquiredValue, setAcquiredValue] = useState("Education");

  const [errors, setErrors] = useState(null);

  const [onGoing, setOnGoing] = useState(false);
  const educationHistory = useSelector((state) => state.educationHistory);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const trainingHistory = useSelector((state) => state.trainingHistory);
  const skillingsHistory = useSelector((state) => state.skillingsHistory);
  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const dispatch = useDispatch();

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

  const [allSortedRecords, setAllSortedRecords] = useState(null);

  useEffect(() => {
    if (educationHistory.status === "idle") {
      dispatch(fetchEducationHistory());
    }
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }
    if (conferenceHistory?.status === "idle") {
      dispatch(fetchConferencesHistory());
    }
    if (skillingsHistory?.status === "idle") {
      dispatch(fetchSkillingHistory());
    }
    if (trainingHistory?.status === "idle") {
      dispatch(fetchTrainingHistory());
    }
  }, []);

  useEffect(() => {
    let allRecords = [
      ...educationHistory.data,
      ...certificationHistory.data,
      ...trainingHistory.data,
      ...skillingsHistory.data,
      ...conferenceHistory.data,
    ];

    console.log(allRecords);
    let formattedRecords = allRecords.map((record) => {
      if (record.fromDate) {
        return record;
      } else {
        return {
          ...record,
          fromDate: record.startDate,
          toDate: record.endDate ? record.endDate : "",
        };
      }
    });

    console.log(formattedRecords);

    let sortedFormattedRecord = formattedRecords?.sort((a, b) => {
      const toDateComparison = parseInt(a.fromDate) - parseInt(b.fromDate);
      if (toDateComparison !== 0) {
        return toDateComparison;
      }
      // If toDate is the same, sort by fromDate
      return (
        parseInt(a.toDate ? a.toDate : `${Date.now()}`) -
        parseInt(b.toDate ? b.toDate : `${Date.now()}`)
      );
    });

    setAllSortedRecords(sortedFormattedRecord);
  }, [
    educationHistory,
    certificationHistory,
    trainingHistory,
    skillingsHistory,
    conferenceHistory,
  ]);

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
    const newErrors = {};
    if (!newEducation.course) {
      newErrors.course = "Course name is required";
    }
    if (!newEducation.institute) {
      newErrors.institute = "institution is required";
    }
    if (!newEducation.startDate) {
      newErrors.startDate = "Start Date is required";
    }
    if (!newEducation.endDate && !onGoing.instituteEndDate) {
      newErrors.endDate = "End Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast("Education already exist in within the date range");
      return;
    }

    if (!newEducation.course || !newEducation.institute) {
      showErrorToast("Please fill all required fields");

      return;
    }
    setIsAddingEducation(true);

    PostApi("Education History", {
      ...newEducation,
      startDate: FormatDateIntoPost(newEducation.startDate),
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
        showSuccessToast("Education Added Successful");
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

        setOnGoing(false);

        setIsAddingEducation(false);
        setIsNewEducationDegree(false);
        setIsCustomInstitution(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
        setIsAddingEducation(false);
      });
  };

  // Custom styles for CreatableSelect
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: "15rem",
      border: "none",
      borderBottom: errors?.course ? "2px solid #d9534f" : "1px solid #ced4da", // Customize bottom border style
      borderRadius: "0",
      boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
      "&:hover": {
        borderBottom: errors?.course
          ? "2px solid #d9534f"
          : "2px solid #ced4da", // Adjust hover state if needed
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: () => ({ display: "none" }),
    // You can add more custom styles as needed
  };

  return (
    <div id="myTab1Content" class="tab-content ">
      {/* <DeleteFormDetailedProfile /> */}

      <div className="d-flex flex-column gap-3 justify-content-center align-items-center mx-lg-5  mx-2 my-5">
        <p
          class="text-muted mb-4 text-center"
          style={{ letterSpacing: ".1rem" }}
          id="Employment"
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "BasicInfoEdu"
            ) || {}
          ).mvalue || "nf BasicInfoEdu"}
        </p>

        <div
          className="d-md-flex d-block  gap-3 w-100 mb-5"
          style={{ flexWrap: "wrap" }}
        >
          <div
            className=" d-flex flex-column gap-1"
            style={{ flex: "1 1 10rem" }}
          >
            <label for="exampleFormControlInput1" class="form-label ">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Type"
                ) || {}
              ).mvalue || "nf Type"}
              <span className="text-danger">*</span>
            </label>
            <select
              className="form-select mb-3 buttom-line-input w-100 p-0 "
              aria-label="Default select example"
              name="type"
              onChange={(e) => setAcquiredValue(e.target.value)}
              value={acquiredValue}
              style={{ height: "32px" }}
            >
              {/* <option className='bg-body-tertiary' value="0" disabled selected hidden>How did you ACQUIRE this skill</option> */}
              <option selected value="Education">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Education"
                  ) || {}
                ).mvalue || "nf Education"}
              </option>
              <option value="Certification">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Certification"
                  ) || {}
                ).mvalue || "nf Certification"}
              </option>
              <option value="Training">
                {" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Training"
                  ) || {}
                ).mvalue || "nf Training"}
              </option>
              <option value="Skilling">
                {" "}
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
            </select>
          </div>

          {acquiredValue === "Education" && (
            <>
              {/* <div className='d-flex justify-content-center align-items-start  gap-5 mb-4 ' style={{ position: 'relative', flex: '1 1 50px' }}> */}

              <div class="mb-2  m-0" style={{ flex: "1 1 15rem" }}>
                <label for="exampleFormControlInput1" class="form-label ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Course"
                    ) || {}
                  ).mvalue || "nf Course"}
                  <span className="text-danger">*</span>
                </label>
                <CreatableSelect
                  // components={{ DropdownIndicator, IndicatorSeparator }}
                  styles={customStyles}
                  onInputChange={(e) => {
                    setDegSearchValue(e);
                    degSearch(e);
                    setErrors({ ...errors, course: false });
                  }}
                  placeholder={
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "SelectYourCourse"
                      ) || {}
                    ).mvalue || "nf SelectYourCourse"
                  }
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
                      transform: "translate(200px,-24px)",
                      width: "50px",
                    }}
                  >
                    <ThreeDots width={"30"} height={"10"} />
                  </div>
                )}
              </div>
              <div class="mb-2  m-0" style={{ flex: "1 1 15rem" }}>
                <label for="exampleFormControlInput1" class="form-label">
                  {(
                    content[selectedLanguage]?.find(
                      (item) =>
                        item.elementLabel === "InstituteCollegeUniversity"
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
                  usedIn={"newUserInterface"}
                  handleInsParentToChild={handleInsParentToChild}
                  errors={errors}
                  setErrors={setErrors}
                />
                {eduApiLoader && (
                  <div
                    style={{
                      transform: "translate(200px,-24px)",
                      width: "50px",
                    }}
                  >
                    <ThreeDots width={"30"} height={"10"} />
                  </div>
                )}
              </div>

              {/*   <div className='d-flex flex-sm-row flex-column justify-content-center gap-3 align-items-start   ' style={{ flex: '1 1 25rem' }} >
                                <div className=" w-100  " >
                                    <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteStartDate') || {}).mvalue || "nf InstituteStartDate"} <span className='text-danger' >*</span></label>
                                    <input onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })} max={timestampToYYYYMMDD(Date.now())} value={newEducation.startDate} type="date" style={{ height: "32px" }} className=" px-0 form-control buttom-line-input h-75  " id="exampleFormControlInput1" />
                                </div>

                                <div className="  h-75 w-100  ">
                                    <div >
                                        <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteEndDate') || {}).mvalue || "nf InstituteEndDate"}</label>
                                        <input type="date" style={{ height: "32px" }} max={timestampToYYYYMMDD(Date.now())} min={newEducation.startDate ? newEducation.startDate : ""} name='endDate'  {...onGoing.instituteEndDate && { disabled: true }} className={onGoing.instituteEndDate ? " buttom-line-input form-control bg-body-tertiary h-75 text-secondary  px-0" : "form-control buttom-line-input  h-75 px-0 "}
                                            id="exampleFormControlInput1" onChange={(e) => setNewEducation({ ...newEducation, [e.target.name]: e.target.value })} value={newEducation.endDate} />
                                    </div>
                                    <div className={onGoing.instituteEndDate ? 'd-flex ms-1 align-items-center font-6 text-secondary   ' : 'd-flex ms-1 align-items-center font-6 text-secondary '} >
                                        <label htmlFor="exampleFormControlInput1" className="">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CurrentEducation') || {}).mvalue || "nf CurrentEducation"}</label>
                                        <input className='ms-2 ' type="checkbox" name="instituteEndDate" checked={onGoing?.instituteEndDate}
                                            onChange={(e) => {
                                                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                                                if (e.target.checked) {
                                                    setNewEducation({ ...newEducation, endDate: "" });
                                                }
                                            }} />
                                    </div>
                                </div>

                            </div> */}

              <div
                className="d-flex flex-sm-row flex-column justify-content-center gap-3 align-items-start   "
                style={{ flex: "1 1 25rem" }}
              >
                <div className=" w-100  ">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label "
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "InstituteStartDate"
                      ) || {}
                    ).mvalue || "nf InstituteStartDate"}{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <DatePicker
                    style={{ height: "32px" }}
                    maxDate={timestampToYYYYMMDD(Date.now())}
                    className={`form-control  h-75 px-0 ${
                      errors?.startDate ? "blank-error" : "buttom-line-input"
                    } `}
                    id="exampleFormControlInput1"
                    onChange={(e) => {
                      setErrors({ ...errors, startDate: false });
                      setNewEducation({
                        ...newEducation,
                        startDate: e
                          ? timestampToYYYYMMDD(new Date(e).getTime())
                          : null,
                      });
                    }}
                    toggleCalendarOnIconClick
                    selected={newEducation.startDate}
                    dateFormat={formatDateInputType(
                      regionalData.selectedCountry.dateFormat
                    )}
                    showYearDropdown
                    scrollableYearDropdown
                    // showMonthDropdown
                    // scrollableMonthDropdown
                    yearDropdownItemNumber={100}
                    placeholderText={getCookie("dateFormat")}
                    onBlur={() => {}}
                  />
                </div>

                <div className="  h-75 w-100  ">
                  <div>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label "
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "InstituteEndDate"
                        ) || {}
                      ).mvalue || "nf InstituteEndDate"}
                      <span className="text-danger">*</span>
                    </label>

                    <DatePicker
                      style={{ height: "32px" }}
                      maxDate={timestampToYYYYMMDD(Date.now())}
                      minDate={
                        newEducation.startDate ? newEducation.startDate : ""
                      }
                      className={
                        onGoing.instituteEndDate
                          ? ` ${
                              errors?.endDate
                                ? "blank-error"
                                : "buttom-line-input"
                            } form-control bg-body-tertiary h-75 text-secondary  px-0`
                          : `form-control ${
                              errors?.endDate
                                ? "blank-error"
                                : "buttom-line-input"
                            }  h-75 px-0 `
                      }
                      id="exampleFormControlInput1"
                      onChange={(e) => {
                        setErrors({ ...errors, endDate: false });
                        setNewEducation({
                          ...newEducation,
                          endDate: e
                            ? timestampToYYYYMMDD(new Date(e).getTime())
                            : null,
                        });
                      }}
                      disabled={onGoing.instituteEndDate}
                      toggleCalendarOnIconClick
                      selected={newEducation.endDate}
                      dateFormat={formatDateInputType(
                        regionalData.selectedCountry.dateFormat
                      )}
                      showYearDropdown
                      scrollableYearDropdown
                      // showMonthDropdown
                      // scrollableMonthDropdown
                      yearDropdownItemNumber={100}
                      placeholderText={getCookie("dateFormat")}
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
                    <label htmlFor="exampleFormControlInput1" className="">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "CurrentEducation"
                        ) || {}
                      ).mvalue || "nf CurrentEducation"}
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
                          setNewEducation({ ...newEducation, endDate: "" });
                          setErrors({ ...errors, endDate: false });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="d-flex  mb-3 justify-content-center align-items-center"
                style={{ flex: "1 1 5rem" }}
              >
                <SecondaryBtnLoader
                  onClick={() => handleAddNewEducation()}
                  label={
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Add"
                      ) || {}
                    ).mvalue || "nf Add"
                  }
                  backgroundColor="var(--primary-color)"
                  color="white"
                  loading={isAddingEducation}
                />
              </div>

              {/* </div> */}
            </>
          )}

          {acquiredValue === "Certification" && <Cert />}
          {acquiredValue === "Training" && <Tran />}
          {acquiredValue === "Skilling" && <Ski />}
          {acquiredValue === "Conferences" && <Conf />}
        </div>

        <div className="table-responsive w-100">
          <table className="table table-sm  table-fixed table-hover    ">
            <thead>
              <tr className="border-dark-subtle ">
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectType"
                    ) || {}
                  ).mvalue || "NF ProjectType"}
                </th>
                <th scope="col" className="bg-body- " style={{ width: "30%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Name"
                    ) || {}
                  ).mvalue || "NF Name"}
                </th>
                <th scope="col" className="bg-body- " style={{ width: "30%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Institution"
                    ) || {}
                  ).mvalue || "nf Institution"}
                </th>

                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "InstituteStartDate"
                    ) || {}
                  ).mvalue || "nf InstituteStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "InstituteEndDate"
                    ) || {}
                  ).mvalue || "nf InstituteEndDate"}{" "}
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody className="">
              {allSortedRecords?.map((record, index) => {
                return (
                  <tr className="">
                    {record?.applicationName === "Education History" && (
                      <>
                        <td>
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Education"
                            ) || {}
                          ).mvalue || "nf Education"}
                        </td>
                        <td>
                          {record.course
                            ? record.course.length > 40
                              ? record.course.substring(0, 40) + "..."
                              : record.course
                            : ""}
                        </td>
                      </>
                    )}
                    {record?.applicationName === "Certification History" && (
                      <>
                        <td>
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Certification"
                            ) || {}
                          ).mvalue || "nf Certification"}
                        </td>
                        <td>
                          {record.certificationName
                            ? record.certificationName.length > 40
                              ? record.certificationName.substring(0, 40) +
                                "..."
                              : record.certificationName
                            : ""}
                        </td>
                      </>
                    )}
                    {record?.applicationName === "Training" && (
                      <>
                        <td>
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Training"
                            ) || {}
                          ).mvalue || "nf Training"}
                        </td>
                        <td>
                          {record.title
                            ? record.title.length > 40
                              ? record.title.substring(0, 40) + "..."
                              : record.title
                            : ""}
                        </td>
                      </>
                    )}
                    {record?.applicationName === "Skilling" && (
                      <>
                        <td>
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Skilling"
                            ) || {}
                          ).mvalue || "nf Skilling"}
                        </td>
                        <td>
                          {record.title
                            ? record.title.length > 40
                              ? record.title.substring(0, 40) + "..."
                              : record.title
                            : ""}
                        </td>
                      </>
                    )}
                    {record?.applicationName === "Conferences" && (
                      <>
                        <td>
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Conferences"
                            ) || {}
                          ).mvalue || "nf Conferences"}
                        </td>
                        <td>
                          {record.title
                            ? record.title.length > 40
                              ? record.title.substring(0, 40) + "..."
                              : record.title
                            : ""}
                        </td>
                      </>
                    )}

                    {record?.applicationName === "Education History" ? (
                      <td>
                        {record.institute
                          ? record.institute.length > 40
                            ? record.institute.substring(0, 40) + "..."
                            : record.institute
                          : ""}
                      </td>
                    ) : (
                      <td>
                        {record.organization
                          ? record.organization.length > 40
                            ? record.organization.substring(0, 40) + "..."
                            : record.organization
                          : ""}
                      </td>
                    )}

                    <td>
                      {formatTimestampToDate(
                        Number(record.startDate),
                        regionalData.selectedCountry.dateFormat
                      )}
                    </td>
                    <td>
                      {record.endDate
                        ? formatTimestampToDate(
                            Number(record.endDate),
                            regionalData.selectedCountry.dateFormat
                          )
                        : "On-going"}
                    </td>

                    <td className="">
                      <button
                        style={{ color: "var(--primary-color)" }}
                        className="border-0 bg-transparent"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Delete"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteformdetailedprofile"
                        onClick={() => {
                          dispatch(setDeleteDetailedProfileData(record));
                        }}
                      >
                        {" "}
                        <MdDelete />{" "}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* {


                                educationHistory.status === "loading" ?


                                    <TableLoaders Rows={2} Cols={5} btnCols={2} />

                                    :
                                    <>
                                        {
                                            educationHistory.status === "success" && educationHistory.data.length > 0
                                            && educationHistory.data.map((education, index) => (


                                                <tr className="" >
                                                    <td>Education</td>
                                                    <td >{education.course ? (education.course.length > 40 ? education.course.substring(0, 40) + "..." : education.course) : ''}</td>
                                                    <td >{education.institute ? (education.institute.length > 40 ? education.institute.substring(0, 40) + "..." : education.institute) : ''}</td>


                                                    <td>{formatTimestampToDate(Number(education.startDate), regionalData.selectedCountry.dateFormat)}</td>
                                                    <td>{education.endDate ? formatTimestampToDate(Number(education.endDate), regionalData.selectedCountry.dateFormat) : 'On-going'}</td>

                                                    <td className=''>
                                            
                                                        <button style={{ color: 'var(--primary-color)' }} className='border-0 bg-transparent' data-tooltip-id="my-tooltip" data-tooltip-content="Delete" data-bs-toggle="modal" data-bs-target="#deleteformdetailedprofile" onClick={() => {
                                                            dispatch(setDeleteDetailedProfileData(education))
                                                        }}>  <MdDelete /> </button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        {
                                            certificationHistory.status === "success" && certificationHistory.data.length > 0
                                            && certificationHistory.data.map((certs, index) => (


                                                <tr className="" >
                                                    <td>Certification</td>
                                                    <td >{certs.certificationName ? (certs.certificationName.length > 40 ? certs.certificationName.substring(0, 40) + "..." : certs.certificationName) : ''}</td>
                                                    <td >{certs.organization ? (certs.organization.length > 40 ? certs.organization.substring(0, 40) + "..." : certs.organization) : ''}</td>


                                                    <td>{formatTimestampToDate(Number(certs.startDate), regionalData.selectedCountry.dateFormat)}</td>
                                                    <td>{certs.endDate ? formatTimestampToDate(Number(certs.endDate), regionalData.selectedCountry.dateFormat) : 'On-going'}</td>

                                                    <td className=''>
                                       
                                                        <button style={{ color: 'var(--primary-color)' }} className='border-0 bg-transparent' data-tooltip-id="my-tooltip" data-tooltip-content="Delete" data-bs-toggle="modal" data-bs-target="#deleteformdetailedprofile" onClick={() => {
                                                            dispatch(setDeleteDetailedProfileData(certs))
                                                        }}>  <MdDelete /> </button>
                                                    </td>
                                                </tr>
                                            ))

                                        }
                                        {
                                            trainingHistory.status === "success" && trainingHistory.data.length > 0
                                            && trainingHistory.data.map((certs, index) => (


                                                <tr className="" >
                                                    <td>Training</td>
                                                    <td >{certs.title ? (certs.title.length > 40 ? certs.title.substring(0, 40) + "..." : certs.title) : ''}</td>
                                                    <td >{certs.organization ? (certs.organization.length > 40 ? certs.organization.substring(0, 40) + "..." : certs.organization) : ''}</td>


                                                    <td>{formatTimestampToDate(Number(certs.startDate), regionalData.selectedCountry.dateFormat)}</td>
                                                    <td>{certs.endDate ? formatTimestampToDate(Number(certs.endDate), regionalData.selectedCountry.dateFormat) : 'On-going'}</td>

                                                    <td className=''>
                                        
                                                        <button style={{ color: 'var(--primary-color)' }} className='border-0 bg-transparent' data-tooltip-id="my-tooltip" data-tooltip-content="Delete" data-bs-toggle="modal" data-bs-target="#deleteformdetailedprofile" onClick={() => {
                                                            dispatch(setDeleteDetailedProfileData(certs))
                                                        }}>  <MdDelete /> </button>
                                                    </td>
                                                </tr>
                                            ))

                                        }

                                        {
                                            skillingsHistory.status === "success" && skillingsHistory.data.length > 0
                                            && skillingsHistory.data.map((certs, index) => (


                                                <tr className="" >
                                                    <td>Skilling</td>
                                                    <td >{certs.title ? (certs.title.length > 40 ? certs.title.substring(0, 40) + "..." : certs.title) : ''}</td>
                                                    <td >{certs.organization ? (certs.organization.length > 40 ? certs.organization.substring(0, 40) + "..." : certs.organization) : ''}</td>


                                                    <td>{formatTimestampToDate(Number(certs.startDate), regionalData.selectedCountry.dateFormat)}</td>
                                                    <td>{certs.endDate ? formatTimestampToDate(Number(certs.endDate), regionalData.selectedCountry.dateFormat) : 'On-going'}</td>

                                                    <td className=''>
                            
                                                        <button style={{ color: 'var(--primary-color)' }} className='border-0 bg-transparent' data-tooltip-id="my-tooltip" data-tooltip-content="Delete" data-bs-toggle="modal" data-bs-target="#deleteformdetailedprofile" onClick={() => {
                                                            dispatch(setDeleteDetailedProfileData(certs))
                                                        }}>  <MdDelete /> </button>
                                                    </td>
                                                </tr>
                                            ))

                                        }
                                        {
                                            conferenceHistory.status === "success" && conferenceHistory.data.length > 0
                                            && conferenceHistory.data.map((certs, index) => (


                                                <tr className="" >
                                                    <td>Conference</td>
                                                    <td >{certs.title ? (certs.title.length > 40 ? certs.title.substring(0, 40) + "..." : certs.title) : ''}</td>
                                                    <td >{certs.organization ? (certs.organization.length > 40 ? certs.organization.substring(0, 40) + "..." : certs.organization) : ''}</td>


                                                    <td>{formatTimestampToDate(Number(certs.startDate), regionalData.selectedCountry.dateFormat)}</td>
                                                    <td>{certs.endDate ? formatTimestampToDate(Number(certs.endDate), regionalData.selectedCountry.dateFormat) : 'On-going'}</td>

                                                    <td className=''>
                                              

                                                        <button style={{ color: 'var(--primary-color)' }} className='border-0 bg-transparent' data-tooltip-id="my-tooltip" data-tooltip-content="Delete" data-bs-toggle="modal" data-bs-target="#deleteformdetailedprofile" onClick={() => {
                                                            dispatch(setDeleteDetailedProfileData(certs))
                                                        }}>  <MdDelete /> </button>
                                                    </td>
                                                </tr>
                                            ))

                                        }
                                    </>
                            } */}
            </tbody>
          </table>
        </div>

        <div
          className="d-flex w-100 gap-2   p-4 pt-2  justify-content-between bg-white"
          style={{ position: "fixed", bottom: "10px" }}
        >
          {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => setSelectedField('Project/Work/Occupation')} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Back') || {}).mvalue || "nf Back"}</button>
                    <button className='btn' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => setSelectedField('Skills')}>{(content[selectedLanguage]?.find(item => item.elementLabel === 'Next') || {}).mvalue || "nf Next"}</button> */}

          <DialogButton
            onClick={() => setSelectedField("Project/Work/Occupation")}
          />
          <DialogButton
            Active={true}
            onClick={() => setSelectedField("Skills")}
          />
        </div>
      </div>
    </div>
  );
};

export default EduCertTranSkillFormForNewUser;
