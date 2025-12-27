import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import RightSideBar from "../../../components/RightSideBar";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import CreateSelectForLocation from "../../../components/SkillOwner/SelectComponent/CreateSelectForLocation";
import { useSelector } from "react-redux";
import ProjectSummary from "../../../components/SkillOwner/DetailedProfile/ProjectSummary";
import ProjectDetail from "../../../components/SkillOwner/DetailedProfile/ProjectDetail";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import { useDispatch } from "react-redux";
import { FetchProjectHistory } from "../../../api/fetchAllData/FetchProjectHistory";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import CreateSelect from "../../../components/SkillOwner/SelectComponent/CreateSelect";
import { RxCross2 } from "react-icons/rx";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { addNewProject } from "../../../reducer/detailedProfile/projectSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import PostApi from "../../../api/PostData/PostApi";
import { convertDateToMilliseconds } from "../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { FetchOrganizationHistory } from "../../../api/fetchAllData/fetchOrganization";
import DatePicker from "react-datepicker";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import useContentLabel from "../../../hooks/useContentLabel";
import { getCookie } from '../../../config/cookieService';


const ProjectHistory = () => {
  const [onGoing, setOnGoing] = useState(false);
  const contentLabel = useContentLabel();

  const buttonRef = useRef(null);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);

  const projectHistory = useSelector((state) => state.projectHistory);
  const [switchTab, setSwitchTab] = useState("");

  const [editEnable, setEditEnable] = useState(false);
  const [location, setLocation] = useState("");
  const [online, setOnline] = useState(false);

  //store
  const dispatch = useDispatch();
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  // Tabs
  const [summaryTab1, setsummaryTab1] = useState(true);
  const [DetailTab1, setDetailTab1] = useState(false);

  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );
  const regionalData = useSelector((state) => state.regionalData);
  const filterEmployment = employmentHistory
    .filter((employment) => employment.mlanguage === selectedLanguage)
    .map((employment) => ({
      value: employment,
      label: employment.organization,
    }));

  const initialProjectState = {
    projectActivity: "",
    fromDate: "",
    toDate: "",
    briefDescriptions: "",
    mtype: "Employment",
    mlanguage: selectedLanguage,
    userId:getCookie("userId"),
    organization: "",
    showHide: "Yes",
    validation: "No",
    duration: "",
    remark: "",
    location: "",
    orgIsnew: false,
  };
  const [newProject, setnewProject] = useState(initialProjectState);

  const [companySelectValue, setCompanySelectValue] = useState(null);

  //locations for exsiting employment
  const [locationForEmployment, setLocationForEmployment] = useState([]);
  useEffect(() => {
    let locations = companySelectValue?.value?.location?.split(",");
    setLocationForEmployment(locations);
  }, [companySelectValue?.value?.location]);

  //Years of Expiriece / Duration Calculation

  function dateDynamicView(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log(start + " " + end);

    const yearDiff = end.getYear() - start.getYear();
    const monthDiff = end.getMonth() - start.getMonth();

    const totalDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    );
    console.log(totalDays);
    if (totalDays <= 13) {
      return totalDays >= 7 ? "1 Wk" : totalDays + " Days";
    } else if (totalDays <= 31) {
      return totalDays >= 30 ? "1 Mon" : Math.floor(totalDays / 7) + " Wks";
    } else if (monthDiff > 0) {
      return monthDiff + " Mos";
    } else {
      return yearDiff === 1
        ? "1 Yr"
        : Math.round((totalDays / 365) * 10) / 10 + " Yrs";
    }
  }
  // Days only Calculation

  // function getDaysDifference(startDate, endDate) {
  //     const differenceInTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
  //     const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  //     const ans = Math.round(differenceInDays);
  //     console.log(ans);
  //     return ans;
  // }
  const toggleOnline = () => {
    setOnline(false);
  };

  console.log(companySelectValue);

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

    // if (projectHistory.status === "idle") {
    //     dispatch(FetchProjectHistory());
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }
  }, []);

  const formatDate = (inputDate) => {
    if (!inputDate) return null;
    const [year, month, day] = inputDate?.split("-");
    return `${month}/${day}/${year}`;
  };

  const checkDuplicate = () => {
    var duplicate = false;

    projectHistory?.data?.map((pro) => {
      if (
        pro.projectActivity === newProject.projectActivity &&
        pro.organization === newProject.organization
      ) {
        let fromDate = convertDateToMilliseconds(newProject.fromDate);
        let toDate = newProject.toDate
          ? convertDateToMilliseconds(newProject.toDate)
          : Date.now();

        console.log(fromDate, pro.fromDate);
        console.log(toDate, pro.toDate ? pro.toDate : Date.now());

        if (
          fromDate === pro.fromDate ||
          toDate === (pro.toDate ? pro.toDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= pro.fromDate &&
            fromDate <= (pro.toDate ? pro.toDate : Date.now())) || // User from date falls within existing date range
          (toDate >= pro.fromDate &&
            toDate <= (pro.toDate ? pro.toDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= pro.fromDate &&
            toDate >= (pro.toDate ? pro.toDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= pro.fromDate &&
            toDate >= pro.fromDate &&
            toDate <= (pro.toDate ? pro.toDate : Date.now())) || // Right-side overlap
          (toDate >= (pro.toDate ? pro.toDate : Date.now()) &&
            fromDate >= pro.fromDate &&
            fromDate <= (pro.toDate ? pro.toDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  const handleAddNewProject = (close) => {
    if (isAddingNewProject) {
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "ProjectAlreadyExistDate"
          ) || {}
        ).mvalue || "nf Project already exist in within the date range"
      );
      return;
    }

    setIsAddingNewProject(true);

    console.log(newProject);

    const ticketIdsArray = [];
    if (companySelectValue?.value?.id) {
      ticketIdsArray.push(companySelectValue.value.id);
    }

    const formatdata = {
      ...newProject,
      fromDate: formatDate(newProject.fromDate),
      toDate: newProject.toDate ? formatDate(newProject.toDate) : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(newProject.fromDate),
        newProject.toDate
          ? convertDateToMilliseconds(newProject.toDate)
          : Date.now()
      ),
      location:
        newProject.mtype === "Own" ? location : locationForEmployment?.join(),
      ticketids: ticketIdsArray,
    };
    /* SHOW ERROR MSG FOR REQ FIELDS */
    if (
      newProject?.projectActivity === "" ||
      newProject?.organization === "" ||
      !newProject?.fromDate ||
      formatdata?.location === ""
    ) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseFillAllRequiredFields"
          ) || {}
        ).mvalue || "nf Please fill all required fields"
      );
      setIsAddingNewProject(false);
      return;
    }
    PostApi("Project  History", formatdata)
      .then((res) => {
        const data = res.data;
        // setFormValues({
        //   ...formValues,
        //   projIsnew: false,
        //   projectActivity: data.projectActivity,
        //   fromDate: data.fromDate,
        //   toDate: data.toDate,
        //   organization: data.organization,
        //   mtype: data.mtype,
        // });
        data.fromDate = convertDateToMilliseconds(data.fromDate);
        data.toDate = data.toDate
          ? convertDateToMilliseconds(res.data.toDate)
          : "";
        dispatch(addNewProject(data));
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "AddedNewProject"
            ) || {}
          ).mvalue || "nf Added new Project"
        );

        setnewProject(initialProjectState);
        setCompanySelectValue(null);
        setLocation("");
        setOnGoing(false);

        if (close && buttonRef.current) {
          buttonRef.current.click();
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
      })
      .finally(() => {
        setIsAddingNewProject(false);
      });
  };

  useEffect(() => {
    if (companySelectValue?.value === "NA") {
      setnewProject({ ...newProject, mtype: "Own" });
      return;
    }

    setnewProject({ ...newProject, mtype: "Employment" });

    if (!companySelectValue) {
      setOnGoing({ ...onGoing, certificationEndDate: false });
      return;
    }
    // if (companySelectValue?.__isNew__) {
    //     setOnGoing({ ...onGoing, certificationEndDate: false })
    //     return
    // }

    if (!companySelectValue?.value?.toDate) {
      setOnGoing({ ...onGoing, certificationEndDate: true });
      setnewProject({ ...newProject, toDate: "" });
    } else {
      setOnGoing({ ...onGoing, certificationEndDate: false });
    }
  }, [companySelectValue?.label]);

  useEffect(() => {
    document.title = "Detailed Profile";

    dispatch(FetchOrganizationHistory());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                        (item) => item.elementLabel === "ProjectHistory"
                      ) || {}
                    ).mvalue || "nf Project History"}
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
                              (item) => item.elementLabel === "ProjectName"
                            ) || {}
                          ).mvalue || "nf ProjectName"}
                          <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                          name="projectActivity"
                          value={newProject.projectActivity}
                          onChange={(e) =>
                            setnewProject({
                              ...newProject,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                      </div>
                      {/* <div class="mb-2 ">
                                            <div class="form-check form-check-inline my-1 ">
                                                <input
                                                    class="  "
                                                    type="radio"
                                                    name="mtype"
                                                    id="inlineRadio1"
                                                    value="Own"
                                                    checked={newProject.mtype === "Own"}
                                                    onChange={(e) =>
                                                        setnewProject({
                                                            ...newProject,
                                                            [e.target.name]: e.target.value,
                                                        })
                                                    }
                                                />
                                                <label class="form-check-label" for="inlineRadio1">
                                                    {(
                                                        content[selectedLanguage]?.find(
                                                            (item) => item.elementLabel === "Own"
                                                        ) || {}
                                                    ).mvalue || "not found"}
                                                </label>
                                            </div>
                                            <div class="form-check form-check-inline  ">
                                                <input
                                                    class="x"
                                                    type="radio"
                                                    name="mtype"
                                                    id="inlineRadio2"
                                                    value="Employment"
                                                    checked={newProject.mtype === "Employment"}
                                                    onChange={(e) =>
                                                        setnewProject({
                                                            ...newProject,
                                                            [e.target.name]: e.target.value,
                                                        })
                                                    }
                                                />
                                                <label class="form-check-label" for="inlineRadio2">
                                                    {(
                                                        content[selectedLanguage]?.find(
                                                            (item) => item.elementLabel === "Employment"
                                                        ) || {}
                                                    ).mvalue || "not found"}
                                                </label>
                                            </div>
                                        </div> */}

                      <div class="my-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "NameOfCompany"
                            ) || {}
                          ).mvalue || "not found"}
                          <span className="text-danger"> *</span>
                        </label>
                        <CreateSelect
                          newField="orgIsnew"
                          placeholder="Enter your company name"
                          setFormValues={setnewProject}
                          formValues={newProject}
                          setNewForm={setnewProject}
                          NewForm={newProject}
                          setNewField="organization"
                          options={[
                            ...filterEmployment,
                            {
                              value: "NA",
                              label:
                                (
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "NA"
                                  ) || {}
                                ).mvalue || "nf NA",
                            },
                          ]}
                          value={companySelectValue}
                          setValue={setCompanySelectValue}
                          hideCreate={true}
                          usedIn={"detailedProfile"}
                        />
                      </div>

                      {newProject.mtype === "Own" && (
                        <>
                          <div className="d-flex my-2  w-100   ">
                            <div className=" h-75 w-100  ">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label "
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "ProjectStartDate"
                                  ) || {}
                                ).mvalue || "nf ProjectStartDate"}
                                <span className="text-danger">*</span>
                              </label>
                              {/* <input type="date" value={newProject.fromDate} max={timestampToYYYYMMDD(Date.now())} style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" name='fromDate' onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} />
                               */}
                              <DatePicker
                                style={{ height: "32px" }}
                                maxDate={timestampToYYYYMMDD(Date.now())}
                                className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                                id="exampleFormControlInput1"
                                onChange={(e) =>
                                  setnewProject({
                                    ...newProject,
                                    fromDate: e
                                      ? timestampToYYYYMMDD(
                                          new Date(e).getTime()
                                        )
                                      : null,
                                  })
                                }
                                toggleCalendarOnIconClick
                                selected={
                                  newProject?.fromDate
                                    ? newProject?.fromDate
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
                              <div className=" ">
                                <label
                                  htmlFor="exampleFormControlInput1"
                                  className="form-label bg-body-tertiary"
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "ProjectEndDate"
                                    ) || {}
                                  ).mvalue || "ProjectEndDate"}
                                </label>
                                {/* <input type="date" value={newProject.toDate} max={timestampToYYYYMMDD(Date.now())} disabled={onGoing.instituteEndDate} style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" min={newProject.fromDate} name='toDate' onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} /> */}
                                <DatePicker
                                  id="exampleFormControlInput1"
                                  style={{ height: "32px" }}
                                  className={`form-control  h-75 buttom-line-input px-0 w-100 `}
                                  minDate={newProject?.fromDate}
                                  maxDate={timestampToYYYYMMDD(Date.now())}
                                  onChange={(e) =>
                                    setnewProject({
                                      ...newProject,
                                      toDate: e
                                        ? timestampToYYYYMMDD(
                                            new Date(e).getTime()
                                          )
                                        : null,
                                    })
                                  }
                                  toggleCalendarOnIconClick
                                  selected={
                                    newProject?.toDate
                                      ? newProject?.toDate
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
                                    : "d-flex ms-1  align-items-center font-6 text-secondary "
                                }
                              >
                                <label
                                  htmlFor="exampleFormControlInput1"
                                  className=""
                                >
                                  Current Project{" "}
                                </label>
                                <input
                                  className="ms-2 "
                                  type="checkbox"
                                  name="instituteEndDate"
                                  onChange={(e) => {
                                    setOnGoing({
                                      ...onGoing,
                                      [e.target.name]: e.target.checked,
                                    });
                                    if (e.target.checked) {
                                      setnewProject({
                                        ...newProject,
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
                              <label
                                htmlFor="locationInput"
                                className="form-label"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "Locations"
                                  ) || {}
                                ).mvalue || " nf Locations"}
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
                                <label
                                  htmlFor="onlineCheckbox"
                                  className="ms-1"
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Online"
                                    ) || {}
                                  ).mvalue || " nf Online"}
                                </label>
                              </div>
                            </div>
                            {/* <CreateSelectForLocation locationData={location}
                                                setLocation={setLocation}
                                                onlineStatus={toggleOnline} /> */}
                            <div class="my-2 ">
                              <MultiSelect
                                viewLocation={location}
                                setLocationData={setLocation}
                                onlineStatus={online}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {newProject.mtype === "Employment" && (
                        <>
                          <div className="d-flex my-2  w-100   ">
                            <div className=" h-75 w-100  ">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label "
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "ProjectStartDate"
                                  ) || {}
                                ).mvalue || "nf ProjectStartDate"}
                                <span className="text-danger">*</span>
                              </label>
                              {/* <input type="date" style={{ height: "32px" }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" name='fromDate' min={timestampToYYYYMMDD(Number(companySelectValue?.value?.fromDate))}
                                                            max={timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate))} value={newProject.fromDate} onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} /> */}
                              <DatePicker
                                id="exampleFormControlInput1"
                                style={{ height: "32px" }}
                                className={`form-control h-75 buttom-line-input px-0 w-100`}
                                minDate={timestampToYYYYMMDD(
                                  Number(companySelectValue?.value?.fromDate)
                                )}
                                maxDate={timestampToYYYYMMDD(
                                  Number(companySelectValue?.value?.toDate)
                                )}
                                onChange={(e) =>
                                  setnewProject({
                                    ...newProject,
                                    fromDate: e
                                      ? timestampToYYYYMMDD(
                                          new Date(e).getTime()
                                        )
                                      : null,
                                  })
                                }
                                toggleCalendarOnIconClick
                                selected={
                                  newProject.fromDate
                                    ? newProject?.fromDate
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
                              <div className=" ">
                                <label
                                  htmlFor="exampleFormControlInput1"
                                  className="form-label bg-body-tertiary"
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "ProjectEndDate"
                                    ) || {}
                                  ).mvalue || "ProjectEndDate"}
                                </label>
                                {/* <input type="date" disabled={onGoing.certificationEndDate} style={{ height: "32px", opacity: onGoing.certificationEndDate ? .5 : 1 }} className="form-control bg-body-tertiary h-75 " id="exampleFormControlInput1" min={newProject.fromDate}
                                                                max={(companySelectValue?.value?.toDate) ? timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate)) : timestampToYYYYMMDD(Date.now())} value={newProject.toDate} name='toDate' onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} /> */}
                                <DatePicker
                                  id="exampleFormControlInput1"
                                  style={{ height: "32px" }}
                                  className={`form-control h-75 buttom-line-input px-0 w-100`}
                                  minDate={newProject?.fromDate}
                                  maxDate={
                                    companySelectValue?.value?.toDate
                                      ? timestampToYYYYMMDD(
                                          Number(
                                            companySelectValue?.value?.toDate
                                          )
                                        )
                                      : timestampToYYYYMMDD(Date.now())
                                  }
                                  onChange={(e) =>
                                    setnewProject({
                                      ...newProject,
                                      toDate: e
                                        ? timestampToYYYYMMDD(
                                            new Date(e).getTime()
                                          )
                                        : null,
                                    })
                                  }
                                  toggleCalendarOnIconClick
                                  selected={
                                    newProject?.toDate
                                      ? newProject?.toDate
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
                                  disabled={onGoing?.certificationEndDate}
                                  onBlur={() => {}}
                                />
                              </div>

                              {!companySelectValue?.value?.toDate && (
                                <div
                                  className={
                                    onGoing.certificationEndDate
                                      ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                                      : "d-flex ms-1  align-items-center font-6 text-secondary "
                                  }
                                >
                                  <label
                                    htmlFor="exampleFormControlInput1"
                                    className=""
                                  >
                                    Current Project{" "}
                                  </label>
                                  <input
                                    className="ms-2 "
                                    type="checkbox"
                                    name="certificationEndDate"
                                    checked={onGoing.certificationEndDate}
                                    onChange={(e) => {
                                      setOnGoing({
                                        ...onGoing,
                                        [e.target.name]: e.target.checked,
                                      });
                                      if (e.target.checked) {
                                        setnewProject({
                                          ...newProject,
                                          toDate: "",
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="my-2">
                            <div>
                              <label
                                for="exampleFormControlInput1"
                                class="form-label"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "Locations"
                                  ) || {}
                                ).mvalue || "not found"}
                                <span className="text-danger me-2"> *</span>

                                <SecondaryBtn
                                  label={contentLabel('Reset', 'nf Reset')}
                                  onClick={() => {
                                    setLocationForEmployment(
                                      companySelectValue?.value?.location?.split(
                                        ","
                                      )
                                    );
                                  }}
                                  backgroundColor="#F8F8E9"
                                  color="var(--primary-color)"
                                />
                              </label>
                            </div>
                            <div className="d-flex gap-2">
                              {locationForEmployment?.map((loc) => {
                                return (
                                  <div className="p-1  rounded bg-light border">
                                    {loc}
                                    <span
                                      className="text-muted px-1"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        let newLocations =
                                          locationForEmployment.filter(
                                            (location) => {
                                              return location !== loc;
                                            }
                                          );
                                        setLocationForEmployment(newLocations);
                                      }}
                                    >
                                      <RxCross2 />
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

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
                          ).mvalue || " nf ProjectBriefDescription"}
                        </label>
                        <textarea
                          className="form-control bg-body-tertiary"
                          id="exampleFormControlTextarea1"
                          name="briefDescriptions"
                          rows="2"
                          value={newProject.briefDescriptions}
                          onChange={(e) =>
                            setnewProject({
                              ...newProject,
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
                                item.elementLabel === "ValidateThisProject"
                            ) || {}
                          ).mvalue || " nf ValidateThisProject"}
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
                          ).mvalue || " nf WhoValidates"}{" "}
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
                          ).mvalue || "nf EmailID"}{" "}
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
                <div className="d-flex gap-2">
                  <SecondaryBtnLoader
                    label={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Save"
                        ) || {}
                      ).mvalue || "Save"
                    }
                    onClick={() => handleAddNewProject(false)}
                    backgroundColor="#F8F8E9"
                    color="var(--primary-color)"
                    loading={isAddingNewProject}
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
                    state={true}
                    onClick={() => handleAddNewProject(true)}
                    backgroundColor="var(--primary-color)"
                    color="#F8F8E9"
                    loading={isAddingNewProject}
                  />
                  {/* <button type="button" className="btn  font-5 me-2" style={{ backgroundColor: "#EFF5DC", color: "var(--primary-color)" }} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Save') || {}).mvalue || "nf Save"}</button>
                                    <button type="button" className="btn  me-2 font-5" style={{ backgroundColor: "var(--primary-color)" , color:"#EFF5DC" }}   data-bs-dismiss="modal" onClick={handleAddNewProject}>{(content[selectedLanguage]?.find(item => item.elementLabel === 'SaveAndClose') || {}).mvalue || "nf SaveAndClose"}</button> */}
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
              className="col-md-7  rounded bg-white  px-1 font-5 overflow-y-auto   "
              style={{ height: contentHeight }}
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
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "ProjectHistory"
                              ) || {}
                            ).mvalue || "nf Project History"}
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
                              <ProjectSummary
                                data={projectHistory}
                                yoeCalc={dateDynamicView}
                                editEnable={editEnable}
                              />
                            </div>
                            {/* table end */}
                          </div>
                        )}
                        {DetailTab1 && (
                          <div className="accordion-body  ">
                            {/* table start */}
                            <ProjectDetail
                              data={projectHistory}
                              yoeCalc={dateDynamicView}
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
                    ).mvalue || "not found"}
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

export default ProjectHistory;
