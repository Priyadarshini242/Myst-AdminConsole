import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import ShowHideIcon from "../../../components/ShowHideIcon";
import { MdDelete, MdEdit } from "react-icons/md";
import { ImAttachment } from "react-icons/im";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import { useSelector } from "react-redux";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import MembershipSummary from "../../../components/SkillOwner/DetailedProfile/MembershipSummary";
import MembershipDetail from "../../../components/SkillOwner/DetailedProfile/MembershipDetail";
import CreateSelectForLocation from "../../../components/SkillOwner/SelectComponent/CreateSelectForLocation";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import { useDispatch } from "react-redux";
import PostApi from "../../../api/PostData/PostApi";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { addNewMembership } from "../../../reducer/detailedProfile/membershipSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import CreateSelect from "../../../components/SkillOwner/SelectComponent/CreateSelect";
import { RxCross2 } from "react-icons/rx";
import { FetchOrganizationHistory } from "../../../api/fetchAllData/fetchOrganization";

import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { fetchMembershipHistory } from "../../../api/fetchAllData/fetchMembershipHistory";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import CreateSelectInstitution from "../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { ThreeDots } from "react-loader-spinner";
import organizationSearchSuggestions from "../../../api/searchSuggestionAPIs/organizationSearchSuggestions";
import { debouncedApiRequest } from "../../../components/DebounceHelperFunction/debouncedApiRequest";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { exceptionPOSTapi } from "../../../api/PostData/exceptionsPOSTapi";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const MembershipHistory = () => {
  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const membershipHistory = useSelector((state) => state.membershipHistory);
  console.log(membershipHistory);

  /* STORE IMPORTS */
  const { regionalData } = useSelector((state) => state);

  const innistalState = {
    mtype: "Membership History",
    fromDate: "",
    toDate: "",
    briefDescriptions: "",
    mtype: "Own",
    mlanguage: selectedLanguage,
    userId:getCookie("userId"),
    organization: "",
    showHide: "Yes",
    validation: "No",
    duration: "",
    remark: "",
    location: "",
    orgIsnew: false,
    membershipName: "",
  };

  const dispatch = useDispatch();

  const buttonRef = useRef(null);
  const [membershipDetails, setMembershipDetails] = useState(innistalState);
  const [newform, setNewForm] = useState({});

  const [isAdddingMembership, setIsAddingMembership] = useState(false);

  console.log(membershipDetails);

  const [editEnable, setEditEnable] = useState(false);
  const [location, setLocation] = useState([]);
  const [online, setOnline] = useState(false);
  const [switchTab, setSwitchTab] = useState("");
  const [onGoing, setOnGoing] = useState(false);

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);

  /* FOR CUSTOM ORGANIZATION NAME */
  const [isCustomIOrgMembership, setIsCustomIOrgMembership] = useState(false);

  const handleOrgMemberParentToChild = (val) => {
    setIsCustomIOrgMembership(val);
  };

  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );
  useEffect(() => {
    dispatch(FetchOrganizationHistory());
  }, []);
  const filterEmployment = employmentHistory
    .filter((employment) => employment.mlanguage === selectedLanguage)
    .map((employment) => ({
      value: employment,
      label: employment.organization,
    }));

  const [companySelectValue, setCompanySelectValue] = useState(null);
  //locations for exsiting employment
  const [locationForEmployment, setLocationForEmployment] = useState([]);
  useEffect(() => {
    let locations = companySelectValue?.value?.location?.split(",");
    setLocationForEmployment(locations);
  }, [companySelectValue?.value?.location]);

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

  const pdfRef = useRef();

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

  useEffect(() => {
    if (membershipHistory?.status === "idle") {
      dispatch(fetchMembershipHistory());
    }
  }, []);

  const checkDuplicate = () => {
    var duplicate = false;

    membershipHistory?.data?.map((cert) => {
      if (
        cert.title === membershipDetails.membershipName &&
        cert.organization === membershipDetails.organization
      ) {
        let fromDate = convertDateToMilliseconds(membershipDetails.fromDate);
        let toDate = membershipDetails.toDate
          ? convertDateToMilliseconds(membershipDetails.toDate)
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

  const handleMembershipSubmit = (close) => {
    console.log(membershipDetails);

    if (isAdddingMembership) {
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "MembershipAlreadyExistDate"
          ) || {}
        ).mvalue || "nf Membership already exist in within the date range"
      );
      return;
    }

    setIsAddingMembership(true);

    // console.log({ ...certificationDetails, location: locationForNewCertificate });
    // dispatch(addNewCertification({...certificationDetails,location:locationForNewCertificate}))
    // dispatch(emptyCertification())

    PostApi("Memberships", {
      ...membershipDetails,
      title: membershipDetails.membershipName,
      location: location,
      startDate: FormatDateIntoPost(membershipDetails.fromDate),
      endDate: membershipDetails.toDate
        ? FormatDateIntoPost(membershipDetails.toDate)
        : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(membershipDetails.fromDate),
        membershipDetails.toDate
          ? convertDateToMilliseconds(membershipDetails.toDate)
          : Date.now()
      ),
    })
      .then((res) => {
        dispatch(
          addNewMembership({
            ...res.data,
            startDate: convertDateToMilliseconds(res.data.startDate),
            endDate: res.data.endDate
              ? convertDateToMilliseconds(res.data.endDate)
              : "",
          })
        );

        /* IF NEW ORGANIZATION NAME ENTERED */
        const data = res?.data;
        if (isCustomIOrgMembership) {
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
              (item) => item.elementLabel === "NewMembershipAddedSuccessful"
            ) || {}
          ).mvalue || "nf New Membership Added Successful"
        );

        setMembershipDetails(innistalState);
        setLocation("");
        setOnGoing(false);

        if (close && buttonRef.current) {
          buttonRef.current.click();
        }
        if (!close && buttonRef.current) {
          setMembershipDetails(innistalState);
        }
        setIsAddingMembership(false);
        setIsCustomIOrgMembership(false);
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
        setIsAddingMembership(false);
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
      organization: newOrgName,
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
                        (item) => item.elementLabel === "Memberships"
                      ) || {}
                    ).mvalue || "nf MemberShips"}
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
                        {/* <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'NameOfTheSkill') || {}).mvalue || "Name Of Skill"}<span className='text-danger' > *</span></label> */}
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "NameOfTheMembership"
                            ) || {}
                          ).mvalue || "nf Name Of Membership"}
                          <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          name="membershipName"
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                          value={membershipDetails.membershipName}
                          onChange={(e) =>
                            setMembershipDetails({
                              ...membershipDetails,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* <div class="mb-2 ">
                                           
                                            <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'NameOfCompany') || {}).mvalue || "Name Of Membership"}<span className='text-danger' > *</span></label>
                                            <input type="text" style={{ height: "32px" }} name='organization' class="form-control bg-body-tertiary h-75 " id="" placeholder="" value={membershipDetails.organization} onChange={(e) => setMembershipDetails({ ...membershipDetails, [e.target.name]: e.target.value })} />
                                        </div> */}

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
                        <CreateSelectInstitution
                          setInsSearch={setInsSearch}
                          insSearch={insSearch}
                          insConvertedToSelect={insConvertedToSelect}
                          formvalues={membershipDetails}
                          setFormValues={setMembershipDetails}
                          showDropdown={false}
                          formType={"Membership"}
                          handleOrgMemberParentToChild={
                            handleOrgMemberParentToChild
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

                      {/* <div class="my-2 ">
                                                    <label for="exampleFormControlInput1" class="form-label">
                                                        {(
                                                            content[selectedLanguage]?.find(
                                                                (item) => item.elementLabel === "NameOfCompany"
                                                            ) || {}
                                                        ).mvalue || "not found"}
                                                        <span className="text-danger"> *</span>
                                                    </label>
                                                    <Select
                                                        placeholder="Enter your company name"
                      
                                                        options={filterEmployment}

                                                        value={setCompanySelectValue.label}

                                                        onChange={(selectedOption)=>{
                                                            setCompanySelectValue(selectedOption)
                                                            setMembershipDetails({...membershipDetails,organization:selectedOption.label})
                                                        }}
                                                   
                                                    />
                                                </div> */}

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
                            ).mvalue || "nf ProjectStartDate"}
                            <span className="text-danger">*</span>
                          </label>
                          {/* <input type="date" style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" name='fromDate'
                                                    max={timestampToYYYYMMDD(Date.now())} value={membershipDetails.fromDate} onChange={(e) => setMembershipDetails({ ...membershipDetails, [e.target.name]: e.target.value })} /> */}
                          <DatePicker
                            style={{ height: "32px" }}
                            maxDate={timestampToYYYYMMDD(Date.now())}
                            className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                            id="exampleFormControlInput1"
                            onChange={(e) =>
                              setMembershipDetails({
                                ...membershipDetails,
                                fromDate: e
                                  ? timestampToYYYYMMDD(new Date(e).getTime())
                                  : null,
                              })
                            }
                            toggleCalendarOnIconClick
                            selected={
                              membershipDetails?.fromDate
                                ? membershipDetails?.fromDate
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
                              ).mvalue || "nf ProjectEndDate"}
                            </label>
                            {/* <input type="date" style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" min={membershipDetails.fromDate}
                                                        max={timestampToYYYYMMDD(Date.now())} name='toDate' value={membershipDetails.toDate} onChange={(e) => setMembershipDetails({ ...membershipDetails, [e.target.name]: e.target.value })} /> */}
                            <DatePicker
                              id="exampleFormControlInput1"
                              style={{ height: "32px" }}
                              className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                              minDate={membershipDetails?.fromDate}
                              maxDate={timestampToYYYYMMDD(Date.now())}
                              onChange={(e) =>
                                setMembershipDetails({
                                  ...membershipDetails,
                                  toDate: e
                                    ? timestampToYYYYMMDD(new Date(e).getTime())
                                    : null,
                                })
                              }
                              toggleCalendarOnIconClick
                              selected={
                                membershipDetails?.toDate
                                  ? membershipDetails?.toDate
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
                              Current Membership{" "}
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
                                  setMembershipDetails({
                                    ...membershipDetails,
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
                          name="briefDescriptions"
                          id="exampleFormControlTextarea1"
                          rows="2"
                          value={membershipDetails.briefDescriptions}
                          onChange={(e) =>
                            setMembershipDetails({
                              ...membershipDetails,
                              [e.target.name]: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      {/* <div className="d-flex justify-content-between align-items-baseline   ">
                                            <div>
                                                <SecondaryBtn label={(content[selectedLanguage]?.find(item => item.elementLabel === 'ValidateThisProject') || {}).mvalue || " nf ValidateThisProject"} onClick={handleValidateProject} backgroundColor="#F8F8E9" color="var(--primary-color)" />
     
                                                <div id="emailHelp" class="form-text">
                                                    <a href="/"> {(content[selectedLanguage]?.find(item => item.elementLabel === 'RequireValidationSupport') || {}).mvalue || "nf RequireValidationSupport"}</a>
                                                </div>

                                            </div> 
                                            <div>
                                                <div>
                                                    <input type="file" id='fileChoose' ref={actualBtnRef} hidden onChange={handleFileChange} />
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
                          Validation
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
                          Who Validates ? <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          className="form-control bg-body-tertiary h-75 "
                          id="exampleFormControlInput1"
                        />
                      </div>

                      <div className="my-2  ">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label "
                        >
                          Relation Ship <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          className="form-control bg-body-tertiary h-75 "
                          id="exampleFormControlInput1"
                        />
                      </div>

                      <div class="mb-2  ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          Email id <span className="text-danger">*</span>
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
                          Mobile No
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
                          Remarks{" "}
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
                          Validate
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
                    onClick={() => handleMembershipSubmit(false)}
                    backgroundColor="#F8F8E9"
                    color="var(--primary-color)"
                    loading={isAdddingMembership}
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
                    onClick={() => handleMembershipSubmit(true)}
                    backgroundColor="var(--primary-color)"
                    color="#F8F8E9"
                    loading={isAdddingMembership}
                  />
                  {/* <button type="button" className="btn  font-5 me-2" style={{ backgroundColor: "#EFF5DC", color:'var(--primary-color)' }} onClick={() => handleMembershipSubmit(false)} disabled={isAdddingMembership} > Save</button>
                                    <button type="button" className="btn  me-2 font-5" style={{backgroundColor: "var(--primary-color)" , color: "#EFF5DC" }} data-bs-dismiss="modal" onClick={() => handleMembershipSubmit(true)} disabled={isAdddingMembership} >Save & Close</button> */}
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
                    <div className="py-1 d-flex gap-1 ">
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
                          ).mvalue || "EditSkillButton"
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
                      <h2 className="accordion-header   py-1">
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
                                (item) => item.elementLabel === "Memberships"
                              ) || {}
                            ).mvalue || "nf MemberShip"}{" "}
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
                        <div className="font-3 font-weight-1 mt-1 d-none  show-in-print ">
                          Memberships in professional bodies
                        </div>

                        {summaryTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <div className="table-responsive ">
                              <MembershipSummary
                                data={membershipHistory}
                                editEnable={editEnable}
                              />
                            </div>
                            {/* table end */}
                          </div>
                        )}
                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            <MembershipDetail
                              data={membershipHistory}
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
      <div className="d-none d-print-block  ">
        <DetailedResume />
      </div>
    </>
  );
};

export default MembershipHistory;
