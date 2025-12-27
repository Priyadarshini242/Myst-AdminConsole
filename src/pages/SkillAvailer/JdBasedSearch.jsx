import React, { useEffect, useRef, useState } from "react";
import NavbarA from "../../components/SkillAvailer/NavbarA";
import RightSideBar from "../../components/RightSideBar";
import skillsData from "../../skills.json";
import UserCardA from "../../components/SkillAvailer/UserCardA";
import { LiaFileExportSolid } from "react-icons/lia";
import user from "../../Images/user.jpeg";
import placeholderImage from "../../Images/avatar-placeholder.webp";
import Footer from "../../components/Footer";
import { MdDelete, MdEdit, MdVerifiedUser } from "react-icons/md";
import { IoMdAnalytics, IoMdArrowDropdown } from "react-icons/io";
import PremiumService from "../../components/SkillOwner/PremiumServices/PremiumService";
import { pdfjs } from "react-pdf";
import extractTextFromPDF from "../../components/SkillAvailer/helperFunction/extractTextFromPDF";
import { useSelector } from "react-redux";
import FileuploadJd from "../../components/SkillAvailer/FileUploadJd";
import { AiOutlinePlusCircle } from "react-icons/ai";
import PremiumServicesOptionsAvailor from "../../components/PremiumServicesOptionsAvailor";
import { showWarningToast } from "../../components/ToastNotification/showWarningToast";
import { useDispatch } from "react-redux";
import { fetchUsersBasedOnSkillSearch } from "../../api/SkillSeeker/fetchUsersBasedOnSkillSearch";
import ResultMIddlePanel from "./ResultMIddlePanel";

// to read pdf content using react-pdf for parse JD
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const JdBasedSearch = () => {
  const dispatch = useDispatch();

  //stores

  const active = {
    backgroundColor: "#EFF5DC",
    borderStyle: "solid",
    borderColor: "var(--primary-color)",
    color: "var(--primary-color)",
  };
  const Inactive = {
    backgroundColor: "white",
    borderStyle: "solid",
    color: "var(--primary-color)",
    borderColor: "var(--primary-color)",
  };

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const skills = skillsData.skills; // Access the skills from the imported JSON data
  const [isFocused, setIsFocused] = useState(false);
  const [listView, setListView] = useState(true);
  const [exportOptions, setExportOptions] = useState(false);
  const [checkSkillEntered, setCheckSkillEntered] = useState(false);
  const [selectedValue, setSelectedValue] = useState("0"); // '0' is the default value
  const [isChecked, setIsChecked] = useState(false); // 'false' is the default value
  const [isCheckedValidation, setIsCheckedValidation] = useState(false); // 'false' is the default value
  const [view, setView] = useState("list");
  const [SkillSuggestions, setSkillSuggestions] = useState(false);

  const [skillsInResult, setSkillsInResult] = useState([]);

  //search results
  const SkillBasedResult = useSelector((state) => state.SkillBasedResult);

  useEffect(() => {
    if (!listView) {
      // Load the Google Maps API asynchronously
      const loadGoogleMapsApi = () => {
        const script = document.createElement("script");
        script.src =
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyA3xT1NvrKVStpm40Eo1T0fB3BUhPVSs9s&callback=initMap";
        script.defer = true;
        script.async = true;
        document.body.appendChild(script);
      };

      // Initialize the map and add markers
      window.initMap = () => {
        const map = new window.google.maps.Map(
          document.getElementById("googleMap"),
          {
            center: { lat: 30.213544, lng: -97.659122 },
            zoom: 8,
          }
        );

        // Coordinates for multiple markers
        const markerCoordinates = [
          { lat: 30.213544, lng: -97.659122 },
          { lat: 30.729899, lng: -97.588213 },
          { lat: 30.267153, lng: -97.7430608 },
          { lat: 33.006231, lng: -98.950518 },
          { lat: 32.562888, lng: -101.850909 },
          { lat: 31.407436, lng: -97.192705 },
          { lat: 30.638819, lng: -99.255278 },
        ];

        // Add markers to the maps
        markerCoordinates?.forEach((coordinate) => {
          new window.google.maps.Marker({
            position: coordinate,
            map: map,
          });
        });
      };

      // Load Google Maps API and initialize the map
      loadGoogleMapsApi();
    }
  }, [listView]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Display suggestions only when there are at least 2 characters
    if (value.length >= 2) {
      // Filter skills based on the input value
      const filteredSkills = skills.filter((skill) =>
        skill.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSkills);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
    setCheckSkillEntered(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleListView = () => {
    setListView(true);
  };

  const handleMapView = () => {
    setListView(false);
  };

  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const [listOfSkills, setListOfSkills] = useState([]);

  const handleAddAnotherSkill = () => {
    // setListOfSkills([...listOfSkills, { skill: inputValue, experience: selectedValue, required: isChecked, validated: isCheckedValidation, edit: false }])
    setExtractedSkills([
      ...extractedSkills,
      {
        skill: inputValue,
        experience: selectedValue,
        required: isChecked,
        validated: isCheckedValidation,
        edit: false,
        addToList: false,
      },
    ]);
    console.log(listOfSkills);
    setInputValue("");
    setSuggestions([]);
    setCheckSkillEntered(false);
  };

  const handleCloseModel = () => {
    setInputValue("");
    setSuggestions([]);
    setCheckSkillEntered(false);
  };

  const handleRemoveListOfSkill = (id) => {
    console.log(id);
    // remove from list of skills
    const updatedList = listOfSkills.filter(
      (skill, index) => index !== parseInt(id)
    );
    setListOfSkills(updatedList);
  };

  const handleSuggestion = () => {
    if (suggestions.length === 0) {
      setSuggestions([
        "react",
        "javascript",
        "spring boot",
        "bootstrap",
        "Next js",
        "tailwind css",
      ]);
    } else if (suggestions.length > 0) {
      setSuggestions([]);
    }
  };

  const [selected, setselected] = useState("");
  const [fileupload, setFileupload] = useState(false);
  const [files, setFiles] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [closeSaveJD, setCloseSaveJD] = useState(false);

  const extractSkillsFromText = (text) => {
    const skills = [];
    const skillKeywords = [
      "JavaScript",
      "React",
      "Node.js",
      "HTML",
      "CSS",
      "java",
      "spring boot",
    ];

    skillKeywords?.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(text)) {
        skills.push({
          skill: keyword,
          experience: "0",
          required: false,
          validated: false,
          addToList: false,
          edit: false,
        });
      }
    });

    return skills;
  };

  const uploadFile = async () => {
    const textContent = await extractTextFromPDF(files[0].preview);
    console.log(textContent);
    const fileSkills = extractSkillsFromText(textContent);

    console.log(fileSkills);
    setExtractedSkills(fileSkills);
    setFileupload(false);
  };
  useEffect(() => {
    console.log("ExtractedSkills List ", extractedSkills);
  }, [extractedSkills]);

  const handleInputChangeForResumeParser = (event, index) => {
    const { name, value, type, checked } = event.target;

    setExtractedSkills((prevSkills) => {
      const updatedSkills = [...prevSkills];
      const skill = updatedSkills[index];

      if (type === "checkbox") {
        if (name === "required") {
          skill["addToList"] = checked;
        }
        skill[name] = checked;
      } else {
        skill[name] = value;
      }

      return updatedSkills;
    });
  };

  const handleRemoveListOfSkillParse = (id) => {
    console.log(id);
    // remove from list of skills
    const updatedList = extractedSkills.filter(
      (skill, index) => index !== parseInt(id)
    );
    setExtractedSkills(updatedList);
  };

  const handleAccordion1 = (event) => {
    event.stopPropagation();
    const target = document.getElementById("panelsStayOpen-collapseOne");
    if (target.classList.contains("show")) {
      target.classList.remove("show");
    } else {
      target.classList.add("show");
    }
  };

  const handleAccordion2 = (event) => {
    event.stopPropagation();
    const target = document.getElementById("panelsStayOpen-collapseTwo");
    if (target.classList.contains("show")) {
      target.classList.remove("show");
    } else {
      target.classList.add("show");
    }
  };

  // store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);

  // temporary
  const [showSearch, setShowSearch] = useState(false);
  const [editJd, setEditJd] = useState(false);

  const apiBodyUpdate = () => {
    return new Promise((resolve) => {
      const mandatorySkills = [];
      const optionalSkills = [];
      //const location = [];
      extractedSkills?.forEach((skill) => {
        if (skill?.show === true) {
          if (skill?.mandatory === true) {
            mandatorySkills?.push(skill.label);
          } else {
            optionalSkills?.push(skill.label);
          }
        }
      });
      // MyRequirement.locationsInMyReq?.forEach((loc) => {
      //     location.push(loc.value);
      // })
      const bod = {
        mandatorySkills: mandatorySkills,
        optionalSkills: optionalSkills,
        // location: location,
      };
      console.log("bod ", bod);
      resolve(bod);
    });
  };

  // const apiBodyUpdateForRef = () => {
  //     return new Promise((resolve) => {
  //         const mandatorySkills = [];
  //         const optionalSkills = [];
  //         const location = [];
  //         RefMyRequirements.skillsInRefined?.forEach((skill) => {

  //             if (skill.show === true) {
  //                 if (skill.mandatory === true) {
  //                     mandatorySkills.push(skill.label);

  //                 } else {
  //                     optionalSkills.push(skill.label);

  //                 }
  //             }
  //         });
  //         RefMyRequirements.locationsInRefined?.forEach((loc) => {
  //             location.push(loc.value);
  //         })
  //         const bod = {
  //             mandatorySkills: mandatorySkills,
  //             optionalSkills: optionalSkills,
  //             location: location,
  //         };
  //         console.log("bod ", bod);
  //         resolve(bod);
  //     });
  // };

  //clicking on search button
  const handleSkillSearch = async () => {
    console.log(extractedSkills);
    let bod;
    if (extractedSkills?.length === 0) {
      showWarningToast("Please Enter a skill");
      return;
    }
    try {
      bod = await apiBodyUpdate();

      //api caller
      dispatch(fetchUsersBasedOnSkillSearch(bod)).then((res) => {
        // const collapseTwo = document.getElementById('panelsStayOpen-collapseTwo');
        //  setCollapsedMRSection(true);
        // updateSkillFilter();
        // setSelectedRefSkillFilter(
        //     MyRequirement.skillsInMyReq.map((skill) => ({
        //         ...skill,
        //         value: skill?.skillOccupation,
        //         label: skill?.skillOccupation,
        //         // Add other properties as needed
        //     }))
        // );
        // collapseTwo.classList.add('show');
      });
      // else if (MyRequirement.locationsInMyReq.length === 0) {
      //     showWarningToast("Please Enter a location");
      //     return;
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="d-print-none">
        {/* modal */}
        <div
          class="modal fade"
          id="exampleModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div
            class="modal-dialog"
            style={{
              backgroundColor:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NavBarBgColor"
                  ) || {}
                ).mvalue || "#000",
              color:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "NavBarFontColor"
                  ) || {}
                ).mvalue || "#000",
            }}
          >
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">
                  Job Description
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  onClick={handleCloseModel}
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div>
                  {/* <div className=' pill-bg-color text-white p-1 px-2  rounded-pill   '>{jobTitle}</div> */}

                  {listOfSkills.length > 0 && (
                    <div>
                      <table className="table-sm table">
                        <thead>
                          <tr>
                            <th>Skill</th>
                            <th>Experience</th>
                            <th>Mandatory</th>
                            <th>Validated?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listOfSkills.map((skill, index) => (
                            <tr key={index}>
                              <td>{skill.skill}</td>
                              <td>{skill.experience}</td>
                              <td>{skill.required === true ? "Yes" : "No"} </td>
                              <td>
                                {skill.validated === true ? "Yes" : "No"}{" "}
                              </td>
                              <td
                                onClick={handleRemoveListOfSkill}
                                id={index}
                                className="btn-close"
                              ></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-2 ">
                    <div className="d-flex justify-content-between px-1 align-items-center   ">
                      <label for="exampleFormControlInput1" class="form-label">
                        Skill <span className="text-danger">*</span>
                      </label>
                      {suggestions.length === 0 &&
                        isFocused &&
                        inputValue.length >= 2 &&
                        !skills.includes(inputValue) && (
                          <i
                            style={{ color: "var(--primary-color)" }}
                            className="font-6"
                          >
                            Nothing found
                          </i>
                        )}
                      {suggestions.length === 0 &&
                        isFocused &&
                        inputValue.length <= 2 && (
                          <i
                            style={{ color: "var(--primary-color)" }}
                            className="font-6"
                          >
                            Enter at least 2 characters
                          </i>
                        )}
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        class="form-control bg-body-secondary "
                        id="exampleFormControlInput1"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder=""
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                      <button
                        className="btn border  "
                        onClick={handleSuggestion}
                      >
                        <IoMdArrowDropdown />
                      </button>
                    </div>
                    {suggestions.length > 0 && (
                      <div
                        className=" table-responsive d-flex  font-5  bg-white border w-auto   "
                        style={{
                          maxHeight: "170px",
                          position: "absolute",
                          zIndex: 999,
                        }}
                      >
                        <table className="table table-sm d-flex table-hover table-borderless  ">
                          <tbody className="font-5 w-100 ">
                            {suggestions.map((suggestion, index) => (
                              <tr
                                key={index}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                              >
                                <td className=" ">{suggestion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {checkSkillEntered && (
                    <div>
                      <div class="my-2   px-1  ">
                        <div className="d-flex align-items-center">
                          <div>
                            <label htmlFor="" className="pe-2">
                              Experience
                            </label>
                          </div>
                          <div>
                            <select
                              className="border-0 px-1"
                              style={{ color: "var(--primary-color)" }}
                              aria-label="Default select example"
                              value={selectedValue}
                              onChange={(e) => setSelectedValue(e.target.value)}
                            >
                              <option value="No Experience">
                                No Experience
                              </option>
                              <option value="less than a year">
                                Less than a year
                              </option>
                              <option value="1 - 3 years">1 - 3 years</option>
                              <option value="More than 3 years">
                                More than 3 years
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckChecked"
                        >
                          Mandatory Skill
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="flexSwitchCheckChecked"
                          checked={isChecked}
                          onChange={() => setIsChecked(!isChecked)}
                        />
                      </div>
                      <div className="form-check form-switch">
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckChecked1"
                        >
                          Validation
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="flexSwitchCheckChecked1"
                          checked={isCheckedValidation}
                          onChange={() =>
                            setIsCheckedValidation(!isCheckedValidation)
                          }
                        />
                      </div>

                      <div className="mt-2 d-flex  ">
                        <button
                          type="button"
                          className="btn  me-2 font-5 primary-green"
                          style={{
                            backgroundColor: "#F7FFDD",
                            color: "var(--primary-color)",
                          }}
                          onClick={handleAddAnotherSkill}
                        >
                          Add another Skill
                        </button>
                        {/* {listOfSkills.length === 0 && */}
                        <div>
                          <button
                            type="button"
                            className="btn  me-2 font-5 primary-green"
                            style={{
                              backgroundColor: "#F7FFDD",
                              color: "var(--primary-color)",
                            }}
                            data-bs-dismiss="modal"
                            onClick={handleAddAnotherSkill}
                          >
                            Save
                          </button>
                          {/* <button type="button" className="btn text-white font-5" style={{ backgroundColor: "var(--primary-color)" }} >Search</button> */}
                        </div>
                        {/* } */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div class="modal-footer"></div>
            </div>
          </div>
        </div>

        {/* second modal for save JD name */}
        {closeSaveJD && (
          <div class="modal show d-block " tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Save Job Description</h5>
                  <button
                    type="button"
                    class="btn-close"
                    onClick={() => setCloseSaveJD(false)}
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <label for="exampleFormControlInput1" class="form-label">
                      Enter a name to save JD
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleFormControlInput1"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn text-white font-5"
                    style={{ backgroundColor: "var(--primary-color)" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={navbarRef} id="yourNavbarId">
          <NavbarA />

          <hr className="p-0 m-0 " />
        </div>

        <div
          styl={{ backgroundColor: "#", minHeight: "", height: "" }}
          className="container-fluid  h6 "
        >
          <div className=" row  gap-0    ">
            {/* Left side bar */}
            <div className="px-1 col-lg col-sm-12  font-5 fixed-sidebar   rounded d-flex flex-column justify-content-between ">
              <div className=" font-5 fixed-sidebar   rounded d-flex flex-column ">
                <div
                  className="mt-2 px-2 mb-2   rounded-top  d-flex align-items-center justify-content-between  "
                  style={{
                    backgroundColor:
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "NavBarBgColor"
                        ) || {}
                      ).mvalue || "#000",
                    color:
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "NavBarFontColor"
                        ) || {}
                      ).mvalue || "#fff",
                  }}
                >
                  <div
                    className="text h6 text-center mt-2   "
                    style={{ padding: " ", cursor: "pointer" }}
                  >
                    Opportunity Profiles
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-center font-2 "
                    style={{ cursor: "pointer" }}
                    onClick={() => setFileupload(true)}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Add New JD"
                  >
                    <AiOutlinePlusCircle />
                  </div>
                </div>

                <div
                  className=" table-responsive   font-5 "
                  style={{ height: "180px" }}
                >
                  <>
                    <table className="table-sm table  ">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>JD Name</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          className=" "
                          onClick={() =>
                            setExtractedSkills([
                              {
                                skill: "React",
                                experience: "1",
                                required: true,
                                validated: true,
                                edit: false,
                              },
                              {
                                skill: "Javascript",
                                experience: "0",
                                required: false,
                                validated: false,
                                edit: false,
                              },
                            ])
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <td>1</td>
                          <td>React Developer</td>
                          <td>
                            <span class="badge text-bg-warning">Pending</span>
                          </td>
                          <td className="d-flex align-items-center h-100  ">
                            <button
                              className=" btn-sm  px-1 py-1  m-0   border-0 bg-white   "
                              style={{}}
                              onClick={() => setEditJd(!editJd)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className=" btn-sm  px-1 py-1  m-0   border-0 bg-white   "
                              style={{}}
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                        <tr
                          onClick={() =>
                            setExtractedSkills([
                              {
                                skill: "Java",
                                experience: "0",
                                required: false,
                                validated: false,
                                edit: false,
                              },
                            ])
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <td>2</td>
                          <td>Java Developer</td>
                          <td>
                            <span class="badge text-bg-success">Done</span>
                          </td>
                          <td className="d-flex align-items-center ">
                            <button
                              className=" btn-sm  px-1 py-1  m-0   border-0 bg-white   "
                              style={{}}
                              onClick={() => setEditJd(!editJd)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className=" btn-sm  px-1 py-1  m-0   border-0 bg-white   "
                              style={{}}
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                </div>
              </div>

              <div className="px-3 py-3 font-6"></div>
              <div class="mb-0" style={{ bottom: "0" }}>
                <PremiumServicesOptionsAvailor />
              </div>

              <div
                class="accordion accordion-flush mb-5 "
                id="accordionPanelsStayOpenExample"
              >
                {/* <div class="accordion-item">
                                    <h2 class="accordion-header rounded-top-2 ">
                                        <button class="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-main" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne" style={{ backgroundColor: "#F7FFDD", color: "var(--primary-color)" }} >
                                            <div className='d-flex justify-content-between  w-100   ' >
                                                <div>
                                                    Opportunity Profiles
                                                </div>
                                                <div className='d-flex  mx-2 align-items-center justify-content-center font-2 ' style={{ cursor: "pointer", color: "var(--primary-color)" }} onClick={() => setFileupload(true)} data-tooltip-id="my-tooltip" data-tooltip-content="Add New JD" >
                                                    <AiOutlinePlusCircle />
                                                </div>
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-main" class="accordion-collapse collapse show">
                                        <div class="accordion-body px-0  ">



                                        </div>
                                    </div>
                                </div> */}
                {/* <div class="accordion-item">
                                    <h2 class="accordion-header rounded-top-2 ">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo" style={{ backgroundColor: "#F7FFDD", color: "var(--primary-color)" }} >
                                            Filter
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse">
                                        <div class="accordion-body px-0 ">

                                           
                                        </div>
                                    </div>
                                </div> */}
              </div>
            </div>

            <hr className="vr m-0 p-0" />

            {/* Middle Sections */}

            <div
              className=" col-lg-7 col-sm-12 rounded bg-white     font-5 overflow-y-auto   "
              style={{ height: contentHeight }}
            >
              <div className="d-flex align-items-center justify-content-end mb-2  ">
                {selected === "no" && (
                  <>
                    <div className="btn-group  ">
                      <button
                        className="btn text-start font-6  ms-1   "
                        type="button"
                        style={listView ? active : Inactive}
                        onClick={handleListView}
                      >
                        List view
                      </button>
                      <button
                        className="btn text-start font-6    "
                        type="button"
                        style={listView ? Inactive : active}
                        onClick={handleMapView}
                      >
                        Map view
                      </button>
                    </div>

                    <div class="btn-group dropend">
                      <button
                        className="border-0    bg-white"
                        data-bs-toggle="tooltip"
                        data-placement="end"
                        title="Export"
                        onClick={() => setExportOptions(!exportOptions)}
                      >
                        <LiaFileExportSolid style={{ fontSize: "30px" }} />
                      </button>
                    </div>
                  </>
                )}

                {exportOptions && (
                  <ul
                    class=" show p-0 m-0 "
                    style={{ minWidth: "116px", left: "33px" }}
                  >
                    <div className="btn-group  ">
                      <button
                        className="btn text-start font-6  ms-1   "
                        type="button"
                        style={{
                          backgroundColor: "#EFF5DC",
                          borderStyle: "solid",
                          borderColor: "var(--primary-color)",
                          color: "var(--primary-color)",
                        }}
                      >
                        Excel
                      </button>
                      <button
                        className="btn text-start font-6    "
                        type="button"
                        style={{
                          backgroundColor: "white",
                          borderStyle: "solid",
                          color: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                        }}
                      >
                        CSV
                      </button>
                      <button
                        className="btn text-start font-6    "
                        type="button"
                        style={{
                          backgroundColor: "white",
                          borderStyle: "solid",
                          color: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                        }}
                      >
                        PDF
                      </button>
                    </div>
                  </ul>
                )}
              </div>

              {/* cards */}
              <div>
                <div id="map" style={{ height: "0", width: "100%" }}></div>

                {selected === "no" && (
                  <>
                    {listView && (
                      <>
                        <UserCardA
                          name="David Marcos"
                          image={user}
                          email="david@gmail.com"
                          phone="5710838457"
                        />
                        <UserCardA
                          name="Confidential"
                          image={placeholderImage}
                          email="****@gmail.com"
                          phone="57********"
                        />
                      </>
                    )}
                    {!listView && (
                      <div
                        id="googleMap"
                        style={{ width: "100%", height: "77vh" }}
                      ></div>
                    )}
                  </>
                )}

                {selected === "PremiumService" && (
                  <>
                    {/* back button */}
                    <button
                      className="input-group-text  mt-4   ms-1 primary-green "
                      style={{
                        backgroundColor: "#",
                        color: "var(--primary-color)",
                        borderStyle: "solid",
                        borderColor: "",
                      }}
                      onClick={() => setselected("")}
                    >
                      Back
                    </button>
                    <PremiumService />
                  </>
                )}
                {selected === "" && (
                  <>
                    {(extractedSkills.length > 0 ||
                      listOfSkills.length > 0) && (
                      <>
                        <div
                          className="d-flex flex-column "
                          style={{ width: "100%" }}
                        >
                          <div
                            className="accordion     "
                            id="accordionPanelsStayOpenExample"
                          >
                            <div className="accordion-item border-0  mb-2 rounded-top  ">
                              <h2
                                className="accordion-header  "
                                style={{ height: "" }}
                              >
                                <button
                                  className="accordion-button d-block d-lg-flex   py-2    justify-content-between "
                                  onClick={handleAccordion1}
                                  style={{
                                    backgroundColor:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarBgColor"
                                        ) || {}
                                      ).mvalue || "#000",
                                    color:
                                      (
                                        content[selectedLanguage]?.find(
                                          (item) =>
                                            item.elementLabel ===
                                            "NavBarFontColor"
                                        ) || {}
                                      ).mvalue || "#fff",
                                  }}
                                  class="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#panelsStayOpen-collapseOne"
                                  aria-expanded="false"
                                  aria-controls="panelsStayOpen-collapseOne"
                                >
                                  Job Description
                                </button>
                              </h2>
                              <div
                                id="panelsStayOpen-collapseOne"
                                className="accordion-collapse   collapse show"
                              >
                                <div>
                                  <div className="d-flex  justify-content-between align-items-center mt-1 ">
                                    <div className="d-flex mx-1  my-2 align-items-center  ">
                                      <b>JD Name:</b>{" "}
                                      {editJd ? (
                                        <input
                                          type="text"
                                          className="form-control w-auto  ms-1 "
                                          style={{
                                            height: "24px",
                                            width: "70px",
                                          }}
                                          value={"React Developer"}
                                        />
                                      ) : (
                                        "React Developer"
                                      )}
                                    </div>
                                    <div>
                                      <button
                                        className="btn  mt-1     ms-1 primary-green "
                                        style={{
                                          backgroundColor: "#",
                                          color: "var(--primary-color)",
                                          borderStyle: "solid",
                                          borderColor: "",
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#exampleModal"
                                      >
                                        Add New Skill
                                      </button>
                                    </div>
                                  </div>

                                  <div className="ms-1 d-flex   ">
                                    <div>
                                      <b>Status: </b>{" "}
                                      {editJd ? (
                                        <select
                                          class="  border-0  "
                                          style={{
                                            color: "var(--primary-color)",
                                          }}
                                          aria-label="Default select example"
                                        >
                                          <option selected>Pending</option>
                                          <option value="Done">Done</option>
                                        </select>
                                      ) : (
                                        <span class="badge text-bg-warning">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                    <div className="ms-5">
                                      <i>
                                        <b>Date Created:</b>{" "}
                                        {new Date().toLocaleDateString()}
                                      </i>
                                    </div>
                                  </div>
                                  {/* <div className='d-flex mx-1  my-2 align-items-center ' >Location: {editJd ? <input type="text" className="form-control w-auto ms-1  " style={{ height: "24px", width: "70px" }} value={"Chennai, Bangalore"} /> : "Chennai, Bangalore"}</div> */}
                                  <table className="table table-sm px-5  mt-2  ">
                                    <thead>
                                      <tr>
                                        <td>Skills</td>
                                        <td className="text-center">
                                          Experience
                                        </td>
                                        <td className="text-center">
                                          Validation
                                        </td>
                                        <td className="text-center">
                                          Top 5 Skill
                                        </td>
                                        <td className="text-center">
                                          Mandatory
                                        </td>
                                        <td></td>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {extractedSkills.map((skill, index) => (
                                        <tr key={index}>
                                          <td>{skill.skill}</td>
                                          <td style={{ width: "130px" }}>
                                            <div className="d-flex ">
                                              <div className="d-flex align-items-baseline me-1">
                                                <div className="me-1">
                                                  {"From:"}
                                                </div>
                                                <input
                                                  type="text"
                                                  name="experience"
                                                  className="form-control"
                                                  style={{
                                                    height: "24px",
                                                    width: "40px",
                                                    marginRight: "4px",
                                                  }}
                                                  value={skill.experience}
                                                  onChange={(e) =>
                                                    handleInputChangeForResumeParser(
                                                      e,
                                                      index
                                                    )
                                                  }
                                                />
                                              </div>
                                              <div className="d-flex align-items-baseline me-1">
                                                <div className="me-1">
                                                  {"To:"}
                                                </div>
                                                <input
                                                  type="text"
                                                  name="experience"
                                                  className="form-control"
                                                  style={{
                                                    height: "24px",
                                                    width: "40px",
                                                    marginRight: "4px",
                                                  }}
                                                  value={skill.experience}
                                                  onChange={(e) =>
                                                    handleInputChangeForResumeParser(
                                                      e,
                                                      index
                                                    )
                                                  }
                                                />
                                              </div>
                                              <div className="">
                                                <select name="Diff" id={index}>
                                                  <option value="week">
                                                    wks
                                                  </option>
                                                  <option value="month">
                                                    Month
                                                  </option>
                                                  <option value="year">
                                                    Years
                                                  </option>
                                                </select>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="text-center">
                                            <input
                                              type="checkbox"
                                              name="validated"
                                              checked={skill.validated}
                                              onChange={(e) =>
                                                handleInputChangeForResumeParser(
                                                  e,
                                                  index
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="text-center">
                                            <input
                                              type="checkbox"
                                              name="top5check"
                                              // checked={skill.validated}
                                              onChange={(e) =>
                                                handleInputChangeForResumeParser(
                                                  e,
                                                  index
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="text-center">
                                            <input
                                              type="checkbox"
                                              name="required"
                                              checked={skill.required}
                                              onChange={(e) =>
                                                handleInputChangeForResumeParser(
                                                  e,
                                                  index
                                                )
                                              }
                                            />
                                          </td>

                                          <td
                                            onClick={() =>
                                              handleRemoveListOfSkillParse(
                                                index
                                              )
                                            }
                                          >
                                            <MdDelete />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  <div class="mb-2 mt-4 row ">
                                    <div className="col-5">
                                      <div className=" d-flex align-items-center   ">
                                        <div>
                                          <label
                                            for="exampleFormControlInput1 "
                                            class="form-label mt-1 "
                                          >
                                            <b>Location:</b>{" "}
                                          </label>
                                        </div>
                                        <div>
                                          <input
                                            type="text"
                                            class="form-control ms-1  "
                                            id="exampleFormControlInput1"
                                            placeholder=""
                                            style={{ height: "24px" }}
                                          />
                                        </div>
                                      </div>
                                      <div className="d-flex justify-content-end align-items-center px-0 my-2    ">
                                        <div>
                                          <label htmlFor="" className=" pe-2  ">
                                            Radius
                                          </label>
                                        </div>
                                        <div>
                                          <select
                                            class="  border-0  "
                                            style={{
                                              color: "var(--primary-color)",
                                            }}
                                            aria-label="Default select example"
                                          >
                                            <option selected>15</option>
                                            <option value="40">40</option>
                                            <option value="55">55</option>
                                            <option value="80">80</option>
                                            <option value="120">120</option>
                                            <option value="160">160</option>
                                          </select>
                                          <select
                                            class="  border-0  "
                                            style={{
                                              color: "var(--primary-color)",
                                            }}
                                            aria-label="Default select example"
                                          >
                                            <option selected>Mile</option>
                                            <option value="KM">KM</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* <button type="button" className="btn text-white font-5 mb-3 " style={{ backgroundColor: "var(--primary-color)" }} onClick={handleMoveParseToMyRequirement} >Move to My Requirement</button> */}
                                  {editJd && (
                                    <button
                                      type="button"
                                      className="btn text-white font-5 mb-3  mx-2  "
                                      style={{
                                        backgroundColor: "var(--primary-color)",
                                      }}
                                    >
                                      Save
                                    </button>
                                  )}
                                  <span
                                    class="badge font-5 mb-3 border-1"
                                    style={{
                                      backgroundColor: "var(--primary-color)",
                                      color: "white",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleSkillSearch}
                                  >
                                    Search
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* search results  */}
                        </div>
                      </>
                    )}

                    {/* modal */}
                    {fileupload && (
                      <div
                        class="modal show  d-block "
                        id="upload"
                        tabindex="-1"
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="false"
                      >
                        <div class="modal-dialog">
                          <div class="modal-content">
                            {/* <div class="modal-header">
                                                        <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div> */}
                            <div class="modal-body">
                              <>
                                <FileuploadJd
                                  handleFileClose={() => setFileupload(false)}
                                  files={files}
                                  setFiles={setFiles}
                                  fileupload={uploadFile}
                                />
                              </>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div class="accordion" id="accordionPanelsStayOpenExample">
                <div class="accordion-item">
                  <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                    <button
                      style={{
                        backgroundColor:
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "NavBarBgColor"
                            ) || {}
                          ).mvalue || "#000",
                        color:
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "NavBarFontColor"
                            ) || {}
                          ).mvalue || "#fff",
                      }}
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#panelsStayOpen-collapseTwo"
                      aria-expanded="false"
                      aria-controls="panelsStayOpen-collapseTwo"
                    >
                      Search Results
                    </button>
                  </h2>
                  <div
                    id="panelsStayOpen-collapseTwo"
                    class="accordion-collapse collapse"
                    aria-labelledby="panelsStayOpen-headingTwo"
                  >
                    <div class="accordion-body">
                      <div className="w-100" style={{ width: "100%" }}>
                        <ResultMIddlePanel Result={SkillBasedResult} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="vr m-0 p-0" />

            <div className="col-lg col-sm-12   rounded bg-white px-1 font-5 fixed-sidebar">
              <RightSideBar />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default JdBasedSearch;
