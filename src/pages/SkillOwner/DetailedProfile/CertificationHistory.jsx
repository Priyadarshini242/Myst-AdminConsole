import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import { useSelector } from "react-redux";
import CertificationSummary from "../../../components/SkillOwner/DetailedProfile/CertificationSummary";
import CertificationDetail from "../../../components/SkillOwner/DetailedProfile/CertificationDetail";
import CreateSelectForLocation from "../../../components/SkillOwner/SelectComponent/CreateSelectForLocation";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import { useDispatch } from "react-redux";
import {
  addNewCertification,
  emptyCertification,
} from "../../../reducer/detailedProfile/certificationSlice";
import { fetchCertificationHistory } from "../../../api/fetchAllData/fetchCertificationHistory";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import PostApi from "../../../api/PostData/PostApi";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import SmallLoader from "../../../components/SkillAvailer/SmallLoader";
import CreateSelect from "../../../components/SkillOwner/SelectComponent/CreateSelect";
import { RxCross2 } from "react-icons/rx";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import CreateSelectInstitution from "../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { debouncedApiRequest } from "../../../components/DebounceHelperFunction/debouncedApiRequest";
import educationInstitutionApi from "../../../api/searchSuggestionAPIs/educationInstitutionApi";
import { ThreeDots } from "react-loader-spinner";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import DeleteFormDetailedProfile from "../../../components/DeleteFormDetailedProfile";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const CertificationHistory = () => {
  //redux
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  /* STORE IMPORTS */
  const { regionalData } = useSelector((state) => state);
  console.log(certificationHistory);
  const dispatch = useDispatch();

  const [onGoing, setOnGoing] = useState(false);

  const innistalState = {
    mtype: "Certification History",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    location: "",
    showHide: "",
    validation: "",
    blockChain: "",
    mlanguage: getCookie("HLang"),
    certificationName: "",
    organization: "",
    userId:getCookie("userId"),
    title: "",
  };
  const [switchTab, setSwitchTab] = useState("");
  const buttonRef = useRef(null);
  const [certificationDetails, setCertificationDetails] =
    useState(innistalState);
  const [isAdddingCert, setIsAddingCert] = useState(false);
  const [isCustomInstitutionCert, setIsCustomInstitutionCert] = useState(false);

  const handleInsCertParentToChild = (val) => {
    setIsCustomInstitutionCert(val);
  };

  // const [resetLocation, setResetLocation] = useState(false);
  // const [companySelectValue, setCompanySelectValue] = useState(null);

  // //locations for certificate from selected company
  // const [locationForNewCertificate, setLocationForNewCertificate] = useState(null);
  // const [online, setOnline] = useState(false);
  // useEffect(() => {
  //     let locations = companySelectValue?.value?.location?.split(",")
  //     setLocationForNewCertificate(locations)
  // }, [companySelectValue])

  const [location, setLocation] = useState([]);
  const [online, setOnline] = useState(false);

  //Years of Expiriece / Duration Calculation
  const [editEnable, setEditEnable] = useState(false);

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);

  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );

  console.log(employmentHistory);

  const filterEmployment = employmentHistory
    .filter((employment) => employment.mlanguage === selectedLanguage)
    .map((employment) => ({
      value: employment,
      label: employment.organization,
    }));

  const handleEdit = () => {
    setEditEnable(!editEnable);
  };
  const toggleOnline = () => {
    setOnline(false);
  };

  const handleAccordion1 = (event) => {
    if (summaryTab1 == false && DetailTab1 == false) {
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

    // if (certificationHistory.status === "idle") {
    //     dispatch(fetchCertificationHistory());
    // }
  }, []);
  useEffect(() => {
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }
  }, []);

  const checkDuplicate = () => {
    var duplicate = false;

    certificationHistory?.data?.map((cert) => {
      if (
        cert.certificationName === certificationDetails.certificationName &&
        cert.organization === certificationDetails.organization
      ) {
        let fromDate = convertDateToMilliseconds(certificationDetails.fromDate);
        let toDate = certificationDetails.toDate
          ? convertDateToMilliseconds(certificationDetails.toDate)
          : Date.now();

        console.log(fromDate, cert.startDate);
        console.log(toDate, cert.endDate ? cert.endDate : Date.now());

        if (
          fromDate === cert.startDate ||
          toDate === (cert.endDate ? cert.endDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= cert.startDate &&
            fromDate <= (cert.endDate ? cert.endDate : Date.now())) || // User from date falls within existing date range
          (toDate >= cert.startDate &&
            toDate <= (cert.endDate ? cert.endDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= cert.startDate &&
            toDate >= (cert.endDate ? cert.endDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= cert.startDate &&
            toDate >= cert.startDate &&
            toDate <= (cert.endDate ? cert.endDate : Date.now())) || // Right-side overlap
          (toDate >= (cert.endDate ? cert.endDate : Date.now()) &&
            fromDate >= cert.startDate &&
            fromDate <= (cert.endDate ? cert.endDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  const handleCreateCertification = (close) => {
    if (isAdddingCert) {
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "CertificationAlreadyExistDate"
          ) || {}
        ).mvalue || "nf Certification already exist in within the date range"
      );
      return;
    }

    /* SHOW ERR MSG FOR REQ FIELDS */
    if (
      !certificationDetails?.certificationName ||
      !certificationDetails?.organization ||
      !location ||
      !certificationDetails?.fromDate
    ) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseFillAllRequiredFields"
          ) || {}
        ).mvalue || "nf Please fill all required fields"
      );
      return;
    }

    setIsAddingCert(true);

    // console.log({ ...certificationDetails, location: locationForNewCertificate });
    // dispatch(addNewCertification({...certificationDetails,location:locationForNewCertificate}))
    // dispatch(emptyCertification())

    PostApi("Certification History", {
      ...certificationDetails,
      location: location,
      startDate: FormatDateIntoPost(certificationDetails.fromDate),

      endDate: certificationDetails.toDate
        ? FormatDateIntoPost(certificationDetails.toDate)
        : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(certificationDetails.fromDate),
        certificationDetails.toDate
          ? convertDateToMilliseconds(certificationDetails.toDate)
          : Date.now()
      ),
    })
      .then((res) => {
        dispatch(
          addNewCertification({
            ...res.data,
            startDate: convertDateToMilliseconds(res.data.startDate),
            endDate: res.data.endDate
              ? convertDateToMilliseconds(res.data.endDate)
              : "",
          })
        );

        /* IF NEW INSTITUTION NAME ENTERED */
        const data = res?.data;
        if (isCustomInstitutionCert) {
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
              (item) => item.elementLabel === "NewCertificationAddedSuccessful"
            ) || {}
          ).mvalue || "nf New Certification Added Successful"
        );

        setCertificationDetails(innistalState);
        setLocation("");
        setOnGoing(false);

        if (close && buttonRef.current) {
          buttonRef.current.click();
        }

        setIsCustomInstitutionCert(false);
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
        setIsAddingCert(false);
        console.log(certificationDetails);
      });
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
      institutionName: newOrgName,
      mlanguage: lang,
      mstatus: "W",
    };
    try {
      const res = await exceptionPOSTapi("Organizations", payload);
      console.log("response for inserting new org record", res);
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

  const [institutionApiData, setInstitutionApiData] = useState([]);
  const [insConvertedToSelect, setInsConvertedToSelect] = useState([]);
  const [insSearch, setInsSearch] = useState("");
  const [eduApiLoader, setEduApiLoader] = useState(false);

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
      setEduApiLoader(false);
      setInstitutionApiData([]);
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

  console.log("online is ", online);

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
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Certifications"
                      ) || {}
                    ).mvalue || "nf Certification"}
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
                  ref={buttonRef}
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
                    <div className=" ">
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "NameOfTheCertification"
                            ) || {}
                          ).mvalue || "nf NameOFTheCertification"}
                          <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          name="certificationName"
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                          value={certificationDetails.certificationName}
                          onChange={(e) =>
                            setCertificationDetails({
                              ...certificationDetails,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                      </div>
                      {/* <div class="mb-2 ">
                                            <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Institution') || {}).mvalue || "Institution"}<span className='text-danger' > *</span></label>
                                            <input type="text" style={{ height: "32px" }} name='organization' class="form-control bg-body-tertiary h-75 " id="" placeholder="" value={certificationDetails.organization} onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                                        </div> */}
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
                          formvalues={certificationDetails}
                          setFormValues={setCertificationDetails}
                          showDropdown={false}
                          formType={"Certification"}
                          handleInsCertParentToChild={
                            handleInsCertParentToChild
                          }
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
                                                onChange={(e) => setcertificationDetails({ ...certificationDetails, institute: e.target.value })}
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
                                (item) => item.elementLabel === "ProjecStart"
                              ) || {}
                            ).mvalue || "nf ProjectStart"}
                            <span className="text-danger">*</span>
                          </label>
                          {/* <input type="date" style={{ height: "32px" }} value={certificationDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} name='fromDate' className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} /> */}
                          <DatePicker
                            style={{ height: "32px" }}
                            maxDate={timestampToYYYYMMDD(Date.now())}
                            className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                            id="exampleFormControlInput1"
                            onChange={(e) =>
                              setCertificationDetails({
                                ...certificationDetails,
                                fromDate: e
                                  ? timestampToYYYYMMDD(new Date(e).getTime())
                                  : null,
                              })
                            }
                            toggleCalendarOnIconClick
                            selected={
                              certificationDetails?.fromDate
                                ? certificationDetails?.fromDate
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

                        <div className="ms-2 h-75 w-100 ">
                          <div className="  ">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label bg-body-tertiary"
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "ProjectEnd"
                                ) || {}
                              ).mvalue || "nf ProjectEnd"}
                            </label>
                            {/* <input type="date" style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} value={certificationDetails.toDate} name='toDate' className="form-control bg-body-tertiary h-75 " min={certificationDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} id="exampleFormControlInput1" onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} /> */}
                            <DatePicker
                              id="exampleFormControlInput1"
                              style={{ height: "32px" }}
                              className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                              minDate={certificationDetails?.fromDate}
                              maxDate={timestampToYYYYMMDD(Date.now())}
                              onChange={(e) =>
                                setCertificationDetails({
                                  ...certificationDetails,
                                  toDate: e
                                    ? timestampToYYYYMMDD(new Date(e).getTime())
                                    : null,
                                })
                              }
                              toggleCalendarOnIconClick
                              selected={
                                certificationDetails?.toDate
                                  ? certificationDetails?.toDate
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
                                ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                                : "d-flex ms-1 align-items-center font-6 text-secondary "
                            }
                          >
                            <label
                              htmlFor="exampleFormControlInput1"
                              className=""
                            >
                              Current Certification{" "}
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
                                  setCertificationDetails({
                                    ...certificationDetails,
                                    toDate: "",
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* <div class="mb-2 ">
                                            <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'NameOfTheCertification') || {}).mvalue || "nf NameOFTheCertification"}<span className='text-danger' > *</span></label>
                                            <input type="text" style={{ height: "32px" }} name='certificationName' class="form-control bg-body-tertiary h-75 " id="" placeholder="" value={certificationDetails.certificationName} onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                                        </div> */}

                      {/* <div class="my-2 ">
                                            <label for="exampleFormControlInput1" class="form-label">
                                                {(
                                                    content[selectedLanguage]?.find(
                                                        (item) => item.elementLabel === "OrganizationName"
                                                    ) || {}
                                                ).mvalue || "not found"}
                                                <span className="text-danger"> *</span>
                                            </label>
                                            <CreateSelect
                                                newField="orgIsnew"
                                                placeholder="Enter your company name"
                                                setFormValues={setCertificationDetails}
                                                formValues={certificationDetails}
                                                setNewForm={setCertificationDetails}
                                                NewForm={certificationDetails}
                                                setNewField="organization"
                                                options={filterEmployment}
                                                value={companySelectValue}
                                                setValue={setCompanySelectValue}
                                            />
                                        </div> */}

                      {/* <div className='d-flex my-2  w-100   '  >
                                            <div className=" h-75 w-100  " >
                                                <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'ProjectStartDate') || {}).mvalue || "nf ProjectStartDate"}<span className='text-danger' >*</span></label>
                                                <input type="date" style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" name='fromDate'
                                                    value={certificationDetails.fromDate}
                                                    min={timestampToYYYYMMDD(Number(companySelectValue?.value?.fromDate))}
                                                    max={timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate))}
                                                    onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                                            </div>
                                            <div className=" ms-2 h-75 w-100  ">
                                                <label htmlFor="exampleFormControlInput1" className="form-label bg-body-tertiary">{(content[selectedLanguage]?.find(item => item.elementLabel === 'ProjectEndDate') || {}).mvalue || "ProjectEndDate"}</label>
                                                <input type="date" style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" name='toDate'
                                                    value={certificationDetails.toDate}
                                                    min={certificationDetails.fromDate}
                                                    max={timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate))}
                                                    onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                                            </div>
                                        </div> */}

                      {/* <div className="my-2">
                                            <div>
                                                <label for="exampleFormControlInput1" class="form-label">
                                                    {(
                                                        content[selectedLanguage]?.find(
                                                            (item) => item.elementLabel === "Locations"
                                                        ) || {}
                                                    ).mvalue || "not found"}
                                                    <span className="text-danger me-2"> *</span>

                                                    <SecondaryBtn
                                                        label="reset"
                                                        onClick={() => {

                                                            setLocationForNewCertificate(companySelectValue?.value?.location.split(","))
                                                        }}
                                                        backgroundColor="#F8F8E9"
                                                        color="var(--primary-color)"

                                                    />
                                                </label>



                                            </div>
                                            <div className="d-flex gap-2">

                                                {locationForNewCertificate?.map((loc) => {
                                                    return (
                                                        <div className="p-1  rounded bg-light border" >
                                                            {loc}
                                                            <span className="text-muted px-1" style={{ cursor: 'pointer' }} onClick={() => {
                                                                let newLocations = locationForNewCertificate?.filter((location) => {
                                                                    return location !== loc
                                                                })
                                                                setLocationForNewCertificate(newLocations)
                                                            }}><RxCross2 /></span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                        </div> */}

                      {/* <div class="my-2 ">
                                            <div className='d-flex justify-content-between '>


                                                <label for="exampleFormControlInput1" class="form-label">Location<span className='text-danger' > *</span></label>
                                                <div className='d-flex align-items-center justify-align-content'>
                                                    <input className='ms-2 ' type="checkbox" name="online" checked={online}
                                                        onClick={(e) => {
                                                            setOnline(!online);
                                                            if (e.target.checked)
                                                                setLocation("Online");
                                                            else setLocation();
                                                        }} />
                                                    <label htmlFor="exampleFormControlInput1" className="ms-1 " >Online </label>

                                                </div>
                                            </div>
                                            <input disabled={online} value={location} type="text" style={{ height: "32px" }} class="form-control bg-body-tertiary h-75 " id="" placeholder="" />
                                        </div> */}

                      {/* <div className="my-2">
                                            <div className='d-flex justify-content-between'>
                                                <label htmlFor="locationInput" className="form-label">
                                                {(content[selectedLanguage]?.find(item => item.elementLabel === 'Location') || {}).mvalue || "nf Location"}<span className='text-danger'> *</span>
                                                </label>
                                                <div className='d-flex align-items-center justify-align-content'>
                                                    <input
                                                        id="onlineCheckbox"
                                                        className='ms-2'
                                                        type="checkbox"
                                                        name="online"
                                                        checked={online}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setOnline(isChecked);                                                           
                                                        }}
                                                    />
                                                    <label htmlFor="onlineCheckbox" className="ms-1"> {(content[selectedLanguage]?.find(item => item.elementLabel === 'Online') || {}).mvalue || "nf Online"}</label>
                                                </div>
                                            </div>

                                            <MultiSelect reset={ resetLocation}  setLocationData={setLocationForNewCertificate} onlineStatus={online}  />
                                        </div> */}

                      <div className="my-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <label htmlFor="locationInput" className="form-label">
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
                              checked={location.includes("Online")}
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
                        {/* <CreateSelectForLocation locationData={location}
                                                setLocation={setLocation}
                                                onlineStatus={toggleOnline} /> */}
                        <MultiSelect
                          viewLocation={location}
                          setLocationData={setLocation}
                          onlineStatus={online}
                        />
                      </div>

                      <div className="my-2 ">
                        <label
                          htmlFor="exampleFormControlTextarea1"
                          className="form-label"
                        >
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ProjectBriefDescription"
                            ) || {}
                          ).mvalue || "nf ProjectBriefDescription"}
                        </label>
                        <textarea
                          className="form-control bg-body-tertiary"
                          name="briefDescription"
                          id="exampleFormControlTextarea1"
                          rows="2"
                          value={certificationDetails.briefDescription}
                          onChange={(e) =>
                            setCertificationDetails({
                              ...certificationDetails,
                              [e.target.name]: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      {/* <div className="d-flex justify-content-between align-items-baseline   ">

                                            <div>
                                                <div>
                                                    <input type="file" id='fileChoose'  ref={actualBtnRef} hidden onChange={handleFileChange} />
                                                    <label htmlFor="fileChoose" > <SecondaryBtn label={(content[selectedLanguage]?.find(item => item.elementLabel === 'AttachRelatedDocuments') || {}).mvalue || "nf AttachRelatedDocuments"} backgroundColor="#F8F8E9" color="var(--primary-color)" /> </label>
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
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ValidateThisProject"
                            ) || {}
                          ).mvalue || "nf ValidateThisProject"}
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
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "WhoValidates"
                            ) || {}
                          ).mvalue || "nf WhoValidates"}
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
              <div className="modal-footer d-flex justify-content-end  ">
                <div className="d-flex gap-2">
                  <SecondaryBtnLoader
                    label={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Save"
                        ) || {}
                      ).mvalue || "Save"
                    }
                    onClick={() => handleCreateCertification(false)}
                    backgroundColor="#F8F8E9"
                    color="var(--primary-color)"
                    loading={isAdddingCert}
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
                    onClick={() => handleCreateCertification(true)}
                    backgroundColor="var(--primary-color)"
                    color="#F8F8E9"
                    loading={isAdddingCert}
                  />
                  {/* <button type="button" className="btn  me-2 font-5 d-flex gap-1" style={{ backgroundColor: "#EFF5DC", color: "var(--primary-color)" }} onClick={() => handleCreateCertification(false)} disabled={isAdddingCert}> {isAdddingCert && <SmallLoader height={'15px'} width={'15px'} bg={'white'} />} {(content[selectedLanguage]?.find(item => item.elementLabel === 'Save') || {}).mvalue || "nf Save"}</button>
                                    <button type="button" className="btn text-white font-5 d-flex gap-1" style={{ backgroundColor: "var(--primary-color)" }} onClick={() => handleCreateCertification(true)} disabled={isAdddingCert}>  {isAdddingCert && <SmallLoader height={'15px'} width={'15px'} bg={'white'} />}  {(content[selectedLanguage]?.find(item => item.elementLabel === 'SaveAndClose') || {}).mvalue || "nf SaveAndClose"}</button> */}
                </div>
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
                    <div className="py-1 d-flex  gap-1">
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
                    className="accordion   "
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item border-0  mb-2 rounded-top  ">
                      <h2 className="accordion-header py-1   ">
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
                                (item) => item.elementLabel === "Certifications"
                              ) || {}
                            ).mvalue || "nf Certifications"}{" "}
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
                              <CertificationSummary
                                data={certificationHistory}
                                editEnable={editEnable}
                              />
                            </div>

                            {/* table end */}
                          </div>
                        )}

                        {/* Detail tab */}

                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            <CertificationDetail
                              data={certificationHistory}
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

export default CertificationHistory;
