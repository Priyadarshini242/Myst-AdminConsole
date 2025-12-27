import React, { useCallback, useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchTopSkill } from "../../../../api/fetchAllData/fetchTopSkill";
import { fetchCertificationHistory } from "../../../../api/fetchAllData/fetchCertificationHistory";
import { fetchEducationHistory } from "../../../../api/fetchAllData/fetchEducationHistory";
import { fetchTrainingHistory } from "../../../../api/fetchAllData/fetchTrainingHistory";
import { fetchSkillingHistory } from "../../../../api/fetchAllData/fetchSkillingHistory";
import { fetchConferencesHistory } from "../../../../api/fetchAllData/fetchConferenceHistory";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { addNewSkillAcquired } from "../../../../reducer/skillProfile/SkillsAcquiredSlice";
import EditApi from "../../../../api/editData/EditApi";
import { replaceTopSkillById } from "../../../../reducer/mySkills/TopSkillSlice";
import {
  editAcquiredExp,
  editYoe,
} from "../../../../reducer/mySkills/SkillSelectedSlice";
import PostApi from "../../../../api/PostData/PostApi";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { DayDifferenceToDynamicView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { setDeleteDetailedProfileData } from "../../../../reducer/delete/deleteDetailedProfileSlice";
import DeleteFormDetailedProfile from "../../../../components/DeleteFormDetailedProfile";
import { fetchDataSkillsAcquired } from "../../../../api/fetchAllData/fetchDataSkillsAcquired";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { FetchProjectHistory } from "../../../../api/fetchAllData/FetchProjectHistory";
import { FaTimes } from "react-icons/fa";
import { EditAccountDetails } from "../../../../api/editData/EditAccountDetails";
import InterfaceChangeConfirmationComponent from "./InterfaceChangeConfirmationComponent";
import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import { FaAnglesLeft } from "react-icons/fa6";
import DialogButton from "../../../../components/Buttons/DialogButton";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const AcquiredFormForNewUser = ({ setSelectedField }) => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const [selectedAcquired, setSelectedAcquired] = useState(
    "Please select a type"
  );
  const [selectedRecord, setSelectedRecord] = useState(null);

  const SkillsAcquired = useSelector((state) => state.SkillsAcquired);
  const regionalData = useSelector((state) => state.regionalData);

  /* NAVIGATE INIT */
  const navigate = useNavigate();

  // initial state for skills acquired certification
  const innitialState = {
    mtype: "",
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescriptions: "",
    location: "",
    showHide: "Yes",
    validation: "No",
    blockChain: "",
    mlanguage: selectedLanguage,
    organization: "",
    userId:getCookie("userId"),
    source: "",
    id: "",
    ticketids: [],
  };
  const [formvalues, setFormValues] = useState(innitialState);
  const [errors, setErrors] = useState(null);
  const [isAddingSkillAcquired, setIsAddingSkillAcquired] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isSavingAccountDetail, setIsSavingAccountDetail] = useState(false);
  const [screenName, setScreenName] = useState("MAIN");

  const dispatch = useDispatch();
  const topSkill = useSelector((state) => state.TopSkill);
  const educationHistory = useSelector((state) => state.educationHistory);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const skillingsHistory = useSelector((state) => state.skillingsHistory);
  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const trainingHistory = useSelector((state) => state.trainingHistory);
  const projectHistory = useSelector((state) => state.projectHistory);
  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );

  const [items, setItems] = useState([]);
  const [onGoing, setOnGoing] = useState(false);

  useEffect(() => {
    if (topSkill.status === "idle") {
      dispatch(fetchTopSkill());
    }

    if (topSkill.status === "success") {
      setItems(
        topSkill.data.filter((item) => item.mlanguage === selectedLanguage)
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topSkill.status, selectedLanguage, topSkill.data]);

  useEffect(() => {
    if (SkillsAcquired.status === "idle") {
      dispatch(fetchDataSkillsAcquired());
    }

    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }
    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }

    if (educationHistory.status === "idle") {
      dispatch(fetchEducationHistory());
    }
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }

    if (trainingHistory?.status === "idle") {
      dispatch(fetchTrainingHistory());
    }
    if (skillingsHistory?.status === "idle") {
      dispatch(fetchSkillingHistory());
    }
    if (conferenceHistory?.status === "idle") {
      dispatch(fetchConferencesHistory());
    }
  }, []);

  useEffect(() => {
    setFormValues({
      ...formvalues,
      fromDate: selectedRecord?.startDate
        ? timestampToYYYYMMDD(Number(selectedRecord?.startDate))
        : null,
      toDate: selectedRecord?.endDate
        ? timestampToYYYYMMDD(Number(selectedRecord?.endDate))
        : "",
      source:
        selectedRecord?.title ||
        selectedRecord?.certificationName ||
        selectedRecord?.course,
      organization: selectedRecord?.institute,
      institute: selectedRecord?.institute,
    });

    if (selectedRecord && !selectedRecord?.endDate) {
      setOnGoing({ ...onGoing, certificationEndDate: true });
    } else {
      setOnGoing({ ...onGoing, certificationEndDate: false });
    }
    setErrors({ ...errors, fromDate: false, toDate: false });
    console.log(selectedRecord);
    console.log(selectedSkill);
  }, [selectedRecord?.id]);

  const checkDuplicate = (form) => {
    var duplicate = false;

    SkillsAcquired?.data?.map((skill) => {
      if (
        selectedSkill?.skillOccupation === skill.title &&
        skill.source === form.source &&
        skill.mtype === selectedAcquired
      ) {
        console.log("passing");

        let fromDate = convertDateToMilliseconds(form.fromDate);
        let toDate = form.toDate
          ? convertDateToMilliseconds(FormatDateIntoPost(form.toDate))
          : Date.now();

        if (
          fromDate === skill.fromDate ||
          toDate === (skill.toDate ? skill.toDate : Date.now())
        ) {
          duplicate = true; // Overlap detected
        }
        // Check for overlap
        else if (
          (fromDate >= skill.fromDate &&
            fromDate <= (skill.toDate ? skill.toDate : Date.now())) || // User from date falls within existing date range
          (toDate >= skill.fromDate &&
            toDate <= (skill.toDate ? skill.toDate : Date.now())) || // User to date falls within existing date range
          (fromDate <= skill.fromDate &&
            toDate >= (skill.toDate ? skill.toDate : Date.now())) || // User date range completely overlaps existing date range
          (fromDate <= skill.fromDate &&
            toDate >= skill.fromDate &&
            toDate <= (skill.toDate ? skill.toDate : Date.now())) || // Right-side overlap
          (toDate >= (skill.toDate ? skill.toDate : Date.now()) &&
            fromDate >= skill.fromDate &&
            fromDate <= (skill.toDate ? skill.toDate : Date.now())) // Left-side overlap
        ) {
          console.log("inside");
          duplicate = true; // Overlap detected
        }
      }
    });

    return duplicate;
  };

  const handleSkillAcquiredSubmit = () => {
    const newErrors = {};
    if (!selectedSkill || selectedSkill === "Please select a skill") {
      newErrors.selectedSkill = "Please select a skill";
    }
    if (!selectedAcquired || selectedAcquired === "Please select a type") {
      newErrors.selectedAcquired = "Please select a type";
    }
    if (selectedAcquired !== "Please select a type" && !selectedRecord) {
      newErrors.selectedRecord = "Please select a record";
    }
    if (!formvalues?.fromDate) {
      newErrors.fromDate = "start date is required";
    }
    if (!formvalues?.toDate && !onGoing.certificationEndDate) {
      newErrors.toDate = "end date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showErrorToast("Please fill all required fields");
      return;
    }

    if (!selectedSkill || !selectedAcquired || !selectedRecord) {
      showErrorToast("Please fill all required fields");
      return;
    }

    let duplicate = checkDuplicate(formvalues);
    if (duplicate) {
      showErrorToast("SkillAccquired already exist within the date range");
      return;
    }

    setIsAddingSkillAcquired(true);

    let ticketIdsArray = [];
    ticketIdsArray.push(selectedRecord?.id);

    PostApi("Skills Acquired", {
      ...formvalues,
      organization: selectedRecord?.organization || selectedRecord?.institute,
      location: selectedRecord?.location,
      title: selectedSkill?.skillOccupation,
      mtype: selectedAcquired,
      fromDate: FormatDateIntoPost(formvalues.fromDate),
      toDate: formvalues.toDate ? FormatDateIntoPost(formvalues.toDate) : "",
      duration: calculateDaysDifference(
        convertDateToMilliseconds(formvalues.fromDate),
        formvalues.toDate
          ? convertDateToMilliseconds(formvalues.toDate)
          : Date.now()
      ),
      ticketids: ticketIdsArray,
    })
      .then((res) => {
        dispatch(
          addNewSkillAcquired({
            ...res.data,
            fromDate: convertDateToMilliseconds(res.data.fromDate),
            toDate: res.data.toDate
              ? convertDateToMilliseconds(res.data.toDate)
              : "",
          })
        );
        showSuccessToast("Skills Acquired Added Successful");

        setFormValues(innitialState);
        setSelectedAcquired("Please select a type");
        setSelectedRecord(null);
        setSelectedSkill(null);
        // setCertChildData("");

        // after update into Myskill Experinece in DND
        const days = calculateDaysDifference(
          res.data.fromDate,
          res.data.toDate ? res.data.toDate : Date.now()
        );
        const totalDays = days + Number(selectedSkill?.yoe);
        const totalExp =
          (selectedSkill?.skillAcquiredExp
            ? Number(selectedSkill?.skillAcquiredExp)
            : 0) + days;

        EditApi("User Skills", selectedSkill?.id, {
          yoe: `${totalDays}`,
          skillAcquiredExp: `${totalExp}`,
        })
          .then((res) => {
            dispatch(
              replaceTopSkillById({
                id: selectedSkill?.id,
                updatedData: res.data,
              })
            );
            dispatch(editYoe(totalDays));
            dispatch(editAcquiredExp(totalExp));
          })
          .catch((err) => {
            console.error(err);
          });

        setIsAddingSkillAcquired(false);
      })
      .catch((err) => {
        console.error(err);
        showErrorToast("Something went wrong");
        setIsAddingSkillAcquired(false);
      })
      .finally(() => {
        setIsAddingSkillAcquired(false);
      });
  };

  console.log(SkillsAcquired.data);
  console.log(selectedRecord);

  /* HANDLE UPDATE ACCOUNT DETAIL */
  const handleUpdateAccount = useCallback(async () => {
    setIsSavingAccountDetail(true);
    try {
      const payload = {
        defaultView: screenName,
      };
      const res = await EditAccountDetails(payload);
      showSuccessToast(res?.data?.message);
      setIsSavingAccountDetail(false);
      setIsAccountDialogOpen(false);
      navigate("/dashboard/skillprofile");
    } catch (error) {
      setIsSavingAccountDetail(false);
      if (error instanceof ReferenceError) {
        console.error("Reference error occured: ", error?.message);
      } else if (error instanceof TypeError) {
        console.error("Type error occured: ", error?.message);
      } else {
        console.error("Error occured during update account: ", error);
      }
    }
  }, [screenName, navigate]);

  /* HANDLE TOGGLE DIALOG */
  const toggleUpdateAccountDetailsModal = useCallback(() => {
    navigate("/newuser/destination");
  }, [navigate]);

  return (
    <>
      {/* <DeleteFormDetailedProfile /> */}

      <FaAnglesLeft
        className="d-none d-md-block"
        style={{
          alignSelf: "end",
          position: "fixed",
          top: "50vh",
          left: "1vw",
          zIndex: "9999",
          fontSize: "40px",
          cursor: "pointer",
          color:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "NavBarBgColor"
              ) || {}
            ).mvalue || "#000",
        }}
        onClick={() => navigate("/newuser/basicinfo")}
      />

      <div className="d-flex flex-column gap-3 justify-content-center align-items-center my-5 mx-2 mx-lg-5">
        <div className="row w-100  " style={{ position: "relative" }}>
          <div className=" mb-3  col-xl-3 col-lg-4 col-md-12">
            <label htmlFor="type" className="mb-1 text-muted">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Skills"
                ) || {}
              ).mvalue || "nf Skills"}{" "}
              <span className="text-danger"> *</span>
            </label>
            <select
              className={`form-select px-0 mb-3 ${
                errors?.selectedSkill ? "blank-error" : "buttom-line-input"
              } font-5 `}
              aria-label="Default select example"
              name="type"
              value={
                selectedSkill
                  ? JSON.stringify(selectedSkill)
                  : "Please select a skill"
              }
              onChange={(e) => {
                const value = JSON.parse(e.target.value);
                setSelectedSkill(value);
                setErrors({ ...errors, selectedSkill: false });
              }}
              style={{ height: "32px" }}
            >
              <option selected disabled value={"Please select a skill"}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "PleaseSelectA"
                  ) || {}
                ).mvalue || "nf Please Select a"}{" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Skill"
                  ) || {}
                ).mvalue || "nf Skill"}
              </option>

              {items.map((item, index) => (
                <option value={JSON.stringify(item)}>
                  {item.skillOccupation}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3  col-xl-2 col-lg-4 col-md-12">
            <label htmlFor="type" className="mb-1 text-muted">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ThroughYouAcquired"
                ) || {}
              ).mvalue || "nf ThroughYouAcquired"}{" "}
              <span className="text-danger"> *</span>
            </label>
            <select
              className={`form-select px-0 mb-3 ${
                errors?.selectedAcquired ? "blank-error" : "buttom-line-input"
              } font-5 `}
              aria-label="Default select example"
              name="type"
              value={selectedAcquired}
              onChange={(e) => {
                setErrors({ ...errors, selectedAcquired: false });
                setSelectedAcquired(e.target.value);
              }}
              style={{ height: "32px" }}
            >
              <option selected disabled value={"Please select a type"}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "PleaseSelectA"
                  ) || {}
                ).mvalue || "nf Please Select a"}{" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Type"
                  ) || {}
                ).mvalue || "nf Type"}
              </option>
              <option value="Education">
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

          {selectedAcquired === "Please select a type" && (
            <div
              className="mb-3  col-xl-3 col-lg-4 col-md-12"
              style={{ opacity: ".5" }}
            >
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SelectRecord"
                  ) || {}
                ).mvalue || "nf SelectRecord"}{" "}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select px-0 mb-3 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                disabled
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "PleaseSelectA"
                    ) || {}
                  ).mvalue || "nf Please Select a"}{" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Record"
                    ) || {}
                  ).mvalue || "nf Record"}
                </option>
                {/* {educationHistory?.data?.map((education, index) => (
                                    <>
                                        <option value={JSON.stringify(education)} >{education.course}</option>
                                    </>
                                ))
                                } */}
              </select>
            </div>
          )}

          {selectedAcquired === "Education" && (
            <div className="mb-3  col-xl-3 col-lg-4 col-md-12">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Education"
                  ) || {}
                ).mvalue || "nf Education"}{" "}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select px-0 mb-3 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                onChange={(e) => {
                  setErrors({ ...errors, selectedRecord: false });
                  setSelectedRecord(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  Please select a Education
                </option>
                {educationHistory?.data?.map((education, index) => (
                  <>
                    <option value={JSON.stringify(education)}>
                      {education.course}
                    </option>
                  </>
                ))}
              </select>
            </div>
          )}
          {selectedAcquired === "Certification" && (
            <div className="mb-3  col-xl-3 col-lg-4 col-md-12">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Certification"
                  ) || {}
                ).mvalue || "nf Certification"}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select mb-3 px-0 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                onChange={(e) => {
                  setErrors({ ...errors, selectedRecord: false });
                  setSelectedRecord(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  Please select a Certification
                </option>
                {certificationHistory?.data?.map((cert, index) => (
                  <>
                    <option value={JSON.stringify(cert)}>
                      {cert.certificationName}
                    </option>
                  </>
                ))}
              </select>
            </div>
          )}
          {selectedAcquired === "Training" && (
            <div className="mb-3  col-xl-3 col-lg-4 col-md-12">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Training"
                  ) || {}
                ).mvalue || "nf Training"}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select mb-3 px-0 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                onChange={(e) => {
                  setErrors({ ...errors, selectedRecord: false });
                  setSelectedRecord(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  Please select a Training
                </option>
                {trainingHistory?.data?.map((tran, index) => (
                  <>
                    <option value={JSON.stringify(tran)}>{tran.title}</option>
                  </>
                ))}
              </select>
            </div>
          )}
          {selectedAcquired === "Skilling" && (
            <div className="mb-3  col-xl-3 col-lg-4 col-md-12">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Skilling"
                  ) || {}
                ).mvalue || "nf Skilling"}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select mb-3 px-0 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                onChange={(e) => {
                  setErrors({ ...errors, selectedRecord: false });
                  setSelectedRecord(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  Please select a Skilling
                </option>
                {skillingsHistory?.data?.map((skilling, index) => (
                  <>
                    <option value={JSON.stringify(skilling)}>
                      {skilling.title}
                    </option>
                  </>
                ))}
              </select>
            </div>
          )}
          {selectedAcquired === "Conferences" && (
            <div className="mb-3  col-xl-3 col-lg-4 col-md-12">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Conferences"
                  ) || {}
                ).mvalue || "nf Conferences"}
                <span className="text-danger"> *</span>
              </label>
              <select
                className={`form-select mb-3 px-0 ${
                  errors?.selectedRecord ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                onChange={(e) => {
                  setErrors({ ...errors, selectedRecord: false });
                  setSelectedRecord(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <option selected disabled>
                  Please select a Conference
                </option>
                {conferenceHistory?.data?.map((conf, index) => (
                  <>
                    <option value={JSON.stringify(conf)}>{conf.title}</option>
                  </>
                ))}
              </select>
            </div>
          )}

          <div className="d-lg-flex  col-xl-3 col-lg-7 col-md-12 mb-3">
            <div className=" w-100  mb-4">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label mb-1"
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillAppliedStart"
                  ) || {}
                ).mvalue || "nf SkillStartDate"}{" "}
                <span className="text-danger">*</span>
              </label>
              {/* <input type="date"

                                min={timestampToYYYYMMDD(Number(selectedRecord?.startDate))}
                                max={timestampToYYYYMMDD(Number((selectedRecord?.endDate) ? selectedRecord?.endDate : Date.now()))}
                                style={{ height: "32px" }} className="form-control buttom-line-input" id="exampleFormControlInput1" name='fromDate' onChange={(e) => setFormValues({ ...formvalues, [e.target.name]: e.target.value })} value={formvalues.fromDate} /> */}

              <DatePicker
                style={{ height: "32px" }}
                maxDate={timestampToYYYYMMDD(
                  Number(
                    selectedRecord?.endDate
                      ? selectedRecord?.endDate
                      : Date.now()
                  )
                )}
                minDate={timestampToYYYYMMDD(Number(selectedRecord?.startDate))}
                className={`form-control   px-0 ${
                  errors?.fromDate ? "blank-error" : "buttom-line-input"
                } `}
                id="exampleFormControlInput1"
                name="fromDate"
                selected={
                  formvalues.fromDate !== NaN - NaN - NaN
                    ? formvalues.fromDate
                    : null
                }
                onChange={(e) => {
                  setErrors({ ...errors, fromDate: false });
                  setFormValues({
                    ...formvalues,
                    fromDate: e
                      ? timestampToYYYYMMDD(new Date(e).getTime())
                      : null,
                  });
                }}
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
            <div className=" ms-lg-2 w-100 ">
              <label
                htmlFor="exampleFormControlInput1"
                className={
                  onGoing.certificationEndDate
                    ? "form-label text-secondary mb-1 "
                    : "form-label mb-1"
                }
              >
                {" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillAppliedEnd"
                  ) || {}
                ).mvalue || "nf SkillEndDate"}{" "}
                <span className="text-danger">*</span>
              </label>

              {/* <input type="date"
                                min={formvalues.fromDate}
                                max={timestampToYYYYMMDD(Number((selectedRecord?.endDate) ? selectedRecord?.endDate : Date.now()))}
                                style={{ height: "32px" }} className={onGoing.certificationEndDate ? "form-control bg-body-tertiary text-secondary  " : "form-control buttom-line-input"} id="exampleFormControlInput1" name='toDate' onChange={(e) => setFormValues({ ...formvalues, [e.target.name]: e.target.value })} value={formvalues.toDate}
                                {...onGoing.certificationEndDate && { disabled: true }} /> */}

              <DatePicker
                // showIcon
                style={{ height: "32px" }}
                className={
                  onGoing.certificationEndDate
                    ? ` ${
                        errors?.toDate ? "blank-error" : "buttom-line-input"
                      } form-control bg-body-tertiary h-75 text-secondary  px-0`
                    : `form-control ${
                        errors?.toDate ? "blank-error" : "buttom-line-input"
                      }  h-75 px-0 `
                }
                minDate={formvalues.fromDate}
                maxDate={timestampToYYYYMMDD(
                  Number(
                    selectedRecord?.endDate
                      ? selectedRecord?.endDate
                      : Date.now()
                  )
                )}
                selected={formvalues.toDate}
                onChange={(e) => {
                  setErrors({ ...errors, toDate: false });
                  setFormValues({
                    ...formvalues,
                    toDate: e
                      ? timestampToYYYYMMDD(new Date(e).getTime())
                      : null,
                  });
                }}
                dateFormat={formatDateInputType(
                  regionalData.selectedCountry.dateFormat
                )}
                placeholderText={getCookie("dateFormat")}
                disabled={onGoing.certificationEndDate}
                id="exampleFormControlInput1"
                toggleCalendarOnIconClick
                showYearDropdown
                scrollableYearDropdown
                // showMonthDropdown
                // scrollableMonthDropdown
                yearDropdownItemNumber={100}
              />

              {selectedRecord && !selectedRecord?.endDate && (
                <div
                  className={
                    onGoing.certificationEndDate
                      ? "d-flex ms-1 align-items-center font-6 text-secondary   "
                      : "d-flex ms-1 align-items-center font-6 text-secondary   "
                  }
                >
                  <label htmlFor="exampleFormControlInput1" className="">
                    Ongoing{" "}
                  </label>
                  <input
                    className="ms-2 "
                    type="checkbox"
                    name="certificationEndDate"
                    checked={onGoing.certificationEndDate}
                    onChange={(e) => {
                      setErrors({ ...errors, toDate: false });
                      setOnGoing({
                        ...onGoing,
                        [e.target.name]: e.target.checked,
                      });
                      setFormValues({ ...formvalues, toDate: "" });
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-center align-self-start mt-2 col-xl-1 col-lg-1 col-12 ">
            <SecondaryBtnLoader
              onClick={() => handleSkillAcquiredSubmit()}
              label={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Add"
                  ) || {}
                ).mvalue || "nf Add"
              }
              backgroundColor="var(--primary-color)"
              color="white"
              loading={isAddingSkillAcquired}
            />
          </div>
        </div>

        <div className="table-responsive w-100 mt-4">
          <table className="table table-sm  table-fixed table-hover    ">
            <thead>
              <tr className="border-dark-subtle ">
                <th scope="col" className="bg-body- " style={{ width: "15%" }}>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Skills"
                    ) || {}
                  ).mvalue || "nf Skills"}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Type"
                    ) || {}
                  ).mvalue || "nf Type"}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Name"
                    ) || {}
                  ).mvalue || "nf Name"}
                </th>

                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SkillAppliedStart"
                    ) || {}
                  ).mvalue || "nf SkillStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SkillAppliedEnd"
                    ) || {}
                  ).mvalue || "nf SkillEndDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf ProjectDuration"}{" "}
                </th>
                <th>{/* Delete */}</th>
              </tr>
            </thead>
            <tbody className="">
              {[...SkillsAcquired?.data]
                ?.sort((a, b) => {
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
                ?.map((skill, index) => (
                  <>
                    {skill.mlanguage === selectedLanguage && (
                      <tr className="" key={index}>
                        <td
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content={skill.title}
                        >
                          {skill.title
                            ? skill.title.length > 17
                              ? skill.title.substring(0, 17) + "..."
                              : skill.title
                            : ""}
                        </td>

                        <td>{skill.mtype}</td>
                        <td
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content={skill.source}
                        >
                          {skill.source
                            ? skill.source.length > 25
                              ? skill.source.substring(0, 25) + "..."
                              : skill.source
                            : ""}
                        </td>

                        <td>
                          {formatTimestampToDate(
                            Number(skill.fromDate),
                            regionalData.selectedCountry.dateFormat
                          )}
                        </td>
                        <td>
                          {skill.toDate
                            ? formatTimestampToDate(
                                Number(skill.toDate),
                                regionalData.selectedCountry.dateFormat
                              )
                            : "On-going"}
                        </td>

                        <td>{DayDifferenceToDynamicView(skill.duration)}</td>

                        <td className="">
                          {/* <MdEdit className='me-4' style={{ color: 'var(--primary-color)' }} /> */}

                          <button
                            style={{ color: "var(--primary-color)" }}
                            className="border-0 bg-transparent"
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Delete"
                            data-bs-toggle="modal"
                            data-bs-target="#deleteformdetailedprofile"
                            onClick={() => {
                              dispatch(setDeleteDetailedProfileData(skill));
                            }}
                          >
                            {" "}
                            <MdDelete />{" "}
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>

        <div
          className="d-flex w-100 gap-2   p-4 pt-2  justify-content-end bg-white"
          style={{ position: "fixed", bottom: "10px" }}
        >
          {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)', opacity: '.5' }} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Back') || {}).mvalue || "nf Back"}</button> */}
          {/* <button className='btn' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => setSelectedField('Acquired')} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Next') || {}).mvalue || "nf Next"}</button> */}

          <DialogButton
            Active={true}
            onClick={() => setSelectedField("Applied")}
          />
        </div>
      </div>
      {/* DISPLAY DIALOG */}
      {isAccountDialogOpen && (
        <InterfaceChangeConfirmationComponent
          content={content}
          selectedLanguage={selectedLanguage}
          FaTimes={FaTimes}
          SecondaryBtnLoader={SecondaryBtnLoader}
          handleUpdateAccount={handleUpdateAccount}
          isSavingAccountDetail={isSavingAccountDetail}
          setIsAccountDialogOpen={setIsAccountDialogOpen}
        />
      )}
    </>
  );
};

export default AcquiredFormForNewUser;
