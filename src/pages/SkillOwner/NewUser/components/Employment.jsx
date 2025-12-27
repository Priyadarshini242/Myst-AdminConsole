import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import CreateSelectInstitution from "../../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { debouncedApiRequest } from "../../../../components/DebounceHelperFunction/debouncedApiRequest";
import organizationSearchSuggestions from "../../../../api/searchSuggestionAPIs/organizationSearchSuggestions";
import { ThreeDots } from "react-loader-spinner";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { useDispatch } from "react-redux";
import PostApi from "../../../../api/PostData/PostApi";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { addNewEmployment } from "../../../../reducer/detailedProfile/employmentSlice";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import TableLoaders from "../../../../components/CustomLoader/TableLoaders";
import { DayDifferenceToDynamicView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";

import CreatableSelect from "react-select/creatable";

import "../newUser.css";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import DeleteFormDetailedProfile from "../../../../components/DeleteFormDetailedProfile";
import { setDeleteDetailedProfileData } from "../../../../reducer/delete/deleteDetailedProfileSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import DialogButton from "../../../../components/Buttons/DialogButton";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const Employment = ({ setSelectedField }) => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const regionalData = useSelector((state) => state.regionalData);

  const employmentHistory = useSelector((state) => state.employmentHistory);
  const dispatch = useDispatch();
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
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [errors, setErrors] = useState({});
  const [onGoing, setOnGoing] = useState(false);

  //Api institution data
  const [orgApiData, setOrgApiData] = useState([]);
  const [insConvertedToSelect, setInsConvertedToSelect] = useState([]);
  const [insSearch, setInsSearch] = useState("");
  const [eduApiLoader, setEduApiLoader] = useState(false);

  const [isAddingEmploy, setIsAddingEmploy] = useState(false);
  const [isCustomOrganization, setIsCustomOrganization] = useState(false);

  /* HANDLE STATUS DATA CHILD TO PARENT */
  const handleOrgParentToChild = (val) => {
    setIsCustomOrganization(val);
  };

  useEffect(() => {
    document.title = "Detailed Profile";

    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSubmitDate = () => {
    const newErrors = {};
    if (!employee.organization) {
      newErrors.organization = "Organization Name is required";
    }
    if (!employee.fromDate) {
      newErrors.fromDate = "Employment Start Date is required";
    }
    if (!employee.toDate && !onGoing.instituteEndDate) {
      newErrors.toDate = "Employment End Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    let duplicate = checkDuplicate();
    console.log(duplicate);
    if (duplicate) {
      showErrorToast("Employment already exist within the date range");
      return;
    }

    if (isAddingEmploy) {
      return;
    }

    setIsAddingEmploy(true);

    PostApi("Employment History", {
      ...employee,
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

        showSuccessToast("New Employment Added Successful");

        setEmployee(initialEmployeeState);
        setOnGoing(false);
        setErrors({});
        dispatch(FetchOrganizationHistory());
        /* RESET THE CUSTOM ORG STATUS */
        // setIsCustomOrganization(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
      })
      .finally(() => {
        setIsAddingEmploy(false);
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

  useEffect(() => {
    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }
  }, []);

  useEffect(() => {
    const toBeSortedEmployment = [...employmentHistory?.data];
    const sortedEmp = toBeSortedEmployment?.sort((a, b) => {
      const toDateComparison = parseInt(a?.fromDate) - parseInt(b?.fromDate);
      console.log(parseInt(a?.fromDate));
      console.log(parseInt(b?.fromDate));
      console.log(toDateComparison);
      if (toDateComparison !== 0) {
        return toDateComparison;
      }
      // If toDate is the same, sort by fromDate
      return (
        parseInt(a?.toDate ? a.toDate : `${Date.now()}`) -
        parseInt(b?.toDate ? b.toDate : `${Date.now()}`)
      );
    });
    console.log(sortedEmp);
  }, [employmentHistory]);

  return (
    <div id="myTab1Content" class="tab-content ">
      {/* <DeleteFormDetailedProfile /> */}

      <div className="d-flex flex-column gap-3 justify-content-between align-items-center m-lg-5 m-md-5 m-2 mt-5">
        <p
          class="text-muted mb-4 text-center"
          style={{ letterSpacing: ".1rem" }}
          id="Employment"
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "BasicInfoEmp"
            ) || {}
          ).mvalue || "nf BasicInfoEmp"}
        </p>

        <div
          className="d-flex  gap-5 flex-lg-row   flex-column justify-content-center align-items-lg-start  align-items-center m-0 mb-4 w-100"
          style={{ position: "relative" }}
        >
          <div class="m-0  ">
            <label for="exampleFormControlInput1" class="form-label">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "OrganizationName"
                ) || {}
              ).mvalue || "nf OrganizationName"}
              <span className="text-danger"> *</span>
            </label>
            <CreateSelectInstitution
              setInsSearch={setInsSearch}
              insSearch={insSearch}
              insConvertedToSelect={insConvertedToSelect}
              formvalues={employee}
              setFormValues={setEmployee}
              showDropdown={false}
              formType={"Employment"}
              usedIn={"newUserInterface"}
              handleOrgParentToChild={handleOrgParentToChild}
              errors={errors}
              setErrors={setErrors}
            />
            {eduApiLoader && (
              <div
                style={{ transform: "translate(285px,-24px)", width: "50px" }}
              >
                <ThreeDots width={"30"} height={"10"} />
              </div>
            )}
            {/* {errors.organization && <div className="invalid-feedback d-flex mt-0">{errors.organization}</div>} */}
          </div>

          {/* <div className=" h-75 " style={{ width: '18rem' }} >
                        <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'EmploymentStartDate') || {}).mvalue || "nf EmploymentStartDate"}<span className='text-danger' >*</span></label>
                        <input type="date" style={{ height: "32px" }} max={timestampToYYYYMMDD(Date.now())} className={`form-control  h-75 buttom-line-input px-0 w-100 `} id="exampleFormControlInput1" onChange={(e) => setEmployee({ ...employee, fromDate: e.target.value })} value={employee.fromDate} />
                        {errors && <div className="invalid-feedback d-flex mt-0">{errors.fromDate}</div>}
                    </div>


                    <div className="  h-75   " style={{ width: '18rem' }} >
                        <div className="   ">
                            <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'EmploymentEndDate') || {}).mvalue || "nf EmploymentEndDate"}</label>
                            <input type="date" disabled={onGoing.instituteEndDate} style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} max={timestampToYYYYMMDD(Date.now())} className=" buttom-line-input form-control px-0 h-75 w-100 " id="exampleFormControlInput1" min={employee.fromDate} onChange={(e) => setEmployee({ ...employee, toDate: e.target.value })} value={employee.toDate} />
                        </div>
                        <div className={onGoing.instituteEndDate ? 'd-flex ms-1 align-items-center  font-6 text-secondary   ' : 'd-flex ms-1 align-items-center font-6 text-secondary '} >
                            <label htmlFor="exampleFormControlInput1" className="">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CurrentEmployment') || {}).mvalue || "nf CurrentEmployment"}</label>
                            <input className='ms-2' type="checkbox" name="instituteEndDate" checked={onGoing.instituteEndDate}
                                onChange={(e) => {
                                    setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                                    if (e.target.checked) {
                                        setEmployee({ ...employee, toDate: "" });
                                    }
                                }} />
                        </div>
                    </div> */}

          <div className=" h-75 " style={{ width: "18rem" }}>
            <label htmlFor="exampleFormControlInput1" className="form-label ">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "EmploymentStartDate"
                ) || {}
              ).mvalue || "nf EmploymentStartDate"}{" "}
              <span className="text-danger">*</span>
            </label>
            <DatePicker
              style={{ height: "32px" }}
              maxDate={timestampToYYYYMMDD(Date.now())}
              className={`form-control w-100 h-75 px-0 ${
                errors?.fromDate ? "blank-error" : "buttom-line-input"
              } `}
              id="exampleFormControlInput1"
              onChange={(e) => {
                setErrors({ ...errors, fromDate: false });
                setEmployee({
                  ...employee,
                  fromDate: e
                    ? timestampToYYYYMMDD(new Date(e).getTime())
                    : null,
                });
              }}
              toggleCalendarOnIconClick
              selected={employee.fromDate ? employee.fromDate : null}
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
            {/* {errors && <div className="invalid-feedback d-flex mt-0">{errors.fromDate}</div>} */}
          </div>

          <div className="  h-75   " style={{ width: "18rem" }}>
            <div className="   ">
              <label htmlFor="exampleFormControlInput1" className="form-label ">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "EmploymentEndDate"
                  ) || {}
                ).mvalue || "nf EmploymentEndDate"}{" "}
                <span className="text-danger">*</span>
              </label>
              <DatePicker
                // showIcon
                toggleCalendarOnIconClick
                selected={employee.toDate ? employee.toDate : null}
                onChange={(e) => {
                  setEmployee({
                    ...employee,
                    toDate: e
                      ? timestampToYYYYMMDD(new Date(e).getTime())
                      : null,
                  });
                  console.log("regional data : ", regionalData.selectedCountry);
                  console.log(
                    "regional data : ",
                    formatDateInputType(regionalData.selectedCountry.dateFormat)
                  );
                  setErrors({ ...errors, toDate: false });
                }}
                dateFormat={formatDateInputType(
                  regionalData.selectedCountry.dateFormat
                )}
                placeholderText={getCookie("dateFormat")}
                minDate={employee.fromDate}
                maxDate={timestampToYYYYMMDD(Date.now())}
                disabled={onGoing.instituteEndDate}
                className={`form-control w-100 h-75 px-0 ${
                  errors?.toDate ? "blank-error" : "buttom-line-input"
                } `}
                showYearDropdown
                scrollableYearDropdown
                // showMonthDropdown
                // scrollableMonthDropdown
                yearDropdownItemNumber={100}
              />
            </div>

            <div
              className={
                onGoing.instituteEndDate
                  ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                  : "d-flex ms-1 align-items-center font-6 text-secondary "
              }
            >
              <label htmlFor="exampleFormControlInput1" className="">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "CurrentEmployment"
                  ) || {}
                ).mvalue || "nf CurrentEmployment"}
              </label>
              <input
                className="ms-2"
                type="checkbox"
                name="instituteEndDate"
                checked={onGoing.instituteEndDate}
                onChange={(e) => {
                  setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                  if (e.target.checked) {
                    setEmployee({ ...employee, toDate: "" });
                    setErrors({ ...errors, toDate: false });
                  }
                }}
              />
            </div>
          </div>

          <div className="align-self-lg-end align-self-center mb-3">
            {/* <button className='btn p-1 px-2' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => handleSubmitDate()}>Add</button> */}
            <SecondaryBtnLoader
              onClick={() => handleSubmitDate(false)}
              label={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Add"
                  ) || {}
                ).mvalue || "nf Add"
              }
              backgroundColor="var(--primary-color)"
              color="white"
              loading={isAddingEmploy}
            />
          </div>
        </div>

        {/* <div
                    className="text-white p-2 px-2 rounded d-flex justify-content-between  fs-6 w-100"
                    style={{
                        cursor: "pointer",
                        backgroundColor:
                            (
                                content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "SecBarBgColor"
                                ) || {}
                            ).mvalue || "var(--primary-color)",
                    }}

                >
                    Your Employment
                </div> */}

        <div className="table-responsive w-100">
          <table className="table table-sm  table-fixed table-hover    ">
            <thead>
              <tr className="border-dark-subtle ">
                <th scope="col" className="bg-body- " style={{ width: "40%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectOrganization"
                    ) || {}
                  ).mvalue || "nf ProjectOrganization"}
                </th>

                <th scope="col" className="bg-body- " style={{ width: "22%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "EmploymentStartDate"
                    ) || {}
                  ).mvalue || "nf EmploymentStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- " style={{ width: "22%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "EmploymentEndDate"
                    ) || {}
                  ).mvalue || "nf EmploymentEndDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf ProjectDuration"}{" "}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="">
              {employmentHistory.status === "loading" ? (
                <TableLoaders Rows={2} Cols={5} btnCols={3} />
              ) : (
                employmentHistory.status === "success" &&
                employmentHistory.data.length > 0 &&
                [...employmentHistory?.data]
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
                        {certs.organization
                          ? certs.organization.length > 60
                            ? certs.organization.substring(0, 50) + "..."
                            : certs.organization
                          : ""}
                      </td>

                      <td>
                        {formatTimestampToDate(
                          Number(certs.fromDate),
                          regionalData.selectedCountry.dateFormat
                        )}
                      </td>
                      <td>
                        {" "}
                        {certs.toDate
                          ? formatTimestampToDate(
                              Number(certs.toDate),
                              regionalData.selectedCountry.dateFormat
                            )
                          : "On-going"}
                      </td>
                      <td>{DayDifferenceToDynamicView(certs.duration)}</td>
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
            </tbody>
          </table>
        </div>

        <div
          className="d-flex w-100 gap-2   p-4 pt-2  justify-content-between bg-white"
          style={{ position: "fixed", bottom: "10px" }}
        >
          {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => setSelectedField('profileInfo')} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Back') || {}).mvalue || "nf Back"}</button>
                    <button className='btn' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => setSelectedField('Project/Work/Occupation')}>{(content[selectedLanguage]?.find(item => item.elementLabel === 'Next') || {}).mvalue || "nf Next"}</button> */}
          <DialogButton onClick={() => setSelectedField("profileInfo")} />
          <DialogButton
            Active={true}
            onClick={() => setSelectedField("Project/Work/Occupation")}
          />
        </div>
      </div>
    </div>
  );
};

export default Employment;
