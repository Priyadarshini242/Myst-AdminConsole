import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import CreateSelect from "../../../../components/SkillOwner/SelectComponent/CreateSelect";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { addNewProject } from "../../../../reducer/detailedProfile/projectSlice";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import PostApi from "../../../../api/PostData/PostApi";
import TableLoaders from "../../../../components/CustomLoader/TableLoaders";
import { DayDifferenceToDynamicView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { useDispatch } from "react-redux";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import { FetchProjectHistory } from "../../../../api/fetchAllData/FetchProjectHistory";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { setDeleteDetailedProfileData } from "../../../../reducer/delete/deleteDetailedProfileSlice";
import DeleteFormDetailedProfile from "../../../../components/DeleteFormDetailedProfile";
import { BiSolidInfoCircle } from "react-icons/bi";
import { wrap } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import DialogButton from "../../../../components/Buttons/DialogButton";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const ProjectFormForNewUser = ({ setSelectedField }) => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const projectHistory = useSelector((state) => state.projectHistory);
  const regionalData = useSelector((state) => state.regionalData);

  const dispatch = useDispatch();

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

  const [onGoing, setOnGoing] = useState(false);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);

  const [sameAsEmp, setSameAsEmp] = useState(false);

  const [errors, setErrors] = useState({});

  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );
  const filterEmployment = employmentHistory
    .filter((employment) => employment.mlanguage === selectedLanguage)
    .map((employment) => ({
      value: employment,
      label: employment.organization,
    }));

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

  const handleAddNewProject = () => {
    console.log(newProject);

    const newErrors = {};
    if (!newProject.projectActivity) {
      newErrors.projectActivity = "Work Detail is required";
    }
    if (newProject.organization === "") {
      newErrors.organization = "Company Name is required";
    }
    if (!newProject.fromDate) {
      newErrors.fromDate = "Work Detail Start Date is required";
    }
    if (!newProject.toDate && !onGoing.certificationEndDate) {
      newErrors.toDate = "Work Detail End Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    console.log(newProject);

    if (
      !companySelectValue ||
      !newProject.projectActivity ||
      newProject.fromDate === "NaN/NaN/NaN"
    ) {
      showErrorToast("Please fill all required fields");
      return;
    }

    if (isAddingNewProject) {
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast("Project already exist in within the date range");
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
      organization: newProject.organization ? newProject.organization : "",
      mtype: newProject.organization ? "Employment" : "Own",
      fromDate: FormatDateIntoPost(newProject.fromDate),
      toDate: newProject.toDate ? FormatDateIntoPost(newProject.toDate) : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(newProject.fromDate),
        newProject.toDate
          ? convertDateToMilliseconds(newProject.toDate)
          : Date.now()
      ),
      // location: newProject.mtype === "Own" ? location : locationForEmployment?.join(),
      ticketids: ticketIdsArray,
    };

    PostApi("Project  History", formatdata)
      .then((res) => {
        const data = res.data;

        data.fromDate = convertDateToMilliseconds(data.fromDate);
        data.toDate = data.toDate
          ? convertDateToMilliseconds(res.data.toDate)
          : "";
        dispatch(addNewProject(data));
        showSuccessToast("Added new Project");
        setnewProject(initialProjectState);
        setCompanySelectValue(null);
        setOnGoing(false);
        setSameAsEmp(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
      })
      .finally(() => {
        setIsAddingNewProject(false);
      });
  };

  useEffect(() => {
    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }
    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }
  }, []);

  useEffect(() => {
    if (companySelectValue && companySelectValue?.value !== "NA") {
      console.log("triggred");
      setSameAsEmp(true);
    } else {
      setSameAsEmp(false);

      setOnGoing({ ...onGoing, certificationEndDate: false });
    }
  }, [companySelectValue]);

  useEffect(() => {
    console.log(companySelectValue);
    if (companySelectValue?.value !== "NA") {
      if (companySelectValue && companySelectValue?.value?.toDate) {
        console.log("triggred false");
        setOnGoing(false);
      } else if (companySelectValue && !companySelectValue?.value?.toDate) {
        setnewProject({ ...newProject, toDate: "" });
        console.log("triggred true");
        setOnGoing({ ...onGoing, certificationEndDate: true });
      }
    }
  }, [companySelectValue]);

  console.log(newProject);

  return (
    <div id="myTab1Content" class="tab-content ">
      {/* <DeleteFormDetailedProfile /> */}

      <div className="d-flex flex-column gap-3 justify-content-center align-items-center m-lg-5 m-md-5 m-2 mt-5">
        <p
          class="text-muted mb-4 text-center"
          style={{ letterSpacing: ".1rem" }}
          id="Employment"
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "BasicInfoPro"
            ) || {}
          ).mvalue || "nf BasicInfoPro"}
        </p>

        <div
          className="d-flex   gap-5 w-100 align-items-start justify-content-center  mb-4"
          style={{ position: "relative", flexWrap: "wrap" }}
        >
          <div class="my-2  w-25  " style={{ flex: "1 1 15rem" }}>
            <label for="exampleFormControlInput1" class="form-label">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "NameOfCompany"
                ) || {}
              ).mvalue || "nf NameOfCompany"}
              <span className="text-danger"> *</span>
            </label>
            <CreateSelect
              newField="orgIsnew"
              placeholder={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "EnterYourCompanyName"
                  ) || {}
                ).mvalue || "nf EnterYourCompanyName"
              }
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
              usedIn={"newUserForm"}
              errors={errors}
              setErrors={setErrors}
            />
          </div>

          <div class=" my-2" style={{ flex: "1 1 15rem" }}>
            <label
              for="exampleFormControlInput1"
              class="form-label d-flex gap-2 mb-1  align-items-center"
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ProjectName"
                ) || {}
              ).mvalue || "nf ProjectName"}
              <span className="text-danger"> *</span>{" "}
              <span
                className="ms-0 mb-1"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDescription"
                    ) || {}
                  ).mvalue || "nf ProjectDescription"
                }
              >
                <BiSolidInfoCircle
                  className="text-muted"
                  style={{ fontSize: "20px" }}
                />
              </span>
            </label>
            <input
              type="text"
              style={{ height: "32px" }}
              placeholder={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "EnterYourProjectName"
                  ) || {}
                ).mvalue || "nf EnterYourProjectName"
              }
              class={`form-control  h-75 px-0 ${
                errors?.projectActivity ? "blank-error" : "buttom-line-input"
              } `}
              id=""
              name="projectActivity"
              value={newProject.projectActivity}
              onChange={(e) => {
                setnewProject({
                  ...newProject,
                  [e.target.name]: e.target.value,
                });
                setErrors({ ...errors, projectActivity: false });
              }}
            />
          </div>

          <div
            className="d-flex flex-md-column flex-row  justify-content-start align-items-md-center align-items-start text-center gap-2 my-2"
            style={{ flex: "1 1 10rem" }}
          >
            <label
              htmlFor="exampleFormControlInput1"
              className=""
              style={{
                opacity:
                  companySelectValue && companySelectValue?.value !== "NA"
                    ? "1"
                    : ".5",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "DateSameAs"
                ) || {}
              ).mvalue || "nf Date Same as"}{" "}
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Employment"
                ) || {}
              ).mvalue || "nf Employment"}
            </label>
            <input
              type="checkbox"
              checked={sameAsEmp}
              disabled={
                companySelectValue && companySelectValue?.value !== "NA"
                  ? false
                  : true
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setnewProject({
                    ...newProject,
                    fromDate: timestampToYYYYMMDD(
                      Number(companySelectValue?.value.fromDate)
                    ),
                    toDate: companySelectValue?.value.toDate
                      ? timestampToYYYYMMDD(
                          Number(companySelectValue?.value.toDate)
                        )
                      : "",
                  });
                  if (!companySelectValue?.value.toDate) {
                    setOnGoing({ ...onGoing, certificationEndDate: true });
                  }
                } else {
                  // setnewProject({ ...newProject, fromDate: '', toDate: '' })
                }
                setSameAsEmp(!sameAsEmp);
              }}
            />
          </div>

          {/* <div className='d-flex my-2 flex-column flex-sm-row  gap-5   ' style={{ width: '30%', pointerEvents: sameAsEmp ? 'none' : 'auto', opacity: sameAsEmp ? '.5' : '' ,flex: '1 1 25rem'}}  >
                            <div className=" h-75 w-100  " >
                                <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'ProjectStartDate') || {}).mvalue || "nf ProjectStartDate"}<span className='text-danger' >*</span></label>
                                <input disabled={sameAsEmp} type="date" style={{ height: "32px" }} className="form-control px-0 h-75  buttom-line-input  " id="exampleFormControlInput1" name='fromDate' min={timestampToYYYYMMDD(Number(companySelectValue?.value?.fromDate))}
                                    max={timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate))} value={newProject.fromDate} onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} />
                            </div>

                            <div className="  h-75 w-100  ">
                                <div className=" ">
                                    <label htmlFor="exampleFormControlInput1" className="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'ProjectEndDate') || {}).mvalue || "nf ProjectEndDate"}</label>
                                    <input type="date" disabled={onGoing.certificationEndDate || sameAsEmp} style={{ height: "32px", opacity: onGoing.certificationEndDate ? .5 : 1 }} className="  buttom-line-input px-0 form-control  h-75 " id="exampleFormControlInput1" min={newProject.fromDate}
                                        max={(companySelectValue?.value?.toDate) ? timestampToYYYYMMDD(Number(companySelectValue?.value?.toDate)) : timestampToYYYYMMDD(Date.now())} value={newProject.toDate} name='toDate' onChange={(e) => setnewProject({ ...newProject, [e.target.name]: e.target.value })} />
                                </div>

                                {onGoing &&
                                    <div className={onGoing.certificationEndDate ? 'd-flex ms-1 align-items-center  font-6 text-secondary   ' : 'd-flex ms-1  align-items-center font-6 text-secondary '} >
                                        <label htmlFor="exampleFormControlInput1" className="">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CurrentProject') || {}).mvalue || "nf CurrentProject"}</label>
                                        <input className='ms-2 ' type="checkbox" name="certificationEndDate" checked={onGoing.certificationEndDate}
                                            onChange={(e) => {
                                                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                                                if (e.target.checked) {
                                                    setnewProject({ ...newProject, toDate: '' });
                                                }
                                            }} />
                                    </div>
                                }
                            </div>

                        </div> */}

          <div
            className="d-flex my-2 flex-column flex-sm-row  gap-5   "
            style={{
              width: "30%",
              pointerEvents: sameAsEmp ? "none" : "auto",
              opacity: sameAsEmp ? ".5" : "",
              flex: "1 1 25rem",
            }}
          >
            <div className=" h-75 w-100  ">
              <label htmlFor="exampleFormControlInput1" className="form-label ">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "ProjectStartDate"
                  ) || {}
                ).mvalue || "nf ProjectStartDate"}
                <span className="text-danger">*</span>
              </label>

              <DatePicker
                style={{ height: "32px" }}
                maxDate={
                  companySelectValue?.value?.toDate
                    ? timestampToYYYYMMDD(
                        Number(companySelectValue?.value?.toDate)
                      )
                    : timestampToYYYYMMDD(Number(Date.now()))
                }
                minDate={
                  companySelectValue?.value?.fromDate
                    ? timestampToYYYYMMDD(
                        Number(companySelectValue?.value?.fromDate)
                      )
                    : ""
                }
                className={`form-control  h-75 px-0 ${
                  errors?.fromDate ? "blank-error" : "buttom-line-input"
                } `}
                id="exampleFormControlInput1"
                name="fromDate"
                selected={newProject?.fromDate}
                onChange={(e) => {
                  setnewProject({
                    ...newProject,
                    fromDate: e
                      ? timestampToYYYYMMDD(new Date(e).getTime())
                      : null,
                  });
                  setErrors({ ...errors, fromDate: false });
                }}
                toggleCalendarOnIconClick
                dateFormat={formatDateInputType(
                  regionalData.selectedCountry.dateFormat
                )}
                placeholderText={getCookie("dateFormat")}
                onBlur={() => {}}
                showYearDropdown
                scrollableYearDropdown
                // showMonthDropdown
                // scrollableMonthDropdown
                yearDropdownItemNumber={100}
              />
            </div>

            <div className="  h-75 w-100  ">
              <div className=" ">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectEndDate"
                    ) || {}
                  ).mvalue || "nf ProjectEndDate"}
                  <span className="text-danger">*</span>
                </label>
                <DatePicker
                  // showIcon
                  toggleCalendarOnIconClick
                  selected={newProject?.toDate}
                  onChange={(e) => {
                    setnewProject({
                      ...newProject,
                      toDate: e
                        ? timestampToYYYYMMDD(new Date(e).getTime())
                        : null,
                    });
                    setErrors({ ...errors, toDate: false });
                  }}
                  dateFormat={formatDateInputType(
                    regionalData.selectedCountry.dateFormat
                  )}
                  placeholderText={getCookie("dateFormat")}
                  minDate={newProject.fromDate}
                  maxDate={
                    companySelectValue?.value?.toDate
                      ? timestampToYYYYMMDD(
                          Number(companySelectValue?.value?.toDate)
                        )
                      : timestampToYYYYMMDD(Date.now())
                  }
                  disabled={onGoing.certificationEndDate || sameAsEmp}
                  className={`form-control  h-75 px-0 ${
                    errors?.toDate ? "blank-error" : "buttom-line-input"
                  } `}
                  id="exampleFormControlInput1"
                  showYearDropdown
                  scrollableYearDropdown
                  // showMonthDropdown
                  // scrollableMonthDropdown
                  yearDropdownItemNumber={100}
                />
              </div>

              {onGoing && (
                <div
                  className={
                    onGoing.certificationEndDate
                      ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                      : "d-flex ms-1  align-items-center font-6 text-secondary "
                  }
                >
                  <label htmlFor="exampleFormControlInput1" className="">
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "CurrentProject"
                      ) || {}
                    ).mvalue || "nf CurrentProject"}
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
                        setnewProject({ ...newProject, toDate: "" });
                        setErrors({ ...errors, toDate: false });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="align-self-center mb-3">
            {/* <button className='btn p-1 px-2' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} >Add</button> */}
            <SecondaryBtnLoader
              onClick={() => handleAddNewProject()}
              label={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Add"
                  ) || {}
                ).mvalue || "nf Add"
              }
              backgroundColor="var(--primary-color)"
              color="white"
              loading={isAddingNewProject}
            />
          </div>
        </div>

        <div className="table-responsive w-100">
          <table className="table table-sm  table-fixed table-hover    ">
            <thead>
              <tr className="border-dark-subtle ">
                <th scope="col" className="bg-body- " style={{ width: "30%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectName"
                    ) || {}
                  ).mvalue || "nf ProjectName"}
                  <span
                    className="ms-1 mb-1"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "ProjectDescription"
                        ) || {}
                      ).mvalue || "nf ProjectDescription"
                    }
                  >
                    <BiSolidInfoCircle
                      className="text-muted"
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                </th>
                <th scope="col" className="bg-body- " style={{ width: "30%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectOrganization"
                    ) || {}
                  ).mvalue || "nf ProjectOrganization"}
                </th>

                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectStartDate"
                    ) || {}
                  ).mvalue || "nf ProjectStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectEndDate"
                    ) || {}
                  ).mvalue || "nf ProjectEndDate"}{" "}
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody className="">
              {projectHistory.status === "loading" ? (
                <TableLoaders Rows={2} Cols={5} btnCols={3} />
              ) : (
                projectHistory.status === "success" &&
                projectHistory.data.length > 0 &&
                [...projectHistory.data]
                  .sort((a, b) => {
                    const toDateComparison =
                      parseInt(a?.fromDate) - parseInt(b?.fromDate);
                    if (toDateComparison !== 0) {
                      return toDateComparison;
                    }
                    // If toDate is the same, sort by fromDate
                    return (
                      parseInt(a?.toDate ? a.toDate : `${Date.now()}`) -
                      parseInt(b?.toDate ? b.toDate : `${Date.now()}`)
                    );
                  })
                  .map((certs) => (
                    <tr className="">
                      <td>
                        {certs.projectActivity
                          ? certs.projectActivity.length > 50
                            ? certs.projectActivity.substring(0, 50) + "..."
                            : certs.projectActivity
                          : ""}
                      </td>
                      <td>
                        {certs.organization
                          ? certs.organization.length > 50
                            ? certs.organization.substring(0, 50) + "..."
                            : certs.organization
                          : (
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "NA"
                              ) || {}
                            ).mvalue || "nf NA"}
                      </td>

                      <td>
                        {formatTimestampToDate(
                          Number(certs.fromDate),
                          regionalData.selectedCountry.dateFormat
                        )}
                      </td>
                      {/* <td>{formatTimestampToDate(Number(certs.toDate))}</td> */}
                      <td>
                        {" "}
                        {certs.toDate
                          ? formatTimestampToDate(
                              Number(certs.toDate),
                              regionalData.selectedCountry.dateFormat
                            )
                          : "On-going"}
                      </td>
                      {/* <td>
                                                {DayDifferenceToDynamicView(
                                                    certs.duration
                                                )}
                                            </td> */}
                      <td className="">
                        {/* <MdEdit className='me-4' style={{ color: 'var(--primary-color)' }} /> */}
                        {/* <MdDelete style={{ color: 'var(--primary-color)' }} /> */}
                        <button
                          style={{ color: "var(--primary-color)" }}
                          className="border-0 bg-transparent"
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Delete"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteformdetailedprofile"
                          onClick={() => {
                            dispatch(setDeleteDetailedProfileData(certs));
                          }}
                        >
                          {" "}
                          <MdDelete />{" "}
                        </button>
                      </td>
                    </tr>
                  ))
              )}

              {/* <tr className="" >
                                <td>Google</td>
                                <td>Google Files</td>

                                <td>22/12/2022</td>
                                <td>22/12/2023</td>
                                <td>
                                    3Y 2M
                                </td>
                                <td>
                                    <MdDelete style={{ color: 'var(--primary-color)' }} />
                                </td>
                            </tr> */}
            </tbody>
          </table>
        </div>

        <div
          className="d-flex w-100 gap-2   p-4 pt-2  justify-content-between bg-white"
          style={{ position: "fixed", bottom: "10px" }}
        >
          {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => setSelectedField('Employment')} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Back') || {}).mvalue || "nf Back"}</button>
                    <button className='btn' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => setSelectedField('Education')}>{(content[selectedLanguage]?.find(item => item.elementLabel === 'Next') || {}).mvalue || "nf Next"}</button> */}

          <DialogButton onClick={() => setSelectedField("Employment")} />
          <DialogButton
            Active={true}
            onClick={() => setSelectedField("Education")}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectFormForNewUser;
