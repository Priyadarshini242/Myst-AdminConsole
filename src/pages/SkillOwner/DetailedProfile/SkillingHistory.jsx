import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import { useSelector } from "react-redux";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import SkillingsSummary from "../../../components/SkillOwner/DetailedProfile/SkillingsSummary";
import SkillingsDetail from "../../../components/SkillOwner/DetailedProfile/SkillingsDetail";
import CreateSelectForLocation from "../../../components/SkillOwner/SelectComponent/CreateSelectForLocation";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { addNewSkilling } from "../../../reducer/detailedProfile/skillingsSlice";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { useDispatch } from "react-redux";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import PostApi from "../../../api/PostData/PostApi";
import { fetchSkillingHistory } from "../../../api/fetchAllData/fetchSkillingHistory";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import { ThreeDots } from "react-loader-spinner";
import CreateSelectInstitution from "../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { debouncedApiRequest } from "../../../components/DebounceHelperFunction/debouncedApiRequest";
import educationInstitutionApi from "../../../api/searchSuggestionAPIs/educationInstitutionApi";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const SkillingHistory = () => {
  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const skillingsHistory = useSelector((state) => state.skillingsHistory);

  /* STORE IMPORTS */
  const { regionalData } = useSelector((state) => state);

  const innistalState = {
    mtype: "Skilling History",

    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    location: "",
    showHide: "",
    validation: "",
    blockChain: "",
    mlanguage: getCookie("HLang"),
    organization: "",
    userId:getCookie("userId"),
    title: "",
    skillingName: "",
  };

  const dispatch = useDispatch();

  const buttonRef = useRef(null);
  const [skillingDetails, setSkillingDetails] = useState(innistalState);

  const [isAdddingSkill, setIsAddingSkill] = useState(false);

  const [isCustomInstitutionSkilling, setIsCustomInstitutionSkilling] =
    useState(false);

  const handleInsTSkillingParentToChild = (val) => {
    setIsCustomInstitutionSkilling(val);
  };

  const [editEnable, setEditEnable] = useState(false);
  const [location, setLocation] = useState([]);
  const [online, setOnline] = useState(false);
  const [switchTab, setSwitchTab] = useState("");
  const [onGoing, setOnGoing] = useState(false);

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);

  console.log(skillingsHistory);

  const toggleOnline = () => {
    setOnline(false);
  };

  const handleEdit = () => {
    setEditEnable(!editEnable);
  };

  useEffect(() => {
    if (skillingsHistory?.status === "idle") {
      dispatch(fetchSkillingHistory());
    }
  }, []);

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
  }, []);

  const checkDuplicate = () => {
    var duplicate = false;

    skillingsHistory?.data?.map((cert) => {
      if (
        cert.title === skillingDetails.skillingName &&
        cert.organization === skillingDetails.organization
      ) {
        let fromDate = convertDateToMilliseconds(skillingDetails.fromDate);
        let toDate = skillingDetails.toDate
          ? convertDateToMilliseconds(skillingDetails.toDate)
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

  const handleSkillingAdd = (close) => {
    console.log(skillingDetails);

    if (isAdddingSkill) {
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast("Skilling already exist in within the date range");
      return;
    }

    setIsAddingSkill(true);

    // console.log({ ...certificationDetails, location: locationForNewCertificate });
    // dispatch(addNewCertification({...certificationDetails,location:locationForNewCertificate}))
    // dispatch(emptyCertification())

    PostApi("Skilling", {
      ...skillingDetails,
      location: location,
      startDate: FormatDateIntoPost(skillingDetails.fromDate),

      endDate: skillingDetails.toDate
        ? FormatDateIntoPost(skillingDetails.toDate)
        : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(skillingDetails.fromDate),
        skillingDetails.toDate
          ? convertDateToMilliseconds(skillingDetails.toDate)
          : Date.now()
      ),
    })
      .then((res) => {
        dispatch(
          addNewSkilling({
            ...res.data,
            startDate: convertDateToMilliseconds(res.data.startDate),
            endDate: res.data.endDate
              ? convertDateToMilliseconds(res.data.endDate)
              : "",
          })
        );

        /* IF NEW INSTITUTION NAME ENTERED */
        const data = res?.data;
        if (isCustomInstitutionSkilling) {
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

        setSkillingDetails(innistalState);
        setLocation("");
        setOnGoing(false);

        if (close && buttonRef.current) {
          buttonRef.current.click();
        }

        setIsCustomInstitutionSkilling(false);
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
        setIsAddingSkill(false);
        console.log(SkillingsDetail);
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
                        (item) => item.elementLabel === "Skilling"
                      ) || {}
                    ).mvalue || "nf Skilling"}
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
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "NameOfTheSkilling"
                            ) || {}
                          ).mvalue || "nf Name Of Skilling"}
                          <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          name="skillingName"
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                          value={skillingDetails?.skillingName}
                          onChange={(e) =>
                            setSkillingDetails({
                              ...skillingDetails,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                      </div>
                      {/* <div class="mb-2 ">
                                            <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Institution') || {}).mvalue || "Institution"}<span className='text-danger' > *</span></label>
                                            <input type="text" style={{ height: "32px" }} name='organization' class="form-control bg-body-tertiary h-75 " id="" placeholder="" value={skillingDetails.organization} onChange={(e) => setSkillingDetails({ ...skillingDetails, [e.target.name]: e.target.value })} />
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
                          formvalues={skillingDetails}
                          setFormValues={setSkillingDetails}
                          showDropdown={false}
                          formType={"Skilling"}
                          handleInsTSkillingParentToChild={
                            handleInsTSkillingParentToChild
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
                                (item) => item.elementLabel === "ProjecStart"
                              ) || {}
                            ).mvalue || "nf ProjectStart"}
                            <span className="text-danger">*</span>
                          </label>
                          {/* <input type="date" style={{ height: "32px" }} value={skillingDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} name='fromDate' className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" onChange={(e) => setSkillingDetails({ ...skillingDetails, [e.target.name]: e.target.value })} /> */}
                          <DatePicker
                            style={{ height: "32px" }}
                            maxDate={timestampToYYYYMMDD(Date.now())}
                            className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                            id="exampleFormControlInput1"
                            onChange={(e) =>
                              setSkillingDetails({
                                ...skillingDetails,
                                fromDate: e
                                  ? timestampToYYYYMMDD(new Date(e).getTime())
                                  : null,
                              })
                            }
                            toggleCalendarOnIconClick
                            selected={
                              skillingDetails?.fromDate
                                ? skillingDetails?.fromDate
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
                                  (item) => item.elementLabel === "ProjectEnd"
                                ) || {}
                              ).mvalue || "nf ProjectEnd"}
                            </label>
                            {/* <input type="date" style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} value={skillingDetails.toDate} name='toDate' className="form-control bg-body-tertiary h-75 " min={skillingDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} id="exampleFormControlInput1" onChange={(e) => setSkillingDetails({ ...skillingDetails, [e.target.name]: e.target.value })} /> */}
                            <DatePicker
                              id="exampleFormControlInput1"
                              style={{ height: "32px" }}
                              className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                              minDate={skillingDetails?.fromDate}
                              maxDate={timestampToYYYYMMDD(Date.now())}
                              onChange={(e) =>
                                setSkillingDetails({
                                  ...skillingDetails,
                                  toDate: e
                                    ? timestampToYYYYMMDD(new Date(e).getTime())
                                    : null,
                                })
                              }
                              toggleCalendarOnIconClick
                              selected={
                                skillingDetails?.toDate
                                  ? skillingDetails?.toDate
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
                              Current Skilling{" "}
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
                                  setSkillingDetails({
                                    ...skillingDetails,
                                    toDate: "",
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

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
                          value={skillingDetails.briefDescription}
                          onChange={(e) =>
                            setSkillingDetails({
                              ...skillingDetails,
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
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ProjectValidationDetail"
                            ) || {}
                          ).mvalue || "nf ProjectValidationDetail"}
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
                          ).mvalue || "MobileNo"}
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
                          ).mvalue || "Remarks"}{" "}
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
                    onClick={() => handleSkillingAdd(false)}
                    backgroundColor="#F8F8E9"
                    color="var(--primary-color)"
                    loading={isAdddingSkill}
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
                    onClick={() => handleSkillingAdd(true)}
                    backgroundColor="var(--primary-color)"
                    color="#F8F8E9"
                    loading={isAdddingSkill}
                  />
                  {/* <button type="button" className="btn  font-5" style={{ color: "var(--primary-color)" , backgroundColor: "#EFF5DC" }} onClick={()=>handleSkillingAdd(false)} disabled>save</button>
                                    <button type="button" className="btn  me-2 font-5" style={{ backgroundColor: "var(--primary-color)" , color: "#EFF5DC" }}  data-bs-dismiss="modal" onClick={()=>handleSkillingAdd(true)}>Save & Close</button> */}
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
                            ).mvalue || "nf AddSkillButton "
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
                      <h2 className="accordion-header py-1 ">
                        <button
                          className="accordion-button flex justify-content-between py-2"
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
                                  item.elementLabel === "SkillingHistory"
                              ) || {}
                            ).mvalue || "nf Skilling History"}{" "}
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
                              <SkillingsSummary
                                data={skillingsHistory}
                                editEnable={editEnable}
                              />
                            </div>
                            {/* table end */}
                          </div>
                        )}
                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}

                            <SkillingsDetail
                              data={skillingsHistory}
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

export default SkillingHistory;
