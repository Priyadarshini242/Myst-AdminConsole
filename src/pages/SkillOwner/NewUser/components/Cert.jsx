import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchCertificationHistory } from "../../../../api/fetchAllData/fetchCertificationHistory";
import PostApi from "../../../../api/PostData/PostApi";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { addNewCertification } from "../../../../reducer/detailedProfile/certificationSlice";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import educationInstitutionApi from "../../../../api/searchSuggestionAPIs/educationInstitutionApi";
import { debouncedApiRequest } from "../../../../components/DebounceHelperFunction/debouncedApiRequest";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import CreateSelectInstitution from "../../../../components/SkillOwner/SelectComponent/CreateSelectInstitution";
import { ThreeDots } from "react-loader-spinner";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const Cert = () => {
  const regionalData = useSelector((state) => state.regionalData);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  console.log(certificationHistory);
  const dispatch = useDispatch();

  const [onGoing, setOnGoing] = useState(false);
  const [errors, setErrors] = useState(null);

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

  useEffect(() => {
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }
  }, []);

  const handleCreateCertification = () => {
    const newErrors = {};
    if (!certificationDetails.certificationName) {
      newErrors.certificationName = "Certification name is required";
    }
    if (!certificationDetails.organization) {
      newErrors.organization = "Organization is required";
    }
    if (!certificationDetails.fromDate) {
      newErrors.fromDate = "Start Date is required";
    }
    if (!certificationDetails.toDate && !onGoing.instituteEndDate) {
      newErrors.toDate = "End Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    if (isAdddingCert) {
      return;
    }

    // let duplicate = checkDuplicate()
    // console.log(duplicate);
    // if (duplicate) {
    //     showErrorToast('Certification already exist in within the date range')
    //     return
    // }

    setIsAddingCert(true);

    PostApi("Certification History", {
      ...certificationDetails,
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

        showSuccessToast("New Certification Added Successful");

        setCertificationDetails(innistalState);

        setOnGoing(false);

        setIsCustomInstitutionCert(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
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

  return (
    <>
      <div class="mb-2" style={{ flex: "1 1 15rem" }}>
        <label for="exampleFormControlInput1" class="form-label">
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Name"
            ) || {}
          ).mvalue || "nf Name"}
          <span className="text-danger"> *</span>
        </label>
        <input
          type="text"
          name="certificationName"
          class={`form-control  px-0 ${
            errors?.certificationName ? "blank-error" : "buttom-line-input"
          } `}
          id=""
          placeholder="Enter Certificate Name"
          value={certificationDetails.certificationName}
          onChange={(e) => {
            setCertificationDetails({
              ...certificationDetails,
              [e.target.name]: e.target.value,
            });
            setErrors({ ...errors, certificationName: false });
          }}
        />
      </div>

      <div class="mb-2  " style={{ flex: "1 1 15rem" }}>
        <label for="exampleFormControlInput1" class="form-label">
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "InstituteCollegeUniversity"
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
          handleInsCertParentToChild={handleInsCertParentToChild}
          usedIn={"newUserInterface"}
          errors={errors}
          setErrors={setErrors}
        />
        {eduApiLoader && (
          <div style={{ transform: "translate(285px,-24px)", width: "50px" }}>
            <ThreeDots width={"30"} height={"10"} />
          </div>
        )}
      </div>

      {/*   <div className='d-flex flex-sm-row flex-column justify-content-center gap-3 align-items-start   ' style={{ flex: '1 1 25rem' }} >
                <div className="  w-100  " >
                    <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteStartDate') || {}).mvalue || "nf InstituteStartDate"}<span className='text-danger' >*</span></label>
                    <input type="date" style={{ height: "32px" }} value={certificationDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} name='fromDate' className=" px-0 buttom-line-input form-control  h-75 " id="exampleFormControlInput1" onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                </div>

                <div className=' w-100   '>

                    <div className="  ">
                        <label htmlFor="exampleFormControlInput1" className="form-label bg-body-tertiary">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteEndDate') || {}).mvalue || "nf InstituteEndDate"}</label>
                        <input type="date" style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} value={certificationDetails.toDate} name='toDate' className=" px-0 buttom-line-input form-control  h-75 " min={certificationDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} id="exampleFormControlInput1" onChange={(e) => setCertificationDetails({ ...certificationDetails, [e.target.name]: e.target.value })} />
                    </div>


                    <div className={onGoing.instituteEndDate ? 'd-flex ms-1 align-items-center  font-6 text-secondary   ' : 'd-flex ms-1 align-items-center font-6 text-secondary '} >
                        <label htmlFor="exampleFormControlInput1" className="">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CurrentCertification') || {}).mvalue || "nf CurrentCertification"}</label>
                        <input className='ms-2' type="checkbox" name="instituteEndDate" checked={onGoing?.instituteEndDate}
                            onChange={(e) => {
                                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                                if (e.target.checked) {
                                    setCertificationDetails({ ...certificationDetails, toDate: "" });
                                }
                            }} />
                    </div>
                </div>
            </div> */}

      <div
        className="d-flex flex-sm-row flex-column justify-content-center gap-3 align-items-start   "
        style={{ flex: "1 1 25rem" }}
      >
        <div className="  w-100  ">
          <label htmlFor="exampleFormControlInput1" className="form-label ">
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "InstituteStartDate"
              ) || {}
            ).mvalue || "nf InstituteStartDate"}
            <span className="text-danger">*</span>
          </label>

          <DatePicker
            style={{ height: "32px" }}
            maxDate={timestampToYYYYMMDD(Date.now())}
            className={`form-control  h-75 px-0 ${
              errors?.fromDate ? "blank-error" : "buttom-line-input"
            } `}
            id="exampleFormControlInput1"
            onChange={(e) => {
              setCertificationDetails({
                ...certificationDetails,
                fromDate: e ? timestampToYYYYMMDD(new Date(e).getTime()) : null,
              });
              setErrors({ ...errors, fromDate: false });
            }}
            toggleCalendarOnIconClick
            selected={certificationDetails.fromDate}
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

        <div className=" w-100   ">
          <div className="  ">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-label bg-body-tertiary"
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
              selected={certificationDetails.toDate}
              maxDate={timestampToYYYYMMDD(Date.now())}
              minDate={certificationDetails.fromDate}
              className={
                onGoing.instituteEndDate
                  ? ` ${
                      errors?.toDate ? "blank-error" : "buttom-line-input"
                    } form-control bg-body-tertiary h-75 text-secondary  px-0`
                  : `form-control ${
                      errors?.toDate ? "blank-error" : "buttom-line-input"
                    }  h-75 px-0 `
              }
              id="exampleFormControlInput1"
              onChange={(e) => {
                setCertificationDetails({
                  ...certificationDetails,
                  toDate: e ? timestampToYYYYMMDD(new Date(e).getTime()) : null,
                });
                setErrors({ ...errors, toDate: false });
              }}
              disabled={onGoing.instituteEndDate}
              toggleCalendarOnIconClick
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
                ? "d-flex ms-1 align-items-center  font-6 text-secondary   "
                : "d-flex ms-1 align-items-center font-6 text-secondary "
            }
          >
            <label htmlFor="exampleFormControlInput1" className="">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "CurrentCertification"
                ) || {}
              ).mvalue || "nf CurrentCertification"}
            </label>
            <input
              className="ms-2"
              type="checkbox"
              name="instituteEndDate"
              checked={onGoing?.instituteEndDate}
              onChange={(e) => {
                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                if (e.target.checked) {
                  setCertificationDetails({
                    ...certificationDetails,
                    toDate: "",
                  });
                  setErrors({ ...errors, toDate: false });
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
        {/* <button className='btn p-1 px-2' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Add</button> */}
        <SecondaryBtnLoader
          onClick={() => handleCreateCertification()}
          label={
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Add"
              ) || {}
            ).mvalue || "nf Add"
          }
          backgroundColor="var(--primary-color)"
          color="white"
          loading={isAdddingCert}
        />
      </div>
    </>
  );
};

export default Cert;
