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
import { fetchTrainingHistory } from "../../../../api/fetchAllData/fetchTrainingHistory";
import { addNewTraining } from "../../../../reducer/detailedProfile/trainingSlice";
import { fetchSkillingHistory } from "../../../../api/fetchAllData/fetchSkillingHistory";
import { addNewSkilling } from "../../../../reducer/detailedProfile/skillingsSlice";
import { fetchConferencesHistory } from "../../../../api/fetchAllData/fetchConferenceHistory";
import { addNewConference } from "../../../../reducer/detailedProfile/conferenceSlice";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const Conf = () => {
  const dispatch = useDispatch();

  const [onGoing, setOnGoing] = useState(false);
  const [errors, setErrors] = useState(null);

  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const regionalData = useSelector((state) => state.regionalData);
  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const [switchTab, setSwitchTab] = useState("");

  const innistalState = {
    mtype: "Conferences",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    location: "",
    showHide: "",
    validation: "No",
    blockChain: "",
    mlanguage: getCookie("HLang"),
    organization: "",
    userId:getCookie("userId"),
    title: "",
  };

  const [skillingDetails, setSkillingDetails] = useState(innistalState);

  const [isAdddingSkill, setIsAddingSkill] = useState(false);

  const [isCustomInstitutionConf, setIsCustomInstitutionConf] = useState(false);

  const handleInsTConfParentToChild = (val) => {
    setIsCustomInstitutionConf(val);
  };

  useEffect(() => {
    if (conferenceHistory?.status === "idle") {
      dispatch(fetchConferencesHistory());
    }
  }, []);

  const handleSkillingAdd = (close) => {
    console.log(skillingDetails);

    const newErrors = {};
    if (!skillingDetails.title) {
      newErrors.title = "Training name is required";
    }
    if (!skillingDetails.organization) {
      newErrors.organization = "Organization is required";
    }
    if (!skillingDetails.fromDate) {
      newErrors.fromDate = "Start Date is required";
    }
    if (!skillingDetails.toDate && !onGoing.instituteEndDate) {
      newErrors.toDate = "End Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    if (isAdddingSkill) {
      return;
    }

    // let duplicate = checkDuplicate()
    // console.log(duplicate);
    // if (duplicate) {
    //     showErrorToast('Conference already exist in within the date range')
    //     return
    // }

    setIsAddingSkill(true);

    PostApi("Conferences", {
      ...skillingDetails,
      startDate: FormatDateIntoPost(skillingDetails.fromDate),
      source: skillingDetails.organization,
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
          addNewConference({
            ...res.data,
            startDate: convertDateToMilliseconds(res.data.startDate),
            endDate: res.data.endDate
              ? convertDateToMilliseconds(res.data.endDate)
              : "",
          })
        );

        /* IF NEW INSTITUTION NAME ENTERED */
        const data = res?.data;
        if (isCustomInstitutionConf) {
          handleInsertNewOrganization(
            data?.organization,
            data?.mlanguage,
            data?.applicationName,
            data?.organization,
            data?.id
          );
        }

        showSuccessToast("New Training Added Successful");

        setSkillingDetails(innistalState);

        setOnGoing(false);

        setIsCustomInstitutionConf(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
      })
      .finally(() => {
        setIsAddingSkill(false);
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
          style={{ height: "32px" }}
          name="title"
          class={`form-control px-0 ${
            errors?.title ? "blank-error" : "buttom-line-input"
          } `}
          id=""
          placeholder="Enter conference name"
          value={skillingDetails.title}
          onChange={(e) => {
            setErrors({ ...errors, title: false });
            setSkillingDetails({
              ...skillingDetails,
              [e.target.name]: e.target.value,
            });
          }}
        />
      </div>

      <div class="mb-2" style={{ flex: "1 1 15rem" }}>
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
          formvalues={skillingDetails}
          setFormValues={setSkillingDetails}
          showDropdown={false}
          formType={"Conference"}
          handleInsTConfParentToChild={handleInsTConfParentToChild}
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
                <div className=" h-75 w-100" >
                    <label htmlFor="exampleFormControlInput1" className="form-label ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteStartDate') || {}).mvalue || "nf InstituteStartDate"}<span className='text-danger' >*</span></label>
                    <input type="date" style={{ height: "32px" }} value={skillingDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} name='fromDate' className="px-0 buttom-line-input form-control  h-75 " id="exampleFormControlInput1" onChange={(e) => setSkillingDetails({ ...skillingDetails, [e.target.name]: e.target.value })} />
                </div>
                <div className=" ms-2 h-75 w-100  ">

                    <div>
                        <label htmlFor="exampleFormControlInput1" className="form-label bg-body-tertiary">{(content[selectedLanguage]?.find(item => item.elementLabel === 'InstituteEndDate') || {}).mvalue || "nf InstituteEndDate"}</label>
                        <input type="date" style={{ height: "32px", opacity: onGoing.instituteEndDate ? .5 : 1 }} value={skillingDetails.toDate} name='toDate' className="px-0 buttom-line-input form-control  h-75 " min={skillingDetails.fromDate} max={timestampToYYYYMMDD(Date.now())} id="exampleFormControlInput1" onChange={(e) => setSkillingDetails({ ...skillingDetails, [e.target.name]: e.target.value })} />
                    </div>


                    <div className={onGoing.instituteEndDate ? 'd-flex ms-1 align-items-center  font-6 text-secondary   ' : 'd-flex ms-1 align-items-center font-6 text-secondary '} >
                        <label htmlFor="exampleFormControlInput1" className="">{(content[selectedLanguage]?.find(item => item.elementLabel === 'CurrentConference') || {}).mvalue || "nf CurrentConference"}</label>
                        <input className='ms-2' type="checkbox" name="instituteEndDate" checked={onGoing?.instituteEndDate}
                            onChange={(e) => {
                                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                                if (e.target.checked) {
                                    setSkillingDetails({ ...skillingDetails, toDate: "" });
                                }
                            }} />
                    </div>

                </div>
            </div> */}

      <div
        className="d-flex flex-sm-row flex-column justify-content-center gap-3 align-items-start   "
        style={{ flex: "1 1 25rem" }}
      >
        <div className=" h-75 w-100">
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
              setErrors({ ...errors, fromDate: false });
              setSkillingDetails({
                ...skillingDetails,
                fromDate: e ? timestampToYYYYMMDD(new Date(e).getTime()) : null,
              });
            }}
            toggleCalendarOnIconClick
            selected={skillingDetails.fromDate}
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
        <div className=" ms-2 h-75 w-100  ">
          <div>
            <label
              htmlFor="exampleFormControlInput1"
              className="form-label bg-body-tertiary"
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "InstituteEndDate"
                ) || {}
              ).mvalue || "nf InstituteEndDate"}{" "}
              <span className="text-danger">*</span>
            </label>

            <DatePicker
              style={{ height: "32px" }}
              selected={skillingDetails.toDate}
              maxDate={timestampToYYYYMMDD(Date.now())}
              minDate={skillingDetails.fromDate}
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
                setErrors({ ...errors, toDate: false });
                setSkillingDetails({
                  ...skillingDetails,
                  toDate: e ? timestampToYYYYMMDD(new Date(e).getTime()) : null,
                });
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
                  (item) => item.elementLabel === "CurrentConference"
                ) || {}
              ).mvalue || "nf CurrentConference"}
            </label>
            <input
              className="ms-2"
              type="checkbox"
              name="instituteEndDate"
              checked={onGoing?.instituteEndDate}
              onChange={(e) => {
                setOnGoing({ ...onGoing, [e.target.name]: e.target.checked });
                if (e.target.checked) {
                  setSkillingDetails({ ...skillingDetails, toDate: "" });
                  setErrors({ ...errors, toDate: false });
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="align-self-center mb-3" style={{ flex: "1 1 5rem" }}>
        <SecondaryBtnLoader
          onClick={() => handleSkillingAdd()}
          label={
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Add"
              ) || {}
            ).mvalue || "nf Add"
          }
          backgroundColor="var(--primary-color)"
          color="white"
          loading={isAdddingSkill}
        />
      </div>
    </>
  );
};

export default Conf;
