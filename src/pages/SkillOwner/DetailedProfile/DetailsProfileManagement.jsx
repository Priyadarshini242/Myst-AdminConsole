import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import CreateSelectForLocation from "../../../components/SkillOwner/SelectComponent/CreateSelectForLocation";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import { useSelector } from "react-redux";
import EmploymentSummary from "../../../components/SkillOwner/DetailedProfile/EmploymentSummary";
import EmploymentDetail from "../../../components/SkillOwner/DetailedProfile/EmploymentDetail";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import { useDispatch } from "react-redux";
import { FetchOrganizationHistory } from "../../../api/fetchAllData/fetchOrganization";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import PostApi from "../../../api/PostData/PostApi";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { addNewEmployment } from "../../../reducer/detailedProfile/employmentSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import EditApi from "../../../api/editData/EditApi";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { set } from "lodash";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import organizationSearchSuggestions from "../../../api/searchSuggestionAPIs/organizationSearchSuggestions";
import { debouncedApiRequest } from "../../../components/DebounceHelperFunction/debouncedApiRequest";
import CreateSelectInstitution from "../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { ThreeDots } from "react-loader-spinner";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { DayDifferenceToDynamicView } from "../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const DetailsProfileManagement = () => {
  //store
  const dispatch = useDispatch();
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  const employmentHistory = useSelector((state) => state.employmentHistory);
  const regionalData = useSelector((state) => state.regionalData);

  const [switchTab, setSwitchTab] = useState("");
  const [editEnable, setEditEnable] = useState(false);
  const [location, setLocation] = useState([]);
  const [onGoing, setOnGoing] = useState(false);
  const [online, setOnline] = useState(false);
  const [isCustomOrganization, setIsCustomOrganization] = useState(false);

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);
  // modal validation show hide
  const [Validation, setValidation] = useState(false);

  const actualBtnRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleEdit = () => {
    setEditEnable(!editEnable);
  };

  /* HANDLE STATUS DATA CHILD TO PARENT */
  const handleOrgParentToChild = (val) => {
    setIsCustomOrganization(val);
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
  const toggleOnline = () => {
    setOnline(false);
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

  const pdfRef = useRef();

  const handlePdf = () => {
    window.print();
  };

  const handleModalClose = () => {
    setValidation(false);
    document.getElementById("mclose").click();
  };

  const handleValidateProject = () => {
    setValidation(true);
  };

  const handleValidationClose = () => {
    setValidation(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  useEffect(() => {
    document.title = "Detailed Profile";

    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const [fileupload, setFileupload] = useState(false);
  const initialEmployeeState = {
    organization: "",
    fromDate: "",
    toDate: "",
    location: "",
    briefDescriptions: "",
    mlanguage: getCookie("HLang"),
    mtype: "Employment",
    userId:getCookie("userId"),
    showHide: "Yes",
    validation: "No",
    duration: "",
    remark: "",
    id: "",
  };
  const [errors, setErrors] = useState({});

  const [employee, setEmployee] = useState(initialEmployeeState);
  const [isAddingEmploy, setIsAddingEmploy] = useState(false);

  const [isEmployeeEdit, setIsEmployeeEdit] = useState(false);
  const [locationForEmploy, setLocationForEmploy] = useState("");
  const [onlineLocation, setOnlineLocation] = useState(false);
  const [isEmployEdit, setIsEmployEdit] = useState(false);

  const handleEmployEdit = (empl) => {
    document.getElementById("exampleModal").click();
    console.log(empl);
  };

  //Api institution data
  const [orgApiData, setOrgApiData] = useState([]);
  const [insConvertedToSelect, setInsConvertedToSelect] = useState([]);
  const [insSearch, setInsSearch] = useState("");
  const [eduApiLoader, setEduApiLoader] = useState(false);

  useEffect(() => {
    if (insSearch.length > 1 && insSearch !== " ") {
      setEduApiLoader(true);
      debouncedApiRequest(
        organizationSearchSuggestions,
        insSearch,
        selectedLanguage,
        setOrgApiData,
        setEduApiLoader
      );
    } else {
      setEduApiLoader(false);
      setOrgApiData([]);
      setInsConvertedToSelect([]);
    }
  }, [insSearch]);

  useEffect(() => {
    if (orgApiData.length > 0) {
      const data = orgApiData.map((item) => {
        // Create a new object to hold the existing fields and the new fields
        const newItem = {
          ...item, // Spread the existing fields
          value: item.organization, // Add new field 1 with a default value
          label: item.organization, // Add new field 2 with a default value
          // Add new field 3 with a default value
        };
        return newItem;
      });
      setInsConvertedToSelect(data);
    }
  }, [orgApiData]);

  const checkDuplicate = () => {
    var duplicate = false;

    employmentHistory?.data?.map((emp) => {
      if (emp.organization === employee.organization) {
        let fromDate = convertDateToMilliseconds(employee.fromDate);
        let toDate = employee.toDate
          ? convertDateToMilliseconds(employee.toDate)
          : Date.now();

        console.log(fromDate, emp.fromDate);
        console.log(toDate, emp.toDate ? emp.toDate : Date.now());

        if (
          fromDate === emp.fromDate ||
          toDate === (emp.toDate ? emp.toDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= emp.fromDate &&
            fromDate <= (emp.toDate ? emp.toDate : Date.now())) || // User from date falls within existing date range
          (toDate >= emp.fromDate &&
            toDate <= (emp.toDate ? emp.toDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= emp.fromDate &&
            toDate >= (emp.toDate ? emp.toDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= emp.fromDate &&
            toDate >= emp.fromDate &&
            toDate <= (emp.toDate ? emp.toDate : Date.now())) || // Right-side overlap
          (toDate >= (emp.toDate ? emp.toDate : Date.now()) &&
            fromDate >= emp.fromDate &&
            fromDate <= (emp.toDate ? emp.toDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  console.log("errors are", errors);

  const handleSubmitDate = (close) => {
    const newErrors = {};
    if (!employee.organization) {
      newErrors.organization = "Organization Name is required";
    }
    if (!employee.fromDate) {
      newErrors.fromDate = "Employment Start Date is required";
    }
    if (!locationForEmploy) {
      newErrors.location = "Location is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseFillAllRequiredFields"
          ) || {}
        ).mvalue || "nf Please fill all required fields"
      );
      return;
    }

    console.log(locationForEmploy);
    console.log(employee);

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "EmploymentAlreadyExistDate"
          ) || {}
        ).mvalue || "nf Employment already exist within the date range"
      );
      return;
    }

    if (!isEmployEdit) {
      if (isAddingEmploy) {
        return;
      }

      setIsAddingEmploy(true);

      PostApi("Employment History", {
        ...employee,
        location: locationForEmploy,
        fromDate: FormatDateIntoPost(employee.fromDate),
        toDate: employee.toDate ? FormatDateIntoPost(employee.toDate) : "",
        duration: calculateDaysDifference(
          convertDateToMilliseconds(employee.fromDate),
          employee.toDate
            ? convertDateToMilliseconds(employee.toDate)
            : Date.now()
        ),
      })
        .then((res) => {
          dispatch(
            addNewEmployment({
              ...res.data,
              fromDate: convertDateToMilliseconds(res.data.fromDate),
              toDate: res.data.toDate
                ? convertDateToMilliseconds(res.data.toDate)
                : "",
            })
          );

          /* INSERT NEW ORGANIZATION */
          const data = res?.data;
          if (isCustomOrganization) {
            handleInsertNewOrganization(
              data?.organization,
              data?.mlanguage,
              data?.applicationName,
              data?.organization,
              data?.id
            );
          }

          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "NewEmploymentAddedSuccessful"
              ) || {}
            ).mvalue || "nf New Employment Added Successful"
          );

          if (close) {
            handleModalClose();
          }
          setEmployee(initialEmployeeState);
          setLocationForEmploy("");
          setOnGoing(false);
          setErrors({});
          dispatch(FetchOrganizationHistory());
          /* RESET THE CUSTOM ORG STATUS */
          setIsCustomOrganization(false);
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
        })
        .finally(() => {
          setIsAddingEmploy(false);
        });
    } else {
      EditApi("Employment History", employee.id, {
        ...employee,
        location: locationForEmploy,
        fromDate: FormatDateIntoPost(employee.fromDate),
        toDate: FormatDateIntoPost(employee.toDate),
      })
        .then((res) => {
          // dispatch(editSkillAcquired({ id: formvalues4.id, updatedData: res.data }))
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) =>
                  item.elementLabel === "EmploymentHistoryUpdatedSuccessful"
              ) || {}
            ).mvalue || "nf Employment History Updated Successful"
          );
          if (close) {
            handleModalClose();
          }
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
        });
    }
  };

  /* HANDLE CREATING NEW ORGANIZATION NAME IN MASTER TABLE */
  const handleInsertNewOrganization = async (
    newOrgName,
    lang,
    moduleName,
    contentName,
    itemId
  ) => {
    const payload = {
      organization: newOrgName,
      mlanguage: lang,
      mstatus: "W",
    };
    try {
      const res = await exceptionPOSTapi("Organizations", payload);
      const data = res?.data;

      handleOrganizationExceptions(
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

  /* HANDLE ORG EXCEPTION */
  const handleOrganizationExceptions = async (
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

  return (
    <>
      <div
        className="d-print-none"
        style={{
          direction:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Direction"
              ) || {}
            ).mvalue || "ltr",
        }}
      >
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
                        (item) => item.elementLabel === "EmploymentHistory"
                      ) || {}
                    ).mvalue || "nf EmploymentHistory"}
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
                ></button>
              </div>
              <div className="modal-body ">
                {/* form start */}
                <div className="   ">
                  {!Validation && (
                    <div className="">
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "OrganizationName"
                            ) || {}
                          ).mvalue || "nf Organization Name"}
                          <span className="text-danger"> *</span>
                        </label>
                        {/* <input type="text" style={{ height: "32px" }} class="form-control bg-body-tertiary h-75 font-5" id="" placeholder="Enter your Organization name" onChange={(e) => setEmployee({ ...employee, organization: e.target.value })} value={employee.organization} /> */}
                        <CreateSelectInstitution
                          setInsSearch={setInsSearch}
                          insSearch={insSearch}
                          insConvertedToSelect={insConvertedToSelect}
                          formvalues={employee}
                          setFormValues={setEmployee}
                          showDropdown={false}
                          formType={"Employment"}
                          handleOrgParentToChild={handleOrgParentToChild}
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
                        {errors.organization && (
                          <div className="invalid-feedback d-flex mt-0">
                            {errors.organization}
                          </div>
                        )}
                      </div>

                      <div className="ms-3">
                        {/* <div class="form-check form-check-inline my-1 p-0    ">
                        <input class=" bg-body-tertiary  " type="radio" name="mtype" id="inlineRadio1" value="Own" checked={employee.mtype === "Own"} onChange={(e) => setEmployee({ ...employee, mtype: e.target.value })} />
                        <label class="form-check-label" for="inlineRadio1">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Own') || {}).mvalue || "nf Own"}</label>
                      </div>
                      <div class="form-check form-check-inline p-0  ">
                        <input class=" bg-body-tertiary  " type="radio" name="mtype" id="inlineRadio2" value="Employment" checked={employee.mtype === "Employment"} onChange={(e) => setEmployee({ ...employee, mtype: e.target.value })} />
                        <label class="form-check-label" for="inlineRadio2">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Employment') || {}).mvalue || "nf Employment"}</label>
                      </div> */}

                        <div className="d-flex my-2  w-100 ">
                          <div className=" h-75 w-100  ">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label "
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "EmploymentStartDate"
                                ) || {}
                              ).mvalue || "nf EmploymentStartDate"}
                              <span className="text-danger">*</span>
                            </label>
                            {/* <input type="date" style={{ height: "32px" }} max={timestampToYYYYMMDD(Date.now())} className={`form-control bg-body-tertiary h-75  `} id="exampleFormControlInput1" onChange={(e) => setEmployee({ ...employee, fromDate: e.target.value })} value={employee.fromDate} /> */}
                            <DatePicker
                              style={{ height: "32px" }}
                              maxDate={timestampToYYYYMMDD(Date.now())}
                              className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                              id="exampleFormControlInput1"
                              onChange={(e) =>
                                setEmployee({
                                  ...employee,
                                  fromDate: e
                                    ? timestampToYYYYMMDD(new Date(e).getTime())
                                    : null,
                                })
                              }
                              toggleCalendarOnIconClick
                              selected={
                                employee?.fromDate ? employee?.fromDate : null
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
                            {errors && (
                              <div className="invalid-feedback d-flex mt-0">
                                {errors.fromDate}
                              </div>
                            )}
                          </div>

                          <div className=" ms-2 h-75 w-100  ">
                            <div className="   ">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label bg-body-tertiary"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "EmploymentEndDate"
                                  ) || {}
                                ).mvalue || "nf EmploymentEndDate"}
                              </label>
                              {/* <input type="date" disabled={onGoing.instituteEndDate} style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} max={timestampToYYYYMMDD(Date.now())} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" min={employee.fromDate} onChange={(e) => setEmployee({ ...employee, toDate: e.target.value })} value={employee.toDate} /> */}
                              <DatePicker
                                id="exampleFormControlInput1"
                                style={{ height: "32px" }}
                                className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                                minDate={employee.fromDate}
                                maxDate={timestampToYYYYMMDD(Date.now())}
                                onChange={(e) =>
                                  setEmployee({
                                    ...employee,
                                    toDate: e
                                      ? timestampToYYYYMMDD(
                                          new Date(e).getTime()
                                        )
                                      : null,
                                  })
                                }
                                toggleCalendarOnIconClick
                                selected={
                                  employee?.toDate ? employee?.toDate : null
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
                                  ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                                  : "d-flex ms-1 align-items-center font-6 text-secondary "
                              }
                            >
                              <label
                                htmlFor="exampleFormControlInput1"
                                className=""
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "CurrentEmployment"
                                  ) || {}
                                ).mvalue || "nf Current Employment"}{" "}
                              </label>
                              <input
                                className="ms-2"
                                type="checkbox"
                                name="instituteEndDate"
                                checked={onGoing?.instituteEndDate}
                                onChange={(e) => {
                                  setOnGoing({
                                    ...onGoing,
                                    [e.target.name]: e.target.checked,
                                  });
                                  if (e.target.checked) {
                                    setEmployee({ ...employee, toDate: "" });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="my-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <label
                              htmlFor="locationInput"
                              className="form-label"
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Location"
                                ) || {}
                              ).mvalue || "nf Location"}
                              <span className="text-danger"> *</span>
                            </label>
                            <div className="d-flex align-items-center justify-align-content">
                              <input
                                id="onlineCheckbox"
                                className="ml-2"
                                type="checkbox"
                                name="online"
                                checked={locationForEmploy.includes("Online")}
                                onChange={(e) => {
                                  setOnline(!online);
                                }}
                              />
                              <label htmlFor="onlineCheckbox" className="ms-1">
                                {" "}
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "Online"
                                  ) || {}
                                ).mvalue || "nf Online"}
                              </label>
                            </div>
                          </div>
                          <MultiSelect
                            viewLocation={locationForEmploy}
                            setLocationData={setLocationForEmploy}
                            onlineStatus={online}
                            isEdit={isEmployEdit}
                            error={errors.location}
                          />
                          {errors.location && (
                            <div className="invalid-feedback d-flex mt-0">
                              {errors.location}
                            </div>
                          )}
                        </div>

                        <div className="my-2 ">
                          <label
                            htmlFor="exampleFormControlTextarea1"
                            className="form-label"
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel ===
                                  "ProjectBriefDescription"
                              ) || {}
                            ).mvalue || "nf ProjectBriefDescription"}
                          </label>
                          <textarea
                            className="form-control bg-body-tertiary"
                            id="exampleFormControlTextarea1"
                            rows="2"
                            onChange={(e) =>
                              setEmployee({
                                ...employee,
                                briefDescriptions: e.target.value,
                              })
                            }
                            value={employee.briefDescriptions}
                          >
                            {" "}
                          </textarea>
                        </div>

                        <div className="d-flex justify-content-between align-items-baseline   ">
                          {/* <div>
                          <SecondaryBtn label="Validate this project" onClick={handleValidateProject} backgroundColor="#F8F8E9" color="var(--primary-color)" />
                          <div id="emailHelp" class="form-text">
                            <a href="/">Require Validation support?</a>
                          </div>

                        </div> */}
                          {/* <SecondaryBtn label="Attach related documents" onClick={() => setFileupload(true)} backgroundColor="#F8F8E9" color="var(--primary-color)" /> */}
                        </div>
                      </div>
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
                          ).mvalue || "nf ProjectValidation"}
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
                                value="Client Team Leader"
                              />
                              <label
                                class="form-check-label"
                                for="relationship1"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "ClientTeamLeader"
                                  ) || {}
                                ).mvalue || "nf ClientTeamleader"}
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
                                value="Client Team Member"
                              />
                              <label
                                class="form-check-label"
                                for="relationship2"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "ClientTeamMember"
                                  ) || {}
                                ).mvalue || "nf ClientTeamMember"}
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
                                value="Own Team Leader"
                              />
                              <label
                                class="form-check-label"
                                for="relationship3"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "OwnTeamLeader"
                                  ) || {}
                                ).mvalue || "nf OwnTeamLeader"}
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
                                value="Own Team Member"
                              />
                              <label
                                class="form-check-label"
                                for="relationship5"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "OwnTeamMember"
                                  ) || {}
                                ).mvalue || "nf OwnTeamMember"}{" "}
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
                          ).mvalue || "nf Others"}
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
                          ).mvalue || "nf MobileNo"}
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
                          ).mvalue || "nf Remarks"}{" "}
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
              <div className="modal-footer d-flex gap-2 justify-content-end  ">
                {!isEmployeeEdit && (
                  <div className="d-flex gap-2 ">
                    <div>
                      <SecondaryBtnLoader
                        onClick={() => handleSubmitDate(false)}
                        label="Save"
                        backgroundColor="#F8F8E9"
                        color="var(--primary-color)"
                        loading={isAddingEmploy}
                      />
                    </div>
                    <SecondaryBtnLoader
                      label="Save & Close"
                      Active={true}
                      onClick={() => handleSubmitDate(true)}
                      backgroundColor="var(--primary-color)"
                      color="#F8F8E9"
                      loading={isAddingEmploy}
                    />
                  </div>
                )}

                {isEmployeeEdit && (
                  <div className="d-flex gap-2 ">
                    <div>
                      <SecondaryBtnLoader
                        onClick={() => handleSubmitDate(false)}
                        label="Edit"
                        backgroundColor="#F8F8E9"
                        color="var(--primary-color)"
                      />
                    </div>
                    <SecondaryBtnLoader
                      label="Edit & Close"
                      onClick={() => handleSubmitDate(true)}
                      backgroundColor="var(--primary-color)"
                      color="#F8F8E9"
                    />
                  </div>
                )}
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
            <div
              className=" bg-white px-1 col-md font-5 fixed-sidebar   rounded overflow-y-auto  "
              style={{ height: contentHeight }}
            >
              <div>
                <DetailedPofileNavbar />
              </div>
              <div>
                <PremiumServicesOptions setSwitchTab={setSwitchTab} />
              </div>
            </div>

            <hr className="vr m-0 p-0" />

            <div
              className="col-md-7  rounded bg-white  px-1 font-5 overflow-y-auto   "
              style={{ height: contentHeight }}
            >
              {switchTab === "" && (
                <>
                  <div className="d-md-flex align-items-center justify-content-between my-1 px-1   ">
                    <div className="d-flex align-items-center "></div>
                    <div className="py-1 d-flex gap-1">
                      <div
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        id="openModal"
                      >
                        <SecondaryBtn
                          label={
                            (
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "AddSkillButton"
                              ) || {}
                            ).mvalue || "nf AddSkillButton"
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
                    className="accordion    "
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item border-0  mb-2 rounded-top  ">
                      <h2 className="accordion-header  py-1 ">
                        <button
                          className="accordion-button flex justify-content-between py-2  "
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
                                  item.elementLabel === "EmploymentHistory"
                              ) || {}
                            ).mvalue || "nf Employment History"}
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
                        ref={pdfRef}
                        id="panelsStayOpen-collapseOne"
                        className="accordion-collapse   collapse show"
                      >
                        {summaryTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <div className="table-responsive ">
                              <EmploymentSummary
                                data={employmentHistory}
                                editEnable={editEnable}
                                edit={handleEmployEdit}
                              ></EmploymentSummary>
                            </div>
                            {/* table end */}
                          </div>
                        )}
                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <EmploymentDetail
                              data={employmentHistory}
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

            <hr className="vr m-0 p-0" />

            <div className="col-md  rounded bg-white px-1 font-5 fixed-sidebar">
              <RightSideBar />
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <div className=" d-none d-print-block   ">
        <DetailedResume />
      </div>
    </>
  );
};

export default DetailsProfileManagement;
