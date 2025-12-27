import React, { useCallback, useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { fetchTopSkill } from "../../../../api/fetchAllData/fetchTopSkill";
import { useDispatch } from "react-redux";
import { FetchProjectHistory } from "../../../../api/fetchAllData/FetchProjectHistory";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import PostApi from "../../../../api/PostData/PostApi";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { addNewSkillApplied } from "../../../../reducer/skillProfile/SkillsAppliedSlice";
import { convertDateToMilliseconds } from "../../../../components/SkillOwner/HelperFunction/convertDateToMilliseconds";
import { replaceTopSkillById } from "../../../../reducer/mySkills/TopSkillSlice";
import {
  editAppliedExp,
  editYoe,
} from "../../../../reducer/mySkills/SkillSelectedSlice";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import EditApi from "../../../../api/editData/EditApi";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { fetchDataSkillsAcquired } from "../../../../api/fetchAllData/fetchDataSkillsAcquired";
import { fetchDataSkillsApplied } from "../../../../api/fetchAllData/fetchDataSkillsApplied";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { setDeleteDetailedProfileData } from "../../../../reducer/delete/deleteDetailedProfileSlice";
import { DayDifferenceToDynamicView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import DeleteFormDetailedProfile from "../../../../components/DeleteFormDetailedProfile";
import { addNewProject } from "../../../../reducer/detailedProfile/projectSlice";
import { FaAnglesLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { BiSolidInfoCircle } from "react-icons/bi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import DialogButton from "../../../../components/Buttons/DialogButton";
import InterfaceChangeConfirmationComponent from "./InterfaceChangeConfirmationComponent";
import { EditAccountDetails } from "../../../../api/editData/EditAccountDetails";
import { FaTimes } from "react-icons/fa";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const AppliedFormForNewUser = ({ setSelectedField }) => {
  const navigate = useNavigate();
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const SkillsApplied = useSelector((state) => state.SkillsApplied);
  const regionalData = useSelector((state) => state.regionalData);

  const [errors, setErrors] = useState(null);
  // collect form values skills applied
  const initialState = {
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    organization: "",
    location: "",
    mtype: "",
    showHide: "Yes",
    recordHide: "No",
    validation: "No",
    blockChain: "No",
    mlanguage: selectedLanguage,
    orgIsnew: false,
    projIsnew: false,
    title: "", // skill name
    userId:getCookie("userId"),
    projectActivity: "",
    id: "",
    ticketids: [],
  };
  const [formvalues, setFormValues] = useState(initialState);
  const [isAddingSkillAcquired, setIsAddingSkillAcquired] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isSavingAccountDetail, setIsSavingAccountDetail] = useState(false);
  const [screenName, setScreenName] = useState("MAIN");
  const [isAddingSkillApplied, setIsAddingSkillApplied] = useState(false);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const topSkill = useSelector((state) => state.TopSkill);
  const projectHistory = useSelector((state) => state.projectHistory);
  const employmentHistory = useSelector(
    (state) => state.employmentHistory.data
  );

  const [projectLists, setProjectLists] = useState(null);
  const [ownProjectLists, setOwnProjectLists] = useState(null);

  const [appliedInPerticularProject, setAppliedInPerticularProject] =
    useState("0");
  const [isAddingproject, setIsAddingProject] = useState(false);

  const [items, setItems] = useState([]);
  const [selectedEmployment, setSelectedEmployment] = useState(
    "Please select an employment"
  );
  const [selectedProject, setSelectedProject] = useState(null);
  const [onGoing, setOnGoing] = useState(false);
  const [sameAsEmp, setSameAsEmp] = useState(false);
  const [sameAsPro, setSameAsPro] = useState(false);

  const [workDescription, setWorkDescription] = useState("");

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
    dispatch(FetchOrganizationHistory());

    const filteredProjects = projectHistory?.data?.filter((project) => {
      return project?.mtype === "Own";
    });
    setOwnProjectLists(filteredProjects);
  }, []);

  useEffect(() => {
    console.log(employmentHistory);

    console.log(projectHistory);

    console.log(projectLists);
  }, [projectLists]);

  useEffect(() => {
    const filteredProjects = projectHistory?.data?.filter((project) => {
      return project?.organization === selectedEmployment?.organization;
    });
    setProjectLists(filteredProjects);
    console.log(selectedEmployment);
    //   setSelectedProject('Please select a project')

    if (selectedEmployment) {
      console.log("triggered emp");
      setSelectedProject("Please select a project");
      setSameAsEmp(false);
      setSameAsPro(false);
      setFormValues({
        ...formvalues,
        fromDate: "",
        toDate: "",
      });
    }
  }, [selectedEmployment]);

  useEffect(() => {
    if (selectedProject === "Please select a project") {
      setOnGoing(false);
      return;
    }

    if (
      selectedProject &&
      selectedProject !== "NA" &&
      selectedProject !== "Please select a project"
    ) {
      console.log("triggred");
      setSameAsPro(true);
      setFormValues({
        ...formvalues,
        fromDate: timestampToYYYYMMDD(Number(selectedProject?.fromDate)),
        toDate: selectedProject?.toDate
          ? timestampToYYYYMMDD(Number(selectedProject?.toDate))
          : "",
      });

      if (
        selectedProject &&
        selectedProject !== "Please select a project" &&
        selectedProject?.toDate
      ) {
        setOnGoing(false);
      } else {
        setOnGoing({ ...onGoing, certificationEndDate: true });
      }

      setErrors({ ...errors, fromDate: false, toDate: false });
    }
  }, [selectedProject]);

  useEffect(() => {
    console.log(selectedProject);
    if (
      selectedEmployment &&
      selectedEmployment !== "NA" &&
      selectedProject &&
      selectedProject === "NA"
    ) {
      console.log("triggred");
      setSameAsEmp(true);
      setFormValues({
        ...formvalues,
        fromDate: timestampToYYYYMMDD(Number(selectedEmployment?.fromDate)),
        toDate: selectedEmployment?.toDate
          ? timestampToYYYYMMDD(Number(selectedEmployment?.toDate))
          : "",
      });

      // setSelectedProject({fromDate:selectedEmployment.fromDate , toDate:selectedEmployment.toDate? selectedEmployment.toDate : ''})

      // if (selectedEmployment === 'Please select an employment') {
      //     setOnGoing(false)
      // }

      if (selectedEmployment && selectedEmployment?.toDate) {
        setOnGoing(false);
      } else {
        setOnGoing({ ...onGoing, certificationEndDate: true });
      }

      setErrors({ ...errors, fromDate: false, toDate: false });
    }
  }, [selectedProject]);

  useEffect(() => {
    if (SkillsApplied.status === "idle") {
      dispatch(fetchDataSkillsApplied());
    }

    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }
    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }
  }, []);

  const checkDuplicate = (form) => {
    var duplicate = false;

    SkillsApplied?.data?.map((skill) => {
      if (
        selectedSkill?.skillOccupation === skill?.title &&
        skill?.projectActivity === selectedProject?.projectActivity &&
        skill?.organization === selectedEmployment?.organization
      ) {
        let fromDate = convertDateToMilliseconds(form.fromDate);
        let toDate = form.toDate
          ? convertDateToMilliseconds(FormatDateIntoPost(form.toDate))
          : Date.now();

        console.log("triggred");

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

  const handleSubmitDate = () => {
    const newErrors = {};
    if (!selectedSkill || selectedSkill === "Please select a skill") {
      newErrors.selectedSkill = "Please select a skill";
    }
    if (
      !selectedEmployment ||
      selectedEmployment === "Please select an employment"
    ) {
      newErrors.selectedEmployment = "Please select an employment";
    }
    if (!selectedProject || selectedProject === "Please select a project") {
      newErrors.selectedProject = "Please select a project";
    }
    if (selectedProject === "NA" && !workDescription) {
      newErrors.workDescription = "Work Description is required";
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

    if (
      !selectedSkill ||
      selectedSkill === "Please select a skill" ||
      !selectedProject ||
      selectedProject === "Please select a project" ||
      !selectedEmployment ||
      selectedEmployment === "Please select an employment"
    ) {
      showErrorToast("Please fill all required fields");
      return;
    }

    if (selectedProject === "NA" && !workDescription) {
      showErrorToast("Please fill all required fields");
      return;
    }

    let duplicate = checkDuplicate(formvalues);
    console.log(duplicate);
    if (duplicate) {
      showErrorToast("SkillApplied already exist within the date range");
      return;
    }

    setIsAddingProject(true);

    formvalues.title = selectedSkill.skillOccupation;
    formvalues.mtype = selectedEmployment === "NA" ? "Own" : "Employment";
    formvalues.projectActivity = selectedProject?.projectActivity
      ? selectedProject?.projectActivity
      : workDescription;
    formvalues.organization = selectedProject?.organization
      ? selectedProject?.organization
      : selectedEmployment?.organization;
    formvalues.duration = calculateDaysDifference(
      convertDateToMilliseconds(formvalues.fromDate),
      formvalues.toDate
        ? convertDateToMilliseconds(formvalues.toDate)
        : Date.now()
    );
    formvalues.fromDate = FormatDateIntoPost(formvalues.fromDate);
    formvalues.toDate = formvalues.toDate
      ? FormatDateIntoPost(formvalues.toDate)
      : "";
    /* TICKETS ID BASED ON THE TICKETS AVAILABLITY */

    const ticketIdsArray = [];

    if (selectedProject?.id) {
      ticketIdsArray.push(selectedProject.id);
    }
    if (selectedEmployment?.id) {
      ticketIdsArray.push(selectedEmployment.id);
    }

    formvalues.ticketids = ticketIdsArray;

    setIsAddingProject(true);

    if (selectedProject === "NA" && workDescription) {
      console.log("add project history");

      const formatdataForNAProject = {
        projectActivity: workDescription,
        fromDate: formvalues.fromDate,
        toDate: formvalues.toDate,
        organization: selectedEmployment?.organization,
        mtype: "Employment",
        mlanguage: selectedLanguage,
        userId:getCookie("userId"),
        showHide: "Yes",
        validation: "No",
        duration: formvalues.duration,
        remark: "",
        location: "",
        orgIsnew: false,
        ticketids: [selectedEmployment?.id],
      };

      PostApi("Project  History", formatdataForNAProject)
        .then((res) => {
          const data = res.data;
          data.fromDate = convertDateToMilliseconds(data.fromDate);
          data.toDate = data.toDate
            ? convertDateToMilliseconds(res.data.toDate)
            : "";
          dispatch(addNewProject(data));
          setWorkDescription("");
          formvalues.projectActivity = workDescription;
          console.log(res?.data?.id);
          ticketIdsArray.push(res?.data?.id);
          console.log(ticketIdsArray);
          formvalues.ticketids = ticketIdsArray;

          PostApi("Skills Applied", formvalues)
            .then((res) => {
              const data = res.data;
              console.log(res.data);
              const days = calculateDaysDifference(
                data.fromDate,
                data.toDate ? data.toDate : Date.now()
              );
              console.log("days areeeee", days);
              const totalDays = days + Number(selectedSkill.yoe);
              const totalExp =
                (selectedSkill.skillAppliedExp
                  ? Number(selectedSkill.skillAppliedExp)
                  : 0) + days;
              console.log("totalll expp", totalExp);
              dispatch(
                addNewSkillApplied({
                  ...data,
                  fromDate: convertDateToMilliseconds(data.fromDate),
                  toDate: data.toDate
                    ? convertDateToMilliseconds(data.toDate)
                    : "",
                })
              );
              showSuccessToast("Skills Applied Added Successful");

              EditApi("User Skills", selectedSkill.id, {
                yoe: `${totalDays}`,
                skillAppliedExp: `${totalExp}`,
              })
                .then((res) => {
                  console.log("edited data", res.data);
                  dispatch(
                    replaceTopSkillById({
                      id: selectedSkill.id,
                      updatedData: res.data,
                    })
                  );
                  dispatch(editYoe(totalDays));
                  dispatch(editAppliedExp(totalExp));
                })
                .catch((err) => {
                  console.log(err);
                });

              setIsAddingProject(false);
              setSelectedSkill(null);
              setSelectedProject(null);
              setSelectedEmployment("Please select an employment");
              setWorkDescription("");
              setOnGoing(false);
            })
            .catch((err) => {
              console.log(err);
              showErrorToast("Something went wrong");
              setIsAddingProject(false);
            })
            .finally(() => {
              setIsAddingProject(false);
              // if press save and close => close is TRUE => close the modal
            });
        })
        .catch((err) => {
          console.log(err);
          showErrorToast("Something went wrong");
        });
    } else {
      PostApi("Skills Applied", formvalues)
        .then((res) => {
          const data = res.data;
          console.log(res.data);
          const days = calculateDaysDifference(
            data.fromDate,
            data.toDate ? data.toDate : Date.now()
          );
          console.log("days areeeee", days);
          const totalDays = days + Number(selectedSkill.yoe);
          const totalExp =
            (selectedSkill.skillAppliedExp
              ? Number(selectedSkill.skillAppliedExp)
              : 0) + days;
          console.log("totalll expp", totalExp);
          dispatch(
            addNewSkillApplied({
              ...data,
              fromDate: convertDateToMilliseconds(data.fromDate),
              toDate: data.toDate ? convertDateToMilliseconds(data.toDate) : "",
            })
          );
          showSuccessToast("Skills Applied Added Successful");

          EditApi("User Skills", selectedSkill.id, {
            yoe: `${totalDays}`,
            skillAppliedExp: `${totalExp}`,
          })
            .then((res) => {
              console.log("edited data", res.data);
              dispatch(
                replaceTopSkillById({
                  id: selectedSkill.id,
                  updatedData: res.data,
                })
              );
              dispatch(editYoe(totalDays));
              dispatch(editAppliedExp(totalExp));
            })
            .catch((err) => {
              console.log(err);
            });

          setIsAddingProject(false);
          setSelectedSkill(null);
          setSelectedProject(null);
          setSelectedEmployment("Please select an employment");
          setWorkDescription("");
        })
        .catch((err) => {
          console.log(err);
          showErrorToast("Something went wrong");
          setIsAddingProject(false);
        })
        .finally(() => {
          setIsAddingProject(false);
          // if press save and close => close is TRUE => close the modal
        });
    }
  };

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

      {/* <FaAnglesLeft className='d-none d-md-block' style={{ alignSelf: 'end', position: 'fixed', top: '50vh', left: '1vw', zIndex: '9999', fontSize: '40px', cursor: 'pointer', color: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || '#000' }} onClick={() => navigate('/newuser/basicinfo')} /> */}

      <div className="d-flex flex-column gap-3 justify-content-center align-items-center my-5 mx-2 mx-lg-5">
        <div className="row  w-100  " style={{ position: "relative" }}>
          <div class="form-group mb-3  col-xl-2 col-lg-4 col-md-12  ">
            <label htmlFor="type" className="mb-1 text-muted">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Skills"
                ) || {}
              ).mvalue || "nf Skills"}{" "}
              <span className="text-danger"> *</span>
            </label>
            <select
              className={`form-select mb-3 ps-0 ${
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
                ).mvalue || "nf skill"}
              </option>

              {items.map((item, index) => (
                <option value={JSON.stringify(item)}>
                  {item.skillOccupation}
                </option>
              ))}
            </select>
          </div>

          <div className="col-xl-2 col-lg-4 col-md-12 mb-3">
            <label htmlFor="type" className="mb-1 text-muted">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Employment"
                ) || {}
              ).mvalue || "nf Employment"}{" "}
              <span className="text-danger"> *</span>
            </label>
            <select
              className={`form-select mb-3 ps-0 ${
                errors?.selectedEmployment ? "blank-error" : "buttom-line-input"
              } font-5 `}
              aria-label="Default select example"
              name="type"
              value={
                selectedEmployment === "NA" ||
                selectedEmployment === "Please select an employment"
                  ? selectedEmployment
                  : JSON.stringify(selectedEmployment)
              }
              onChange={(e) => {
                setErrors({ ...errors, selectedEmployment: false });
                e.target.value === "NA"
                  ? setSelectedEmployment("NA")
                  : setSelectedEmployment(JSON.parse(e.target.value));
              }}
              style={{ height: "32px" }}
            >
              <option selected disabled value={"Please select an employment"}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "PleaseSelectAn"
                  ) || {}
                ).mvalue || "nf Please Select an"}{" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Employment"
                  ) || {}
                ).mvalue || "nf Employment"}
              </option>
              {employmentHistory?.map((emp, index) => (
                <>
                  <option value={JSON.stringify(emp)}>
                    {emp.organization}
                  </option>
                </>
              ))}
              <option value="NA">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NA"
                  ) || {}
                ).mvalue || "nf NA"}
              </option>
            </select>
          </div>

          {selectedProject !== "NA" ? (
            <div className="col-xl-2 col-lg-4 col-md-12 mb-3">
              <label htmlFor="type" className="mb-1 text-muted">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Project"
                  ) || {}
                ).mvalue || "nf Project"}{" "}
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
              <select
                className={`form-select mb-3 ps-0 ${
                  errors?.selectedProject ? "blank-error" : "buttom-line-input"
                } font-5 `}
                aria-label="Default select example"
                name="type"
                value={
                  selectedProject === "NA" ||
                  selectedProject === "Please select a project"
                    ? selectedProject
                    : JSON.stringify(selectedProject)
                }
                onChange={(e) => {
                  setErrors({ ...errors, selectedProject: false });
                  e.target.value === "NA"
                    ? setSelectedProject("NA")
                    : setSelectedProject(JSON.parse(e.target.value));
                }}
                style={{ height: "32px" }}
              >
                <>
                  <option selected disabled value={"Please select a project"}>
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "PleaseSelectA"
                      ) || {}
                    ).mvalue || "nf Please Select a"}{" "}
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Project"
                      ) || {}
                    ).mvalue || "nf Project"}
                  </option>
                  {selectedEmployment &&
                    selectedEmployment !== "NA" &&
                    selectedEmployment !== "Please select an employment" &&
                    projectLists?.map((pro, index) => (
                      <>
                        <option value={JSON.stringify(pro)}>
                          {pro.projectActivity}
                        </option>
                      </>
                    ))}
                </>

                <>
                  {selectedEmployment &&
                    selectedEmployment === "NA" &&
                    selectedEmployment !== "Please select an employment" &&
                    ownProjectLists?.map((pro, index) => (
                      <>
                        <option value={JSON.stringify(pro)}>
                          {pro.projectActivity}
                        </option>
                      </>
                    ))}
                </>

                {selectedEmployment &&
                  selectedEmployment !== "NA" &&
                  selectedEmployment !== "Please select an employment" && (
                    <option value="NA">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "NA"
                        ) || {}
                      ).mvalue || "nf NA"}
                    </option>
                  )}
              </select>
            </div>
          ) : (
            <div className="col-xl-2 col-lg-4 col-md-12 mb-3">
              <label for="exampleFormControlInput1" class="form-label">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "WorkDescription"
                  ) || {}
                ).mvalue || "nf WorkDescription"}
                <span className="text-danger"> *</span>
              </label>
              <input
                type="text"
                style={{ height: "32px" }}
                placeholder="Work description"
                className={`form-select mb-3 ps-0 ${
                  errors?.workDescription ? "blank-error" : "buttom-line-input"
                } font-5 `}
                id=""
                name=""
                value={workDescription}
                onChange={(e) => {
                  setWorkDescription(e.target.value);
                  setErrors({ ...errors, workDescription: false });
                }}
              />
            </div>
          )}

          {(selectedEmployment === "Please select an Employment" ||
            selectedProject === "Please select a project") && (
            <>
              <div
                className="d-flex flex-lg-column flex-row-reverse justify-content-lg-start justify-content-end  align-items-center text-center gap-2 m-0 col-xl-2 col-lg-4 col-md-12 mb-3 "
                style={{ opacity: ".5" }}
              >
                <label htmlFor="exampleFormControlInput1" className="">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "DateSameAs"
                    ) || {}
                  ).mvalue || "nf Date Same as"}{" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Project"
                    ) || {}
                  ).mvalue || "nf Project"}{" "}
                  /{" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Employment"
                    ) || {}
                  ).mvalue || "nf Employment"}
                </label>
                <input type="checkbox" disabled />
              </div>
            </>
          )}

          {selectedProject &&
            selectedProject !== "NA" &&
            selectedProject !== "Please select a project" && (
              <div className="d-flex flex-lg-column flex-row-reverse justify-content-lg-start justify-content-end  align-items-center  text-center gap-2 col-xl-2 col-lg-4 col-md-12 mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className=""
                  style={{
                    opacity:
                      selectedProject && selectedProject !== "NA" ? "1" : ".5",
                  }}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "DateSameAs"
                    ) || {}
                  ).mvalue || "nf Date Same as"}{" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Project"
                    ) || {}
                  ).mvalue || "nf Project"}
                </label>
                <input
                  type="checkbox"
                  checked={sameAsPro}
                  disabled={
                    selectedProject && selectedProject !== "NA" ? false : true
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormValues({
                        ...formvalues,
                        fromDate: timestampToYYYYMMDD(
                          Number(selectedProject?.fromDate)
                        ),
                        toDate: selectedProject?.toDate
                          ? timestampToYYYYMMDD(Number(selectedProject?.toDate))
                          : "",
                      });

                      if (!selectedProject?.toDate) {
                        setOnGoing({ ...onGoing, certificationEndDate: true });
                      }
                    } else {
                      // setFormValues({ ...formvalues, fromDate: '', toDate: '' })
                    }
                    setSameAsEmp(false);
                    setSameAsPro(!sameAsPro);
                    setErrors({ ...errors, fromDate: false, toDate: false });
                  }}
                />
              </div>
            )}

          {selectedEmployment &&
            selectedEmployment !== "NA" &&
            selectedEmployment !== "Please select a employment" &&
            selectedProject &&
            selectedProject === "NA" && (
              <div className="d-flex flex-lg-column flex-row-reverse justify-content-lg-start justify-content-end  align-items-center text-center gap-2 col-xl-2 col-lg-4 col-md-12 mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className=""
                  style={{
                    opacity:
                      selectedEmployment && selectedEmployment !== "NA"
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
                    selectedEmployment && selectedEmployment !== "NA"
                      ? false
                      : true
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormValues({
                        ...formvalues,
                        fromDate: timestampToYYYYMMDD(
                          Number(selectedEmployment?.fromDate)
                        ),
                        toDate: selectedEmployment?.toDate
                          ? timestampToYYYYMMDD(
                              Number(selectedEmployment?.toDate)
                            )
                          : "",
                      });
                      if (!selectedEmployment?.toDate) {
                        setOnGoing({ ...onGoing, certificationEndDate: true });
                      }
                    } else {
                      // setFormValues({ ...formvalues, fromDate: '', toDate: '' })
                    }
                    setSameAsPro(false);
                    setSameAsEmp(!sameAsEmp);
                    setErrors({ ...errors, fromDate: false, toDate: false });
                  }}
                />
              </div>
            )}

          <div
            className="d-lg-flex  col-xl-3 col-lg-7 col-md-12 mb-3 "
            style={{
              opacity: sameAsEmp || sameAsPro ? ".5" : "1",
              pointerEvents: sameAsEmp || sameAsPro ? "none" : "",
            }}
          >
            <div className=" w-100 mb-5 ">
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
              {/* <input type="date" disabled={sameAsPro || sameAsEmp}

                                min={timestampToYYYYMMDD(Number(selectedProject?.fromDate))}
                                max={timestampToYYYYMMDD(Number((selectedProject?.toDate) ? selectedProject?.toDate : Date.now()))}
                                style={{ height: "32px" }} 
                                className="form-control ps-0 buttom-line-input" id="exampleFormControlInput1" name='fromDate'
                                onChange={(e) => setFormValues({ ...formvalues, [e.target.name]: e.target.value })} value={formvalues.fromDate} /> */}

              <DatePicker
                style={{ height: "32px" }}
                maxDate={timestampToYYYYMMDD(
                  Number(
                    selectedProject?.toDate
                      ? selectedProject?.toDate
                      : Date.now()
                  )
                )}
                minDate={timestampToYYYYMMDD(Number(selectedProject?.fromDate))}
                className={`form-control   ps-0 ${
                  errors?.fromDate ? "blank-error" : "buttom-line-input"
                } `}
                id="exampleFormControlInput1"
                name="fromDate"
                selected={formvalues.fromDate}
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
                    ? "form-label text-secondary  mb-1"
                    : "form-label mb-1"
                }
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillAppliedEnd"
                  ) || {}
                ).mvalue || "nf SkillStartDate"}{" "}
                <span className="text-danger">*</span>
              </label>

              {/* <input type="date" disabled={sameAsPro || sameAsEmp}
                                min={formvalues.fromDate}
                                max={timestampToYYYYMMDD(Number((selectedProject?.toDate) ? selectedProject?.toDate : Date.now()))}
                                style={{ height: "32px" }} className={onGoing.certificationEndDate ? "form-control ps-0 bg-body-tertiary text-secondary  " : "form-control ps-0 buttom-line-input"} id="exampleFormControlInput1" name='toDate'
                                onChange={(e) => setFormValues({ ...formvalues, [e.target.name]: e.target.value })} value={formvalues.toDate}
                                {...onGoing.certificationEndDate && { disabled: true }} /> */}

              <DatePicker
                // showIcon
                minDate={formvalues.fromDate}
                maxDate={timestampToYYYYMMDD(
                  Number(
                    selectedProject?.toDate
                      ? selectedProject?.toDate
                      : Date.now()
                  )
                )}
                style={{ height: "32px" }}
                className={
                  onGoing.certificationEndDate
                    ? ` ${
                        errors?.toDate ? "blank-error" : "buttom-line-input"
                      } form-control bg-body-tertiary h-75 text-secondary  ps-0`
                    : `form-control ${
                        errors?.toDate ? "blank-error" : "buttom-line-input"
                      }  h-75 ps-0 `
                }
                id="exampleFormControlInput1"
                name="toDate"
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
                toggleCalendarOnIconClick
                showYearDropdown
                scrollableYearDropdown
                // showMonthDropdown
                // scrollableMonthDropdown
                yearDropdownItemNumber={100}
              />

              {onGoing && (
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
                      setOnGoing({
                        ...onGoing,
                        [e.target.name]: e.target.checked,
                      });
                      setFormValues({ ...formvalues, toDate: "" });
                      setErrors({ ...errors, toDate: false });
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-center align-self-start mt-2 col-xl-1 col-lg-1 col-12 ">
            <SecondaryBtnLoader
              label={
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Add"
                  ) || {}
                ).mvalue || "nf Add"
              }
              backgroundColor="var(--primary-color)"
              color="white"
              loading={isAddingproject}
              onClick={() => handleSubmitDate()}
            />
          </div>
        </div>

        <div className="table-responsive w-100 ">
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
                      (item) => item.elementLabel === "ProjectOrganization"
                    ) || {}
                  ).mvalue || "nf Organization"}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectName"
                    ) || {}
                  ).mvalue || "not ProjectName"}
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
                      (item) => item.elementLabel === "SkillAppliedStart"
                    ) || {}
                  ).mvalue || "nf SkillStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SkillAppliedEnd"
                    ) || {}
                  ).mvalue || "nf SkillStartDate"}{" "}
                </th>
                <th scope="col" className="bg-body- ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf Duration"}{" "}
                </th>
                <th>{/* Delete */}</th>
              </tr>
            </thead>
            <tbody className="">
              {[...SkillsApplied?.data]
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
                        <td
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content={skill.organization}
                        >
                          {skill.organization
                            ? skill.organization.length > 25
                              ? skill.organization.substring(0, 25) + "..."
                              : skill.organization
                            : (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "NA"
                                ) || {}
                              ).mvalue || "nf NA"}
                        </td>
                        <td>
                          {skill.projectActivity
                            ? skill.projectActivity.length > 17
                              ? skill.projectActivity.substring(0, 17) + "..."
                              : skill.projectActivity
                            : (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "NA"
                                ) || {}
                              ).mvalue || "nf NA"}
                        </td>
                        <td>
                          {skill.mtype === "Own"
                            ? (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "ProjectOwn"
                                ) || {}
                              ).mvalue || "nf Project(O)"
                            : skill.mtype === "Employment" &&
                              skill.projectActivity
                            ? (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "ProjectEmployment"
                                ) || {}
                              ).mvalue || "nf Project(E)"
                            : (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel ===
                                    "ProfessionalExperience"
                                ) || {}
                              ).mvalue || "nf Professional Experience"}
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

              {/* <tr className="" >

                                <td>React</td>
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
                            </tr>
                            <tr className="" >
                                <td>Java</td>
                                <td>Facebook</td>
                                <td>Facebook Ads</td>

                                <td>22/12/2022</td>
                                <td>22/12/2023</td>
                                <td>
                                    1Y 2M
                                </td>
                                <td>
                                    <MdDelete style={{ color: 'var(--primary-color)' }} />
                                </td>
                            </tr>
                            <tr className="" >
                                <td>JS</td>
                                <td>Apple</td>
                                <td>Ios Design</td>

                                <td>22/12/2022</td>
                                <td>22/12/2023</td>
                                <td>
                                    4Y 5M
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
          <button
            className="btn"
            style={{
              border: `2px solid ${
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NavBarBgColor"
                  ) || {}
                ).mvalue || "#000"
              }`,
              color:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NavBarBgColor"
                  ) || {}
                ).mvalue || "#000",
            }}
            onClick={() => setSelectedField("Acquired")}
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Back"
              ) || {}
            ).mvalue || "nf Back"}
          </button>
          <button
            className="btn"
            style={{
              backgroundColor:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NavBarBgColor"
                  ) || {}
                ).mvalue || "#000",
              color: "white",
            }}
            onClick={toggleUpdateAccountDetailsModal}
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Next"
              ) || {}
            ).mvalue || "nf Next"}
          </button>
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

export default AppliedFormForNewUser;
