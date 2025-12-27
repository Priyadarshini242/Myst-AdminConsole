import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useSelector } from "react-redux";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import { showWarningToast } from "../../../../components/ToastNotification/showWarningToast";
import { useDispatch } from "react-redux";
import PostApi from "../../../../api/PostData/PostApi";
import { addNewTopSkill } from "../../../../reducer/mySkills/TopSkillSlice";
import { setMySkill } from "../../../../reducer/mySkills/SkillSelectedSlice";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { debouncedSendRequest } from "../../../../components/DebounceHelperFunction/debouncedSendRequest";
import { addNewSkillApplied } from "../../../../reducer/skillProfile/SkillsAppliedSlice";
import { toTitleCase } from "../../../../components/SkillOwner/HelperFunction/toTitleCase";
import { FaTimes } from "react-icons/fa";
import CreateSelectOccupation from "../../../../components/SkillOwner/SelectComponent/CreateSelectOccupation";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import SortableList from "../../../../components/SkillOwner/SkillsDragDrop/SortableList";

import { FaAnglesRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { set } from "lodash";
import FindSkillByOccModal from "./FindSkillByOccModal";
import DialogButton from "../../../../components/Buttons/DialogButton";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import useContentLabel from "../../../../hooks/useContentLabel";
import { getCookie } from '../../../../config/cookieService';


const SkillFormForNewUser = ({ setSelectedField }) => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  // store imports
  const topSkill = useSelector((state) => state.TopSkill);
  const scrollRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentLabel = useContentLabel();

  // collect form values skills applied
  const initialState = {
    fromDate: "",
    toDate: "",
    duration: "",
    briefDescription: "",
    organization: "",
    location: "",
    mtype: "Own",
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

  const [formValues, setFormValues] = useState(initialState); // project

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // for adding skills to the dashboard
  const [SkillSuggestions, setSkillSuggestions] = useState(false);
  const [SkillValue, setSkillValue] = useState("");
  // const [skillRecord, setSkillRecord] = useState({});
  const [skillAppliedYoe, setSkillAppliedYoe] = useState("");
  const [skillAcquiredYoe, setSkillAcquiredYoe] = useState("");
  const [suggestionLoader, setSuggestionLoader] = useState(false);
  const [isShowOccupationPopup, setIsShowOccupationPopup] = useState(false);

  /* GET CURRENT DATA FROM CHILD */
  const [childData, setChildData] = useState("");
  const [certChildData, setCertChildData] = useState("");
  const [trainingChildData, setTrainingChildData] = useState("");
  const [confChildData, setConfChildData] = useState("");
  const [skillingChildData, setSkillingChildData] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [isNewOccupation, setIsNewOccupation] = useState(false);
  const [isSavingOccupation, setIsSavingOccupation] = useState(false);
  const [isNewSkill, setIsNewSkill] = useState(false);

  const [findByOcc, setFindByOcc] = useState(false);

  ///////////////////////////////////////find by occ////////////////////////////////////////

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  /* HANDLE CREATING NEW SKILL IN MASTER */
  const handleInsertNewSkill = useCallback(
    async (
      newSkillName,
      occupationNameData,
      skillOccupationNameData,
      lang,
      moduleName,
      contentName,
      itemId
    ) => {
      const payload = {
        skill: newSkillName,
        occupation: occupationNameData,
        skillOccupation: skillOccupationNameData,
        mlanguage: lang,
        mstatus: "W",
      };
      try {
        const res = await exceptionPOSTapi("skill", payload);
        const data = res?.data;

        handleSkillExceptions(
          data?.applicationName,
          data?.id,
          moduleName,
          contentName,
          itemId
        );
        if (isNewOccupation) {
          handleOccupationExceptions(
            data?.applicationName,
            data?.id,
            moduleName,
            occupationNameData,
            itemId
          );
        }
      } catch (error) {
        console.error("Error inserting new skill: ", error);
      }
    },
    [isNewOccupation]
  );

  /* HANDLE SKILL EXCEPTION */
  const handleSkillExceptions = async (
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

  /* HANDLE OCCUPATION EXCEPTION */
  const handleOccupationExceptions = async (
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

  // const handleSuggestionClick = (value) => {
  //   console.log("inni");
  //   if (value.skillOccupation === "No suggestions found") {
  //     setSkillValue("");
  //     setSkillSuggestions("");
  //   } else {
  //     setSkillValue(value.skillOccupation);
  //     setSkillRecord(value);
  //     setSkillSuggestions("");
  //   }
  // }

  const handleAddSkill = (SkillValue, skillRecord) => {
    if (skillRecord.skillOccupation === "No suggestions found") {
      setSkillValue("");
      setSkillSuggestions("");
      return;
    }

    const checkSkill = topSkill.data.find(
      (item) =>
        item.skillOccupation === SkillValue &&
        item.mlanguage === selectedLanguage
    );
    if (checkSkill) {
      showErrorToast("Skill already exist");
      setSkillValue("");
      return;
    }

    setSkillValue(SkillValue);

    setSkillSuggestions("");
    if (SkillValue === "") {
      showWarningToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseEnterASkill"
          ) || {}
        ).mvalue || "Please Enter a skill"
      );
    }
    // check if the skill is already added in particular selected language
    else {
      const checkSkill = topSkill.data.find(
        (item) =>
          item.skillOccupation === SkillValue &&
          item.mlanguage === selectedLanguage
      );
      // if checkskill undefined then POST the data
      if (checkSkill === undefined) {
        const findRank = topSkill.data.filter(
          (item) => item.mlanguage === selectedLanguage
        );
        console.log(skillRecord);

        const newUserSkill = {
          skillOccupation: SkillValue,
          mlanguage: selectedLanguage,
          userRank: findRank.length + 1,
          yoe: "0",
          userId:getCookie("userId"),
          occupation: skillRecord.occupation,
          occupationId: skillRecord.occupationId,
          skill: skillRecord.skill,
          skillId: "",
        };

        // if already request is pending then return
        if (isAddingSkill) {
          return;
        }
        setIsAddingSkill(true);

        console.log(newUserSkill);

        PostApi("User Skills", newUserSkill)
          .then((res) => {
            const data = res?.data;
            if (isNewSkill && !data?.occupationId) {
              handleInsertNewSkill(
                data?.skill,
                data?.occupation,
                data?.skillOccupation,
                data?.mlanguage,
                data?.applicationName,
                data?.skill,
                data?.id
              );
            }

            dispatch(addNewTopSkill(res.data));
            dispatch(setMySkill(res.data));
            setSelectedOccupation(null);
            setIsNewSkill(false);
            setIsNewOccupation(false);
            setSkillValue("");
          })
          .catch((err) => {
            console.error(err);
            showErrorToast("Something went wrong");
          })
          .finally(() => {
            setIsAddingSkill(false);
            handleScroll();
          });
      } else {
        dispatch(setMySkill(checkSkill));
      }
    }
  };

  useEffect(() => {
    //  console.log(scrollRef.current);
    //         scrollRef.current.scrollIntoView({  block: 'end' });
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      const height = scrollRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollRef.current.scrollTop = maxScrollTop; // Adjust the value as needed
    }
  };

  const [isThreeCharacters, setIsThreeCharacters] = useState(false);
  const handleChangeSkill = (e) => {
    const inputValue = e.target.value;
    setSkillValue(inputValue);
    // if value greater than 2 then query the database and get the suggestions
    if (e.target.value.length > 2) {
      // debouncedSendRequest( user input ,selectedLanguage, usestateToSetSuggestions)
      setSuggestionLoader(true);
      debouncedSendRequest(
        e.target.value,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
      setIsThreeCharacters(true);
    } else {
      setSkillSuggestions([
        {
          skillOccupation: "Enter atleast 3 characters",
          id: 1,
          occupation: selectedLanguage,
        },
      ]);
      setIsThreeCharacters(false);
    }
  };

  const buttonRef = useRef(null);
  const handleSubmitDate = () => {
    dispatch(addNewSkillApplied(formValues));

    // before send data verify the skill is filled validation form sent to db if yes update validation to yes
  };

  /* FOR CREATING NEW SKILL */
  const handleCreateSkill = (skillName) => {
    setIsNewSkill(true);
    if (selectedOccupation) {
      const titleCaseSkillName = toTitleCase(skillName);
      const formattedSkillOccupation = `${titleCaseSkillName} || ${selectedOccupation?.label}`;
      const newSkill = {
        skill: titleCaseSkillName,
        occupation: selectedOccupation?.label,
        skillOccupation: formattedSkillOccupation,
      };
      setSkillSuggestions((prevSuggestions) => [...prevSuggestions, newSkill]);
    }
  };

  /* HANDLE OCCUPATION SAVE */
  const handleOccupationSave = () => {
    handleCreateSkill(SkillValue);
    setIsSavingOccupation(true);
    setIsShowOccupationPopup(false);
    /* RETURN TO FALSE */
    setIsSavingOccupation(false);
  };

  console.log(SkillSuggestions);

  return (
    <>
      <FaAnglesRight
        className=""
        style={{
          alignSelf: "end",
          position: "fixed",
          top: "50vh",
          right: "2vw",
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
        onClick={() => navigate("/newuser/linkskills")}
      />

      <div className="d-flex  justify-content-center align-items-center mt-4">
        <div className="w-100 d-flex flex-column justify-content-center align-items-center  gap-5">
          {/* <button onClick={() => setFindByOcc(true)}>

            nf find by occ
          </button> */}

          <p
            class="text-muted mb-2 text-center"
            style={{ letterSpacing: ".1rem" }}
            id="Employment"
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "BasicInfoSkill"
              ) || {}
            ).mvalue || "nf Lets Catalog Your Skills"}
          </p>

          {/* <div className="mt-2  rounded-top   " style={{ backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecBarBgColor') || {}).mvalue || 'var(--primary-color)' }}>
          <div className='text h6 text-center   ' style={{ padding: "8px 0 ", color: "#F7FFDD" }} >{(content[selectedLanguage]?.find(item => item.elementLabel === "MySkills") || {}).mvalue || "not found"}</div>
        </div> */}

          <div style={{ position: "relative" }} className=" w-75 ">
            {isAddingSkill ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "38px" }}
              >
                <ThreeDots width={"30"} height={"10"} />
              </div>
            ) : (
              <div
                className="d-flex gap-5  justify-content-center align-items-center w-100"
                style={{ position: "relative" }}
              >
                <div className="d-flex justify-content-center align-items-center row w-100 mb-2">
                  <div className=" py-0 row  col-md-7 col-12">
                    <label
                      for="exampleFormControlInput1"
                      class="form-label m-0 col-md-3 col-12 p-0 text-center"
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "YourSkills"
                        ) || {}
                      ).mvalue || "nf Your Skills"}
                      <span className="text-danger">*</span>
                    </label>
                    <div
                      className="col-md-9 col-12 p-0"
                      style={{ position: "relative" }}
                    >
                      <input
                        type="text"
                        placeholder={
                          isFocused
                            ? ""
                            : (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "AddSkill"
                                ) || {}
                              ).mvalue || "nf AddSkill"
                        }
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="buttom-line-input form-control  m-0 p-0 "
                        value={SkillValue}
                        onChange={(e) => handleChangeSkill(e)}
                      />

                      {suggestionLoader && (
                        <div
                          style={{
                            transform: "translate(205px,-24px)",
                            width: "50px",
                          }}
                        >
                          <ThreeDots width={"30"} height={"10"} />
                        </div>
                      )}

                      {SkillValue &&
                        SkillSuggestions.length > 0 &&
                        !isShowOccupationPopup && (
                          <div
                            className="dropdown-menu table-responsive d-flex  font-5   py-0 w-100"
                            style={{
                              maxHeight: "130px",
                              position: "absolute",
                              // top:'1px',
                              zIndex: 999,
                            }}
                          >
                            <table className="table table-sm d-flex table-hover   px-0  mx-1  py-0 w-100">
                              <tbody
                                className="font-5 w-100"
                                style={{ width: "100%" }}
                              >
                                {/* FOR CREATING NEW SKILL */}
                                {!SkillSuggestions.some(
                                  (suggestion) =>
                                    suggestion.skillOccupation === SkillValue
                                ) &&
                                  isThreeCharacters &&
                                  !suggestionLoader && (
                                    <tr
                                      onClick={() =>
                                        handleCreateSkill(SkillValue)
                                      }
                                      className="w-100"
                                    >
                                      <td
                                        style={{ cursor: "pointer" }}
                                        className="w-100"
                                        onClick={() =>
                                          setIsShowOccupationPopup(true)
                                        }
                                      >
                                        Create "{toTitleCase(SkillValue)}"
                                      </td>
                                    </tr>
                                  )}

                                {SkillSuggestions.map((suggestion, index) => (
                                  <tr
                                    key={index}
                                    className="w-100"
                                    onClick={() => {
                                      // handleSuggestionClick(suggestion)
                                      handleAddSkill(
                                        suggestion.skillOccupation,
                                        suggestion
                                      );
                                    }}
                                    style={{
                                      pointerEvents: `${
                                        suggestion?.skillOccupation ===
                                          "No suggestions found" ||
                                        suggestion?.skillOccupation ===
                                          "Enter atleast 3 characters" ||
                                        !suggestion.skillOccupation
                                          ? "none"
                                          : "auto"
                                      }`,
                                      cursor: `${
                                        suggestion?.skillOccupation ===
                                          "No suggestions found" ||
                                        suggestion?.skillOccupation ===
                                          "Enter atleast 3 characters" ||
                                        !suggestion.skillOccupation
                                          ? "default"
                                          : "pointer"
                                      }`,
                                    }}
                                  >
                                    <td className=" w-100">
                                      {suggestion?.occupation &&
                                        suggestion.skillOccupation}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="text-center col-md-1 col-12 mb-2 mt-2">
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Or"
                      ) || {}
                    ).mvalue || "nf OR"}
                  </div>
                  <div
                    className=" m-0 p-0 text-underline col-md-4 col-12 text-md-start text-center mb-2"
                    style={{
                      zIndex: "9",
                      textDecoration: "Underline",
                      cursor: "pointer",
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#pmodal"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "FindSkillsByOccupation"
                      ) || {}
                    ).mvalue || "nf Find skills by Occupation"}
                  </div>
                </div>
              </div>
            )}
            {/* <button className="input-group-text h-75 my-0 py-0  me-1  "
        style={{
            backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecBarBgColor') || {}).mvalue || 'var(--primary-color)',
            color: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecBarFontColor') || {}).mvalue || '#F7FFDD',
            borderStyle: "solid",
            height: "38px"
        }}
        disabled={isAddingSkill}
        onClick={handleAddSkill}> +</button> */}

            {/* <div className="input-group my-2 py-0  mx-1 d-flex flex-column w-50 " >

          <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'YourSkills') || {}).mvalue || "nf Your Skills"}<span className='text-danger' >*</span></label>
          <input type="text" placeholder={isFocused ? '' : (content[selectedLanguage]?.find(item => item.elementLabel === 'AddSkill') || {}).mvalue || "not found"} onFocus={handleFocus} onBlur={handleBlur} className="buttom-line-input form-control w-100  me-2" value={SkillValue}
            onChange={(e) => handleChangeSkill(e)}
          />

          { isAddingSkill && <div style={{ transform: "translate(285px,-24px)", width: "50px" }}>
            <ThreeDots width={"30"} height={"10"} />
          </div>}


        </div> */}

            {/* <div className='d-flex   ' style={{zIndex:'999'}}>
          {suggestionLoader && <div className='d-flex justify-content-center align-items-center w-100 mb-1' style={{ height: "10px"  }}> <ThreeDots width={"30"} height={"10"} /> </div>}
        </div> */}
          </div>

          {/* OCCUPATION POPUP */}
          {isShowOccupationPopup && (
            <React.Fragment>
              <div
                class="modal modal-xl"
                tabindex="-1"
                role="dialog"
                style={{ display: "block" }}
              >
                <div
                  class="modal-dialog"
                  role="document"
                  style={{ marginTop: "5rem" }}
                >
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title fw-bold">Enter Occupation</h5>
                      <button
                        type="button"
                        class="close"
                        style={{ border: "none" }}
                        data-dismiss="modal"
                        aria-label="Close"
                        onClick={() => setIsShowOccupationPopup(false)}
                      >
                        <span aria-hidden="true">
                          <FaTimes />
                        </span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <CreateSelectOccupation
                        occupationData={setSelectedOccupation}
                        setIsNewOccupation={setIsNewOccupation}
                      />
                    </div>
                    <div class="modal-footer border-top-0">
                      <SecondaryBtnLoader
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Save&Close"
                            ) || {}
                          ).mvalue || "Save & Close"
                        }
                        backgroundColor="var(--primary-color)"
                        color="#F8F8E9"
                        onClick={handleOccupationSave}
                        loading={isSavingOccupation}
                      />
                      <SecondaryBtnLoader
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Close"
                            ) || {}
                          ).mvalue || "Close"
                        }
                        backgroundColor="var(--primary-color)"
                        color="#F8F8E9"
                        data-dismiss="modal"
                        onClick={() => setIsShowOccupationPopup(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* OCCUPATION POPUP */}
          {findByOcc && (
            <React.Fragment>
              <div
                class="modal"
                tabindex="-1"
                role="dialog"
                style={{ display: "block" }}
              >
                <div
                  class="modal-dialog"
                  role="document"
                  style={{ marginTop: "5rem" }}
                >
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title fw-bold">Enter Occupation</h5>
                      <button
                        type="button"
                        class="close"
                        style={{ border: "none" }}
                        data-dismiss="modal"
                        aria-label="Close"
                        onClick={() => setFindByOcc(false)}
                      >
                        <span aria-hidden="true">
                          <FaTimes />
                        </span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <CreateSelectOccupation
                        occupationData={setSelectedOccupation}
                        setIsNewOccupation={setIsNewOccupation}
                      />
                    </div>
                    <div class="modal-footer border-top-0">
                      <SecondaryBtnLoader
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Save&Close"
                            ) || {}
                          ).mvalue || "Save & Close"
                        }
                        backgroundColor="var(--primary-color)"
                        color="#F8F8E9"
                        onClick={handleOccupationSave}
                        loading={isSavingOccupation}
                      />
                      <SecondaryBtnLoader
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Close"
                            ) || {}
                          ).mvalue || "Close"
                        }
                        backgroundColor="var(--primary-color)"
                        color="#F8F8E9"
                        data-dismiss="modal"
                        onClick={() => setFindByOcc(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}

          {topSkill.status === "loading" ? (
            <>
              <div
                class="d-flex justify-content-center align-items-center "
                style={{ height: "180px" }}
              >
                <div
                  class="spinner-border"
                  style={{ width: "5rem", height: "5rem" }}
                  role="status"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {topSkill?.data?.length === 0 ? (
                <div
                  className=" table-responsive d-flex  font-5 "
                  style={{ height: "180px" }}
                >
                  <div className="d-flex justify-content-center align-items-center h-100 w-100">
                    <img
                      src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1710266618/61339543-skill_eevkrv.png"
                      alt=""
                      className="h-100 w-100"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className=" table-responsive d-flex"
                    style={{ width: "90%" }}
                    ref={scrollRef}
                  >
                    <table className="table table-sm d-flex    ">
                      <tbody
                        className=""
                        style={{ minWidth: "100%", position: "relative" }}
                      >
                        <tr
                          className="no-hover"
                          style={{
                            borderBottom: "2px solid gray",
                            position: "sticky",
                            top: "0px",
                            width: "100%",
                          }}
                        >
                          <th style={{ width: "12%" }}>
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Rank"
                              ) || {}
                            ).mvalue || "nf Rank"}
                          </th>
                          <th
                            className="text-start px-0  w-100  "
                            style={{ minWidth: "100%" }}
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "SkillName"
                              ) || {}
                            ).mvalue || "nf SkillName"}
                          </th>
                          <th
                            className="text-center  w-100  "
                            style={{ minWidth: "100%" }}
                          ></th>
                        </tr>

                        <SortableList />
                        <tr
                          className="no-hover no-border"
                          style={{
                            height: "25px",
                            border: "none",
                            borderBottom: 0,
                          }}
                        >
                          <td className="p-0"></td>
                          <td className="p-0"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* <div className='px-2 py-2 font-6 '>
                  <i>{(content[selectedLanguage]?.find(item => item.elementLabel === 'DragAndDropToReorderMyskills') || {}).mvalue || "not found"}</i>
                </div> */}
                </>
              )}
            </>
          )}
        </div>

        <div
          className="d-flex w-100 gap-2   p-4 pt-2  bg-white"
          style={{ position: "fixed", bottom: "10px", width: "100vw" }}
        >
          {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={() => setSelectedField('Education')} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Back') || {}).mvalue || "nf Back"}</button> */}
          {/* <button className='btn' style={{ backgroundColor: 'var(--primary-color)', color: 'white' , opacity:'.5' }} >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Next') || {}).mvalue || "nf Next"}</button> */}

          <DialogButton onClick={() => setSelectedField("Education")} />
        </div>
      </div>
    </>
  );
};

export default SkillFormForNewUser;
