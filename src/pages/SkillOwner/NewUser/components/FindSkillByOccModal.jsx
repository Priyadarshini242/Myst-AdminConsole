import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SkillSuggestionApi from "../../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { debouncedSendRequest } from "../../../../components/DebounceHelperFunction/debouncedSendRequest";
import { setMyReqSkills } from "../../../../reducer/SkillSeeker/SkillBasedSearch/MyRequirementSkillSlice";
import Loader from "../../../../components/Loader";
import { showWarningToast } from "../../../../components/ToastNotification/showWarningToast";
import { GoPlusCircle } from "react-icons/go";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import PostApi from "../../../../api/PostData/PostApi";
import { fetchTopSkill } from "../../../../api/fetchAllData/fetchTopSkill";
import { ThreeDots } from "react-loader-spinner";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import { FaSearch } from "react-icons/fa";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const FindSkillByOccModal = ({ handleScroll }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const navbarRef = useRef(null);
  const buttonRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  // store imports
  const topSkill = useSelector((state) => state.TopSkill);
  const scrollRef = useRef(null);

  //store imports
  const [occOpen, setOccOpen] = useState(false);

  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);

  const [locationForNewEmployment, setLocationForNewEmployment] = useState("");
  //search results
  const SkillBasedResult = useSelector((state) => state.SkillBasedResult);
  //my requiremnet
  const MyRequirement = useSelector((state) => state.MyRequirement);
  //refine my req
  const RefMyRequirements = useSelector((state) => state.RefMyRequirements);
  //Regional country Data
  const regionalData = useSelector((state) => state.regionalData);

  //Occupation Title
  const [occuTitle, setOccuTitle] = useState("");
  // occu sugge results
  const [occuSuggestions, setOccuSuggestions] = useState([]);

  //Occupation skills list left bar
  const [skillListInOccupation, setskillListInOccupation] = useState([]);

  //occupation skills list right bar
  const [occupationRightBox, setOccupationRightBox] = useState([]);
  const [suggestionLoader, setSuggestionLoader] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [exportOptions, setExportOptions] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [skillObj, setSkillObj] = useState({});

  //middle section view setting
  const [view, setView] = useState("card");
  //end refine to selectedRef
  const [SelectedRefSkillFilter, setSelectedRefSkillFilter] = useState([]);

  //my reqirements section open close
  const [collapsedMRSection, setCollapsedMRSection] = useState(false);
  //Suggestions inside skill search
  const [SkillSuggestions, setSkillSuggestions] = useState(false);
  //API store
  const [occuApiData, setOccuApiData] = useState([]);
  //occu loader
  const [occuApiLoading, setOccuApiLoading] = useState("none");

  const [occSuggLoader, setOccSuggLoader] = useState(false);

  const [addingSkill, setAddingskill] = useState(false);

  // auto suggestion for  occupations
  const handleChangeOccu = (e) => {
    const val = e.target.value;
    setOccuTitle(val);
    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setOccSuggLoader(true);
      setOccuSuggestions([]);
      SkillSuggestionApi(val, selectedLanguage, "occupation")
        .then((res) => {
          //console.log(res.data);
          // check res data length if empty pass No suggestions found
          if (res.data.length === 0) {
            setOccuSuggestions([{ occupation: "No suggestions found" }]);
          } else {
            setOccuSuggestions(
              res.data.filter(
                (tag, index, array) =>
                  array.findIndex((t) => t.occupation === tag.occupation) ===
                  index
              )
            );
          }
          setOccSuggLoader(false);
        })
        .catch((err) => {
          setOccSuggLoader(false);
          console.log(err);
        });
    } else {
      setOccuSuggestions([]);
    }
  };

  const isCheckedValidation = false; // 'false' is the default value

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const selectedValue = "0"; // '0' is the default value

  const [showOccBox, setShowOccBox] = useState(false);

  //right box
  const handleRemoveSkillOccu = (e) => {
    // remove from list of skills
    const obj = occupationRightBox?.find((skill) => skill.id === e.target.id);
    if (obj) {
      // Update the left box by removing the skill with the specified id
      setOccupationRightBox((prevList) =>
        prevList.filter((skill) => skill.id !== e.target.id)
      );

      // Update the right box by adding the skill to it
      setskillListInOccupation((prevRightBox) => [...prevRightBox, obj]);
    } else {
      console.error("Skill not found with id:", e.target.id);
      // Optionally, you can add error handling or notify the user about the issue.
    }
  };

  //Left box add btn handler
  const handleAddSkillOccu = (e) => {
    // Find the skill object with the provided id
    let obj = skillListInOccupation.find((skill) => skill.id === e.target.id);

    // Check if obj is not undefined before proceeding
    if (obj) {
      const name = obj.skill;
      obj = {
        ...obj,
        experience: selectedValue,
        required: false,
        validated: false,
        edit: false,
        mandatory: false,
        show: true,
        label: name,
      };
      // Update the left box by removing the skill with the specified id
      setskillListInOccupation((prevList) =>
        prevList.filter((skill) => skill.id !== e.target.id)
      );

      // Update the right box by adding the skill to it
      setOccupationRightBox((prevRightBox) => {
        // Ensure that the state is updated with the latest values
        const updatedList = [...prevRightBox, obj];
        return updatedList;
      });
    } else {
      console.error("Skill not found with id:", e.target.id);
      // Optionally, you can add error handling or notify the user about the issue.
    }
  };

  //occupation skill populate

  const occSkillPopulate = () => {
    if (MyRequirement.skillsInMyReq.length > 0) {
      setOccupationRightBox(MyRequirement.skillsInMyReq);
    }
  };

  //Populate Skills based On Occupation

  const occuSuggestionClickHandle = (suggestion) => {
    setOccuSuggestions([]);
    setOccuTitle(suggestion.occupation);
    console.log("sug", suggestion);
  };

  //Add occupation btn

  const plusBtnOccupation = async () => {
    setOccuApiLoading("loading");
    setOccOpen(true);

    if (occuTitle.length !== 0) {
      setShowOccBox(true);
      const data = await SkillSuggestionApi(
        occuTitle,
        selectedLanguage,
        "occupation"
      ).then((res) => {
        //console.log(res.data);
        setOccuApiLoading("success");
        // check res data length if empty pass No suggestions found
        return res.data;
      });

      setOccuApiData(data);
    } else {
      showWarningToast("No occupation is selected");
    }
  };
  useEffect(() => {
    setskillListInOccupation(occuApiData);
  }, [occuApiData]);

  //search occupation skill list filtering
  const occSkillFilter = (event) => {
    const value = event.target.value;
    //console.log("search value ", value);

    if (value !== "" && value !== "  ") {
      const filtered = occuApiData.filter((prev) =>
        prev.skill.toLowerCase().includes(value.toLowerCase())
      );
      setskillListInOccupation(filtered);
    } else {
      setskillListInOccupation(occuApiData);
    }
  };

  // save occupation

  const handleSaveOccu = () => {
    setOccOpen(false);
    dispatch(setMyReqSkills(occupationRightBox));
    setOccuSuggestions([]);
    setOccuTitle([]);
    setOccupationRightBox([]);
    setShowOccBox(false);
    setskillListInOccupation([]);
    setOccuApiData([]);
  };

  console.log(topSkill);

  const handleAddSkill = async () => {
    console.log(occupationRightBox);

    if (!occupationRightBox.length > 0) {
      showWarningToast("Please Select Skills");
      return;
    }

    // check if the skill is already added in particular selected language
    let unique = [];
    if (topSkill.data.length > 0) {
      const isInTopSkills = (rightboxitem) => {
        return topSkill?.data?.some(
          (ts) => ts.skillOccupation === rightboxitem.skillOccupation
        );
      };

      // Compute unique items present in array1 but not in array2
      unique = occupationRightBox.filter(
        (rightboxitem) => !isInTopSkills(rightboxitem)
      );

      console.log(unique);
    } else {
      unique = occupationRightBox;
    }

    setAddingskill(true);

    try {
      const promises = unique.map(async (skill, i) => {
        const findRank = topSkill.data.filter(
          (item) => item.mlanguage === selectedLanguage
        );

        const newUserSkill = {
          skillOccupation: skill.skillOccupation,
          mlanguage: selectedLanguage,
          userRank: findRank.length + (i + 1),
          yoe: "0",
          userId:getCookie("userId"),
          occupation: skill.occupation,
          occupationId: skill.occupationId,
          skill: skill.skill,
          skillId: "",
        };

        const response = await PostApi("User Skills", newUserSkill);

        return response.json();
      });

      const results = await Promise.all(promises);

      dispatch(fetchTopSkill());

      setAddingskill(false);

      setOccOpen(false);
      setOccuSuggestions([]);
      setOccuTitle([]);
      setOccupationRightBox([]);
      setShowOccBox(false);
      setskillListInOccupation([]);
      setOccuApiData([]);
      if (handleScroll) {
        handleScroll();
      }
    } catch (err) {
      console.log(err);
      dispatch(fetchTopSkill());
      setAddingskill(false);
      setOccOpen(false);
      setOccuSuggestions([]);
      setOccuTitle([]);
      setOccupationRightBox([]);
      setShowOccBox(false);
      setskillListInOccupation([]);
      setOccuApiData([]);

      // showErrorToast('Something Went Wrong')
    }

    // const findRank = topSkill.data.filter(item => item.mlanguage === selectedLanguage);

    // const newUserSkill = {
    //     skillOccupation: SkillValue, mlanguage: selectedLanguage, userRank: findRank.length + 1, yoe: "0", userId:getCookie("userId"),
    //     occupation: skillRecord.occupation, occupationId: skillRecord.occupationId, skill: skillRecord.skill, skillId: ""
    // }

    // // if already request is pending then return
    // if (isAddingSkill) {
    //     return;
    // }
    // setIsAddingSkill(true);

    // PostApi("User Skills", newUserSkill).then((res) => {
    //     const data = res?.data;
    //     if (isNewSkill && !data?.occupationId) {
    //         handleInsertNewSkill(data?.skill, data?.occupation, data?.skillOccupation, data?.mlanguage, data?.applicationName, data?.skill, data?.id);
    //     }

    //     dispatch(addNewTopSkill(res.data))
    //     dispatch(setMySkill(res.data))
    //     setSelectedOccupation(null);
    //     setIsNewSkill(false);
    //     setIsNewOccupation(false);
    //     setSkillValue("");
    // }).catch((err) => {
    //     console.error(err);
    //     showErrorToast("Something went wrong");
    // }).finally(() => {
    //     setIsAddingSkill(false);
    //     handleScroll()
    // })
  };

  return (
    <div
      class="modal fade modal-lg mt-5"
      id="pmodal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">
              {" "}
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "FindSkillsByOccupation"
                ) || {}
              ).mvalue || "nf Find skills by Occupation"}
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={buttonRef}
              onClick={() => {
                setOccOpen(false);
                setOccuSuggestions([]);
                setOccuTitle([]);
                setOccupationRightBox([]);
                setShowOccBox(false);
                setskillListInOccupation([]);
                setOccuApiData([]);
              }}
            ></button>
          </div>
          <div class="modal-body" style={{ minHeight: "50vh" }}>
            {/* search bar for occupation */}
            <div className="d-flex  justify-content-center align-items-start w-100 mb-4 ">
              <div className="input-group w-100 d-flex  justify-content-center  ">
                <div
                  className="d-flex flex-column   w-50 h-100 "
                  style={{ position: "relative" }}
                >
                  <input
                    type="text"
                    placeholder={isFocused ? "" : "Enter an occupation   "}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ height: "2.5rem" }}
                    className="form-control w-100  bg-body-tertiary font-5"
                    onChange={(e) => handleChangeOccu(e)}
                    value={occuTitle}
                  />
                  {occSuggLoader && (
                    <div
                      style={{
                        transform: "translate(285px,-24px)",
                        width: "50px",
                      }}
                    >
                      <ThreeDots width={"30"} height={"10"} />
                    </div>
                  )}

                  {/* suggestion list */}
                  {occuSuggestions.length > 0 && (
                    <div
                      className="dropdown-menu table-responsive d-flex font-5 m-0 py-0 w-100"
                      style={
                        !occOpen
                          ? {
                              maxHeight: "130px",

                              width: "100%",
                              position: "absolute",
                              top: "100%",
                            }
                          : {
                              maxHeight: "130px",

                              width: "100%",
                              position: "absolute",
                              top: "100%",
                            }
                      }
                    >
                      <table
                        className="table table-sm  table-hover px-0  py-0 "
                        style={{ width: "100%" }}
                      >
                        <tbody className="font-5 bg-danger w-100">
                          {occuSuggestions.map((suggestion, index) => (
                            <tr
                              key={index}
                              className=" w-100"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                occuSuggestionClickHandle(suggestion)
                              }
                            >
                              <td className="w-100 ">
                                <div>{suggestion.occupation}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <button
                  className="input-group-text  me-1   "
                  onClick={plusBtnOccupation}
                  style={{
                    backgroundColor:
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SecBarBgColor"
                        ) || {}
                      ).mvalue || "var(--primary-color)",
                    color: "white",
                    borderStyle: "solid",
                    borderColor: "",
                    height: "2.5rem",
                  }}
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            {/*main body*/}
            {showOccBox && (
              <div
                className="d-flex justify-content-around   "
                style={{ height: "60vh", overflow: "hidden" }}
              >
                {/* left box */}
                <div
                  style={{
                    border: "solid 3px var(--primary-color)",
                    borderRadius: "10px",
                    width: "47%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      height: "28px",
                    }}
                    className="d-flex justify-content-center w-auto  "
                  >
                    Select the skills
                  </div>

                  <div
                    className="px-2 py-1 "
                    style={{
                      border: "solid 1px",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                    }}
                  >
                    <input
                      placeholder="Search for skills "
                      onChange={(event) => occSkillFilter(event)}
                      className="w-100 mb-1 form-control"
                    />
                  </div>
                  {/* Listing of Skills */}
                  <div
                    className="overflow-x-hidden overflow-y-auto "
                    style={{ height: "84%" }}
                  >
                    {occuApiLoading === "loading" && (
                      <div className="">
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
                      </div>
                    )}
                    {occuApiLoading === "success" &&
                      skillListInOccupation.length > 0 && (
                        <div className="mx-0 mb-1 d-flex flex-column">
                          {skillListInOccupation.length > 0 &&
                            skillListInOccupation
                              .sort((a, b) =>
                                a.skill.localeCompare(b.skill, undefined, {
                                  sensitivity: "base",
                                })
                              )
                              .map((skill, index) => (
                                <div
                                  id={skill.id}
                                  onClick={handleAddSkillOccu}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div
                                    className="  mx-1 d-flex align-items-center justify-content-between"
                                    style={{
                                      borderStyle: "solid",
                                      borderWidth: "1px",
                                      color: "black",
                                      padding: "3px 6px",
                                      fontSize: "15px",
                                      borderTop: "none",
                                      borderLeft: "none",
                                      borderRight: "none",
                                    }}
                                    id={skill.id}
                                  >
                                    <div className=" me-2" id={skill.id}>
                                      {skill.skill}
                                    </div>
                                    <GoPlusCircle
                                      style={{ color: "" }}
                                      id={skill.id}
                                    />
                                  </div>
                                </div>
                              ))}
                        </div>
                      )}
                    {occuApiLoading === "success" &&
                      skillListInOccupation.length === 0 && (
                        <div className="d-flex justify-content-center ">
                          No Skills available
                        </div>
                      )}
                  </div>
                </div>

                {/* right box */}

                <div
                  style={{
                    border: "solid 3px var(--primary-color)",
                    borderRadius: "10px",
                    width: "47%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      height: "28px",
                    }}
                    className="d-flex justify-content-center w-auto  "
                  >
                    Selected skills{" "}
                  </div>

                  <div
                    className="overflow-x-hidden overflow-y-auto "
                    style={{ height: "91%" }}
                  >
                    {occupationRightBox.length > 0 &&
                      occupationRightBox.map(
                        (skill, index) =>
                          skill !== undefined && (
                            <div onClick={handleRemoveSkillOccu} id={skill.id}>
                              <div
                                className=" mx-1 d-flex align-items-center justify-content-between"
                                style={{
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  color: "black",
                                  padding: "3px 6px",
                                  fontSize: "15px",
                                  borderTop: "none",
                                  borderLeft: "none",
                                  borderRight: "none",
                                }}
                                id={skill.id}
                              >
                                <div className="me-2 " id={skill.id}>
                                  {skill.skill}
                                </div>
                                <div
                                  className="align-items-baseline btn-close"
                                  id={skill.id}
                                ></div>
                              </div>
                            </div>
                          )
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="modal-footer">
            <SecondaryBtnLoader
              label={"Cancel"}
              onClick={() => {
                setOccOpen(false);
                setOccuSuggestions([]);
                setOccuTitle([]);
                setOccupationRightBox([]);
                setShowOccBox(false);
                setskillListInOccupation([]);
                setOccuApiData([]);
              }}
            />
            <SecondaryBtnLoader
              onClick={handleAddSkill}
              label={"Save"}
              loading={addingSkill}
              Active={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindSkillByOccModal;
